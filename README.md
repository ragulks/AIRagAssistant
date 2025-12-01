# 🤖 AI RAG Assistant

A full-stack RAG (Retrieval-Augmented Generation) chatbot application with user authentication and document processing capabilities.

## 🌟 Features

- **User Authentication**: Secure registration and login system with JWT tokens
- **Document Upload**: Support for PDF, DOCX, and TXT files
- **RAG Chat**: Ask questions about uploaded documents using Ollama AI
- **Chat History**: Save and manage conversation sessions
- **Modern UI**: Beautiful React frontend with Vite

## 🛠️ Tech Stack

### Backend
- **Flask**: Web framework
- **Ollama**: Local AI model (llama2)
- **SQLAlchemy**: Database ORM
- **JWT**: Authentication
- **SQLite/PostgreSQL**: Database

### Frontend
- **React**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **React Router**: Navigation
- **Framer Motion**: Animations

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Ollama installed locally

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
# or: source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run Ollama (in separate terminal)
ollama serve
ollama pull llama2

# Run Flask app
python app.py
```

Backend runs on: http://localhost:5000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on: http://localhost:5173

## 🌐 Deployment

### Option 1: Railway (Recommended for Ollama)

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect the `railway.json` config
6. Add environment variables:
   - `JWT_SECRET_KEY`: (generate a secure key)
7. Deploy!

### Option 2: Render

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Click "New" → "Blueprint"
4. Connect your repository
5. Render will use `render.yaml` for configuration
6. Deploy both frontend and backend together

### Option 3: DigitalOcean/VPS

Use the provided `Dockerfile` to deploy to any Docker-compatible platform.

```bash
# Build and run with Docker
docker build -t airag-assistant .
docker run -p 5000:5000 airag-assistant
```

## 📁 Project Structure

```
AIRagAssistant/
├── backend/
│   ├── app.py              # Flask API server
│   ├── main.py             # RAG processing logic
│   ├── database.py         # Database models
│   ├── requirements.txt    # Python dependencies
│   └── uploads/            # Uploaded documents
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth context
│   │   └── App.jsx         # Main app component
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
├── Dockerfile              # Docker configuration
├── railway.json            # Railway deployment config
├── render.yaml             # Render deployment config
└── README.md               # This file
```

## 🔐 Environment Variables

### Backend
- `JWT_SECRET_KEY`: Secret key for JWT tokens (required in production)
- `DATABASE_URL`: PostgreSQL connection string (optional, defaults to SQLite)

### Frontend
- `VITE_API_URL`: Backend API URL (e.g., `https://your-backend.railway.app/api`)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Documents & Chat
- `POST /api/upload` - Upload document
- `GET /api/upload/status` - Check upload status
- `POST /api/chat` - Send chat message
- `POST /api/clear` - Clear all documents

### History
- `GET /api/history` - Get all chat sessions
- `POST /api/history` - Create new session
- `GET /api/history/:id` - Get session messages
- `DELETE /api/history/:id` - Delete session

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ using React, Flask, and Ollama
