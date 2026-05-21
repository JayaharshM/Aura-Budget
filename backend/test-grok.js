const OpenAI = require('openai');
require('dotenv').config();

async function testGrok() {
    const apiKey = process.env.GROK_API_KEY;
    console.log('Testing Grok API Key:', apiKey && apiKey !== 'your_grok_key_here' ? 'Key detected' : 'Key MISSING or placeholder');

    if (!apiKey || apiKey === 'your_grok_key_here') {
        console.error('Please update GROK_API_KEY in your .env file first.');
        return;
    }

    try {
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.x.ai/v1",
        });

        console.log('Attempting to generate a test response from Grok...');
        const completion = await openai.chat.completions.create({
            model: "grok-beta",
            messages: [
                { role: "system", content: "You are a professional financial advisor." },
                { role: "user", content: "Say 'Hello, I am Grok!'" },
            ],
        });

        console.log('--- SUCCESS! ---');
        console.log('Grok Response:', completion.choices[0].message.content);
    } catch (error) {
        console.error('--- FAILURE ---');
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.message);
    }
}

testGrok();
