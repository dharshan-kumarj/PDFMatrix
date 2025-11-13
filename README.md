# 📄 PDFMatrix

> A privacy-first, client-side PDF editor that runs entirely in your browser. Merge, split, rotate, convert, and enhance PDFs without uploading to any server.

[![PWA](https://img.shields.io/badge/PWA-Enabled-green.svg)](https://pdfmatrix.dharshankumar.com)
[![Offline](https://img.shields.io/badge/Offline-Ready-blue.svg)](https://pdfmatrix.dharshankumar.com)
[![Privacy](https://img.shields.io/badge/Privacy-First-red.svg)](https://pdfmatrix.dharshankumar.com)

**PDFMatrix** is a powerful, free, browser-based PDF toolkit that runs entirely in your browser—no servers, no uploads, no limits. Built with modern web technologies for students, professionals, and anyone who values privacy and control over their documents.

## 🌟 Why PDFMatrix?

- **🔒 100% Privacy** - All processing happens locally in your browser. Your files never leave your device.
- **⚡ Lightning Fast** - No server uploads or downloads. Process files instantly.
- **💰 Completely Free** - No subscriptions, no hidden costs, no feature locks.
- **🚫 No Limits** - Process unlimited files of any size.
- **📴 Works Offline** - Progressive Web App with full offline support
- **📱 Installable** - Add to home screen on mobile/desktop as a native app
- **🎨 Modern UI** - Beautiful Matrix-themed dark interface with smooth animations.

---

## 🚀 Progressive Web App (PWA)

PDFMatrix is a fully offline-capable Progressive Web App with advanced features:

### ✨ PWA Features
- ✅ **Works Completely Offline** - All features available without internet connection
- ✅ **Installable** - Add to home screen on mobile/desktop as a native app
- ✅ **Fast Loading** - Smart caching with Workbox for instant startup
- ✅ **Auto-Updates** - Seamless background updates when online
- ✅ **Cross-Platform** - Works on any device with a modern browser
- ✅ **App-Like Experience** - Standalone window, no browser UI
- ✅ **Persistent Storage** - Cached assets for offline use

### 📱 Installation Guide

#### **Desktop Installation (Chrome/Edge)**
1. Visit https://pdfmatrix.dharshankumar.com
2. Look for the install icon (⊕) in the address bar
3. Click "Install PDFMatrix"
4. The app will open in its own window

#### **Mobile Installation**

**iOS (Safari):**
1. Open the website in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. Find PDFMatrix on your home screen

**Android (Chrome):**
1. Open the website in Chrome
2. Tap the menu icon (⋮)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install" to confirm
5. Find PDFMatrix in your app drawer

### ⚙️ PWA Technical Details

#### **Service Worker Configuration**
- **Strategy**: Auto-update with prompt
- **Caching**: Workbox-powered intelligent caching
- **Offline Fallback**: Full functionality without network
- **Cache Management**: Automatic cleanup of outdated caches

#### **Caching Strategies**
1. **CacheFirst** - Fonts, images (long-term assets)
2. **StaleWhileRevalidate** - JS/CSS (balance between speed and freshness)
3. **NetworkFirst** - HTML pages (always try network first)
4. **Runtime Caching** - Dynamic content caching

#### **Workbox Configuration**
```javascript
// Precaching
- All HTML, CSS, JS, and assets
- App icons and favicons
- Fonts and images

// Runtime Caching
- Google Fonts (1 year cache)
- Images (30 days cache)
- Static resources (7 days cache)
```

---

## ✨ Features

### 📄 Core PDF Operations

#### **1. Merge PDFs** 📄➕📄
Combine multiple PDF files into a single document with drag-and-drop reordering.
- Merge 2 or more PDFs
- Drag-and-drop file ordering
- Preview all files before merging
- Visual progress tracking

#### **2. Split PDF** ✂️📄
Extract specific pages or split PDFs into multiple documents.
- **Split by Pages** - Extract specific page numbers (e.g., 1,3,5-10)
- **Split by Ranges** - Divide into custom page ranges
- **Extract Single Pages** - Get individual pages as separate PDFs
- **Split Every N Pages** - Automatically divide into equal parts
- Visual page selection with live preview

#### **3. Compress PDF** 🗜️📉
Reduce PDF file size while maintaining acceptable quality.
- Multiple compression levels (Low, Medium, High)
- Real-time size preview
- Quality vs. size balance controls
- Automatic image optimization

---

### 🔄 Page Manipulation

#### **4. Rotate Pages** 🔄
Rotate PDF pages individually or in bulk.
- Quick actions: 90°, 180°, 270° rotation
- Rotate all pages at once
- Individual page rotation
- Live rotation preview
- Clockwise/Counter-clockwise controls

#### **5. Reorder Pages** 🔀
Rearrange, duplicate, or delete PDF pages with visual drag-and-drop.
- **Drag-and-drop** page reordering
- **Visual page thumbnails** with preview
- **Duplicate pages** - Create copies of any page
- **Delete pages** - Remove unwanted pages
- **Reverse order** - Flip entire document
- **Select all** - Bulk operations
- Interactive page grid view

#### **6. Resize Pages** 📐
Change PDF page dimensions and scale content.
- **Standard sizes**: A4, A3, A5, Letter, Legal
- **Fit modes**:
  - Fit to page (maintain aspect ratio)
  - Fill page (crop if needed)
  - Stretch to fill
- **Custom dimensions** - Set exact width/height
- **Content scaling** options
- Margin controls

---

### 🎨 Page Enhancements

#### **7. Add Page Numbers** 🔢
Automatically add customizable page numbers to your PDF.
- **Positioning**: Top/Bottom, Left/Center/Right (9 positions)
- **Number formats**:
  - Simple numbers (1, 2, 3)
  - Page X of Y format
  - Custom prefix/suffix
- **Customization**:
  - Font size (8-24pt)
  - Text color picker
  - Margin controls (horizontal/vertical)
  - Starting number
  - Skip first/last page options
- Real-time preview

#### **8. Add Watermark** 💧
Protect documents with text or image watermarks.
- **Text Watermarks**:
  - Custom text input
  - Font size control (12-72pt)
  - Color picker
  - Opacity adjustment (0-100%)
  - Rotation angle (-180° to +180°)
- **Image Watermarks**:
  - Upload custom images (PNG, JPEG)
  - Size control (50-500px)
  - Opacity adjustment
  - Rotation control
- **Positioning**: 9-point positioning grid + custom coordinates
- Apply to all pages or specific pages

---

### 🖼️ Format Conversion

#### **9. PDF to Images** 📄➡️🖼️
Export PDF pages as high-quality image files.
- **Image formats**: PNG, JPEG
- **Quality control**: 50-100% (for JPEG)
- **Resolution**: 72-216 DPI (1x, 2x, 3x scaling)
- **Page selection**:
  - Convert all pages
  - Custom page selection (e.g., 1,3,5-10)
- **Download options**:
  - Individual images
  - All as ZIP archive
  - Batch download
- Preview all converted images

#### **10. Images to PDF** 🖼️➡️📄
Create PDF documents from image collections.
- **Supported formats**: PNG, JPEG, GIF, WebP, BMP
- **Multi-image upload** - Select multiple files at once
- **Page size options**: A4, A3, A5, Letter, Legal, Custom
- **Image fitting modes**:
  - Fit (maintain aspect ratio)
  - Fill (crop to fill page)
  - Stretch (fill without maintaining aspect ratio)
- **Drag-and-drop reordering** - Arrange images before conversion
- **Individual controls**: Move up/down, remove images
- **Margin controls** - Adjust spacing around images
- Visual image preview grid

---

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 19** - Modern UI library with latest features
- **TypeScript 5.7** - Type-safe development
- **Vite 6.2** - Lightning-fast build tool and dev server

### **PWA & Service Worker**
- **vite-plugin-pwa 0.20.5** - PWA plugin for Vite
- **Workbox 7.3.0** - Service worker generation and caching strategies
- **Service Worker** - Auto-generated with intelligent caching
- **Web App Manifest** - Installability and app configuration

### **Styling**
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Custom Matrix Theme** - Dark mode with green accent colors
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Enhanced user experience

### **PDF Processing Libraries**
- **pdf-lib 1.17.1** - Core PDF manipulation (merge, split, modify)
- **pdfjs-dist 5.4.394** - PDF rendering and page preview
- **JSZip 3.10.1** - Create ZIP archives for batch downloads
- **node-forge 1.3.1** - Cryptographic operations (for future password protection)
- **tesseract.js 6.0.1** - OCR capabilities (for future features)

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS & Autoprefixer** - CSS processing
- **TypeScript ESLint** - TypeScript linting rules

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm/yarn/pnpm

### **Quick Installation**

```bash
# Clone the repository
git clone https://github.com/dharshan-kumarj/PDFMatrix.git
cd PDFMatrix

# Navigate to frontend directory
cd frontend

# Install all dependencies (including PWA packages)
npm install vite-plugin-pwa@^0.20.5 workbox-window@^7.3.0
```

### **Development Commands**

```bash
# Start development server
npm run dev              # Runs at http://localhost:5173

# Build for production (includes service worker generation)
npm run build

# Preview production build with PWA features
npm run preview

# Run linter
npm run lint
```

### **Project Structure**

```
PDFMatrix/
├── frontend/
│   ├── public/                    # Static assets
│   │   ├── favicon.svg
│   │   ├── site.webmanifest      # PWA manifest
│   │   ├── web-app-manifest-*.png # App icons
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── PdfMerger.tsx
│   │   │   ├── PdfSplitter.tsx
│   │   │   ├── PdfCompressor.tsx
│   │   │   ├── PdfRotation.tsx
│   │   │   ├── PdfResize.tsx
│   │   │   ├── PdfPageNumbers.tsx
│   │   │   ├── PdfPasswordProtection.tsx
│   │   │   ├── PdfWatermark.tsx
│   │   │   ├── PdfReorder.tsx
│   │   │   ├── PdfToImages.tsx
│   │   │   └── ImagesToPdf.tsx
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # Entry + SW registration
│   │   └── index.css             # Global styles
│   ├── vite.config.ts            # Vite + PWA config
│   ├── package.json              # Dependencies
│   └── tsconfig.json             # TypeScript config
├── backend/                       # Future backend (optional)
├── LICENSE
└── README.md
```

---

## 🔧 PWA Configuration Details

### **vite.config.ts - PWA Setup**

```typescript
VitePWA({
  registerType: 'autoUpdate',       // Auto-update SW
  includeAssets: ['favicon.svg', 'robots.txt'],
  manifest: {
    name: 'PDFMatrix - Free PDF Tools',
    short_name: 'PDFMatrix',
    theme_color: '#10b981',
    background_color: '#000000',
    display: 'standalone',          // App-like experience
    icons: [...]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,svg}'],
    runtimeCaching: [
      // Google Fonts - CacheFirst (1 year)
      // Images - CacheFirst (30 days)
      // JS/CSS - StaleWhileRevalidate (7 days)
    ],
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true
  }
})
```

### **Service Worker Registration**

```typescript
// src/main.tsx
import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() {
    // Prompt user to reload for updates
  },
  onOfflineReady() {
    // App ready to work offline
  }
})
```

---

## 🚀 Deployment

### **Build for Production**

```bash
cd frontend
npm run build
```

**Output (`dist/` folder):**
- ✅ Optimized static assets
- ✅ Service worker (`sw.js`)
- ✅ Web app manifest
- ✅ Pre-cached resources
- ✅ All app icons

### **Deploy to Static Hosting**

Compatible with any static file host:

```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod

# GitHub Pages
# Push dist/ folder to gh-pages branch

# Cloudflare Pages
# Connect repo and set build output to 'dist'

# AWS S3 + CloudFront
aws s3 sync dist/ s3://your-bucket --delete
```

### **Environment Variables**

No environment variables required! Everything runs 100% client-side.

---

## 🎯 Key Features Explained

### **Client-Side Architecture**
All PDF processing happens in your browser using WebAssembly and JavaScript. No files are uploaded to any server, ensuring complete privacy and security.

### **No File Size Limits**
Since processing is client-side, you're only limited by your device's memory—not arbitrary server limits.

### **Drag-and-Drop Interface**
Intuitive file management with visual feedback for reordering, merging, and organizing pages.

### **Real-Time Preview**
See changes immediately with live page thumbnails and previews before downloading.

### **Responsive Design**
Works seamlessly on desktop, tablet, and mobile devices with an adaptive interface.

### **Dark Matrix Theme**
Eye-friendly dark interface with green accent colors inspired by The Matrix aesthetic.

---

## 📱 User Interface

### **Navigation**
- **Sidebar Menu** - Easy access to all 10 PDF tools
- **Mobile-Responsive** - Collapsible sidebar for mobile devices
- **Tool Descriptions** - Clear descriptions for each feature
- **Active Tool Highlighting** - Visual feedback for current selection

### **Components**
Each tool features:
- Clean, centered layouts
- Step-by-step instructions
- Visual progress indicators
- Error handling with user-friendly messages
- Success confirmations
- Helpful tips and usage guidelines

---

## 🔐 Privacy & Security

- **Zero Server Communication** - All operations are local
- **No Data Collection** - We don't track, store, or transmit any data
- **No Account Required** - Use all features without signing up
- **Open Source** - Code is transparent and auditable
- **Browser-Only Storage** - Files exist only in your browser session

---

## 🌐 Browser Compatibility

PDFMatrix works in all modern browsers with PWA support:

### **Desktop Browsers**
- ✅ Chrome/Edge 90+ (Full PWA support with installation)
- ✅ Firefox 88+ (Service worker support, limited install)
- ✅ Safari 14+ (Service worker and manifest support)
- ✅ Opera 76+ (Full PWA support)

### **Mobile Browsers**
- ✅ Chrome/Samsung Internet (Android) - Full PWA
- ✅ Safari (iOS 14+) - Add to Home Screen
- ✅ Edge Mobile - Full PWA support

### **Required Features**
- JavaScript enabled
- WebAssembly support
- Service Worker API
- Cache API
- IndexedDB (for future features)
- Web App Manifest support

---

## 📊 Performance

### **Lighthouse Scores**
- 🎯 **Performance:** 95+
- 🎯 **PWA:** 100 (Perfect PWA score)
- 🎯 **Accessibility:** 95+
- 🎯 **SEO:** 100
- 🎯 **Best Practices:** 100

### **Metrics**
- **First Contentful Paint:** < 1.0s
- **Time to Interactive:** < 2.0s
- **Speed Index:** < 1.5s
- **Offline Ready:** 100% functionality
- **Bundle Size:** < 500KB (gzipped)
- **Service Worker:** < 50KB

### **PWA Criteria** ✅
- ✅ Served over HTTPS
- ✅ Responsive on all devices
- ✅ All app URLs load while offline
- ✅ Metadata for Add to Home Screen
- ✅ Fast load time
- ✅ Works cross-browser
- ✅ Page transitions feel snappy
- ✅ Each page has a URL

---

## 🔮 Roadmap

### **Current Version (v1.0) ✅**
- ✅ 10 Core PDF Tools
- ✅ Progressive Web App (PWA)
- ✅ Full Offline Support
- ✅ Service Worker with Workbox
- ✅ Installable on all platforms
- ✅ Auto-updates

### **Upcoming Features**
- 🔐 **PDF Password Protection** - Add encryption to PDFs (In Progress)
- 📝 **PDF Form Filling** - Fill and edit PDF forms
- ✏️ **Text Editing** - Edit text directly in PDFs
- 🔍 **Enhanced OCR** - Extract text from scanned PDFs
- 📋 **Batch Processing** - Process multiple PDFs at once
- 🎯 **PDF Annotations** - Add comments and highlights
- 🔗 **PDF Bookmarks** - Create and manage document bookmarks
- 🌍 **Multi-language Support** - Internationalization
- 🎨 **Theme Customization** - Multiple color schemes
- 💾 **Local Storage** - Save recent files (with permission)
- 📱 **Push Notifications** - Update notifications
- 🔄 **Background Sync** - Process files in background

---

## 📦 Installation Commands

### **Complete Setup**

```bash
# Clone repository
git clone https://github.com/dharshan-kumarj/PDFMatrix.git
cd PDFMatrix/frontend

# Install PWA dependencies (run this single command)
npm install vite-plugin-pwa@^0.20.5 workbox-window@^7.3.0

# Start development
npm run dev

# Build for production (generates service worker)
npm run build

# Preview production build with PWA features
npm run preview
```

### **Verify PWA Setup**

After building, check for these files in `dist/`:
- ✅ `sw.js` - Service worker
- ✅ `manifest.webmanifest` - PWA manifest
- ✅ `workbox-*.js` - Workbox runtime

### **Testing Offline Mode**

1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools → Application → Service Workers
4. Check "Offline" checkbox
5. Reload page - app should work offline!

---

## 📄 License

**MIT License** - Free to use, modify, and distribute.

See [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! This project is actively maintained.

### **How to Contribute**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Areas for Contribution**
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🌍 Translations (future)

---

## 💬 Support & Feedback

- **Issues**: [GitHub Issues](https://github.com/dharshan-kumarj/PDFMatrix/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dharshan-kumarj/PDFMatrix/discussions)
- **Feature Requests**: Open an issue with the `enhancement` label

---

## 👨‍💻 Author

**Dharshan Kumar J**
- GitHub: [@dharshan-kumarj](https://github.com/dharshan-kumarj)

---

## 🙏 Acknowledgments

- **pdf-lib** - Excellent PDF manipulation library
- **PDF.js** - Mozilla's PDF rendering engine
- **Workbox** - Google's PWA toolkit and service worker library
- **vite-plugin-pwa** - Seamless PWA integration for Vite
- **React** - Amazing UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation build tool

---

## 📈 Project Stats

- **10 PDF Tools** - Comprehensive feature set
- **100% Client-Side** - Complete privacy guarantee
- **100% PWA Score** - Perfect Progressive Web App
- **0 Server Dependencies** - Fully offline capable
- **Modern Tech Stack** - Latest React, TypeScript, Vite
- **Lighthouse Score** - 95+ across all metrics

---

<div align="center">

**Built with ❤️ and ☕ by Dharshan Kumar J**

⭐ **Star this repo if you find it useful!** ⭐

### 📱 Try It Now: [pdfmatrix.dharshankumar.com](https://pdfmatrix.dharshankumar.com)

[![PWA](https://img.shields.io/badge/PWA-Enabled-green.svg)](https://pdfmatrix.dharshankumar.com)
[![Offline](https://img.shields.io/badge/Offline-Ready-blue.svg)](https://pdfmatrix.dharshankumar.com)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>