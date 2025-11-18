import React, { useState } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import PdfQualitySelector, { PdfQualitySettings, DEFAULT_QUALITY_PRESETS } from './PdfQualitySelector';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

type PageSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'Custom';
type ImageFit = 'fit' | 'fill' | 'stretch';

const ImagesToPdf: React.FC = () => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [imageFit, setImageFit] = useState<ImageFit>('fit');
  const [margin, setMargin] = useState(20);
  const [qualitySettings, setQualitySettings] = useState<PdfQualitySettings>({
    level: 'medium',
    ...DEFAULT_QUALITY_PRESETS.medium,
  });

  // Handle image file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFilesOnly = files.filter(file => file.type.startsWith('image/'));

    if (imageFilesOnly.length === 0) {
      alert('Please select valid image files (PNG, JPEG, etc.)');
      return;
    }

    const newImageFiles: ImageFile[] = [];

    for (const file of imageFilesOnly) {
      try {
        // Read image and get dimensions
        const dataUrl = await readFileAsDataURL(file);
        const { width, height } = await getImageDimensions(dataUrl);

        newImageFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          dataUrl,
          width,
          height,
        });
      } catch (error) {
        console.error(`Error loading ${file.name}:`, error);
      }
    }

    setImageFiles(prev => [...prev, ...newImageFiles]);
  };

  // Read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Get image dimensions
  const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  // Remove image
  const removeImage = (id: string) => {
    setImageFiles(prev => prev.filter(img => img.id !== id));
  };

  // Move image up
  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...imageFiles];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setImageFiles(newFiles);
  };

  // Move image down
  const moveImageDown = (index: number) => {
    if (index === imageFiles.length - 1) return;
    const newFiles = [...imageFiles];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setImageFiles(newFiles);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newFiles = [...imageFiles];
    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, draggedItem);

    setImageFiles(newFiles);
    setDraggedIndex(null);
  };

  // Clear all images
  const clearAllImages = () => {
    setImageFiles([]);
  };

  // Get page dimensions based on page size
  const getPageDimensions = (): { width: number; height: number } => {
    switch (pageSize) {
      case 'A4':
        return { width: PageSizes.A4[0], height: PageSizes.A4[1] };
      case 'Letter':
        return { width: PageSizes.Letter[0], height: PageSizes.Letter[1] };
      case 'Legal':
        return { width: PageSizes.Legal[0], height: PageSizes.Legal[1] };
      case 'A3':
        return { width: PageSizes.A3[0], height: PageSizes.A3[1] };
      case 'A5':
        return { width: PageSizes.A5[0], height: PageSizes.A5[1] };
      default:
        return { width: PageSizes.A4[0], height: PageSizes.A4[1] };
    }
  };

  // Compress and resize image
  const compressImage = async (
    dataUrl: string,
    maxDimension: number,
    quality: number
  ): Promise<{ dataUrl: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Resize if needed
        if (maxDimension > 0 && (width > maxDimension || height > maxDimension)) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG for compression (better than PNG for photos)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        resolve({
          dataUrl: compressedDataUrl,
          width,
          height,
        });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  // Convert images to PDF
  const convertImagesToPdf = async () => {
    if (imageFiles.length === 0) {
      alert('Please add at least one image');
      return;
    }

    setIsConverting(true);

    try {
      console.log(`Converting ${imageFiles.length} images to PDF with quality: ${qualitySettings.level}...`);

      // Create new PDF document
      const pdfDoc = await PDFDocument.create();
      const pageDimensions = getPageDimensions();

      for (const imageFile of imageFiles) {
        try {
          // Compress image based on quality settings
          const { dataUrl: compressedDataUrl } = await compressImage(
            imageFile.dataUrl,
            qualitySettings.imageMaxDimension,
            qualitySettings.imageQuality
          );

          // Fetch compressed image
          const imageBytes = await fetch(compressedDataUrl).then(res => res.arrayBuffer());

          // Embed image (always as JPEG after compression)
          const image = await pdfDoc.embedJpg(imageBytes);

          // Create page
          const page = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);

          // Calculate image placement based on fit mode
          const availableWidth = pageDimensions.width - margin * 2;
          const availableHeight = pageDimensions.height - margin * 2;

          let imageWidth = image.width;
          let imageHeight = image.height;
          let x = margin;
          let y = margin;

          if (imageFit === 'fit') {
            // Fit image within page while maintaining aspect ratio
            const scaleX = availableWidth / image.width;
            const scaleY = availableHeight / image.height;
            const scale = Math.min(scaleX, scaleY);

            imageWidth = image.width * scale;
            imageHeight = image.height * scale;

            // Center the image
            x = (pageDimensions.width - imageWidth) / 2;
            y = (pageDimensions.height - imageHeight) / 2;
          } else if (imageFit === 'fill') {
            // Fill page while maintaining aspect ratio (crop if needed)
            const scaleX = availableWidth / image.width;
            const scaleY = availableHeight / image.height;
            const scale = Math.max(scaleX, scaleY);

            imageWidth = image.width * scale;
            imageHeight = image.height * scale;

            // Center the image
            x = (pageDimensions.width - imageWidth) / 2;
            y = (pageDimensions.height - imageHeight) / 2;
          } else if (imageFit === 'stretch') {
            // Stretch to fill entire page
            imageWidth = availableWidth;
            imageHeight = availableHeight;
            x = margin;
            y = margin;
          }

          // Draw image on page
          page.drawImage(image, {
            x,
            y,
            width: imageWidth,
            height: imageHeight,
          });

          console.log(`Added ${imageFile.name} to PDF (compressed)`);
        } catch (error) {
          console.error(`Error adding ${imageFile.name}:`, error);
        }
      }

      // Save PDF with compression settings
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: qualitySettings.useObjectStreams,
      });

      // Download PDF
      const uint8Array = new Uint8Array(pdfBytes);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images-to-pdf.pdf';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      alert(`Successfully created PDF with ${imageFiles.length} image(s)!`);
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Error creating PDF. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-green-500/20 p-6 sm:p-8">
          <div className="text-center mb-6 pb-4 border-b border-green-500/20">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <span className="text-4xl">🖼️📄</span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Images to PDF
              </span>
            </h1>
            <p className="text-gray-400 text-sm">
              Select images to convert
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-green-400">
              Select images to convert
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-gradient-to-r file:from-green-500 file:to-emerald-600 file:text-black file:shadow-lg file:shadow-green-500/30
                hover:file:from-green-400 hover:file:to-emerald-500
                cursor-pointer"
            />
            <p className="mt-2 text-sm text-gray-400">
              You can select multiple images at once
            </p>
          </div>

          {/* PDF Settings */}
          {imageFiles.length > 0 && (
            <>
              <div className="mb-6 p-6 bg-gradient-to-br from-gray-800/50 to-black/50 rounded-xl border border-green-500/30">
                <h3 className="text-lg font-semibold text-green-400 mb-4">PDF Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Page Size */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-green-400">
                      Page Size
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as PageSize)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-white"
                    >
                      <option value="A4">A4 (210 × 297 mm)</option>
                      <option value="Letter">Letter (8.5 × 11 in)</option>
                      <option value="Legal">Legal (8.5 × 14 in)</option>
                      <option value="A3">A3 (297 × 420 mm)</option>
                      <option value="A5">A5 (148 × 210 mm)</option>
                    </select>
                  </div>

                  {/* Image Fit */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-green-400">
                      Image Fit
                    </label>
                    <select
                      value={imageFit}
                      onChange={(e) => setImageFit(e.target.value as ImageFit)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-white"
                    >
                      <option value="fit">Fit (maintain ratio)</option>
                      <option value="fill">Fill (crop if needed)</option>
                      <option value="stretch">Stretch (distort)</option>
                    </select>
                  </div>

                  {/* Margin */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-green-400">
                      Margin: {margin}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value))}
                      className="w-full accent-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quality Settings */}
              <PdfQualitySelector
                qualitySettings={qualitySettings}
                onChange={setQualitySettings}
                className="mb-6"
              />

              {/* Images List */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-green-400">
                    Images ({imageFiles.length})
                  </h3>
                  <button
                    onClick={clearAllImages}
                    className="text-sm text-red-400 hover:text-red-300 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageFiles.map((image, index) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`border-2 border-green-500/30 rounded-xl overflow-hidden transition-all cursor-move ${
                        draggedIndex === index ? 'opacity-50' : ''
                      } hover:border-green-500/50 bg-gray-900/50`}
                    >
                      <div className="relative p-2 bg-gray-800/50">
                        <img
                          src={image.dataUrl}
                          alt={image.name}
                          className="w-full h-48 object-contain rounded"
                        />
                        <div className="absolute top-2 left-2 bg-green-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                          {index + 1}
                        </div>
                      </div>

                      <div className="p-3 bg-gray-900/50 border-t border-green-500/30">
                        <p className="text-sm font-medium text-green-400 mb-2 truncate">
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          {image.width} × {image.height}px
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => moveImageUp(index)}
                            disabled={index === 0}
                            className="flex-1 px-2 py-1 bg-gray-700 text-gray-100 rounded text-xs hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveImageDown(index)}
                            disabled={index === imageFiles.length - 1}
                            className="flex-1 px-2 py-1 bg-gray-700 text-gray-100 rounded text-xs hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => removeImage(image.id)}
                            className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-sm text-gray-400 italic">
                  💡 Tip: Drag and drop to reorder images, or use ▲ ▼ buttons
                </p>
              </div>

              {/* Convert Button */}
              <button
                onClick={convertImagesToPdf}
                disabled={isConverting}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold rounded-xl
                  hover:from-green-400 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed
                  transition-colors shadow-lg shadow-green-500/30 hover:shadow-xl"
              >
                {isConverting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating PDF...
                  </span>
                ) : (
                  `📄 Create PDF (${imageFiles.length} image${imageFiles.length !== 1 ? 's' : ''})`
                )}
              </button>
            </>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
            <h3 className="text-sm font-semibold text-green-400 mb-2">📖 How to use:</h3>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Click "Choose Files" and select multiple images</li>
              <li>Reorder images by dragging or using ▲ ▼ buttons</li>
              <li>Choose page size, image fit mode, and margin</li>
              <li>Click "Create PDF" to download your PDF</li>
            </ol>
            <div className="mt-3 text-sm text-gray-300">
              <p className="font-semibold text-green-400"><strong>Image Fit Modes:</strong></p>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong className="text-white">Fit:</strong> Centers image and scales to fit page (recommended)</li>
                <li><strong className="text-white">Fill:</strong> Fills page completely, may crop image</li>
                <li><strong className="text-white">Stretch:</strong> Stretches image to fill page, may distort</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagesToPdf;
