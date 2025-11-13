#!/usr/bin/env node

/**
 * Copy PDF.js worker to public folder for offline PWA support
 * This script runs automatically after npm install
 */

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workerSource = join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const workerDest = join(__dirname, 'public', 'pdf.worker.min.mjs');

try {
  // Ensure public directory exists
  const publicDir = join(__dirname, 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // Copy the worker file
  if (existsSync(workerSource)) {
    copyFileSync(workerSource, workerDest);
    console.log('✅ PDF.js worker copied to public folder for offline support');
  } else {
    console.error('❌ PDF.js worker not found in node_modules');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error copying PDF.js worker:', error.message);
  process.exit(1);
}
