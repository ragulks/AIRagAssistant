# 🚀 Deploy to Render.com - Simple Guide

## Why Render?
- ✅ **One-click deployment** using blueprint (render.yaml)
- ✅ Deploys **both frontend AND backend** automatically
- ✅ **Free tier** available
- ✅ Supports **Docker** (works with Ollama)
- ✅ Includes **free PostgreSQL database**

---

## 📋 Prerequisites

1. **GitHub account** (free) - https://github.com
2. **Render account** (free) - https://render.com
3. **Git installed** OR **GitHub Desktop**

---

## Step 1: Install Git (Choose One Method)

### Option A: GitHub Desktop (Easiest - Recommended)
1. Download: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. ✅ Done!

### Option B: Git Command Line
1. Download: https://git-scm.com/download/win
2. Run installer with default settings
3. Restart your terminal
4. ✅ Done!

---

## Step 2: Push Your Code to GitHub

### Using GitHub Desktop (Easiest):

1. **Open GitHub Desktop**
2. Click **"File"** → **"Add Local Repository"**
3. Browse to: `c:\Users\ragul\Downloads\AIRagAssistant\AIRagAssistant`
4. Click **"Add Repository"**
5. If it says "not a Git repository", click **"Create a repository"**
6. **Fill in**:
   - Name: `AIRagAssistant`
   - Description: `AI RAG Chatbot with Authentication`
   - ✅ Keep "Keep this code private" checked (if you want)
7. Click **"Create Repository"**
8. Click **"Publish repository"** button (top right)
9. Uncheck **"Keep this code private"** if you want public (or keep it checked)
10. Click **"Publish Repository"**
11. ✅ **Done!** Your code is now on GitHub!

### Using Git Command Line:

Open PowerShell in your project folder:

```powershell
cd c:\Users\ragul\Downloads\AIRagAssistant\AIRagAssistant

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI RAG Assistant"

# Go to GitHub.com and create a new repository (call it AIRagAssistant)
# Then run these (replace YOUR_USERNAME with your GitHub username):

git remote add origin https://github.com/YOUR_USERNAME/AIRagAssistant.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Render

### 🎯 This is the EASY part!

1. **Go to Render.com**: https://render.com

2. **Sign Up / Log In**:
   - Click **"Get Started"** or **"Sign In"**
   - Choose **"Sign in with GitHub"** (easiest)
   - Authorize Render to access your GitHub

3. **Create New Blueprint**:
   - Click **"New"** (+ button) in the top right
   - Select **"Blueprint"**
   
4. **Connect Repository**:
   - Select your **AIRagAssistant** repository
   - Click **"Connect"**

5. **Render Detects render.yaml**:
   - Render will automatically read your `render.yaml` file
   - You'll see it's creating:
     - ✅ Backend web service (with Docker)
     - ✅ Frontend static site
     - ✅ PostgreSQL database

6. **Review & Deploy**:
   - Review the blueprint
   - You can rename services if you want
   - Click **"Apply"** or **"Create Resources"**

7. **Wait for Deployment** (10-15 minutes):
   - Backend: Building Docker image with Ollama (takes time)
   - Frontend: Building React app
   - Database: Creating PostgreSQL database
   
8. **Get Your URLs**:
   - Once deployed, you'll see both services
   - Backend URL: `https://your-backend-name.onrender.com`
   - Frontend URL: `https://your-frontend-name.onrender.com`

9. **✅ DONE!** Your app is live!

---

## Step 4: Update Frontend API URL

⚠️ **Important**: After deployment, update the frontend to use the backend URL.

1. **Go to Render Dashboard**
2. Find your **Frontend** service
3. Click **"Environment"** tab
4. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-name.onrender.com/api`
   - (Replace with your actual backend URL)
5. Click **"Save Changes"**
6. Frontend will automatically redeploy

---

## 🎉 Your App is Live!

Visit your frontend URL and test:
- ✅ Registration
- ✅ Login
- ✅ Upload documents
- ✅ Chat with AI

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Backend**: May sleep after 15 minutes of inactivity
- **First request**: Takes 30-60 seconds to "wake up"
- **Database**: 90 days max on free tier (then needs upgrade)

### Upgrade to Paid (Optional):
- **Backend**: $7/month (no sleep, faster)
- **Database**: $7/month (permanent)
- **Total**: ~$14/month for always-on service

### Ollama Memory Requirements:
- Free tier might struggle with Ollama
- If it fails, you may need to upgrade to paid tier
- Or consider switching to cloud AI (see DEPLOYMENT_GUIDE.md)

---

## 🔧 Troubleshooting

### "Deployment Failed"
- Check Render logs (click on service → "Logs" tab)
- Most common: Not enough memory for Ollama
- **Solution**: Upgrade to paid tier or switch to cloud AI

### "CORS Errors"
- Make sure `VITE_API_URL` is set correctly in frontend
- Check backend CORS settings in `app.py`

### "Database Connection Error"
- Render automatically sets `DATABASE_URL`
- Make sure `psycopg2-binary` is in requirements.txt (already added)

### "Site Shows 404"
- Frontend might still be building
- Check deployment logs
- Wait a few more minutes

---

## 💡 Next Steps After Deployment

1. Test all features thoroughly
2. Monitor Render dashboard for errors
3. Set up custom domain (optional)
4. Configure environment variables as needed

---

## 🆘 Need Help?

- **Render Docs**: https://docs.render.com
- **Community**: https://community.render.com
- Or message me with specific errors!

---

**Good luck! Your deployment should be smooth! 🚀**
