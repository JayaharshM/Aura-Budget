const Groq = require('groq-sdk');
require('dotenv').config();

async function testGroq() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log('Testing Groq API Key:', apiKey && apiKey !== 'your_groq_key_here' ? 'Key detected' : 'Key MISSING or placeholder');

    if (!apiKey || apiKey === 'your_groq_key_here') {
        console.error('Please update GROQ_API_KEY in your .env file first.');
        return;
    }

    try {
        const groq = new Groq({
            apiKey: apiKey,
        });

        console.log('Attempting to generate a test response from Groq (using Llama 3.3)...');
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "user", content: "Say 'Hello, I am Groq LPU!'" },
            ],
            model: "llama-3.3-70b-versatile",
        });

        console.log('--- SUCCESS! ---');
        console.log('Groq Response:', completion.choices[0]?.message?.content);
    } catch (error) {
        console.error('--- FAILURE ---');
        console.error('Error Message:', error.message);
    }
}

testGroq();
