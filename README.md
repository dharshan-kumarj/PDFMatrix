# PDFMatrix

**PDFMatrix** is a free, browser-based tool for seamless PDF editing, merging, and file conversion—built for students and professionals who want full control with no credit or usage limits.

## 🎯 Current Features (MVP v1.0)

### ✨ Real-time PDF Editor
- **Upload PDF Files** - Drag-and-drop interface with file validation
- **Edit PDF Text in Browser** - WYSIWYG text editing powered by Apryse WebViewer
- **Real-time Formatting** - Resize, reformat, and style text directly in PDFs
- **Export Edited PDFs** - Download your modified PDFs instantly
- **Print Support** - Print directly from the browser

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Modern, utility-first styling
- **Zustand** - Lightweight state management
- **Apryse WebViewer** - Professional PDF editing SDK

### Backend
- Python (Coming soon for advanced features)

## 📦 Project Structure

```
PDFMatrix/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── store/      # State management
│   │   └── App.tsx     # Main application
│   └── public/         # Static assets
└── backend/            # Python backend (future)
```

## 🏃 Getting Started

### Prerequisites
- Node.js 18+ and npm
- WSL2 (if on Windows)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dharshan-kumarj/PDFMatrix.git
   cd PDFMatrix/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   npm install zustand
   ```

3. **Set up WebViewer**:
   ```bash
   npm run setup-webviewer
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to `http://localhost:5173`

📖 For detailed setup instructions, see [frontend/SETUP.md](frontend/SETUP.md)

## 🎮 Usage

1. **Upload a PDF** - Drag and drop or click to browse
2. **Edit Content** - Click "Edit Text" and modify your PDF
3. **Export** - Download your edited PDF

## 🔮 Upcoming Features

- **Merge Multiple PDFs** - Combine several documents into one
- **Word to PDF Conversion** - Convert `.docx` to PDF
- **PDF to Word Conversion** - Export PDFs to editable Word format
- **Page Management** - Add, remove, and reorder pages
- **Annotations** - Add comments, highlights, and notes
- **Form Filling** - Fill and create PDF forms

## 🔒 Privacy First

- 100% client-side processing (current MVP)
- Your files never leave your device
- No usage caps or credit limits
- No watermarks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project uses Apryse WebViewer which requires a license for production use. Get a free trial at [Apryse](https://apryse.com/).

## 🙏 Acknowledgments

- Apryse WebViewer for the powerful PDF editing engine
- React team for the amazing framework
- Open source community for inspiration

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for students and professionals worldwide
