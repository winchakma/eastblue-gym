const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiV1() {
    try {
        // Specifying v1 instead of v1beta
        const genAI = new GoogleGenerativeAI("AIzaSyAzEahMWKZNpOuj_3J__FmnfwxKj30ZfQg");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
        const result = await model.generateContent("Say hello!");
        const response = await result.response;
        console.log("Gemini V1 Response:", response.text());
    } catch (err) {
        console.error("Gemini V1 Error:", err);
    }
}

testGeminiV1();
