import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

type WatermarkType = 'text' | 'image';
type Position = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal' | 'tile';

const PdfWatermark: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  const [loading, setLoading] = useState(false);

  // Text watermark settings
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#FF0000');
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<Position>('diagonal');

  // Image watermark settings
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [imageScale, setImageScale] = useState(0.3);
  const [imagePosition, setImagePosition] = useState<Position>('center');

  // Common settings
  const [applyToAllPages, setApplyToAllPages] = useState(true);
  const [specificPages, setSpecificPages] = useState('');

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      console.log('PDF file selected:', file.name);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWatermarkImage(file);
      console.log('Watermark image selected:', file.name);
    } else {
      alert('Please select a valid image file (PNG, JPEG, etc.)');
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

  const parsePageNumbers = (input: string, totalPages: number): number[] => {
    if (!input.trim()) return [];
    
    const pages = new Set<number>();
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        if (start && end && start <= end) {
          for (let i = start; i <= Math.min(end, totalPages); i++) {
            pages.add(i);
          }
        }
      } else {
        const pageNum = Number(trimmed);
        if (pageNum && pageNum <= totalPages) {
          pages.add(pageNum);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const getTextPosition = (
    pageWidth: number,
    pageHeight: number,
    pos: Position
  ): { x: number; y: number; rotation: number } => {
    let x = 0;
    let y = 0;
    let rot = 0;

    switch (pos) {
      case 'center':
        x = pageWidth / 2;
        y = pageHeight / 2;
        rot = rotation;
        break;
      case 'diagonal':
        x = pageWidth / 2;
        y = pageHeight / 2;
        rot = 45;
        break;
      case 'top-left':
        x = 50;
        y = pageHeight - 50;
        rot = 0;
        break;
      case 'top-right':
        x = pageWidth - 50;
        y = pageHeight - 50;
        rot = 0;
        break;
      case 'bottom-left':
        x = 50;
        y = 50;
        rot = 0;
        break;
      case 'bottom-right':
        x = pageWidth - 50;
        y = 50;
        rot = 0;
        break;
      case 'tile':
        // Tile will be handled separately
        x = 0;
        y = 0;
        rot = rotation;
        break;
    }

    return { x, y, rotation: rot };
  };

  const getImagePosition = (
    pageWidth: number,
    pageHeight: number,
    imageWidth: number,
    imageHeight: number,
    pos: Position
  ): { x: number; y: number } => {
    let x = 0;
    let y = 0;

    switch (pos) {
      case 'center':
      case 'diagonal':
        x = (pageWidth - imageWidth) / 2;
        y = (pageHeight - imageHeight) / 2;
        break;
      case 'top-left':
        x = 20;
        y = pageHeight - imageHeight - 20;
        break;
      case 'top-right':
        x = pageWidth - imageWidth - 20;
        y = pageHeight - imageHeight - 20;
        break;
      case 'bottom-left':
        x = 20;
        y = 20;
        break;
      case 'bottom-right':
        x = pageWidth - imageWidth - 20;
        y = 20;
        break;
      case 'tile':
        // Tile will be handled separately
        break;
    }

    return { x, y };
  };

  const addTextWatermark = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first');
      return;
    }

    if (!watermarkText.trim()) {
      alert('Please enter watermark text');
      return;
    }

    setLoading(true);
    console.log('Adding text watermark to PDF...');

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      console.log(`PDF loaded: ${totalPages} pages`);

      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const color = hexToRgb(textColor);

      // Determine which pages to watermark
      let pagesToWatermark: number[];
      if (applyToAllPages) {
        pagesToWatermark = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        pagesToWatermark = parsePageNumbers(specificPages, totalPages);
        if (pagesToWatermark.length === 0) {
          alert('Please specify valid page numbers');
          setLoading(false);
          return;
        }
      }

      console.log(`Applying watermark to pages: ${pagesToWatermark.join(', ')}`);

      for (const pageNum of pagesToWatermark) {
        const page = pages[pageNum - 1];
        const { width, height } = page.getSize();

        if (position === 'tile') {
          // Tile watermark across the page
          const spacingX = 250;
          const spacingY = 150;
          const cols = Math.ceil(width / spacingX) + 1;
          const rows = Math.ceil(height / spacingY) + 1;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = col * spacingX;
              const y = row * spacingY;

              page.drawText(watermarkText, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(color.r, color.g, color.b),
                opacity: opacity,
                rotate: degrees(rotation),
              });
            }
          }
          console.log(`Tiled watermark on page ${pageNum}`);
        } else {
          // Single watermark at specified position
          const { x, y, rotation: rot } = getTextPosition(width, height, position);

          page.drawText(watermarkText, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(color.r, color.g, color.b),
            opacity: opacity,
            rotate: degrees(rot),
          });
          console.log(`Added watermark to page ${pageNum} at position ${position}`);
        }
      }

      // Save the watermarked PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile.name.replace('.pdf', '')}_watermarked.pdf`;
      link.click();

      console.log('Watermarked PDF created successfully');
      alert('Watermark added successfully!');
    } catch (error) {
      console.error('Error adding watermark:', error);
      alert('Failed to add watermark. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addImageWatermark = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first');
      return;
    }

    if (!watermarkImage) {
      alert('Please select a watermark image');
      return;
    }

    setLoading(true);
    console.log('Adding image watermark to PDF...');

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      console.log(`PDF loaded: ${totalPages} pages`);

      // Embed the image
      const imageBytes = await watermarkImage.arrayBuffer();
      let embeddedImage;

      if (watermarkImage.type === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else if (watermarkImage.type === 'image/jpeg' || watermarkImage.type === 'image/jpg') {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else {
        alert('Please use PNG or JPEG images only');
        setLoading(false);
        return;
      }

      const imageDims = embeddedImage.scale(imageScale);

      // Determine which pages to watermark
      let pagesToWatermark: number[];
      if (applyToAllPages) {
        pagesToWatermark = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        pagesToWatermark = parsePageNumbers(specificPages, totalPages);
        if (pagesToWatermark.length === 0) {
          alert('Please specify valid page numbers');
          setLoading(false);
          return;
        }
      }

      console.log(`Applying image watermark to pages: ${pagesToWatermark.join(', ')}`);

      for (const pageNum of pagesToWatermark) {
        const page = pages[pageNum - 1];
        const { width, height } = page.getSize();

        if (imagePosition === 'tile') {
          // Tile image watermark across the page
          const spacingX = imageDims.width + 100;
          const spacingY = imageDims.height + 100;
          const cols = Math.ceil(width / spacingX) + 1;
          const rows = Math.ceil(height / spacingY) + 1;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = col * spacingX;
              const y = row * spacingY;

              page.drawImage(embeddedImage, {
                x,
                y,
                width: imageDims.width,
                height: imageDims.height,
                opacity: imageOpacity,
              });
            }
          }
          console.log(`Tiled image watermark on page ${pageNum}`);
        } else {
          // Single image watermark at specified position
          const { x, y } = getImagePosition(width, height, imageDims.width, imageDims.height, imagePosition);

          page.drawImage(embeddedImage, {
            x,
            y,
            width: imageDims.width,
            height: imageDims.height,
            opacity: imageOpacity,
          });
          console.log(`Added image watermark to page ${pageNum} at position ${imagePosition}`);
        }
      }

      // Save the watermarked PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile.name.replace('.pdf', '')}_watermarked.pdf`;
      link.click();

      console.log('Image watermarked PDF created successfully');
      alert('Image watermark added successfully!');
    } catch (error) {
      console.error('Error adding image watermark:', error);
      alert('Failed to add image watermark. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWatermark = () => {
    if (watermarkType === 'text') {
      addTextWatermark();
    } else {
      addImageWatermark();
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              💧 PDF Watermark
            </h1>
            <p className="text-gray-300">
              Add text or image watermarks to protect your PDFs
            </p>
          </div>

          {/* PDF File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-green-400 mb-3">
              📄 Select PDF File
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-3 file:px-6
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-gradient-to-r file:from-green-500 file:to-emerald-600 file:text-black file:shadow-lg file:shadow-green-500/30
                hover:file:from-green-400 hover:file:to-emerald-500 file:cursor-pointer
                cursor-pointer border-2 border-dashed border-gray-300
                rounded-xl p-4 hover:border-teal-400 transition-colors"
            />
            {pdfFile && (
              <p className="mt-3 text-sm text-gray-300 bg-teal-50 p-3 rounded-xl">
                ✓ Selected: <span className="font-semibold">{pdfFile.name}</span>
              </p>
            )}
          </div>

          {/* Watermark Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-green-400 mb-3">
              🎨 Watermark Type
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setWatermarkType('text')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                  watermarkType === 'text'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-green-400 hover:bg-gray-200'
                }`}
              >
                📝 Text Watermark
              </button>
              <button
                onClick={() => setWatermarkType('image')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                  watermarkType === 'image'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-green-400 hover:bg-gray-200'
                }`}
              >
                🖼️ Image Watermark
              </button>
            </div>
          </div>

          {/* Text Watermark Settings */}
          {watermarkType === 'text' && (
            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  📝 Text Watermark Settings
                </h3>

                {/* Watermark Text */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-green-400 mb-3">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>20px</span>
                      <span>70px</span>
                      <span>120px</span>
                    </div>
                  </div>

                  {/* Opacity */}
                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Opacity: {Math.round(opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>10%</span>
                      <span>55%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Text Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-16 h-12 border-2 border-gray-300 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Rotation */}
                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Rotation: {rotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0°</span>
                      <span>180°</span>
                      <span>360°</span>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Position
                    </label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value as Position)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="center">Center</option>
                      <option value="diagonal">Diagonal (Center at 45°)</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="tile">Tile (Repeating Pattern)</option>
                    </select>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6 bg-white rounded-xl p-6 border-2 border-green-500/20">
                  <p className="text-sm text-gray-300 mb-3 text-center">Preview:</p>
                  <div className="flex justify-center">
                    <p
                      style={{
                        color: textColor,
                        fontSize: `${Math.min(fontSize, 32)}px`,
                        opacity: opacity,
                        transform: `rotate(${position === 'diagonal' ? 45 : rotation}deg)`,
                        fontWeight: 'bold',
                      }}
                    >
                      {watermarkText || 'Preview'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Watermark Settings */}
          {watermarkType === 'image' && (
            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                  🖼️ Image Watermark Settings
                </h3>

                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-green-400 mb-3">
                    Watermark Image (PNG or JPEG)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-3 file:px-6
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gradient-to-r file:from-green-500 file:to-emerald-600 file:text-black file:shadow-lg file:shadow-green-500/30
                      hover:file:from-green-400 hover:file:to-emerald-500 file:cursor-pointer
                      cursor-pointer border-2 border-dashed border-gray-300
                      rounded-xl p-4 hover:border-teal-400 transition-colors"
                  />
                  {watermarkImage && (
                    <p className="mt-3 text-sm text-gray-300 bg-teal-50 p-3 rounded-xl">
                      ✓ Selected: <span className="font-semibold">{watermarkImage.name}</span>
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image Opacity */}
                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Opacity: {Math.round(imageOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={imageOpacity}
                      onChange={(e) => setImageOpacity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>10%</span>
                      <span>55%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Image Scale */}
                  <div>
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Size: {Math.round(imageScale * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={imageScale}
                      onChange={(e) => setImageScale(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>10%</span>
                      <span>55%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Image Position */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-green-400 mb-3">
                      Position
                    </label>
                    <select
                      value={imagePosition}
                      onChange={(e) => setImagePosition(e.target.value as Position)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="center">Center</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="tile">Tile (Repeating Pattern)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page Selection */}
          <div className="mb-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-green-400 mb-4">
              📄 Apply To Pages
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={applyToAllPages}
                  onChange={() => setApplyToAllPages(true)}
                  className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-green-400">Apply to all pages</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!applyToAllPages}
                  onChange={() => setApplyToAllPages(false)}
                  className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-green-400">Apply to specific pages</span>
              </label>
              {!applyToAllPages && (
                <input
                  type="text"
                  value={specificPages}
                  onChange={(e) => setSpecificPages(e.target.value)}
                  placeholder="e.g., 1,3,5-7,10"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* Add Watermark Button */}
          <button
            onClick={handleAddWatermark}
            disabled={!pdfFile || loading || (watermarkType === 'image' && !watermarkImage)}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all ${
              !pdfFile || loading || (watermarkType === 'image' && !watermarkImage)
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 transform hover:scale-[1.02]'
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
                Adding Watermark...
              </span>
            ) : (
              '💧 Add Watermark to PDF'
            )}
          </button>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>💡</span> Watermark Tips
            </h3>
            <ul className="space-y-2 text-sm text-green-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Text Watermarks:</strong> Perfect for "CONFIDENTIAL", "DRAFT", or copyright notices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Image Watermarks:</strong> Great for logos, signatures, or stamps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Opacity:</strong> Lower opacity (30-50%) maintains document readability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Diagonal:</strong> Classic diagonal watermark prevents easy cropping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Tile:</strong> Repeating pattern across entire page for maximum protection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>PNG Images:</strong> Use PNG with transparency for best results</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfWatermark;
