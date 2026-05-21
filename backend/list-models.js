const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const ai = new GoogleGenAI({ apiKey });
        console.log('Listing available models...');
        const result = await ai.models.list();
        console.log('--- MODELS ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('--- FAILURE ---');
        console.error(error.message);
    }
}

listModels();
