import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Activity, Shield, Database, UserPlus, Edit, Trash2, RefreshCcw, FileText, Search, TrendingUp, Server, Download, AlertTriangle, X, Plus, Globe, Zap, Pause, Play } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", fullname: "", role: "Client" });

  useEffect(() => { if (token) fetchData(); }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/m3/admin/system-overview`, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
      const txRes = await axios.get(`${API}/m3/admin/transactions`, { headers: { Authorization: `Bearer ${token}` } });
      setTransactions(txRes.data);
    } catch (err) { console.error("Erreur admin data", err); }
    finally { setLoading(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/m3/admin/create-user`, newUser, { headers: { Authorization: `Bearer ${token}` } });
      setShowCreateModal(false);
      setNewUser({ username: "", password: "", fullname: "", role: "Client" });
      fetchData();
      alert("Utilisateur créé avec succès !");
    } catch (err) { alert(err.response?.data?.detail || "Erreur lors de la création"); }
  };

  const handleToggleUser = async (username) => {
    if (!confirm(`Suspendre/Réactiver ${username} ?`)) return;
    try {
      const res = await axios.post(`${API}/m3/admin/toggle-user`, { username }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Statut changé : ${res.data.new_status}`);
      fetchData();
    } catch (err) { alert("Erreur"); }
  };

  const handleDeleteUser = async (username) => {
    if (!confirm(`Supprimer définitivement ${username} ?`)) return;
    try {
      await axios.post(`${API}/m3/admin/delete-user`, { username }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Utilisateur supprimé");
      fetchData();
    } catch (err) { alert("Erreur"); }
  };

  const handleDownloadReport = async () => {
    try {
      const res = await axios.get(`${API}/m3/admin/report/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'rapport_kandjou.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { alert("Erreur téléchargement rapport"); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <RefreshCcw size={40} className="spin" color="#006233" />
      <p style={{ marginTop: "1rem", fontWeight: 700, color: "#64748B" }}>Synchronisation...</p>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const chartData = (data?.user_growth || []).map(g => ({ name: g.month, val: g.count }));

  const kpis = [
    { label: "Utilisateurs", value: data?.kpis?.total_users || 0, trend: "+12%", icon: <Users size={20} />, color: "#2563EB" },
    { label: "Transactions", value: data?.kpis?.tx_total || 0, trend: "+5%", icon: <Activity size={20} />, color: "#059669" },
    { label: "Volume Total", value: "2.4B GNF", trend: "Est.", icon: <Zap size={20} />, color: "#7C3AED" },
    { label: "Système", value: data?.kpis?.system_health || "UP", trend: "Stable", icon: <Globe size={20} />, color: "#EA580C" },
  ];

  return (
    <>
      <div className="adm">
        <div className="adm-header">
          <div>
            <h1 className="adm-title">Tableau de Bord Administratif</h1>
            <p className="adm-subtitle">Centre de pilotage stratégique Kandjou</p>
          </div>
          <div className="adm-actions">
            <button className="adm-btn-sec" onClick={handleDownloadReport}><Download size={16} /> Rapport PDF</button>
            <button className="adm-btn-pri" onClick={() => setShowCreateModal(true)}><Plus size={18} /> Nouvel Utilisateur</button>
          </div>
        </div>

        <div className="adm-kpi-row">
          {kpis.map((k, i) => (
            <div key={i} className="adm-kpi">
              <div className="adm-kpi-icon" style={{ color: k.color, background: k.color + '15' }}>{k.icon}</div>
              <div className="adm-kpi-body">
                <span className="adm-kpi-label">{k.label}</span>
                <div className="adm-kpi-valrow">
                  <span className="adm-kpi-val">{k.value}</span>
                  <span className={`adm-kpi-trend ${k.trend.includes('-') ? 'down' : 'up'}`}>{k.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="adm-tabs">
          {[{id:"overview",label:"Vue d'ensemble"},{id:"users",label:"Utilisateurs"},{id:"infrastructure",label:"Infrastructure"}].map(t => (
            <button key={t.id} className={activeTab === t.id ? "active" : ""} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="adm-grid">
            <div className="adm-card adm-chart">
              <div className="adm-card-head">
                <h3>Flux Financiers (7j)</h3>
                <div className="adm-live"><div className="adm-ping"></div> Temps Réel</div>
              </div>
              <div style={{ height: 320, width: '100%', marginTop: '1.5rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs><linearGradient id="gK" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#006233" stopOpacity={0.15}/><stop offset="95%" stopColor="#006233" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A0AEC0', fontWeight: 600 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="val" stroke="#006233" strokeWidth={3} fill="url(#gK)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="adm-side">
              <div className="adm-card">
                <h3 className="adm-card-title">Alertes Sécurité</h3>
                {data?.security_alerts?.map((a, i) => (
                  <div key={i} className="adm-alert"><AlertTriangle size={14} /><div><p className="adm-alert-t">{a.reason}</p><span className="adm-alert-m">{a.time} • {a.ip}</span></div></div>
                ))}
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Connecteurs API</h3>
                {Object.entries(data?.api_monitoring || {}).map(([name, status]) => (
                  <div key={name} className="adm-connector">
                    <img src={name === 'orange' ? '/orange.png' : '/mtn.png'} alt={name} />
                    <div><p className="adm-conn-name">{name.toUpperCase()}</p><span className={`adm-conn-status ${status.status}`}>{status.status} • {status.latency}</span></div>
                    <div className={`adm-conn-dot ${status.status}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="adm-card">
            <div className="adm-tbl-head">
              <h2>Répertoire Utilisateurs</h2>
              <div className="adm-search"><Search size={18} /><input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            </div>
            <table className="adm-table">
              <thead><tr><th>Utilisateur</th><th>Nom</th><th>Rôle</th><th>État</th><th>Actions</th></tr></thead>
              <tbody>
                {data?.users?.filter(u => u.username.includes(search)).map((u, i) => (
                  <tr key={i}>
                    <td className="adm-bold">{u.username}</td>
                    <td>{u.fullname}</td>
                    <td><span className={`adm-role ${u.role.toLowerCase().replace(/ /g, '-')}`}>{u.role}</span></td>
                    <td><span className={`adm-status-tag ${u.status}`}>{u.status === 'active' ? '● Actif' : '● Suspendu'}</span></td>
                    <td>
                      <div className="adm-act-row">
                        <button className="adm-btn-icon" title="Suspendre/Réactiver" onClick={() => handleToggleUser(u.username)}>
                          {u.status === 'active' ? <Pause size={14}/> : <Play size={14}/>}
                        </button>
                        <button className="adm-btn-icon red" title="Supprimer" onClick={() => handleDeleteUser(u.username)}>
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "infrastructure" && (
          <div className="adm-node-grid">
            {Object.entries(data?.api_monitoring || {}).map(([name, status]) => (
              <div key={name} className="adm-card adm-node">
                <img src={name === 'orange' ? '/orange.png' : '/mtn.png'} alt={name} />
                <h2>API {name.toUpperCase()}</h2>
                <div className="adm-node-stats"><div><span>LATENCE</span><strong>{status.latency}</strong></div><div><span>DISPONIBILITÉ</span><strong>99.9%</strong></div></div>
                <div className={`adm-node-badge ${status.status}`}>Service {status.status}</div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="adm-modal-bg">
            <div className="adm-modal">
              <div className="adm-modal-head">
                <div><h2>Nouvel Utilisateur</h2><p>Créez un accès système sécurisé.</p></div>
                <button className="adm-modal-close" onClick={() => setShowCreateModal(false)}><X size={24} /></button>
              </div>
              <form className="adm-modal-form" onSubmit={handleCreateUser}>
                <div className="adm-field"><label>Nom complet</label><input required value={newUser.fullname} onChange={e => setNewUser({...newUser, fullname: e.target.value})} placeholder="Mamadou Diallo" /></div>
                <div className="adm-field"><label>Email / Identifiant</label><input required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="user@kandjou.gn" /></div>
                <div className="adm-field"><label>Mot de passe</label><input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" /></div>
                <div className="adm-field"><label>Rôle</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="Client">Client</option><option value="Agent de Crédit">Agent de Crédit</option><option value="Administrateur">Administrateur</option><option value="Analyste Risque">Analyste Risque</option><option value="Régulateur (BCRG)">Régulateur (BCRG)</option>
                  </select>
                </div>
                <button type="submit" className="adm-btn-submit">Enregistrer</button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .adm { animation:admFade .4s ease; color:#1A202C; }
        @keyframes admFade { from{opacity:0;transform:translateY(5px);} to{opacity:1;transform:translateY(0);} }
        .adm-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; }
        .adm-title { font-size:1.75rem; font-weight:900; margin:0; letter-spacing:-1px; }
        .adm-subtitle { margin:4px 0 0; color:#718096; font-weight:600; font-size:.9rem; }
        .adm-actions { display:flex; gap:1rem; }
        .adm-btn-sec { background:#fff; border:2px solid #E2E8F0; padding:.6rem 1.2rem; border-radius:12px; font-weight:800; display:flex; align-items:center; gap:8px; cursor:pointer; color:#4A5568; font-size:.85rem; }
        .adm-btn-sec:hover { background:#F7FAFC; }
        .adm-btn-pri { background:#006233; color:#fff; border:none; padding:.7rem 1.4rem; border-radius:12px; font-weight:800; display:flex; align-items:center; gap:8px; cursor:pointer; box-shadow:0 4px 15px rgba(0,98,51,.2); font-size:.85rem; }
        .adm-btn-pri:hover { background:#005229; }
        .adm-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; margin-bottom:2.5rem; }
        .adm-kpi { background:#fff; padding:1.5rem; border-radius:20px; border:1px solid #E2E8F0; display:flex; align-items:center; gap:1.2rem; }
        .adm-kpi-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; }
        .adm-kpi-body { flex:1; }
        .adm-kpi-label { font-size:.7rem; font-weight:900; color:#A0AEC0; text-transform:uppercase; letter-spacing:.5px; }
        .adm-kpi-valrow { display:flex; justify-content:space-between; align-items:flex-end; margin-top:4px; }
        .adm-kpi-val { font-size:1.5rem; font-weight:900; letter-spacing:-.5px; }
        .adm-kpi-trend { font-size:.75rem; font-weight:900; }
        .adm-kpi-trend.up { color:#38A169; }
        .adm-kpi-trend.down { color:#E53E3E; }
        .adm-tabs { display:flex; gap:2rem; border-bottom:2px solid #EDF2F7; margin-bottom:2.5rem; }
        .adm-tabs button { background:none; border:none; padding:1rem 0; color:#718096; font-weight:800; font-size:.95rem; cursor:pointer; position:relative; }
        .adm-tabs button.active { color:#006233; }
        .adm-tabs button.active::after { content:""; position:absolute; bottom:-2px; left:0; right:0; height:3px; background:#006233; border-radius:10px; }
        .adm-grid { display:grid; grid-template-columns:1fr 320px; gap:2rem; }
        @media(max-width:1024px){ .adm-grid{grid-template-columns:1fr;} }
        .adm-card { background:#fff; padding:1.5rem; border-radius:24px; border:1px solid #E2E8F0; }
        .adm-chart { padding:2rem; }
        .adm-card-head { display:flex; justify-content:space-between; align-items:center; }
        .adm-card-head h3 { font-size:1.1rem; font-weight:900; margin:0; }
        .adm-live { display:flex; align-items:center; gap:8px; font-size:.7rem; font-weight:900; color:#38A169; background:#F0FFF4; padding:4px 10px; border-radius:8px; }
        .adm-ping { width:8px; height:8px; background:#38A169; border-radius:50%; animation:admPulse 1.5s infinite; }
        @keyframes admPulse { 0%{opacity:1;} 50%{opacity:.4;} 100%{opacity:1;} }
        .adm-side { display:flex; flex-direction:column; gap:1.5rem; }
        .adm-card-title { font-size:.9rem; font-weight:900; margin:0 0 1.2rem; }
        .adm-alert { display:flex; align-items:flex-start; gap:12px; padding:1rem; background:#FFF5F5; border-radius:16px; color:#C53030; margin-bottom:.8rem; }
        .adm-alert-t { margin:0; font-size:.8rem; font-weight:800; }
        .adm-alert-m { font-size:.65rem; font-weight:700; color:#E53E3E; }
        .adm-connector { display:flex; align-items:center; gap:12px; padding:1rem; background:#F7FAFC; border-radius:16px; position:relative; margin-bottom:.8rem; }
        .adm-connector img { width:32px; height:32px; object-fit:contain; }
        .adm-conn-name { margin:0; font-size:.85rem; font-weight:900; }
        .adm-conn-status { font-size:.65rem; font-weight:800; }
        .adm-conn-status.online { color:#38A169; }
        .adm-conn-dot { width:8px; height:8px; border-radius:50%; position:absolute; right:1rem; }
        .adm-conn-dot.online { background:#38A169; box-shadow:0 0 0 4px #F0FFF4; }
        .adm-tbl-head { padding:1.5rem 2rem; border-bottom:1px solid #EDF2F7; display:flex; justify-content:space-between; align-items:center; }
        .adm-tbl-head h2 { font-size:1.2rem; font-weight:900; margin:0; }
        .adm-search { position:relative; }
        .adm-search svg { position:absolute; left:12px; top:11px; color:#A0AEC0; }
        .adm-search input { padding:.6rem 1rem .6rem 2.8rem; border-radius:12px; border:2px solid #EDF2F7; outline:none; font-weight:600; width:250px; font-size:.85rem; }
        .adm-table { width:100%; border-collapse:collapse; }
        .adm-table th { text-align:left; padding:1rem 1.2rem; background:#F8FAFC; color:#A0AEC0; font-size:.7rem; font-weight:900; text-transform:uppercase; }
        .adm-table td { padding:1rem 1.2rem; border-bottom:1px solid #F7FAFC; font-size:.85rem; }
        .adm-bold { font-weight:800; }
        .adm-role { padding:4px 10px; border-radius:8px; font-size:.7rem; font-weight:800; }
        .adm-role.administrateur { background:#FED7D7; color:#822727; }
        .adm-role.client { background:#C6F6D5; color:#22543D; }
        .adm-role.agent-de-crédit { background:#BEE3F8; color:#2C5282; }
        .adm-role.analyste-risque { background:#FEFCBF; color:#744210; }
        .adm-role.régulateur-\\(bcrg\\) { background:#E9D8FD; color:#553C9A; }
        .adm-status-tag { font-size:.75rem; font-weight:800; }
        .adm-status-tag.active { color:#38A169; }
        .adm-status-tag.suspended { color:#E53E3E; }
        .adm-act-row { display:flex; gap:8px; }
        .adm-btn-icon { background:#F7FAFC; border:none; width:34px; height:34px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; color:#718096; transition:.2s; }
        .adm-btn-icon:hover { background:#EDF2F7; color:#1A202C; }
        .adm-btn-icon.red:hover { background:#FFF5F5; color:#E53E3E; }
        .adm-node-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:1.5rem; }
        .adm-node { text-align:center; padding:2.5rem; }
        .adm-node img { width:64px; height:64px; margin-bottom:1.5rem; }
        .adm-node h2 { font-size:1.3rem; font-weight:900; margin:0 0 1.5rem; }
        .adm-node-stats { display:flex; justify-content:center; gap:2rem; margin-bottom:1.5rem; }
        .adm-node-stats div { display:flex; flex-direction:column; gap:4px; }
        .adm-node-stats span { font-size:.6rem; font-weight:800; color:#A0AEC0; }
        .adm-node-stats strong { font-size:1rem; color:#1A202C; }
        .adm-node-badge { padding:8px; border-radius:12px; font-weight:900; font-size:.7rem; text-transform:uppercase; }
        .adm-node-badge.online { background:#C6F6D5; color:#22543D; }
        .adm-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1.5rem; }
        .adm-modal { background:#fff; width:100%; max-width:460px; border-radius:32px; box-shadow:0 25px 50px rgba(0,0,0,.15); animation:admModalIn .4s cubic-bezier(.175,.885,.32,1.275); }
        @keyframes admModalIn { from{opacity:0;transform:scale(.8);} to{opacity:1;transform:scale(1);} }
        .adm-modal-head { padding:2rem 2.5rem; border-bottom:1px solid #EDF2F7; display:flex; justify-content:space-between; align-items:center; }
        .adm-modal-head h2 { font-size:1.4rem; font-weight:900; margin:0; }
        .adm-modal-head p { margin:4px 0 0; color:#718096; font-size:.85rem; font-weight:600; }
        .adm-modal-close { background:#F7FAFC; border:none; width:40px; height:40px; border-radius:14px; cursor:pointer; color:#A0AEC0; display:flex; align-items:center; justify-content:center; }
        .adm-modal-form { padding:2rem 2.5rem; display:flex; flex-direction:column; gap:1.5rem; }
        .adm-field { display:flex; flex-direction:column; gap:8px; }
        .adm-field label { font-size:.75rem; font-weight:900; color:#4A5568; text-transform:uppercase; }
        .adm-field input, .adm-field select { padding:1rem 1.2rem; border-radius:14px; border:2px solid #EDF2F7; outline:none; font-size:1rem; font-weight:700; transition:.2s; }
        .adm-field input:focus, .adm-field select:focus { border-color:#006233; }
        .adm-btn-submit { background:#006233; color:#fff; border:none; padding:1.1rem; border-radius:16px; font-size:1rem; font-weight:900; cursor:pointer; margin-top:1rem; }
        @media(max-width:900px){ .adm-kpi-row{grid-template-columns:1fr 1fr;} }
        @media(max-width:600px){ .adm-kpi-row{grid-template-columns:1fr;} .adm-header{flex-direction:column;gap:1rem;align-items:flex-start;} }
      `}</style>
    </>
  );
}
