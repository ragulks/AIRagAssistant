# 🚀 Step-by-Step Guide: Deploy to GitHub & Online

## ✅ What's Been Prepared

I've created all the necessary deployment files for you:
- ✅ `.gitignore` - Excludes sensitive files
- ✅ `Dockerfile` - For Docker deployment  
- ✅ `railway.json` - Railway.app configuration
- ✅ `render.yaml` - Render.com configuration
- ✅ `README.md` - Project documentation
- ✅ Updated `requirements.txt` - Added production dependencies

---

## 📝 Step 1: Install Git (If Not Installed)

### Download Git for Windows:
1. Go to: https://git-scm.com/download/win
2. Download the installer
3. Run the installer with default settings
4. Restart your terminal/VS Code after installation

---

## 📤 Step 2: Upload to GitHub

### Option A: Using Git Command Line

Open **PowerShell** or **Git Bash** in your project folder and run:

```bash
cd c:\Users\ragul\Downloads\AIRagAssistant\AIRagAssistant

# Initialize Git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: AI RAG Assistant"

# Create a new repository on GitHub (go to github.com and create new repo)
# Then connect it (replace YOUR_USERNAME and YOUR_REPO with actual values):
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Desktop (Easier)

1. **Download GitHub Desktop**: https://desktop.github.com/
2. **Install and sign in** to your GitHub account
3. Click **"Add"** → **"Add Existing Repository"**
4. Browse to: `c:\Users\ragul\Downloads\AIRagAssistant\AIRagAssistant`
5. Click **"Create Repository"**
6. Click **"Publish repository"** to push to GitHub
7. Choose repository name and click **"Publish Repository"**

---

## 🌐 Step 3: Deploy Online

You have **3 deployment options**. Choose the one that fits your needs:

---

### 🎯 Option 1: Railway.app (Recommended - Easiest with Ollama)

**Cost**: ~$5-10/month (has $5 free trial credit)

#### Steps:

1. **Go to**: https://railway.app
2. **Sign up** with your GitHub account
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your **AIRagAssistant** repository
6. Railway will **auto-detect** the `railway.json` config
7. Add environment variable:
   - Click **"Variables"** tab
   - Add: `JWT_SECRET_KEY` = `your-super-secret-key-here-change-this-12345`
8. Click **"Deploy"**
9. Wait for deployment (5-10 minutes)
10. Railway will provide a URL like: `https://your-app.railway.app`

#### Deploy Frontend Separately:

Railway doesn't serve static sites easily, so deploy frontend to **Vercel** or **Netlify**:

**Vercel Frontend Deploy:**
1. Go to https://vercel.com
2. Import your GitHub repo
3. Set **Root Directory**: `frontend`
4. Set **Framework Preset**: Vite
5. Add environment variable:
   - `VITE_API_URL` = `https://your-app.railway.app/api`
6. Deploy!

---

### 🎯 Option 2: Render.com (All-in-One)

**Cost**: Free tier available (slow cold starts)

#### Steps:

1. **Go to**: https://render.com
2. **Sign up** with your GitHub account
3. Click **"New"** → **"Blueprint"**
4. Connect your **AIRagAssistant** repository
5. Render will detect `render.yaml` and create:
   - Backend service
   - Frontend service
   - PostgreSQL database
6. Review the services and click **"Apply"**
7. Wait 10-15 minutes for deployment
8. Both frontend and backend will be deployed automatically!

**Note**: Render free tier has limitations. The backend might take 30-60 seconds to wake up from sleep.

---

### 🎯 Option 3: DigitalOcean App Platform

**Cost**: $5/month minimum

#### Steps:

1. **Go to**: https://cloud.digitalocean.com/apps
2. **Sign up** and verify account
3. Click **"Create App"**
4. Select **"GitHub"** as source
5. Choose your repository
6. DigitalOcean will detect the Dockerfile
7. Configure:
   - **Resource Type**: Web Service
   - **Environment Variables**:
     - `JWT_SECRET_KEY`: your-secret-key
8. Add a static site component for frontend:
   - **Source Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
9. Deploy!

---

## 🔧 Frontend Configuration Update

Before pushing to GitHub, you need to update the frontend API URLs:

### Create `frontend/src/config.js`:

```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Update API calls to use this config:

I can help you do this automatically. Just let me know when you're ready!

---

## ✅ Deployment Checklist

Before deploying, make sure:

- [ ] Git is installed
- [ ] Code is pushed to GitHub
- [ ] You have a GitHub account
- [ ] You've chosen a deployment platform
- [ ] Environment variables are ready:
  - `JWT_SECRET_KEY` (generate a random secure string)
  - `VITE_API_URL` (frontend - will be your backend URL)

---

## 🆘 Troubleshooting

### "Git not recognized"
- Install Git from: https://git-scm.com/download/win
- Restart terminal after installation

### "Ollama not working on deployment"
- Use Railway.app (they support Docker with enough resources)
- Or switch to cloud AI (see DEPLOYMENT_GUIDE.md)

### "CORS errors"
- Make sure `VITE_API_URL` points to your backend
- Backend CORS is already configured for all origins

### "Database errors"
- For production, use PostgreSQL (Render/Railway provide free tier)
- Update `DATABASE_URL` environment variable

---

## 🎉 What's Next?

1. Install Git if needed
2. Push code to GitHub (using option A or B above)
3. Choose a deployment platform
4. Follow the platform-specific steps
5. Your app will be live!

**Need help?** Let me know which platform you choose and I'll guide you through! 🚀
