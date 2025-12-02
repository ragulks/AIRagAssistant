@echo off
echo ==========================================
echo Starting Local Backend for Hybrid Deployment
echo ==========================================

cd backend

if exist venv\Scripts\activate (
    echo Activating backend/venv...
    call venv\Scripts\activate
) else if exist ..\.venv\Scripts\activate (
    echo Activating .venv...
    call ..\.venv\Scripts\activate
) else (
    echo [WARNING] No virtual environment found. Running with system python.
    echo It is recommended to use a virtual environment.
)

echo.
echo [1/2] Checking/Installing dependencies...
pip install -r requirements.txt

echo.
echo [2/2] Starting Flask Server...
echo ------------------------------------------
echo IMPORTANT: 
echo 1. Ensure Ollama is running (run 'ollama serve' in another terminal if needed).
echo 2. Ensure you have pulled the models: 'ollama pull nomic-embed-text' and 'ollama pull llama3'
echo 3. Run ngrok in another terminal: 'ngrok http 5000'
echo ------------------------------------------
python app.py
pause
