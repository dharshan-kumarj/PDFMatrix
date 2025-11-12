export interface ExtractedTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  transform: number[];
  originalFont: string;
}

export interface ExtractedPageData {
  textItems: ExtractedTextItem[];
  pageWidth: number;
  pageHeight: number;
  viewport: any;
}

// Map PDF font names to standard web-safe fonts
const fontMapping: { [key: string]: string } = {
  // Helvetica family
  'Helvetica': 'Helvetica, Arial, sans-serif',
  'Helvetica-Bold': 'Helvetica, Arial, sans-serif',
  'Helvetica-Oblique': 'Helvetica, Arial, sans-serif',
  'Helvetica-BoldOblique': 'Helvetica, Arial, sans-serif',
  
  // Times family
  'Times-Roman': 'Times New Roman, Times, serif',
  'Times-Bold': 'Times New Roman, Times, serif',
  'Times-Italic': 'Times New Roman, Times, serif',
  'Times-BoldItalic': 'Times New Roman, Times, serif',
  'TimesNewRoman': 'Times New Roman, Times, serif',
  'TimesNewRomanPS': 'Times New Roman, Times, serif',
  
  // Courier family
  'Courier': 'Courier New, Courier, monospace',
  'Courier-Bold': 'Courier New, Courier, monospace',
  'Courier-Oblique': 'Courier New, Courier, monospace',
  'Courier-BoldOblique': 'Courier New, Courier, monospace',
  
  // Arial family
  'Arial': 'Arial, Helvetica, sans-serif',
  'Arial-Bold': 'Arial, Helvetica, sans-serif',
  'Arial-Italic': 'Arial, Helvetica, sans-serif',
  'Arial-BoldItalic': 'Arial, Helvetica, sans-serif',
  'ArialMT': 'Arial, Helvetica, sans-serif',
  
  // Symbol and special fonts
  'Symbol': 'Symbol, serif',
  'ZapfDingbats': 'Zapf Dingbats, serif',
};

// Get standard font family from PDF font name
function getStandardFont(pdfFontName: string): string {
  // Direct match
  if (fontMapping[pdfFontName]) {
    return fontMapping[pdfFontName];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(fontMapping)) {
    if (pdfFontName.includes(key)) {
      return value;
    }
  }
  
  // Check for common patterns
  if (pdfFontName.includes('Arial')) return 'Arial, Helvetica, sans-serif';
  if (pdfFontName.includes('Times')) return 'Times New Roman, Times, serif';
  if (pdfFontName.includes('Courier')) return 'Courier New, Courier, monospace';
  if (pdfFontName.includes('Helvetica')) return 'Helvetica, Arial, sans-serif';
  
  // Default fallback
  return 'Arial, Helvetica, sans-serif';
}

// Convert RGB array to hex color
function rgbToHex(rgb: number[]): string {
  if (!rgb || rgb.length < 3) return '#000000';
  
  const r = Math.round(rgb[0] * 255);
  const g = Math.round(rgb[1] * 255);
  const b = Math.round(rgb[2] * 255);
  
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Extract all text items from a PDF page with exact positioning and styling
 */
export async function extractTextFromPage(
  pdfDoc: any,
  pageNumber: number,
  scale: number = 1.5
): Promise<ExtractedPageData> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const textContent = await page.getTextContent();
  const textItems: ExtractedTextItem[] = [];
  
  let itemId = 0;
  
  for (const item of textContent.items) {
    if ('str' in item && item.str.trim()) {
      const transform = item.transform;
      
      // Extract position and size from transform matrix
      // Transform matrix: [scaleX, skewY, skewX, scaleY, translateX, translateY]
      const fontSize = Math.abs(transform[3]); // scaleY gives font size
      const x = transform[4];
      const y = viewport.height - transform[5]; // Convert from PDF to canvas coordinates
      
      // Calculate text width (approximate)
      const width = item.width || (item.str.length * fontSize * 0.5);
      const height = fontSize;
      
      // Get font information
      const fontName = item.fontName || 'Helvetica';
      const fontFamily = getStandardFont(fontName);
      
      // Get color (default to black if not specified)
      const color = rgbToHex(item.color || [0, 0, 0]);
      
      textItems.push({
        id: `text-${pageNumber}-${itemId++}`,
        text: item.str,
        x: x,
        y: y - height, // Adjust for baseline
        width: width,
        height: height,
        fontSize: fontSize,
        fontFamily: fontFamily,
        color: color,
        transform: transform,
        originalFont: fontName,
      });
    }
  }
  
  return {
    textItems,
    pageWidth: viewport.width,
    pageHeight: viewport.height,
    viewport,
  };
}

/**
 * Extract text from all pages
 */
export async function extractTextFromAllPages(
  pdfDoc: any,
  scale: number = 1.5
): Promise<{ [pageNumber: number]: ExtractedPageData }> {
  const numPages = pdfDoc.numPages;
  const allPagesData: { [pageNumber: number]: ExtractedPageData } = {};
  
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    allPagesData[pageNum] = await extractTextFromPage(pdfDoc, pageNum, scale);
  }
  
  return allPagesData;
}

/**
 * Get font weight from font name
 */
export function getFontWeight(fontName: string): number {
  if (fontName.includes('Bold')) return 700;
  if (fontName.includes('Medium')) return 500;
  if (fontName.includes('Light')) return 300;
  return 400; // Normal
}

/**
 * Get font style from font name
 */
export function getFontStyle(fontName: string): string {
  if (fontName.includes('Italic') || fontName.includes('Oblique')) return 'italic';
  return 'normal';
}

/**
 * Merge adjacent text items that are part of the same line
 */
export function mergeAdjacentTextItems(items: ExtractedTextItem[]): ExtractedTextItem[] {
  if (items.length === 0) return [];
  
  const merged: ExtractedTextItem[] = [];
  const sortedItems = [...items].sort((a, b) => {
    // Sort by Y position first, then X position
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) > 2) return yDiff; // Different lines
    return a.x - b.x; // Same line, sort by X
  });
  
  let currentItem = { ...sortedItems[0] };
  
  for (let i = 1; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    
    // Check if items are on the same line and adjacent
    const yDiff = Math.abs(item.y - currentItem.y);
    const xGap = item.x - (currentItem.x + currentItem.width);
    const sameFontSize = Math.abs(item.fontSize - currentItem.fontSize) < 1;
    const sameFont = item.fontFamily === currentItem.fontFamily;
    const sameColor = item.color === currentItem.color;
    
    // Merge if on same line, close together, and same styling
    if (yDiff < 2 && xGap < item.fontSize && sameFontSize && sameFont && sameColor) {
      // Add space if there's a gap
      if (xGap > 1) {
        currentItem.text += ' ';
      }
      currentItem.text += item.text;
      currentItem.width = item.x + item.width - currentItem.x;
    } else {
      // Start new item
      merged.push(currentItem);
      currentItem = { ...item };
    }
  }
  
  merged.push(currentItem);
  return merged;
}
