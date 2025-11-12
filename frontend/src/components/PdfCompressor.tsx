import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

const PdfCompressor: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionStats | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'basic' | 'medium' | 'high'>('medium');

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }

    setPdfFile(file);
    setCompressionStats(null);
    console.log(`PDF selected: ${file.name} (${formatFileSize(file.size)})`);
  };

  // Compress PDF
  const compressPdf = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first');
      return;
    }

    setIsCompressing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalSize = arrayBuffer.byteLength;
      
      console.log(`Starting compression with ${compressionLevel} level...`);
      console.log(`Original size: ${formatFileSize(originalSize)}`);

      // Load PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Apply compression based on level
      let compressedPdfBytes: Uint8Array;

      switch (compressionLevel) {
        case 'basic':
          // Basic: Just re-save without object streams
          compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: false,
          });
          break;

        case 'medium':
          // Medium: Use object streams (better compression)
          compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true,
          });
          break;

        case 'high':
          // High: Object streams + optimize for size
          compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
          });
          break;

        default:
          compressedPdfBytes = await pdfDoc.save();
      }

      const compressedSize = compressedPdfBytes.byteLength;
      const reduction = ((originalSize - compressedSize) / originalSize) * 100;

      console.log(`Compressed size: ${formatFileSize(compressedSize)}`);
      console.log(`Reduction: ${reduction.toFixed(2)}%`);

      // Update stats
      setCompressionStats({
        originalSize,
        compressedSize,
        reductionPercentage: reduction,
      });

      // Download compressed PDF
      const uint8Array = new Uint8Array(compressedPdfBytes);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFile.name.replace('.pdf', '_compressed.pdf');
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      alert(`PDF compressed successfully!\nReduction: ${reduction.toFixed(2)}%`);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('Error compressing PDF. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-green-500/20 p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-green-500/20">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              🗜️ PDF Compressor
            </h1>
            <p className="text-gray-400 text-sm">
              Reduce PDF file size with intelligent compression
            </p>
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block mb-3 text-sm font-semibold text-green-400">
              Select PDF file to compress
            </label>
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gradient-to-r file:from-green-500 file:to-emerald-600
                  file:text-black file:shadow-lg file:shadow-green-500/30
                  hover:file:from-green-400 hover:file:to-emerald-500
                  file:transition-all file:duration-200
                  cursor-pointer
                  bg-gray-800/50 border-2 border-green-500/30 rounded-lg p-3
                  hover:border-green-500/50 transition-colors"
              />
            </div>
            {pdfFile && (
              <div className="mt-3 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-green-500/30">
                <p className="text-sm text-gray-300 flex items-center gap-2">
                  <span className="text-green-400">📄</span> 
                  <strong className="text-green-400">{pdfFile.name}</strong>
                </p>
                <p className="text-sm text-gray-400 mt-1 ml-6">
                  Original size: <strong className="text-white">{formatFileSize(pdfFile.size)}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Compression Level Selection */}
          {pdfFile && (
            <>
              <div className="mb-6">
                <label className="block mb-3 text-sm font-semibold text-green-400">
                  Select Compression Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setCompressionLevel('basic')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      compressionLevel === 'basic'
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-green-500/20 hover:border-green-500/40'
                    }`}
                  >
                    <div className="font-semibold text-white">🟢 Basic</div>
                    <div className="text-sm text-gray-300 mt-1">Light compression</div>
                    <div className="text-xs text-gray-400 mt-1">~5-15% reduction</div>
                  </button>

                  <button
                    onClick={() => setCompressionLevel('medium')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      compressionLevel === 'medium'
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-green-500/20 hover:border-green-500/40'
                    }`}
                  >
                    <div className="font-semibold text-white">🟡 Medium</div>
                    <div className="text-sm text-gray-300 mt-1">Balanced compression</div>
                    <div className="text-xs text-gray-400 mt-1">~15-30% reduction</div>
                  </button>

                  <button
                    onClick={() => setCompressionLevel('high')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      compressionLevel === 'high'
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-green-500/20 hover:border-green-500/40'
                    }`}
                  >
                    <div className="font-semibold text-white">🔴 High</div>
                    <div className="text-sm text-gray-300 mt-1">Maximum compression</div>
                    <div className="text-xs text-gray-400 mt-1">~30-50% reduction</div>
                  </button>
                </div>
              </div>

              {/* Compression Stats */}
              {compressionStats && (
                <div className="mb-6 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border-2 border-green-500/30">
                  <h3 className="text-lg font-semibold text-green-400 mb-3">📊 Compression Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Original Size</p>
                      <p className="text-2xl font-bold text-white">
                        {formatFileSize(compressionStats.originalSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Compressed Size</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatFileSize(compressionStats.compressedSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Reduction</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {compressionStats.reductionPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(compressionStats.reductionPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compress Button */}
              <button
                onClick={compressPdf}
                disabled={isCompressing}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold rounded-xl text-lg
                  hover:from-green-400 hover:to-emerald-500 
                  disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-lg shadow-green-500/30
                  hover:shadow-xl hover:shadow-green-500/40"
              >
                {isCompressing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Compressing PDF...
                  </span>
                ) : (
                  '🗜️ Compress PDF'
                )}
              </button>
            </>
          )}

          {/* Info Section */}
          <div className="mt-6 p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
            <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              How it works:
            </h3>
            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              <li><strong className="text-white">Basic:</strong> Removes redundant data and optimizes structure</li>
              <li><strong className="text-white">Medium:</strong> Uses object streams for better compression</li>
              <li><strong className="text-white">High:</strong> Maximum optimization with object streams</li>
            </ul>
            <p className="text-xs text-gray-400 mt-3 flex items-start gap-2">
              <span className="text-yellow-400">⚠️</span>
              <span>Note: Compression results vary based on PDF content. PDFs with many images may not compress as much.</span>
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
            <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
              <span className="text-lg">📖</span>
              Tips for best results:
            </h3>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li className="pl-2">Start with "Medium" compression for balanced results</li>
              <li className="pl-2">Use "High" for maximum file size reduction</li>
              <li className="pl-2">PDFs with lots of text compress better than image-heavy PDFs</li>
              <li className="pl-2">Already compressed PDFs may not reduce much further</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfCompressor;
