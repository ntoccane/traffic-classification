import { classifyTrafficSource } from '@adobe/spacecat-shared-rum-api-client/src/common/traffic.js';
import isURL from 'validator/lib/isURL.js';
import csv from 'csv-parser';
import fs from 'fs';

export default function datasetGenerator(nEntries) {
    return new Promise((resolve, reject) => {
        const headers = {
            url: 0,
            utm_source: 1,
            utm_medium: 2,
            referrer: 3,
            paid_tracking_param: 4,
            email_tracking_param: 5,
            count: 6,
            type: 7,
            category: 8,
            inferred_type: 9,
            inferred_category: 10,
        };
        let parsedRows = 0;
        const uncategorizedRows = [];
        const categorizedRows = [];
        const rows = [];

        fs.createReadStream('./traffic.csv')
            .pipe(csv())
            .on(
                'data',
                (data) => {
                    if (isURL(data.url, { require_protocol: true })) {
                        try {
                            const { type, category } = classifyTrafficSource(
                                data.url || '',
                                data.referrer || '',
                                data.utm_source || '',
                                data.utm_medium || '',
                                [
                                    data.paid_tracking_param || '',
                                    data.email_tracking_param || ''
                                ]
                            );
                            rows.push([...Object.values(data).map(v => v || 'Empty'), type, category]);
                            parsedRows++;
                        } catch (error) {
                            console.error(error);
                            reject(error);
                        };
                    }
                }
            )
            .on(
                'end',
                () => {
                    rows
                        .sort((a, b) => Number(b.count) - Number(a.count))
                        .forEach(
                            row => {
                                const isURLValid = (row[headers.url] && row[headers.url].startsWith('http') && !row[headers.url].endsWith('ptth'));
                                const isURLEmpty = !row[headers.url];
                                const isReferrerValid = row[headers.referrer] && row[headers.referrer].startsWith('http') && !row[headers.referrer].endsWith('ptth');
                                const isUTMSourceValid = isNaN(Number(row[headers.utm_source])) || !row[headers.utm_source].length;
                                const isUTMMediumValid = isNaN(Number(row[headers.utm_medium])) || !row[headers.utm_medium].length;
                                if ((isURLValid || isURLEmpty) && isReferrerValid && isUTMSourceValid && isUTMMediumValid) {
                                    if (row[headers.category] === 'uncategorized') uncategorizedRows.push(row);
                                    else categorizedRows.push(row);
                                }
                            }
                        );
                    resolve([headers, uncategorizedRows.slice(0, nEntries), categorizedRows.slice(0, nEntries)]);
                }
            )
            .on(
                'error',
                (error) => {
                    console.error(error);
                    reject(error);
                }
            );
    });
}