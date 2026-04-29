# --- Kandjou Unified Starter (v4.2 - Soutenance) ---
# Ce script lance l'ensemble du projet Kandjou sur un port unique (8000)

Write-Host "--- Kandjou Fintech : DÃ©marrage du systÃ¨me ---" -ForegroundColor Cyan

# 1. Nettoyage des processus existants
Write-Host "[1/3] Nettoyage des ports..." -ForegroundColor Yellow
try {
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
} catch {
    # On ignore si aucun processus n'est trouv
}
Start-Sleep -Seconds 1

# 2. Compilation du Frontend
Write-Host "[2/3] Compilation du Frontend React (Production Build)..." -ForegroundColor Yellow
Set-Location "frontend"
# On utilise --silent pour une sortie propre
npm run build --silent
Set-Location ".."

# 3. Lancement du Backend Unifi
Write-Host "[3/3] Lancement du Backend sur http://localhost:8000" -ForegroundColor Green
Write-Host "Mode : Single Worker (Memory Consistent) + Hot Reload active" -ForegroundColor Gray
Write-Host "Accdez  l'interface : http://localhost:8000" -ForegroundColor Blue

Set-Location "backend"
# Note: On utilise uvicorn directement (assurez-vous que les deps sont installes)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
