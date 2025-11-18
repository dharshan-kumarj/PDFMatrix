import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import PdfQualitySelector, { PdfQualitySettings, DEFAULT_QUALITY_PRESETS } from './PdfQualitySelector';

type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type Format = 'number' | 'page-of-total' | 'page-x-of-y';

const PdfPageNumbers: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [format, setFormat] = useState<Format>('number');
  const [fontSize, setFontSize] = useState(12);
  const [marginX, setMarginX] = useState(50);
  const [marginY, setMarginY] = useState(30);
  const [startNumber, setStartNumber] = useState(1);
  const [skipFirstPage, setSkipFirstPage] = useState(false);
  const [skipLastPage, setSkipLastPage] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [opacity, setOpacity] = useState(0.8);
  const [qualitySettings, setQualitySettings] = useState<PdfQualitySettings>({
    level: 'medium',
    ...DEFAULT_QUALITY_PRESETS.medium,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      console.log('PDF file selected:', file.name);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  };

  const getPageNumberText = (pageNum: number, totalPages: number): string => {
    let text = '';
    
    if (prefix) text += prefix + ' ';
    
    switch (format) {
      case 'number':
        text += (pageNum + startNumber - 1).toString();
        break;
      case 'page-of-total':
        text += `Page ${pageNum + startNumber - 1} of ${totalPages + startNumber - 1}`;
        break;
      case 'page-x-of-y':
        text += `${pageNum + startNumber - 1} / ${totalPages + startNumber - 1}`;
        break;
    }
    
    if (suffix) text += ' ' + suffix;
    
    return text;
  };

  const getTextPosition = (
    pageWidth: number,
    pageHeight: number,
    textWidth: number
  ): { x: number; y: number } => {
    let x = 0;
    let y = 0;

    // Calculate Y position (vertical)
    if (position.startsWith('top')) {
      y = pageHeight - marginY;
    } else {
      y = marginY;
    }

    // Calculate X position (horizontal)
    if (position.includes('left')) {
      x = marginX;
    } else if (position.includes('center')) {
      x = (pageWidth - textWidth) / 2;
    } else {
      x = pageWidth - marginX - textWidth;
    }

    return { x, y };
  };

  const addPageNumbers = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first');
      return;
    }

    setLoading(true);
    console.log('Adding page numbers to PDF...');

    try {
      // Read the PDF file
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      console.log(`PDF loaded: ${totalPages} pages`);

      // Embed font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const color = hexToRgb(textColor);

      // Add page numbers to each page
      for (let i = 0; i < totalPages; i++) {
        // Skip first page if option is enabled
        if (skipFirstPage && i === 0) {
          console.log(`Skipping first page (page ${i + 1})`);
          continue;
        }

        // Skip last page if option is enabled
        if (skipLastPage && i === totalPages - 1) {
          console.log(`Skipping last page (page ${i + 1})`);
          continue;
        }

        const page = pages[i];
        const { width, height } = page.getSize();

        // Get the text for this page
        const text = getPageNumberText(i + 1, totalPages);
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        // Calculate position
        const { x, y } = getTextPosition(width, height, textWidth);

        // Draw the page number
        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
          opacity: opacity,
        });

        console.log(`Added page number to page ${i + 1}: "${text}"`);
      }

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile.name.replace('.pdf', '')}_numbered.pdf`;
      link.click();

      console.log('PDF with page numbers created successfully');
      alert('Page numbers added successfully!');
    } catch (error) {
      console.error('Error adding page numbers:', error);
      alert('Failed to add page numbers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-green-500/20 p-6 sm:p-8">
          <div className="text-center mb-6 pb-4 border-b border-green-500/20">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <span className="text-4xl">🔢📄</span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                PDF Page Numbers
              </span>
            </h1>
            <p className="text-gray-400 text-sm">
              Add customizable page numbers to your PDF
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-green-400 mb-3">
              📄 Select PDF File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gradient-to-r file:from-green-500 file:to-emerald-600 file:text-black file:shadow-lg file:shadow-green-500/30
                  hover:file:from-green-400 hover:file:to-emerald-500 file:cursor-pointer
                  cursor-pointer bg-gray-800/50 border-2 border-green-500/30
                  rounded-xl p-4 hover:border-green-500/50 transition-colors"
              />
            </div>
            {pdfFile && (
              <p className="mt-3 text-sm text-gray-300 bg-green-500/20 p-3 rounded-xl border border-green-500/30">
                ✓ Selected: <span className="font-semibold text-green-400">{pdfFile.name}</span>
              </p>
            )}
          </div>

          {/* Settings Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                📍 Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="w-full px-4 py-3 bg-gray-800/50 border-2 border-green-500/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                📝 Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as Format)}
                className="w-full px-4 py-3 bg-gray-800/50 border-2 border-green-500/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="number">Number Only (1, 2, 3...)</option>
                <option value="page-of-total">Page X of Y</option>
                <option value="page-x-of-y">X / Y</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                🔤 Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-xl appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>8px</span>
                <span>16px</span>
                <span>24px</span>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                🎨 Text Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-12 bg-gray-800/50 border-2 border-green-500/30 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-4 py-3 bg-gray-800/50 border-2 border-green-500/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                💧 Opacity: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-xl appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>30%</span>
                <span>65%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Margin X */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                ↔️ Horizontal Margin: {marginX}px
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={marginX}
                onChange={(e) => setMarginX(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-xl appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10px</span>
                <span>55px</span>
                <span>100px</span>
              </div>
            </div>

            {/* Margin Y */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                ↕️ Vertical Margin: {marginY}px
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={marginY}
                onChange={(e) => setMarginY(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-xl appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10px</span>
                <span>55px</span>
                <span>100px</span>
              </div>
            </div>

            {/* Start Number */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                🔢 Start Number
              </label>
              <input
                type="number"
                min="1"
                value={startNumber}
                onChange={(e) => setStartNumber(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800/50 border-2 border-green-500/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Prefix */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                📌 Prefix (Optional)
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g., Page"
                className="w-full px-4 py-3 bg-gray-800/50 border-2 border-green-500/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
              />
            </div>

            {/* Suffix */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-green-400 mb-3">
                📌 Suffix (Optional)
              </label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="e.g., - Confidential"
                className="w-full px-4 py-3 bg-gray-800/50 border-2 border-green-500/30 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Skip Options */}
          <div className="mb-8 bg-gradient-to-br from-gray-800/50 to-black/50 rounded-xl border border-green-500/30 p-6">
            <h3 className="text-sm font-semibold text-green-400 mb-4">
              ⚙️ Skip Pages Options
            </h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipFirstPage}
                  onChange={(e) => setSkipFirstPage(e.target.checked)}
                  className="w-5 h-5 text-green-600 bg-gray-800 border-green-500/30 rounded focus:ring-green-500 cursor-pointer accent-green-500"
                />
                <span className="text-gray-300">Skip first page (cover page)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipLastPage}
                  onChange={(e) => setSkipLastPage(e.target.checked)}
                  className="w-5 h-5 text-green-600 bg-gray-800 border-green-500/30 rounded focus:ring-green-500 cursor-pointer accent-green-500"
                />
                <span className="text-gray-300">Skip last page (back cover)</span>
              </label>
            </div>
          </div>

          {/* Preview Example */}
          <div className="mb-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30">
            <h3 className="text-sm font-semibold text-green-400 mb-3">
              👁️ Preview Example
            </h3>
            <div className="bg-gray-900/50 rounded-xl p-4 text-center border border-green-500/20">
              <p className="text-gray-400 text-sm mb-2">Page 1 will display as:</p>
              <p
                className="font-semibold"
                style={{
                  color: textColor,
                  fontSize: `${fontSize}px`,
                }}
              >
                {getPageNumberText(1, 10)}
              </p>
            </div>
          </div>

          {/* Quality Settings */}
          {pdfFile && (
            <PdfQualitySelector
              qualitySettings={qualitySettings}
              onChange={setQualitySettings}
              className="mb-6"
            />
          )}

          {/* Add Page Numbers Button */}
          <button
            onClick={addPageNumbers}
            disabled={!pdfFile || loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all ${
              !pdfFile || loading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-black hover:from-green-400 hover:to-emerald-500 transform hover:scale-[1.02] shadow-green-500/30'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Adding Page Numbers...
              </span>
            ) : (
              '🔢 Add Page Numbers to PDF'
            )}
          </button>

          {/* Info Section */}
          <div className="mt-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border-l-4 border-green-500">
            <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
              <span>💡</span> Tips for Best Results
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong className="text-white">Position:</strong> Bottom center is the most common position for page numbers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong className="text-white">Skip First Page:</strong> Enable this if your first page is a cover page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong className="text-white">Font Size:</strong> 10-12px works best for most documents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong className="text-white">Margins:</strong> Increase margins if text is too close to the edge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong className="text-white">Prefix/Suffix:</strong> Add custom text like "Page" or "Confidential"</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPageNumbers;
