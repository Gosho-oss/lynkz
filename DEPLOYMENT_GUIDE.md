# 🚀 Lynkz Deployment Guide - Vercel

## Step 1: Prepare Your Repository

1. **Initialize Git (if not already done):**
```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

2. **Push to GitHub:**
   - Create a new repository on GitHub: https://github.com/new
   - Name it: `lynkz` (or your preferred name)
   - Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/lynkz.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel:**
   - Go to: https://vercel.com
   - Sign in with your GitHub account

2. **Import Your Project:**
   - Click "Add New..." → "Project"
   - Import your `lynkz` repository
   - Click "Import"

3. **Configure Build Settings:**
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `./`

---

## Step 3: Set Environment Variables

In Vercel project settings, add these environment variables:

### Database
```
DATABASE_URL=postgresql://neondb_owner:npg_yBYpMlFqV8f1@ep-lively-darkness-agiisspm-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=AIzaSyAzNmEj6dg16fO9V4s4hdPqpkNFzQdn-90
VITE_FIREBASE_AUTH_DOMAIN=lynkz-e7f84.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lynkz-e7f84
VITE_FIREBASE_STORAGE_BUCKET=lynkz-e7f84.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=459460692536
VITE_FIREBASE_APP_ID=1:459460692536:web:83535dadb79c3bc8f234cd
```

### Production Settings
```
NODE_ENV=production
```

---

## Step 4: Deploy!

1. Click **"Deploy"** in Vercel
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

---

## Step 5: Post-Deployment Setup

### 5.1 Run Database Migrations

You need to push your database schema to production:

```bash
# Install Drizzle Kit globally (if needed)
npm install -g drizzle-kit

# Set your production DATABASE_URL
export DATABASE_URL="postgresql://neondb_owner:npg_yBYpMlFqV8f1@ep-lively-darkness-agiisspm-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Push schema
npm run db:push
```

### 5.2 Seed Themes

```bash
npm run themes:seed
```

### 5.3 Create Admin Account

1. First, register an account on your live site using the email you want for admin
2. Then run:
```bash
npm run admin:setup
```

---

## Step 6: Configure Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain (e.g., `lynkz.app`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

---

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` scripts are correct

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Make sure Neon database is active
- Check database connection pooling settings

### Firebase Authentication Not Working
- Verify all Firebase environment variables are set
- Add your Vercel domain to Firebase authorized domains:
  - Go to Firebase Console → Authentication → Settings → Authorized domains
  - Add: `your-project-name.vercel.app`

### File Uploads Not Persisting
Vercel has a read-only filesystem. For production file uploads, you need to:
1. Use cloud storage (AWS S3, Cloudinary, etc.)
2. Update `server/storage.ts` to use cloud storage
3. Add cloud storage credentials to environment variables

---

## 🎯 Next Steps

1. **Monitor your deployment:**
   - Vercel Dashboard: https://vercel.com/dashboard
   - View logs, analytics, and performance metrics

2. **Set up continuous deployment:**
   - Every push to `main` branch auto-deploys
   - Preview deployments for pull requests

3. **Optimize performance:**
   - Enable Vercel Analytics
   - Monitor Core Web Vitals
   - Optimize images and assets

---

## 📝 Important Notes

- **Free Tier Limits:** Vercel free tier includes:
  - 100GB bandwidth/month
  - Unlimited deployments
  - 6000 build minutes/month
  
- **Database:** Your Neon database has separate limits
  - Check Neon dashboard for usage

- **Environment Variables:** Never commit `.env` to git (it's in `.gitignore`)

---

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Firebase Docs: https://firebase.google.com/docs

---

**Your app is now live! 🎉**

Visit: `https://your-project-name.vercel.app`
