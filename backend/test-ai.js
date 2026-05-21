const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function testApiKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing API Key:', apiKey ? 'Key found' : 'Key MISSING');

    if (!apiKey) return;

    try {
        const ai = new GoogleGenAI({ apiKey });
        console.log('Attempting to generate a simple test response...');

        const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: [{ parts: [{ text: "Say 'Hello, Aura Budget!'" }] }]
        });

        console.log('--- SUCCESS! ---');
        console.log('AI Response:', response.text);
    } catch (error) {
        console.error('--- FAILURE ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.message.includes('API_KEY_INVALID')) {
            console.error('CRITICAL: The API key provided is INVALID.');
        }
    }
}

testApiKey();
