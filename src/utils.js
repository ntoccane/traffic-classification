import FirefallClient from "@adobe/spacecat-shared-gpt-client/src/clients/firefall-client.js";
import 'dotenv/config';

const client = FirefallClient.createFrom({
    log: {
        info: () => { },
        debug: () => { },
        error: () => { },
    },
    env: process.env,
});

const clientWrapper = (prompt) => {
    return new Promise(async (resolve, reject) => {
        try {
            const text = await client.fetch(prompt);
            resolve({ text });
        } catch (error) {
            console.log(error);
            reject({ error: error.message });
        }
    });
}

const getCSVFileName = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const day = now.getDate().toString().padStart(2, '0');

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `./categorized-results-${year}-${month}-${day}-${hours}:${minutes}:${seconds}`;
};

export {
    clientWrapper,
    getCSVFileName
};