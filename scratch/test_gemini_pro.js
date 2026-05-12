const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI("AIzaSyDJ31-kIFxThDHqeqNaDx_P2xNjwiRb0cw");
        // The SDK doesn't have a direct listModels but we can try a basic generation with gemini-pro
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hi");
        const response = await result.response;
        console.log("Gemini Pro Response:", response.text());
    } catch (err) {
        console.error("Gemini Pro Error:", err);
    }
}

listModels();
