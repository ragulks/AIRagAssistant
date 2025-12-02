# Hybrid Deployment Guide

This guide explains how to connect your **Render-deployed Frontend** to your **Local Backend** running on your PC. This allows you to use local resources (like Ollama) while keeping the frontend accessible online.

## Prerequisites

1.  **Ollama**: Installed and running locally.
2.  **Ngrok**: Installed locally to expose your local server.
3.  **Render Account**: Access to your deployed frontend.

## Step 1: Prepare Local Backend

1.  **Start Ollama**:
    Ensure Ollama is running. Open a terminal and run:
    ```powershell
    ollama serve
    ```
    Make sure you have the required models:
    ```powershell
    ollama pull nomic-embed-text
    ollama pull llama3
    ```

2.  **Start Backend Server**:
    Run the provided script in the project root:
    ```powershell
    .\run_backend_local.bat
    ```
    This will start the Flask server on `http://localhost:5000`.

## Step 2: Expose Backend via Ngrok

1.  Open a **new** terminal window.
2.  Run ngrok to tunnel port 5000:
    ```powershell
    ngrok http 5000
    ```
    *(If you don't have ngrok, download it from [ngrok.com](https://ngrok.com/download))*

3.  **Copy the Forwarding URL**:
    Look for the line that looks like:
    `Forwarding                    https://<random-id>.ngrok-free.app -> http://localhost:5000`
    
    Copy the `https://...` URL. This is your **Public Backend URL**.

## Step 3: Configure Render Frontend

1.  Go to your **Render Dashboard**.
2.  Select your **Frontend** service.
3.  Go to **Environment**.
4.  Add or Update the environment variable:
    -   **Key**: `VITE_API_URL`
    -   **Value**: `https://<random-id>.ngrok-free.app/api`
    
    **IMPORTANT**: Append `/api` to the end of the ngrok URL.
    Example: `https://a1b2-c3d4.ngrok-free.app/api`

5.  **Save Changes**. Render will automatically redeploy your frontend.

## Step 4: Verify

1.  Once the redeploy finishes, open your website.
2.  Open the Browser Console (F12 -> Console).
3.  You should see a log: `API Base URL: https://...` matching your ngrok URL.
4.  Try to login or chat. The request will go from:
    `Browser` -> `Render Frontend` -> `Ngrok` -> `Local PC` -> `Flask Backend` -> `Ollama`

## Troubleshooting

-   **CORS Errors**: If you see CORS errors in the console, ensure the backend is running and `flask-cors` is installed (the script handles this).
-   **Ngrok Session Expired**: On the free plan, ngrok sessions might expire or change URL if you restart. You will need to update the Render Env Var and redeploy if the URL changes.
-   **Ollama Connection**: If the backend says it can't connect to Ollama, ensure `ollama serve` is running.
