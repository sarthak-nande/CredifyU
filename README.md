# CredifyU - Digital Identity Platform

<img src="https://credify-u-oelj.vercel.app/web-app-manifest-512x512.png"></img>

**CredifyU** is a secure digital identity platform that enables students, colleges, and third-party authorities to store, issue, and verify academic credentials through QR-based verification.

## 🚀 Features

### 🎓 **Multi-Role Support**
- **Students**: Store and share credentials securely
- **Colleges**: Issue and manage verified records  
- **Authorities**: Verify authenticity instantly

### 🔐 **Security First**
- End-to-end encryption
- QR-based verification
- Privacy-first approach
- Tamper-evident credentials

### 📱 **Cross-Platform**
- Progressive Web App (PWA)
- Android Trusted Web Activity (TWA)
- Offline functionality
- Responsive design

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT, OTP verification
- **QR Generation**: QRCode.js, html5-qrcode
- **UI Components**: Radix UI, Lucide React
- **PWA**: Service Workers, Web App Manifest
- **TWA**: Bubblewrap CLI, Android Studio

## 📦 Project Structure

```
CredifyU/
├── client/                 # React PWA Frontend
│   ├── public/            # Static assets & PWA config
│   │   ├── credifyu-logo.svg
│   │   ├── site.webmanifest
│   │   ├── sw.js
│   │   └── .well-known/
│   ├── src/               # React components
│   └── dist/              # Built files
├── server/                # Node.js Backend
├── twa/                   # TWA Configuration
│   ├── twa-manifest.json
│   └── TWA_SETUP_GUIDE.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Android Studio (for TWA)

### 1. Clone Repository
```bash
git clone https://github.com/sarthak-nande/CredifyU.git
cd CredifyU
```

### 2. Install Dependencies
```bash
# Frontend
cd client
npm install

# Backend  
cd ../server
npm install
```

### 3. Environment Setup
Create `.env` files:

**Client (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=CredifyU
```

**Server (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/credifyu
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
```

### 4. Start Development
```bash
# Backend
cd server
npm run dev

# Frontend (new terminal)
cd client  
npm run dev
```

Visit: `http://localhost:5173`

## 📱 PWA Installation

### Automatic Installation
- Chrome: Click "Install" banner
- Mobile: "Add to Home Screen"
- Safari: Share → "Add to Home Screen"

### Manual Testing
```bash
cd client
npm run build
npm run preview
```

## 🤖 TWA (Android App) Build

### 1. Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

### 2. Build TWA
```bash
cd client
npm run twa:init    # First time only
npm run twa:build   # Development build
```

### 3. Production Build
```bash
# Generate signing key
keytool -genkey -v -keystore ../twa/credifyu-release-key.keystore -alias credifyu-key -keyalg RSA -keysize 2048 -validity 10000

# Build signed APK
npm run twa:build:prod
```

### 4. Install on Device
```bash
npm run twa:install
```

## 🔧 Configuration

### PWA Manifest (`site.webmanifest`)
```json
{
  "name": "CredifyU - Digital Identity Platform",
  "short_name": "CredifyU",
  "theme_color": "#000000",
  "background_color": "#000000",
  "display": "standalone",
  "start_url": "/",
  "icons": [...],
  "shortcuts": [...]
}
```

### TWA Manifest (`twa-manifest.json`)
```json
{
  "packageId": "com.credifyu.app",
  "host": "credifyu.com", 
  "name": "CredifyU",
  "themeColor": "#000000",
  "startUrl": "/",
  "shortcuts": [...]
}
```

## 🌐 Deployment

### 1. Build for Production
```bash
cd client
npm run build
```

### 2. Deploy Frontend
- **Vercel**: Connect GitHub repo
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Enable in repository settings

### 3. Deploy Backend
- **Railway**: Connect GitHub repo
- **Heroku**: Git push deployment
- **DigitalOcean**: App Platform

### 4. Digital Asset Links
Upload to your domain: `https://yourdomain.com/.well-known/assetlinks.json`

## 📊 App Store Preparation

### Google Play Store Listing

**App Details:**
- **Name**: CredifyU
- **Package**: com.credifyu.app
- **Category**: Education > Productivity
- **Target Age**: 13+

**Description:**
"CredifyU is a secure digital identity platform for academic credentials. Students can store transcripts and certificates, colleges can issue verified records, and authorities can verify authenticity instantly through QR codes. Privacy-first design ensures you control your digital identity."

**Keywords:**
digital identity, credentials, verification, QR code, education, student, college, certificate, transcript, secure

### Screenshots Needed
- 📱 Phone: 1080x1920 (minimum 4 screenshots)
- 🖥️ Tablet: 2048x1536 (optional)
- 🎨 Feature Graphic: 1024x500

## 🧪 Testing

### PWA Testing
```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse http://localhost:5173 --view

# PWA features test
npm run build
npm run preview
```

### TWA Testing  
```bash
# Install debug build
npm run twa:install

# Test deep links
adb shell am start -W -a android.intent.action.VIEW -d "https://credifyu.com/student/dashboard" com.credifyu.app
```

## 🔒 Security Features

### Data Protection
- 🔐 JWT authentication
- 📧 OTP email verification  
- 🛡️ CORS protection
- 🔒 HTTPS enforcement

### Credential Security
- 📝 Digital signatures
- 🎯 QR-based verification
- ⏰ Token expiration
- 🚫 Tamper detection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- React Team for the amazing framework
- Radix UI for accessible components
- Bubblewrap team for TWA tooling
- Lucide for beautiful icons

---

**Made with ❤️ by the CredifyU Team**

*Securing digital identities, one credential at a time.*
