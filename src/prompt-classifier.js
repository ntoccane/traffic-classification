import classificationTableGenerator from './table-generator.js';
import { clientWrapper, getCSVFileName } from './utils.js';
import datasetGenerator from "./generate-dataset.js";
import csvToMarkdown from "csv-to-markdown-table";
import fs from 'fs';

export default async function promptClassifier(nEntries) {
    console.log('Generating prompts...');

    const classficationTable = classificationTableGenerator();
    const [headers, uncategorizedRows, categorizedRows] = await datasetGenerator(nEntries);

    const promptGenerator = (trafficEntry) => (
        `The table inside "+++" data about web requests:\n+++\n${trafficEntry}\n+++\nAssign a value to type and category using the table inside "===":\n===\n${classficationTable}\n===\nAnswer only with values for type and category separated by ","`
    );

    const prompts = categorizedRows.map(row => {
        const csvRow = row.slice(0, -3).join(',');
        const csvHeaders = Object.keys(headers).slice(0, -5);
        return promptGenerator(
            csvToMarkdown(`${csvHeaders}\n${csvRow}`, ',', true)
        );
    });

    const results = [];

    // Using generator functions to run prompts in batch of N = 10 (in order not to overload the API).
    const generator = (
        function* (asyncTasks, N) {
            let index = 0;
            while (index < asyncTasks.length) {
                const sublist = asyncTasks.slice(index, index + N);
                yield Promise.allSettled(sublist.map(task => clientWrapper(task)));
                index += N;
            }
        }
    )(prompts, 10);

    console.log('Executing prompts... it may take a while');

    for await (let resultBatch of generator) {
        results.push(
            ...resultBatch.map(
                res => res.reason?.error
                    ? res.reason?.error + ',' + res.reason?.error
                    : res.value.text
            )
        );
        // Wait for 5000ms before running the next batch of prompts (avoid being blocked by OpenAI).
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    const uncorrectlyClassifiedEntries = [];
    let nGuessedCategory = 0;
    let nGuessedType = 0;

    const csvRows = results.map((res, idx) => {
        let [type, category] = res.split(',');

        if (categorizedRows[idx][headers.type] === type) nGuessedType++;
        if (categorizedRows[idx][headers.category] === category) nGuessedCategory++;
        if (categorizedRows[idx][headers.type] !== type || categorizedRows[idx][headers.category] !== category) {
            uncorrectlyClassifiedEntries.push(`${categorizedRows[idx]},${type},${category}`);
        }

        return `${categorizedRows[idx]},${type},${category}`;
    });

    const resultHeaders = Object.keys(headers).join(',');

    fs.writeFileSync(getCSVFileName() + '.csv', resultHeaders + '\n' + csvRows.join('\n'));
    fs.writeFileSync(getCSVFileName() + '-uncorrectly.csv', resultHeaders + '\n' + uncorrectlyClassifiedEntries.join('\n'));

    console.log('Finished');
    console.log(`Global accuracy: ${((nGuessedCategory + nGuessedType) * 100) / (nEntries * 2)}`);
    console.log(`Type accuracy: ${(nGuessedType * 100) / nEntries}`);
    console.log(`Category accuracy: ${(nGuessedCategory * 100) / nEntries}`);
}