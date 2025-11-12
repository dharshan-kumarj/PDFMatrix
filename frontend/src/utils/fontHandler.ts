import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib';

export interface FontEmbedInfo {
  pdfFont: PDFFont;
  fontName: string;
  isBold: boolean;
  isItalic: boolean;
}

// Cache for embedded fonts
const fontCache = new Map<string, FontEmbedInfo>();

/**
 * Get or embed standard font in PDF
 */
export async function getOrEmbedFont(
  pdfDoc: PDFDocument,
  fontFamily: string,
  isBold: boolean = false,
  isItalic: boolean = false
): Promise<FontEmbedInfo> {
  const cacheKey = `${fontFamily}-${isBold}-${isItalic}`;
  
  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey)!;
  }
  
  let standardFont: StandardFonts;
  let fontName: string;
  
  // Determine which standard font to use
  if (fontFamily.includes('Times')) {
    if (isBold && isItalic) {
      standardFont = StandardFonts.TimesRomanBoldItalic;
      fontName = 'Times-BoldItalic';
    } else if (isBold) {
      standardFont = StandardFonts.TimesRomanBold;
      fontName = 'Times-Bold';
    } else if (isItalic) {
      standardFont = StandardFonts.TimesRomanItalic;
      fontName = 'Times-Italic';
    } else {
      standardFont = StandardFonts.TimesRoman;
      fontName = 'Times-Roman';
    }
  } else if (fontFamily.includes('Courier')) {
    if (isBold && isItalic) {
      standardFont = StandardFonts.CourierBoldOblique;
      fontName = 'Courier-BoldOblique';
    } else if (isBold) {
      standardFont = StandardFonts.CourierBold;
      fontName = 'Courier-Bold';
    } else if (isItalic) {
      standardFont = StandardFonts.CourierOblique;
      fontName = 'Courier-Oblique';
    } else {
      standardFont = StandardFonts.Courier;
      fontName = 'Courier';
    }
  } else {
    // Default to Helvetica
    if (isBold && isItalic) {
      standardFont = StandardFonts.HelveticaBoldOblique;
      fontName = 'Helvetica-BoldOblique';
    } else if (isBold) {
      standardFont = StandardFonts.HelveticaBold;
      fontName = 'Helvetica-Bold';
    } else if (isItalic) {
      standardFont = StandardFonts.HelveticaOblique;
      fontName = 'Helvetica-Oblique';
    } else {
      standardFont = StandardFonts.Helvetica;
      fontName = 'Helvetica';
    }
  }
  
  const pdfFont = await pdfDoc.embedFont(standardFont);
  
  const fontInfo: FontEmbedInfo = {
    pdfFont,
    fontName,
    isBold,
    isItalic,
  };
  
  fontCache.set(cacheKey, fontInfo);
  return fontInfo;
}

/**
 * Parse font family and determine weight/style
 */
export function parseFontFamily(fontFamily: string, originalFont: string = ''): {
  family: string;
  isBold: boolean;
  isItalic: boolean;
} {
  const fontLower = (fontFamily + ' ' + originalFont).toLowerCase();
  
  const isBold = fontLower.includes('bold') || fontLower.includes('700');
  const isItalic = fontLower.includes('italic') || fontLower.includes('oblique');
  
  // Extract base family
  let family = fontFamily.split(',')[0].trim();
  
  return { family, isBold, isItalic };
}

/**
 * Convert hex color to RGB values for pdf-lib
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 }; // Default to black
  }
  
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

/**
 * Calculate text width for accurate positioning
 */
export function calculateTextWidth(
  text: string,
  font: PDFFont,
  fontSize: number
): number {
  return font.widthOfTextAtSize(text, fontSize);
}

/**
 * Clear font cache (useful when switching documents)
 */
export function clearFontCache(): void {
  fontCache.clear();
}
