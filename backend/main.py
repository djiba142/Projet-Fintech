import logging
import io
import os
from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel
from fpdf import FPDF
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
    client_name: str = "Jean Dupont"
    msisdn_primary: str
    credit_analysis: Dict
    consolidation: Dict

# --- Logique de génération PDF ---
def generate_kandjou_report(data: PDFExportRequest):
    pdf = FPDF()
    pdf.add_page()
    logo_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "kandjou.png")
    pdf.set_fill_color(30, 64, 175)
    pdf.rect(0, 0, 210, 40, 'F')
    if os.path.exists(logo_path):
        pdf.image(logo_path, 10, 8, 25)
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(255, 255, 255)
    pdf.text(40, 25, "KANDJOU")
    pdf.set_font("helvetica", "I", 10)
    pdf.text(140, 25, f"Rapport #K-{datetime.now().strftime('%Y%m%d%H%M')}")
    pdf.ln(45)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "RAPPORT D'ANALYSE DE SOLVABILITÉ", ln=True, align='C')
    score = data.credit_analysis.get('score', 0)
    pdf.set_font("helvetica", "B", 20)
    pdf.cell(190, 25, f"SCORE DE CRÉDIT : {score}/100", ln=True, align='C')
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
        headers={"Content-Disposition": f"attachment; filename=Kandjou_Report_{data.msisdn_primary}.pdf"}
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
