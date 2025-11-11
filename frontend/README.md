
# PDFMatrix - Professional PDF Editor

A modern, browser-based PDF editor built with React, TypeScript, and Apryse WebViewer. Edit PDFs in real-time with WYSIWYG text editing, formatting, and instant export capabilities.

## ✨ Features

- 🎯 **Real-time PDF Editing**: WYSIWYG text editing directly in the browser
- 📤 **Drag & Drop Upload**: Easy file upload with validation
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- 💾 **Instant Export**: Download edited PDFs with one click
- 🖨️ **Print Support**: Direct printing from the browser
- 🔄 **State Management**: Efficient state handling with Zustand
- ⚡ **Fast & Responsive**: Powered by Vite and React 19

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- WSL2 (if on Windows)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Zustand** (if not already installed):
   ```bash
   npm install zustand
   ```

3. **Set up WebViewer library files**:
   ```bash
   npm run setup-webviewer
   ```
   
   Or manually:
   ```bash
   bash setup-webviewer.sh
   ```

4. **Get Apryse License** (Optional but recommended):
   - Sign up at [Apryse](https://apryse.com/)
   - Get a free trial license key
   - Add your license key in `src/components/PdfEditor.tsx`:
     ```typescript
     licenseKey: 'your-license-key-here',
     ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── PdfUploader.tsx      # Drag & drop upload component
│   │   ├── PdfEditor.tsx        # WebViewer integration
│   │   └── ExportControls.tsx   # Export & print controls
│   ├── store/
│   │   └── pdfStore.ts          # Zustand state management
│   ├── App.tsx                  # Main application
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── public/
│   └── webviewer/               # WebViewer library files
└── package.json
```

## 🎮 Usage

1. **Upload a PDF**:
   - Drag and drop a PDF file onto the upload area
   - Or click "Choose File" to browse for a file
   - Maximum file size: 50MB

2. **Edit the PDF**:
   - Click the "Edit Text" button in the WebViewer toolbar
   - Click on any text in the PDF to start editing
   - Resize, format, and modify content as needed
   - Use the toolbar for additional editing tools

3. **Export**:
   - Click "Download Edited PDF" to save your changes
   - Or click "Print" to print the document

4. **Upload New PDF**:
   - Click "Upload New PDF" in the header to start over

## 🛠️ Technologies

- **React 19**: Latest React with improved performance
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Apryse WebViewer**: Professional PDF editing SDK

## 🔧 Configuration

### Tailwind CSS

Configured in `tailwind.config.js` with custom gradient utilities.

### TypeScript

Configured in `tsconfig.json` with strict type checking.

### Vite

Configured in `vite.config.ts` with React plugin.

## 📝 API Reference

### Zustand Store (`usePdfStore`)

```typescript
interface PDFStore {
  pdfFile: File | null;              // Current PDF file
  pdfUrl: string | null;             // Object URL for the PDF
  isEditorReady: boolean;            // Editor initialization status
  isLoading: boolean;                // Loading state
  webViewerInstance: any;            // WebViewer instance
  
  // Actions
  setPdfFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
  setIsEditorReady: (ready: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setWebViewerInstance: (instance: any) => void;
  resetState: () => void;
}
```

## 🐛 Troubleshooting

### WebViewer files not found

Run the setup script:
```bash
npm run setup-webviewer
```

### Module not found errors

Make sure all dependencies are installed:
```bash
npm install
```

### WSL/Windows path issues

Use the WSL terminal for running commands instead of PowerShell.

## 📄 License

This project uses Apryse WebViewer which requires a license for production use. Get a free trial at [Apryse](https://apryse.com/).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Apryse WebViewer

---

## 📁 Folder Structure


``` 
├── public/  
├── src/  
├── .gitignore  
├── README.md  
├── eslint.config.js  
├── index.html  
├── package-lock.json  
├── package.json  
├── postcss.config.cjs  
├── tailwind.config.js  
├── tsconfig.json  
├── tsconfig.app.json  
├── tsconfig.node.json  
└── vite.config.ts

```

---

## 🧰 Tech Stack

- ⚛️ React
- ⚡ Vite
- 🎨 Tailwind CSS v3
- 🟦 TypeScript


---

## 🚀 Getting Started

### 1. Clone the Repository & Checkout the Tailwind Branch

```bash
https://github.com/dharshan-kumarj/React_CSS_Frameworks_Starter/tree/Tailwind
cd React_CSS_Frameworks_Starter
git checkout Tailwind

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Start the Dev Server

```bash
npm run dev

```

----------

## 🧩 Tailwind CSS Configuration

###  `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

```
### `postcss.config.cjs`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

###  `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

```

----------

## 🧪 Verifying Tailwind CSS

To check if Tailwind is working:

1.  Go to `src/App.tsx`
    
2.  Add a class like `bg-blue-600 text-white p-4 rounded`
    
3.  Run the app and see the changes
    

----------

## 🏗️ Build for Production

```bash
npm run build

```

Then preview using:

```bash
npm run preview

```
