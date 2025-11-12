export interface TextBox {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
}

export interface PDFState {
  pdfDoc: any; // PDFDocumentProxy from pdfjs-dist
  currentPage: number;
  totalPages: number;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  textBoxes: TextBox[];
}
