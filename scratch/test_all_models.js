const { GoogleGenerativeAI } = require('@google/generative-ai');

const key = "AIzaSyAzEahMWKZNpOuj_3J__FmnfwxKj30ZfQg";
const genAI = new GoogleGenerativeAI(key);

async function testAll() {
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
    for (const m of models) {
        console.log(`Testing model: ${m}...`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`✅ Success with ${m}:`, response.text());
            return;
        } catch (err) {
            console.error(`❌ Failed with ${m}:`, err.message);
        }
    }
}

testAll();
