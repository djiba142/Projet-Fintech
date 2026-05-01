import logging
import asyncio
import sqlite3
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from pydantic import BaseModel

from .router import require_valid_token, get_transactions_internal
from modules.common.database import get_db_connection, log_event

logger = logging.getLogger("bcrg-audit")
router = APIRouter()

# --- Modèles ---
class AlertActionRequest(BaseModel):
    alert_id: int
    new_status: str # OPEN, INVESTIGATING, CLOSED
    note: Optional[str] = ""

# ─── ENDPOINTS BCRG ───

@router.get("/overview")
async def get_audit_overview(token_data: Dict = Depends(require_valid_token)):
    if token_data.get("role") != "Régulateur (BCRG)":
        raise HTTPException(status_code=403, detail="Accès réservé à la Banque Centrale")

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # KPIs
    cursor.execute("SELECT COUNT(*) as count FROM transactions")
    total_tx_count = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM audit_alerts WHERE status = 'OPEN'")
    open_alerts = cursor.fetchone()['count']
    
    cursor.execute("SELECT SUM(total_volume) as vol FROM institutions")
    total_volume = cursor.fetchone()['vol'] or 0
    
    cursor.execute("SELECT COUNT(*) as count FROM institutions WHERE api_status = 'ONLINE'")
    active_inst = cursor.fetchone()['count']

    # Graph: Transactions 7 derniers jours
    days = []
    for i in range(6, -1, -1):
        d = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        days.append(d)
    
    stats_tx = []
    for d in days:
        cursor.execute("SELECT COUNT(*) as count FROM transactions WHERE created_at LIKE ?", (f"{d}%",))
        stats_tx.append({"date": d, "count": cursor.fetchone()['count']})

    # Alertes récentes
    cursor.execute("SELECT * FROM audit_alerts ORDER BY created_at DESC LIMIT 5")
    recent_alerts = [dict(a) for a in cursor.fetchall()]

    conn.close()
    
    return {
        "kpis": {
            "total_transactions": total_tx_count,
            "open_alerts": open_alerts,
            "total_volume": total_volume,
            "active_institutions": active_inst,
            "risk_score": 12.5 # Simulation
        },
        "stats_daily": stats_tx,
        "recent_alerts": recent_alerts
    }

@router.get("/transactions")
async def get_audit_transactions(
    token_data: Dict = Depends(require_valid_token),
    min_amount: Optional[int] = 0,
    operator: Optional[str] = None
):
    if token_data.get("role") != "Régulateur (BCRG)":
        raise HTTPException(status_code=403, detail="Accès réservé")

    from modules.common.database import get_db_connection, get_placeholder
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    p = get_placeholder()
    
    query = f"SELECT * FROM transactions WHERE amount >= {p}"
    params = [min_amount]
    
    if operator:
        query += f" AND operator = {p}"
        params.append(operator.upper())
    
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    all_system_tx = []
    for r in rows:
        t = dict(r)
        # On mappe les noms de colonnes pour la compatibilité frontend
        t['op'] = t.get('operator')
        t['date'] = t.get('created_at')
        t['desc'] = t.get('description')
        t['receiver'] = t.get('receiver') or "N/A"
        
        # Scoring Fraude Basique (AML)
        score = 0
        if t.get('amount', 0) > 1000000: score += 40
        if t.get('status') != 'SUCCESS': score += 10
        t['fraud_score'] = score
        t['risk_level'] = "HIGH" if score >= 40 else "MEDIUM" if score >= 20 else "LOW"
        all_system_tx.append(t)

    return all_system_tx

@router.get("/alerts")
async def get_audit_alerts(token_data: Dict = Depends(require_valid_token)):
    if token_data.get("role") != "Régulateur (BCRG)":
        raise HTTPException(status_code=403, detail="Accès réservé")
    
    from modules.common.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    cursor.execute("SELECT * FROM audit_alerts ORDER BY created_at DESC")
    alerts = [dict(a) for a in cursor.fetchall()]
    conn.close()
    return alerts

@router.post("/alerts/process")
async def process_alert(req: AlertActionRequest, token_data: Dict = Depends(require_valid_token)):
    if token_data.get("role") != "Régulateur (BCRG)":
        raise HTTPException(status_code=403, detail="Accès réservé")
    
    from modules.common.database import get_db_connection, get_placeholder
    conn = get_db_connection()
    cursor = conn.cursor()
    p = get_placeholder()
    cursor.execute(f"UPDATE audit_alerts SET status = {p}, details = {p} WHERE id = {p}", (req.new_status, req.note, req.alert_id))
    if isinstance(conn, sqlite3.Connection): conn.commit()
    conn.close()
    
    log_event(token_data.get("primary"), "PROCESS_ALERT", target=str(req.alert_id), result="SUCCESS", details=f"New Status: {req.new_status}")
    return {"message": "Alerte mise à jour"}

@router.get("/institutions")
async def get_audit_institutions(token_data: Dict = Depends(require_valid_token)):
    if token_data.get("role") != "Régulateur (BCRG)":
        raise HTTPException(status_code=403, detail="Accès réservé")
    
    from modules.common.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    cursor.execute("SELECT * FROM institutions")
    insts = [dict(i) for i in cursor.fetchall()]
    conn.close()
    return insts

# --- Fonctions AML (Appelées par le système) ---

def trigger_aml_check(tx_id: str, client_id: str, amount: float, details: str):
    """Analyse une transaction et lève une alerte si suspecte."""
    from modules.common.database import get_db_connection, get_placeholder
    conn = get_db_connection()
    if not conn: return
    cursor = conn.cursor()
    p = get_placeholder()
    
    # Règle 1: Montant élevé (> 1,000,000 GNF)
    if amount >= 1000000:
        cursor.execute(f"""
            INSERT INTO audit_alerts (tx_id, client_id, type, severity, details)
            VALUES ({p}, {p}, 'LARGE_AMOUNT', 'HIGH', {p})
        """, (tx_id, client_id, f"Transaction de {amount} GNF détectée. Détails: {details}"))
        if isinstance(conn, sqlite3.Connection): conn.commit()
        logger.warning(f"🚨 AML ALERT: Large amount detected for {client_id}: {amount}")

    conn.close()
@router.get("/reports")
async def get_audit_reports(token_data: Dict = Depends(require_valid_token)):
    if token_data.get("role") != "Régulateur (BCRG)":
        raise HTTPException(status_code=403, detail="Accès réservé")
    
    # On récupère les logs de type 'GENERATE_REPORT'
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True) if not isinstance(conn, sqlite3.Connection) else conn.cursor()
    cursor.execute("SELECT * FROM audit_logs WHERE action = 'GENERATE_REPORT' ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    
    reports = []
    for r in rows:
        d = dict(r)
        reports.append({
            "id": f"REP-{d['id']}",
            "name": d['details'] or "Rapport Système",
            "date": d['timestamp'][:10],
            "size": "1.2 MB", # Simulé car pas de stockage fichier réel
            "type": "PDF"
        })
    return reports
