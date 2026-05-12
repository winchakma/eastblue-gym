const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI("AIzaSyAzEahMWKZNpOuj_3J__FmnfwxKj30ZfQg");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello!");
        const response = await result.response;
        console.log("Gemini Response:", response.text());
    } catch (err) {
        console.error("Gemini Test Error:", err);
    }
}

testGemini();
