from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI(title="GN-Connect Dashboard (M4)", description="Interface Agent de Crédit")

# Squelette de la page Dashboard (HTML Inlined pour le MVP initial)
@app.get("/", response_class=HTMLResponse)
async def get_dashboard():
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GN-Connect | Dashboard Agent</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 font-sans">
        <nav class="bg-blue-800 text-white p-4 shadow-lg">
            <h1 class="text-xl font-bold">GN-Connect : Agrégateur Intelligent</h1>
        </nav>
        
        <main class="p-8 max-w-4xl mx-auto">
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 class="text-lg font-semibold mb-4 text-gray-700">Recherche de Client</h2>
                <div class="flex gap-4">
                    <input type="text" id="phone" placeholder="Numéro de téléphone (ex: 622...)" class="flex-1 border p-2 rounded">
                    <button onclick="searchClient()" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Analyser</button>
                </div>
            </div>

            <div id="results" class="hidden space-y-6">
                <!-- Les résultats s'afficheront ici -->
            </div>
        </main>

        <script>
            async function searchClient() {
                const phone = document.getElementById('phone').value;
                const resultsDiv = document.getElementById('results');
                resultsDiv.classList.remove('hidden');
                resultsDiv.innerHTML = '<p class="text-center text-gray-500">Agrégation en cours...</p>';

                try {
                    // Appel à l'agrégateur (M1 sur port 8001)
                    // Note: En mode local cross-origine, il faudra gérer le CORS sur M1
                    const response = await fetch(`http://localhost:8001/aggregate/${phone}`);
                    const data = await response.json();
                    
                    resultsDiv.innerHTML = `
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-white p-4 rounded shadow border-l-4 border-orange-500">
                                <h3 class="font-bold">Solde Orange</h3>
                                <p class="text-2xl">${data.consolidation.sources.orange.balance.toLocaleString()} GNF</p>
                            </div>
                            <div class="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                                <h3 class="font-bold">Solde MTN</h3>
                                <p class="text-2xl">${data.consolidation.sources.mtn.balance.toLocaleString()} GNF</p>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded shadow text-center">
                            <h3 class="text-xl font-bold mb-2">Score de Solvabilité</h3>
                            <div class="text-5xl font-black ${data.scoring.score > 60 ? 'text-green-600' : 'text-red-600'}">
                                ${data.scoring.score}/100
                            </div>
                            <p class="mt-2 text-gray-600">Niveau de risque : <strong>${data.scoring.risk_level}</strong></p>
                            <p class="mt-4 p-3 bg-gray-50 rounded italic">${data.scoring.recommendation}</p>
                        </div>
                    `;
                } catch (e) {
                    resultsDiv.innerHTML = '<p class="text-red-500">Erreur : Assurez-vous que les modules M1, M2 et M3 sont lancés.</p>';
                }
            }
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
