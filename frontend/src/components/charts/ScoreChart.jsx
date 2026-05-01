import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ScoreChart({ score }) {
  const data = {
    labels: ["Solvabilité", "Risque"],
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: ["#10B981", "#F1F5F9"],
        borderColor: ["#10B981", "#F1F5F9"],
        borderWidth: 0,
        hoverOffset: 4,
        cutout: "80%",
        borderRadius: 20
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      }
    }
  };

  return (
    <div style={{ position: "relative", height: 180, width: 180, margin: "0 auto" }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center"
      }}>
        <p style={{ margin: 0, fontSize: "2rem", fontWeight: 950, color: "#1E293B", letterSpacing: -1 }}>{score}</p>
        <p style={{ margin: 0, fontSize: "0.6rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" }}>Points</p>
      </div>
    </div>
  );
}
