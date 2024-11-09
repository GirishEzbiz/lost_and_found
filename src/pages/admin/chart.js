import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const IncomeChart = () => {
  // Set the initial income value
  const [income, setIncome] = useState(200000); // Default income is ₹2,00,000

  // Handle income input change
  const handleIncomeChange = (e) => {
    setIncome(e.target.value);
  };

  // Prepare chart data based on income
  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Income Over Time",
        data: [
          income * 0.8,
          income * 0.85,
          income * 0.9,
          income * 1.1,
          income * 1.05,
          income * 1.2,
        ], // Simulating income changes
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="income-chart-container">
      <div className="input-container">
        <label htmlFor="income-input">Enter Your Income:</label>
        <input
          type="number"
          id="income-input"
          value={income}
          onChange={handleIncomeChange}
          className="income-input"
        />
      </div>

      <div className="chart-container">
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default IncomeChart;
