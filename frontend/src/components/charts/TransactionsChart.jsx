import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function TransactionsChart({ data, type = "bar" }) {
  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", borderRadius: 20, color: "#94A3B8", fontWeight: 700, fontSize: "0.8rem" }}>
        Aucune donnée d'analyse disponible
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Entrées (GNF)",
        data: data.in,
        backgroundColor: "#006233",
        borderColor: "#006233",
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 20,
      },
      {
        label: "Sorties (GNF)",
        data: data.out,
        backgroundColor: "#10B981",
        borderColor: "#10B981",
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 20,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // Optimisation Afrique : désactiver animations lourdes
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: '#1E293B',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 12,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#F1F5F9"
        },
        ticks: {
          font: { size: 10, weight: 'bold' },
          color: "#94A3B8",
          callback: (value) => value.toLocaleString()
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 10, weight: 'bold' },
          color: "#94A3B8"
        }
      }
    }
  };

  return (
    <div style={{ height: 250, width: "100%" }}>
      {type === "line" ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}
