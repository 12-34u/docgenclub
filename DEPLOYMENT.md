# DocGen Club - Deployment Guide v1.0

This guide will help you deploy your DocGen Club application to production.

## Pre-Deployment Checklist

- [ ] Your Gemini API key is added to backend .env
- [ ] Frontend and backend work correctly locally
- [ ] All environment variables are configured
- [ ] Code is committed to Git repository
- [ ] README.md is updated with project details

## Deployment Options

### Option 1: Frontend on Vercel + Backend on Railway (Recommended)

This is the easiest option for full-stack deployment.

#### Frontend (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "v1.0 release"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the setup from `vercel.json`
   - Add environment variable:
     - Name: `VITE_GENERATOR_API`
     - Value: (Leave empty for now, we'll add after backend deployment)
   - Click "Deploy"

3. **Note your Vercel URL** (e.g., `https://docgenclub.vercel.app`)

#### Backend (Railway)

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Click "Add variables" and add:
     - `GEMINI_API_KEY`: Your Gemini API key
     - `PORT`: 3001
     - `HOST`: 0.0.0.0
   - Railway will auto-detect it's a Python app
   - If not, set these in Settings:
     - Root Directory: `server`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `python main.py`
   - Click "Deploy"

2. **Get your Railway URL**
   - Go to Settings → Generate Domain
   - Copy the domain (e.g., `https://your-app.railway.app`)

3. **Update Vercel Environment Variable**
   - Go back to Vercel dashboard
   - Open your project → Settings → Environment Variables
   - Update `VITE_GENERATOR_API` to your Railway URL
   - Redeploy from the Deployments tab

### Option 2: Both on Vercel (with Serverless Functions)

You can deploy both frontend and backend on Vercel using serverless functions.

1. **Create API folder structure**
   ```bash
   mkdir -p api
   cp server/main.py api/index.py
   cp server/generator.py api/generator.py
   ```

2. **Update vercel.json** to include API routes

3. **Deploy** - Vercel will handle both

### Option 3: Frontend on Vercel + Backend on Render

Similar to Railway option, but use [Render](https://render.com):

1. Deploy frontend to Vercel (same as Option 1)
2. For backend:
   - Create new Web Service on Render
   - Connect GitHub repo
   - Set:
     - Root Directory: `server`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `python main.py`
   - Add environment variables
   - Deploy

3. Update Vercel's `VITE_GENERATOR_API` with Render URL

## Environment Variables Reference

### Backend (Railway/Render/etc.)
```
GEMINI_API_KEY=<your-gemini-api-key>
PORT=3001
HOST=0.0.0.0
```

### Frontend (Vercel)
```
VITE_GENERATOR_API=<your-backend-url>
```

## Post-Deployment

### Testing

1. Visit your frontend URL
2. Fill out the form
3. Try generating different document types
4. Verify downloads and content generation work

### Health Check

Visit `<your-backend-url>/health` to verify backend is running:
```json
{
  "status": "ok",
  "supportedDocTypes": ["report", "notice", ...]
}
```

### CORS Issues

If you encounter CORS errors:
1. Check that your backend allows your frontend domain
2. Backend already has CORS enabled for all origins (`*`)
3. If needed, update in `server/main.py`:
   ```python
   allow_origins=["https://your-frontend.vercel.app"]
   ```

## Monitoring & Maintenance

### Backend Logs
- **Railway**: View logs in Railway dashboard
- **Render**: View logs in Render dashboard

### Frontend Errors
- Check Vercel deployment logs
- Use browser console for client-side errors

### API Usage
- Monitor your Gemini API usage in Google Cloud Console
- Free tier: Check quotas and limits

## Updating the Application

### Update Code
```bash
git add .
git commit -m "Update: <description>"
git push origin main
```

### Automatic Deployment
- Vercel and Railway will automatically redeploy when you push to main
- Check deployment status in respective dashboards

### Rolling Back
- Both Vercel and Railway support rolling back to previous deployments
- Use their dashboards to revert if needed

## Cost Estimation

### Free Tier (Suitable for v1)
- **Vercel**: Free for personal projects
- **Railway**: $5 credit/month (usually enough for small apps)
- **Render**: Free tier available
- **Gemini API**: Free tier with limits

### Recommended for Production
- **Railway Hobby**: $5/month per service
- **Vercel Pro**: $20/month (if you need more)
- **Gemini API**: Pay-as-you-go (very affordable)

## Troubleshooting

### Backend won't start
- Check GEMINI_API_KEY is set correctly
- Verify Python version (3.9+)
- Check build logs for dependency errors

### Frontend can't connect to backend
- Verify VITE_GENERATOR_API is correct
- Check CORS settings
- Make sure backend is running (check health endpoint)

### Gemini API errors
- Verify API key is valid
- Check quotas in Google Cloud Console
- Ensure billing is enabled (if using paid tier)

## Security Notes

- **Never commit .env files** - They're in .gitignore
- **Use environment variables** for all secrets
- **Rotate API keys** periodically
- **Monitor usage** to prevent abuse

## Next Steps

Once deployed:
1. Share the link with AIML Club members
2. Gather feedback
3. Plan v1.1 improvements
4. Consider adding:
   - User authentication
   - Document history
   - Custom branding
   - Analytics

## Support

For deployment issues:
- Check platform-specific docs (Vercel, Railway, Render)
- Review error logs carefully
- Test locally first to isolate issues

---

**Congratulations on deploying v1.0! 🎉**
