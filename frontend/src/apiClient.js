// apiClient.js
// Traffic Guard AI - JS frontend API client
// Fetches prediction from FastAPI backend with API key

const BACKEND_URL = "http://127.0.0.1:5000/predict"; // backend endpoint
const API_KEY = "YOUR_SECURE_API_KEY"; // must match backend key

export async function fetchPrediction(inputData) {
    // Add API key to payload automatically
    inputData.api_key = API_KEY;

    try {
        const res = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inputData),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Prediction API error:", err);
        return { error: err.message };
    }
}
