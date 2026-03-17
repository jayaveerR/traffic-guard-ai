import React, { useState } from "react";
import { fetchPrediction } from "./apiClient";

function App() {
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    const inputData = {
      weather_condition: "Clear",
      lighting_condition: "Daylight",
      trafficway_type: "Urban",
      alignment: "Straight",
      roadway_surface_condition: "Dry",
      road_defect: "None",
      crash_hour: 8,
      crash_day_of_week: 2,
      crash_month: 5
    };

    const prediction = await fetchPrediction(inputData);
    setResult(prediction);
  };

  return (
    <div className="App p-4">
      <h1 className="text-xl font-bold mb-4">Traffic Guard AI Prediction</h1>
      <button
        onClick={handlePredict}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Predict Accident Risk
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <p>Predicted Frequency: {result.predicted_frequency}</p>
              <p>Risk Score: {result.risk_score}%</p>
              <p>Risk Category: {result.risk_category}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
