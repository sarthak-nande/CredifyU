# Deploy CredifyU to Vercel for TWA Setup

## Quick Deployment Steps

### 1. Prepare for Deployment
```powershell
cd client
npm run build
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from client directory)
vercel

# For production deployment
vercel --prod
```

#### Option B: GitHub + Vercel
1. Push your code to GitHub (already done!)
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Import your `CredifyU` repository
5. Set build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `client`

### 3. Configure Build Settings for Vercel

Create `client/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Update TWA Manifest After Deployment

Once deployed, update `twa/twa-manifest.json`:
```json
{
  "host": "https://credifyu.vercel.app",
  // ... rest of config
}
```

### 5. Complete TWA Setup
```powershell
# After deployment
npm run twa:init
npm run twa:build
```

## Alternative: Local Development TWA

If you want to test TWA with local development:

1. **Start development server**:
   ```powershell
   npm run client:dev
   ```

2. **Use development manifest**:
   ```powershell
   npm run twa:init-dev
   ```

3. **Build development APK**:
   ```powershell
   npm run twa:build
   ```

## Deployment Checklist

- [ ] Client app builds successfully (`npm run build`)
- [ ] Deploy to Vercel or similar platform
- [ ] Verify deployed URL works
- [ ] Update TWA manifest with deployed URL
- [ ] Test PWA functionality on deployed site
- [ ] Initialize TWA project
- [ ] Build Android APK
- [ ] Test APK on Android device

## Common Issues

### Build Errors
- Check all dependencies are installed
- Ensure environment variables are set
- Verify API endpoints are accessible

### Deployment Errors  
- Check Vercel build logs
- Ensure correct build command and output directory
- Verify all required files are committed to Git

### TWA Errors
- Ensure deployed URL is accessible
- Verify web manifest is served correctly
- Check Digital Asset Links configuration

## Production Considerations

### Before Google Play Store Submission:
1. **Generate production signing key**
2. **Build signed APK**
3. **Test thoroughly on multiple devices**
4. **Set up Digital Asset Links**
5. **Create store listing with screenshots**

Your app is ready for deployment! 🚀
