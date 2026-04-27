import logging
import io
import os
from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel
from fpdf import FPDF
import qrcode
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn

# Configuration du logging global
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("kandjou-unified")

# --- Modèles pour l'export PDF ---
class PDFExportRequest(BaseModel):
    client_name: str
    report_id: str
    msisdn_primary: str
    credit_analysis: Dict
    consolidation: Dict

# --- Logique de génération PDF ---
def generate_kandjou_report(data: PDFExportRequest):
    pdf = FPDF()
    pdf.add_page()
    
    # Header Background
    pdf.set_fill_color(10, 22, 40) # Bleu nuit profond
    pdf.rect(0, 0, 210, 50, 'F')
    
    # Logo
    logo_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "kandjou.png")
    if os.path.exists(logo_path):
        pdf.image(logo_path, 15, 12, 25)
    
    # Brand Name
    pdf.set_font("helvetica", "B", 32)
    pdf.set_text_color(255, 255, 255)
    pdf.text(50, 28, "KANDJOU")
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.text(50, 36, "Intelligence de Crédit & Agrégation Mobile Money")
    
    # Report Number & Date
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("helvetica", "B", 10)
    pdf.text(145, 20, f"RAPPORT CERTIFIÉ")
    pdf.set_font("helvetica", "", 9)
    pdf.text(145, 26, f"ID: {data.report_id}")
    pdf.text(145, 32, f"Date: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    
    pdf.ln(55)
    
    # Client Section
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, f"BÉNÉFICIAIRE : {data.client_name.upper()}", ln=True)
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 6, f"Numéro Mobile : +{data.msisdn_primary}", ln=True)
    pdf.cell(0, 6, f"Statut KYC : Vérifié (Identité Certifiée)", ln=True)
    pdf.ln(5)
    
    # Score Section
    pdf.set_fill_color(248, 250, 252)
    pdf.rect(10, 85, 190, 40, 'F')
    
    score = data.credit_analysis.get('score', 0)
    status = data.credit_analysis.get('status', 'N/A')
    
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(100, 116, 139)
    pdf.text(15, 95, "SCORE KANDJOU")
    
    pdf.set_font("helvetica", "B", 36)
    if score >= 71: pdf.set_text_color(34, 197, 94)
    elif score >= 41: pdf.set_text_color(245, 158, 11)
    else: pdf.set_text_color(239, 68, 68)
    pdf.text(15, 115, f"{score}/100")
    
    pdf.set_font("helvetica", "B", 18)
    pdf.text(80, 112, status)
    
    pdf.ln(45)
    
    # Consolidation Table
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 10, "RÉSUMÉ DES AVOIRS AGRÉGÉS", ln=True)
    pdf.ln(2)
    
    pdf.set_font("helvetica", "B", 10)
    pdf.set_fill_color(226, 232, 240)
    pdf.cell(80, 10, "Opérateur", 1, 0, 'C', True)
    pdf.cell(80, 10, "Solde (GNF)", 1, 1, 'C', True)
    
    pdf.set_font("helvetica", "", 10)
    
    # Orange Row
    orange_logo = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "orange.png")
    pdf.cell(10, 10, "", 1, 0)
    if os.path.exists(orange_logo):
        pdf.image(orange_logo, 16, pdf.get_y() + 2, 6)
    pdf.cell(70, 10, "Orange Money", 1, 0, 'L')
    pdf.cell(80, 10, f"{data.consolidation.get('orange_balance', 0):,.0f}", 1, 1, 'C')
    
    # MTN Row
    mtn_logo = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "mtn.png")
    pdf.cell(10, 10, "", 1, 0)
    if os.path.exists(mtn_logo):
        pdf.image(mtn_logo, 16, pdf.get_y() + 2, 6)
    pdf.cell(70, 10, "MTN MoMo", 1, 0, 'L')
    pdf.cell(80, 10, f"{data.consolidation.get('mtn_balance', 0):,.0f}", 1, 1, 'C')
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(80, 10, "TOTAL CONSOLIDÉ", 1, 0, 'C', True)
    pdf.cell(80, 10, f"{data.consolidation.get('total_balance', 0):,.0f}", 1, 1, 'C', True)
    
    pdf.ln(10)
    
    # Recommendation
    pdf.ln(5)
    pdf.set_fill_color(255, 243, 205)
    pdf.set_text_color(133, 100, 4)
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 10, " ATTENTION : Profil a surveiller. Analyse complementaire recommandee.", 1, 1, 'L', True)
    
    pdf.set_text_color(30, 41, 59)
    pdf.set_font("helvetica", "I", 10)
    pdf.multi_cell(0, 8, data.credit_analysis.get('recommendation', 'Aucune recommandation fournie.'))
    
    # Footer - Legal & QR
    pdf.set_y(-40)
    
    # QR Code Generation
    qr_data = f"https://kandjou.gn/verify/{data.report_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=1)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    qr_temp = io.BytesIO()
    qr_img.save(qr_temp, format='PNG')
    qr_temp.seek(0)
    
    pdf.image(qr_temp, 165, 250, 30, 30)
    
    pdf.set_y(-30)
    pdf.set_font("helvetica", "I", 8)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(150, 5, "Ce document est généré électroniquement et certifié par la plateforme Kandjou.", ln=True, align='L')
    pdf.cell(150, 5, "Conforme aux réglementations de la BCRG. Toute altération rend ce rapport invalide.", ln=True, align='L')
    pdf.cell(150, 5, f"Authenticité vérifiable via QR Code ou sur https://kandjou.gn/verify", ln=True, align='L')
    
    return pdf.output()

# Chargement du .env
load_dotenv()

# Import des routers
from modules.M1_aggregator.router import router as m1_router
from modules.M2_simulators.router import router as m2_router
from modules.M3_security.router import router as m3_router

app = FastAPI(
    title="Kandjou Fintech - Unified Backend",
    description="Agrégateur Mobile Money & Scoring — Service Unique",
    version="4.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de Logging global
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"Path: {request.url.path} | Method: {request.method} | Status: {response.status_code} | Time: {process_time:.3f}s")
    return response

# Montage des modules
app.include_router(m1_router, prefix="/m1", tags=["M1 - Aggregator"])
app.include_router(m2_router, prefix="/m2", tags=["M2 - Simulators"])
app.include_router(m3_router, prefix="/m3", tags=["M3 - Security & OTP"])

@app.post("/export-pdf", tags=["Utility"])
async def export_pdf(data: PDFExportRequest):
    pdf_bytes = generate_kandjou_report(data)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Rapport_Kandjou_{data.report_id}.pdf"}
    )

@app.get("/")
async def root():
    return {"service": "Kandjou Unified API", "status": "online"}

@app.get("/health")
async def health():
    return {"status": "UP", "timestamp": datetime.now().isoformat()}

# Service du Frontend React
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
frontend_assets = os.path.join(frontend_dist, "assets")

if os.path.exists(frontend_assets):
    app.mount("/assets", StaticFiles(directory=frontend_assets), name="assets")

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_react(full_path: str):
    potential_file = os.path.join(frontend_dist, full_path)
    if os.path.exists(potential_file) and os.path.isfile(potential_file):
        return FileResponse(potential_file)
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return HTMLResponse(content="<h1>Frontend non compilé</h1>", status_code=404)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
