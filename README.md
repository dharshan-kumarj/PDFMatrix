# PDFMatrix

**PDFMatrix** is a powerful, free, browser-based PDF toolkit that runs entirely in your browser—no servers, no uploads, no limits. Built with modern web technologies for students, professionals, and anyone who values privacy and control over their documents.

## 🌟 Why PDFMatrix?

- **🔒 100% Privacy** - All processing happens locally in your browser. Your files never leave your device.
- **⚡ Lightning Fast** - No server uploads or downloads. Process files instantly.
- **💰 Completely Free** - No subscriptions, no hidden costs, no feature locks.
- **🚫 No Limits** - Process unlimited files of any size.
- **📴 Works Offline** - Use it anywhere, even without internet (after initial load).
- **🎨 Modern UI** - Beautiful Matrix-themed dark interface with smooth animations.

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
- Node.js 18+ and npm/yarn

### **Installation**

```bash
# Clone the repository
git clone https://github.com/dharshan-kumarj/PDFMatrix.git

# Navigate to frontend directory
cd PDFMatrix/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Development Commands**

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

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

PDFMatrix works in all modern browsers:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

**Note**: Requires JavaScript enabled and WebAssembly support.

---

## 📊 Performance

- **Fast Processing** - Modern browsers leverage GPU acceleration
- **Memory Efficient** - Optimized for handling large files
- **Instant Downloads** - No waiting for server processing
- **Smooth Animations** - 60fps UI interactions

---

## �️ Roadmap

### **Upcoming Features**
- 🔐 **PDF Password Protection** - Add encryption to PDFs
- 📝 **PDF Form Filling** - Fill and edit PDF forms
- ✏️ **Text Editing** - Edit text directly in PDFs
- 🔍 **OCR (Text Recognition)** - Extract text from scanned PDFs
- 📋 **Batch Processing** - Process multiple PDFs at once
- 🎯 **PDF Annotations** - Add comments and highlights
- 🔗 **PDF Bookmarks** - Create and manage document bookmarks

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
- **React** - Amazing UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation build tool

---

## 📈 Project Stats

- **10 PDF Tools** - Comprehensive feature set
- **100% Client-Side** - Complete privacy guarantee
- **0 Dependencies on Servers** - Fully offline capable
- **Modern Tech Stack** - Latest React, TypeScript, Vite

---

<div align="center">

**Built with ❤️ and ☕ by Dharshan Kumar J**

⭐ **Star this repo if you find it useful!** ⭐

</div>