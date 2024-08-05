import promptClassifier from "./src/prompt-classifier.js";
import minimist from "minimist";

(
    async () => {
        const args = minimist(process.argv.slice(2));
        const nEntries = args.nEntries || 1;
        await promptClassifier(nEntries);
        process.exit(0);
    }
)();