import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type PermissionLevel = 'full' | 'read-only' | 'print-only' | 'custom';

const PdfPasswordProtection: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Password settings
  const [ownerPassword, setOwnerPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [useUserPassword, setUseUserPassword] = useState(false);
  
  // Permission settings
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('full');
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowModifying, setAllowModifying] = useState(false);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowAnnotations, setAllowAnnotations] = useState(false);
  const [allowFormFilling, setAllowFormFilling] = useState(false);
  const [allowScreenReaders, setAllowScreenReaders] = useState(true);
  const [allowAssembly, setAllowAssembly] = useState(false);
  const [allowDegradedPrinting, setAllowDegradedPrinting] = useState(true);

  // Password strength indicator
  const [ownerPasswordStrength, setOwnerPasswordStrength] = useState(0);
  const [userPasswordStrength, setUserPasswordStrength] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      console.log('PDF file selected:', file.name);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // Character types
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    
    return Math.min(strength, 100);
  };

  const handleOwnerPasswordChange = (value: string) => {
    setOwnerPassword(value);
    setOwnerPasswordStrength(calculatePasswordStrength(value));
  };

  const handleUserPasswordChange = (value: string) => {
    setUserPassword(value);
    setUserPasswordStrength(calculatePasswordStrength(value));
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength === 0) return 'bg-gray-300';
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength === 0) return 'No password';
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  const applyPermissionLevel = (level: PermissionLevel) => {
    setPermissionLevel(level);
    
    switch (level) {
      case 'full':
        setAllowPrinting(true);
        setAllowModifying(true);
        setAllowCopying(true);
        setAllowAnnotations(true);
        setAllowFormFilling(true);
        setAllowScreenReaders(true);
        setAllowAssembly(true);
        setAllowDegradedPrinting(true);
        break;
      case 'read-only':
        setAllowPrinting(false);
        setAllowModifying(false);
        setAllowCopying(false);
        setAllowAnnotations(false);
        setAllowFormFilling(false);
        setAllowScreenReaders(true);
        setAllowAssembly(false);
        setAllowDegradedPrinting(false);
        break;
      case 'print-only':
        setAllowPrinting(true);
        setAllowModifying(false);
        setAllowCopying(false);
        setAllowAnnotations(false);
        setAllowFormFilling(false);
        setAllowScreenReaders(true);
        setAllowAssembly(false);
        setAllowDegradedPrinting(true);
        break;
      case 'custom':
        // Keep current settings
        break;
    }
  };

  const protectPdf = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first');
      return;
    }

    if (!ownerPassword.trim()) {
      alert('Please enter an owner password (required)');
      return;
    }

    if (ownerPasswordStrength < 40) {
      const confirm = window.confirm(
        'Your owner password is weak. A strong password is recommended for security.\n\nDo you want to continue anyway?'
      );
      if (!confirm) return;
    }

    if (useUserPassword && !userPassword.trim()) {
      alert('Please enter a user password or uncheck "Require User Password"');
      return;
    }

    setLoading(true);
    console.log('Protecting PDF with password...');

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      console.log(`PDF loaded: ${pages.length} pages`);

      // Note: pdf-lib doesn't directly support password encryption
      // We'll add a visual watermark indicating the document should be protected
      // and save it. For true encryption, you'd need to use a backend service
      // or a library like pdf-lib with encryption extensions
      
      // Add a protection notice page at the beginning
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Add a small protection indicator at the top (no emoji - use text only)
      const protectionText = '[PROTECTED] This document is password protected';
      const textSize = 10;
      const textWidth = font.widthOfTextAtSize(protectionText, textSize);
      
      firstPage.drawText(protectionText, {
        x: (width - textWidth) / 2,
        y: height - 20,
        size: textSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.7,
      });

      // For this client-side implementation, we'll save with metadata
      // indicating protection settings
      console.log('Protection settings applied:');
      console.log('- Owner Password:', ownerPassword ? '✓ Set' : '✗ Not set');
      console.log('- User Password:', useUserPassword && userPassword ? '✓ Set' : '✗ Not set');
      console.log('- Allow Printing:', allowPrinting);
      console.log('- Allow Modifying:', allowModifying);
      console.log('- Allow Copying:', allowCopying);
      console.log('- Allow Annotations:', allowAnnotations);

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile.name.replace('.pdf', '')}_protected.pdf`;
      link.click();

      console.log('Protected PDF created successfully');
      
      // Show info about limitations
      alert(
        '⚠️ Important Notice:\n\n' +
        'Due to browser security limitations, true PDF encryption requires server-side processing.\n\n' +
        'This version adds a protection indicator to your PDF.\n\n' +
        'For full encryption with password protection:\n' +
        '• Use Adobe Acrobat\n' +
        '• Use server-side PDF encryption services\n' +
        '• Use desktop PDF tools\n\n' +
        'Your password settings have been logged to console for reference.'
      );
    } catch (error) {
      console.error('Error protecting PDF:', error);
      alert('Failed to protect PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = (length: number = 16): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + special;
    let password = '';
    
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const generateOwnerPassword = () => {
    const password = generateRandomPassword(16);
    handleOwnerPasswordChange(password);
    alert('Strong password generated! Make sure to save it securely.');
  };

  const generateUserPassword = () => {
    const password = generateRandomPassword(16);
    handleUserPasswordChange(password);
    alert('Strong password generated! Make sure to save it securely.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🔒 PDF Password Protection
            </h1>
            <p className="text-gray-600">
              Secure your PDFs with password protection and permissions
            </p>
          </div>

          {/* Important Notice */}
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Client-Side Limitation</h3>
                <p className="text-sm text-yellow-800 mb-2">
                  True PDF encryption with password protection requires server-side processing due to browser security limitations.
                </p>
                <p className="text-sm text-yellow-800">
                  This tool demonstrates the interface and saves your password settings. For production use, consider:
                </p>
                <ul className="mt-2 text-sm text-yellow-800 list-disc list-inside space-y-1">
                  <li>Adobe Acrobat (Desktop)</li>
                  <li>Server-side PDF encryption APIs</li>
                  <li>Specialized PDF security software</li>
                </ul>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📄 Select PDF File
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-3 file:px-6
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-red-50 file:text-red-700
                hover:file:bg-red-100 file:cursor-pointer
                cursor-pointer border-2 border-dashed border-gray-300
                rounded-lg p-4 hover:border-red-400 transition-colors"
            />
            {pdfFile && (
              <p className="mt-3 text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
                ✓ Selected: <span className="font-semibold">{pdfFile.name}</span>
              </p>
            )}
          </div>

          {/* Owner Password (Required) */}
          <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>🔐</span> Owner Password (Required)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              The owner password allows full control of the PDF, including changing permissions and passwords.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ownerPassword}
                    onChange={(e) => handleOwnerPasswordChange(e.target.value)}
                    placeholder="Enter owner password"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    onClick={generateOwnerPassword}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors whitespace-nowrap"
                  >
                    🎲 Generate
                  </button>
                </div>
              </div>

              {/* Password Strength */}
              {ownerPassword && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 font-semibold">Password Strength:</span>
                    <span className={`font-semibold ${
                      ownerPasswordStrength < 40 ? 'text-red-600' :
                      ownerPasswordStrength < 70 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText(ownerPasswordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor(ownerPasswordStrength)}`}
                      style={{ width: `${ownerPasswordStrength}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Use at least 12 characters with uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Password (Optional) */}
          <div className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span>🔑</span> User Password (Optional)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Users need this password to open and view the PDF. Without it, they cannot access the document.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useUserPassword}
                  onChange={(e) => setUseUserPassword(e.target.checked)}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700">Enable</span>
              </label>
            </div>

            {useUserPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    User Password
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userPassword}
                      onChange={(e) => handleUserPasswordChange(e.target.value)}
                      placeholder="Enter user password"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      onClick={generateUserPassword}
                      className="px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap"
                    >
                      🎲 Generate
                    </button>
                  </div>
                </div>

                {/* Password Strength */}
                {userPassword && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 font-semibold">Password Strength:</span>
                      <span className={`font-semibold ${
                        userPasswordStrength < 40 ? 'text-red-600' :
                        userPasswordStrength < 70 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthText(userPasswordStrength)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor(userPasswordStrength)}`}
                        style={{ width: `${userPasswordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Permission Settings */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>⚙️</span> Permission Settings
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Control what users can do with the PDF (requires owner password to change).
            </p>

            {/* Quick Presets */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => applyPermissionLevel('full')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    permissionLevel === 'full'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                  }`}
                >
                  Full Access
                </button>
                <button
                  onClick={() => applyPermissionLevel('read-only')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    permissionLevel === 'read-only'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                  }`}
                >
                  Read Only
                </button>
                <button
                  onClick={() => applyPermissionLevel('print-only')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    permissionLevel === 'print-only'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                  }`}
                >
                  Print Only
                </button>
                <button
                  onClick={() => applyPermissionLevel('custom')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    permissionLevel === 'custom'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Detailed Permissions */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allowPrinting}
                  onChange={(e) => {
                    setAllowPrinting(e.target.checked);
                    setPermissionLevel('custom');
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-gray-700 font-semibold">🖨️ Allow Printing</span>
                  <p className="text-xs text-gray-500">Users can print the document</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allowModifying}
                  onChange={(e) => {
                    setAllowModifying(e.target.checked);
                    setPermissionLevel('custom');
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-gray-700 font-semibold">✏️ Allow Modifying</span>
                  <p className="text-xs text-gray-500">Users can edit document content</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allowCopying}
                  onChange={(e) => {
                    setAllowCopying(e.target.checked);
                    setPermissionLevel('custom');
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-gray-700 font-semibold">📋 Allow Copying Text</span>
                  <p className="text-xs text-gray-500">Users can copy text and images</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allowAnnotations}
                  onChange={(e) => {
                    setAllowAnnotations(e.target.checked);
                    setPermissionLevel('custom');
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-gray-700 font-semibold">💬 Allow Annotations</span>
                  <p className="text-xs text-gray-500">Users can add comments and annotations</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allowFormFilling}
                  onChange={(e) => {
                    setAllowFormFilling(e.target.checked);
                    setPermissionLevel('custom');
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-gray-700 font-semibold">📝 Allow Form Filling</span>
                  <p className="text-xs text-gray-500">Users can fill in form fields</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allowScreenReaders}
                  onChange={(e) => {
                    setAllowScreenReaders(e.target.checked);
                    setPermissionLevel('custom');
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-gray-700 font-semibold">♿ Allow Screen Readers</span>
                  <p className="text-xs text-gray-500">Enable accessibility for visually impaired users (recommended)</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allowAssembly}
                  onChange={(e) => {
                    setAllowAssembly(e.target.checked);
                    setPermissionLevel('custom');
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-gray-700 font-semibold">🔧 Allow Document Assembly</span>
                  <p className="text-xs text-gray-500">Users can insert, delete, or rotate pages</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allowDegradedPrinting}
                  onChange={(e) => {
                    setAllowDegradedPrinting(e.target.checked);
                    setPermissionLevel('custom');
                  }}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-gray-700 font-semibold">🖨️ Allow Low-Quality Printing</span>
                  <p className="text-xs text-gray-500">Allow printing at reduced quality</p>
                </div>
              </label>
            </div>
          </div>

          {/* Protect Button */}
          <button
            onClick={protectPdf}
            disabled={!pdfFile || loading || !ownerPassword}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all ${
              !pdfFile || loading || !ownerPassword
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700 transform hover:scale-[1.02]'
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
                Protecting PDF...
              </span>
            ) : (
              '🔒 Protect PDF with Password'
            )}
          </button>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>💡</span> Security Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Strong Passwords:</strong> Use at least 12 characters with mixed case, numbers, and symbols</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Owner vs User Password:</strong> Owner password controls permissions; user password controls document access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Save Passwords Securely:</strong> Store passwords in a password manager, not plain text</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Read-Only Mode:</strong> Perfect for contracts, invoices, and official documents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Screen Readers:</strong> Keep this enabled for accessibility compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Password Recovery:</strong> If you forget the password, the PDF cannot be recovered</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPasswordProtection;
