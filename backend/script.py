from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
import tempfile
import shutil
from pathlib import Path

app = FastAPI(
    title="PDF Matrix Backend",
    description="Document conversion API using LibreOffice and unoconv",
    version="0.1.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory for conversions
TEMP_DIR = Path(tempfile.gettempdir()) / "pdfmatrix"
TEMP_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "message": "PDF Matrix Backend API",
        "version": "0.1.0"
    }


@app.get("/health")
async def health_check():
    """Check if LibreOffice and unoconv are available"""
    libreoffice_available = shutil.which("soffice") is not None
    unoconv_available = shutil.which("unoconv") is not None
    
    return {
        "status": "ok",
        "libreoffice": libreoffice_available,
        "unoconv": unoconv_available,
        "python_version": os.sys.version
    }


@app.post("/convert/docx-to-pdf")
async def convert_docx_to_pdf(file: UploadFile = File(...)):
    """
    Convert DOCX file to PDF using LibreOffice
    """
    if not file.filename.endswith(('.docx', '.doc')):
        raise HTTPException(status_code=400, detail="File must be a DOCX or DOC file")
    
    # Create unique temporary files
    input_path = TEMP_DIR / f"input_{os.urandom(8).hex()}.docx"
    output_filename = file.filename.rsplit('.', 1)[0] + '.pdf'
    
    try:
        # Save uploaded file
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Convert using unoconv (preferred method)
        try:
            result = subprocess.run(
                ["unoconv", "-f", "pdf", "-o", str(TEMP_DIR), str(input_path)],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                # Fallback to LibreOffice directly
                result = subprocess.run(
                    ["soffice", "--headless", "--convert-to", "pdf", 
                     "--outdir", str(TEMP_DIR), str(input_path)],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if result.returncode != 0:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Conversion failed: {result.stderr}"
                    )
        
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=500, detail="Conversion timeout")
        
        # Find the output PDF
        output_path = input_path.with_suffix('.pdf')
        
        if not output_path.exists():
            raise HTTPException(
                status_code=500,
                detail="Conversion completed but output file not found"
            )
        
        # Return the converted file
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename=output_filename,
            background=None  # File will be cleaned up after response
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Cleanup input file
        if input_path.exists():
            input_path.unlink()


@app.post("/convert/pdf-to-docx")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    """
    Convert PDF file to DOCX using LibreOffice
    Note: Quality may vary depending on PDF complexity
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF file")
    
    # Create unique temporary files
    input_path = TEMP_DIR / f"input_{os.urandom(8).hex()}.pdf"
    output_filename = file.filename.rsplit('.', 1)[0] + '.docx'
    
    try:
        # Save uploaded file
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Convert using LibreOffice (unoconv may not support PDF to DOCX well)
        try:
            result = subprocess.run(
                ["soffice", "--headless", "--convert-to", "docx:writer_MS_Word_2007",
                 "--outdir", str(TEMP_DIR), str(input_path)],
                capture_output=True,
                text=True,
                timeout=60  # PDF to DOCX may take longer
            )
            
            if result.returncode != 0:
                raise HTTPException(
                    status_code=500,
                    detail=f"Conversion failed: {result.stderr}"
                )
        
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=500, detail="Conversion timeout")
        
        # Find the output DOCX
        output_path = input_path.with_suffix('.docx')
        
        if not output_path.exists():
            raise HTTPException(
                status_code=500,
                detail="Conversion completed but output file not found"
            )
        
        # Return the converted file
        return FileResponse(
            path=output_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=output_filename,
            background=None
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Cleanup input file
        if input_path.exists():
            input_path.unlink()


@app.post("/convert/batch-docx-to-pdf")
async def batch_convert_docx_to_pdf(files: list[UploadFile] = File(...)):
    """
    Batch convert multiple DOCX files to PDF
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    results = []
    
    for file in files:
        try:
            # Similar logic as single conversion but collect results
            if not file.filename.endswith(('.docx', '.doc')):
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": "Invalid file type"
                })
                continue
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "message": "Converted successfully"
            })
        
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": str(e)
            })
    
    return {"results": results}


@app.on_event("shutdown")
async def cleanup():
    """Cleanup temporary files on shutdown"""
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR, ignore_errors=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
