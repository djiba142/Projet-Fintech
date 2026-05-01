import { useState } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  PieChart, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Check,
  QrCode,
  Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logoKandjou from "../../assets/logo_kandjou.png";

const ReportCard = ({ title, description, icon, color, onGenerate }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onGenerate(title);
    }, 2500);
  };

  return (
    <div 
      onClick={!loading ? handleGenerate : null}
      style={{ 
        background: "#fff", borderRadius: 24, padding: "1.5rem", border: "1px solid #E2E8F0", 
        transition: "all 0.2s", boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
        cursor: loading ? "not-allowed" : "pointer",
        position: "relative",
        overflow: "hidden"
      }}
      onMouseOver={e => !loading && (e.currentTarget.style.borderColor = color)}
      onMouseOut={e => !loading && (e.currentTarget.style.borderColor = "#E2E8F0")}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}10`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#1E293B" }}>{title}</h3>
      <p style={{ margin: "10px 0 1.5rem", fontSize: "0.85rem", color: "#64748B", fontWeight: 600, lineHeight: 1.5 }}>{description}</p>
      
      <div style={{
        width: "100%", padding: "12px", borderRadius: 12, border: "none", 
        background: loading ? "#F1F5F9" : "#0F172A",
        color: loading ? "#94A3B8" : "#fff", fontWeight: 900, fontSize: "0.8rem", 
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "0.3s"
      }}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        {loading ? "Génération..." : "Générer le rapport"}
      </div>
    </div>
  );
};

export default function AuditReports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API}/m3/audit/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  return (
    <div style={{ padding: "2rem", background: "#F8FAFC", minHeight: "100vh" }}>
      
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 950, color: "#0F172A", margin: 0 }}>Générateur de Rapports</h1>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>Édition de documents officiels et exports de conformité pour la Banque Centrale</p>
      </header>

      {/* ── SELECTION ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        <ReportCard 
          title="Flux Nationaux" 
          description="Analyse complète des volumes de transactions, parts de marché des opérateurs et tendances macro." 
          icon={<PieChart color="#3B82F6" />} 
          color="#3B82F6" 
          onGenerate={(t) => alert(`Le rapport '${t}' est prêt pour téléchargement.`)}
        />
        <ReportCard 
          title="Rapport AML / Fraude" 
          description="Liste exhaustive des alertes, comptes bloqués et résultats des enquêtes sur le blanchiment." 
          icon={<ShieldCheck color="#EF4444" />} 
          color="#EF4444" 
          onGenerate={(t) => alert(`Le rapport '${t}' est prêt pour téléchargement.`)}
        />
        <ReportCard 
          title="Santé des Institutions" 
          description="Rapport technique sur l'uptime, les pannes API et la qualité de service des partenaires." 
          icon={<FileText color="#10B981" />} 
          color="#10B981" 
          onGenerate={(t) => alert(`Le rapport '${t}' est prêt pour téléchargement.`)}
        />
      </div>

      {/* ── HISTORY ── */}
      <div style={{ background: "#fff", borderRadius: 32, padding: "2rem", border: "1px solid #E2E8F0" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1E293B", marginBottom: "1.5rem" }}>Historique des rapports générés</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {history.map((rep, i) => (
            <div key={i} style={{ padding: "1.2rem", background: "#F8FAFC", borderRadius: 20, border: "1.5px solid #F1F5F9", display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <img src={logoKandjou} alt="Logo" style={{ height: 24, objectFit: "contain", opacity: 0.8 }} />
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                   <FileText size={20} color={rep.type === 'PDF' ? '#EF4444' : '#10B981'} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, color: "#1E293B" }}>{rep.name}</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>ID: {rep.id} • {rep.size}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 800, color: "#64748B" }}>Date</p>
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 950, color: "#1E293B" }}>{rep.date}</p>
              </div>
              <div style={{ width: 50, height: 50, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                 <QrCode size={30} color="#0F172A" />
                 <span style={{ position: "absolute", bottom: -12, fontSize: "0.5rem", fontWeight: 900, color: "#94A3B8" }}>SECURE-REF</span>
              </div>
              <button 
                onClick={() => alert(`Téléchargement du rapport ${rep.id} démarré...`)}
                style={{ background: "#0F172A", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: "0.75rem", fontWeight: 900, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                <Download size={16} /> Télécharger
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
