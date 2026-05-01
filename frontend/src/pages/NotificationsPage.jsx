import MainLayout from "../components/MainLayout";
import { Bell, Info, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: "SUCCESS", title: "Transfert envoyé", msg: "Votre transfert de 500 000 GNF a été confirmé.", date: "Il y a 10 min" },
    { id: 2, type: "INFO", title: "Score mis à jour", msg: "Votre score de solvabilité a été recalculé (78/100).", date: "Il y a 1h" },
    { id: 3, type: "WARNING", title: "Connexion suspecte", msg: "Une connexion a été détectée depuis un nouvel appareil.", date: "Hier" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 950, color: "#1E293B", letterSpacing: "-1px" }}>Centre de Notifications</h1>
        <p style={{ color: "#64748B", fontWeight: 600 }}>Restez informé des activités de votre compte.</p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {notifications.map(n => (
          <div key={n.id} style={{ 
            background: "#fff", padding: "1.5rem", borderRadius: "20px", 
            border: "1.5px solid #F1F5F9", display: "flex", gap: "1.2rem",
            alignItems: "flex-start", boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
          }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: "14px", 
              display: "flex", alignItems: "center", justifyContent: "center",
              background: n.type === 'SUCCESS' ? '#F0FDF4' : n.type === 'WARNING' ? '#FEF2F2' : '#EFF6FF',
              color: n.type === 'SUCCESS' ? '#10B981' : n.type === 'WARNING' ? '#EF4444' : '#3B82F6'
            }}>
              {n.type === 'SUCCESS' ? <CheckCircle size={22} /> : n.type === 'WARNING' ? <AlertTriangle size={22} /> : <Info size={22} />}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: 800, color: "#1E293B" }}>{n.title}</h3>
              <p style={{ margin: "0 0 8px 0", color: "#64748B", fontSize: "0.9rem", fontWeight: 500 }}>{n.msg}</p>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>{n.date}</span>
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1" }}>
              <ArrowRight size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
