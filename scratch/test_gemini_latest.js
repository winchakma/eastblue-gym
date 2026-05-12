const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiLatest() {
    try {
        const genAI = new GoogleGenerativeAI("AIzaSyAzEahMWKZNpOuj_3J__FmnfwxKj30ZfQg");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Say hello!");
        const response = await result.response;
        console.log("Gemini Latest Response:", response.text());
    } catch (err) {
        console.error("Gemini Latest Error:", err);
    }
}

testGeminiLatest();
