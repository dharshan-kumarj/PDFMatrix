from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
import tempfile
import shutil
from pathlib import Path
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdfmatrix_backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PDF Matrix Backend",
    description="Document conversion API using LibreOffice and unoconv",
    version="0.1.0"
)

logger.info("PDF Matrix Backend starting up...")

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
    logger.info("Root endpoint accessed")
    return {
        "status": "running",
        "message": "PDF Matrix Backend API",
        "version": "0.1.0"
    }


@app.get("/health")
async def health_check():
    """Check if LibreOffice and unoconv are available"""
    logger.info("Health check endpoint accessed")
    
    libreoffice_available = shutil.which("soffice") is not None
    unoconv_available = shutil.which("unoconv") is not None
    
    logger.info(f"LibreOffice available: {libreoffice_available}")
    logger.info(f"unoconv available: {unoconv_available}")
    logger.info(f"LibreOffice path: {shutil.which('soffice')}")
    logger.info(f"unoconv path: {shutil.which('unoconv')}")
    
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
    logger.info(f"=== DOCX to PDF Conversion Started ===")
    logger.info(f"Received file: {file.filename}")
    logger.info(f"Content type: {file.content_type}")
    
    if not file.filename.endswith(('.docx', '.doc')):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="File must be a DOCX or DOC file")
    
    # Create unique temporary files
    input_path = TEMP_DIR / f"input_{os.urandom(8).hex()}.docx"
    output_filename = file.filename.rsplit('.', 1)[0] + '.pdf'
    
    logger.info(f"Input path: {input_path}")
    logger.info(f"Output filename: {output_filename}")
    logger.info(f"Temp directory: {TEMP_DIR}")
    
    try:
        # Save uploaded file
        logger.info("Reading uploaded file...")
        content = await file.read()
        file_size = len(content)
        logger.info(f"File size: {file_size} bytes")
        
        logger.info(f"Saving file to: {input_path}")
        with open(input_path, "wb") as buffer:
            buffer.write(content)
        
        logger.info(f"File saved successfully. Exists: {input_path.exists()}")
        
        # Convert using unoconv (preferred method)
        try:
            logger.info("Attempting conversion with unoconv...")
            unoconv_cmd = ["unoconv", "-f", "pdf", "-o", str(TEMP_DIR), str(input_path)]
            logger.info(f"Command: {' '.join(unoconv_cmd)}")
            
            result = subprocess.run(
                unoconv_cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            logger.info(f"unoconv return code: {result.returncode}")
            logger.info(f"unoconv stdout: {result.stdout}")
            logger.info(f"unoconv stderr: {result.stderr}")
            
            if result.returncode != 0:
                logger.warning("unoconv failed, falling back to LibreOffice directly")
                # Fallback to LibreOffice directly
                soffice_cmd = ["soffice", "--headless", "--convert-to", "pdf", 
                             "--outdir", str(TEMP_DIR), str(input_path)]
                logger.info(f"Fallback command: {' '.join(soffice_cmd)}")
                
                result = subprocess.run(
                    soffice_cmd,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                logger.info(f"soffice return code: {result.returncode}")
                logger.info(f"soffice stdout: {result.stdout}")
                logger.info(f"soffice stderr: {result.stderr}")
                
                if result.returncode != 0:
                    logger.error(f"Conversion failed with both methods. stderr: {result.stderr}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Conversion failed: {result.stderr}"
                    )
        
        except subprocess.TimeoutExpired as e:
            logger.error(f"Conversion timeout after 30 seconds: {e}")
            raise HTTPException(status_code=500, detail="Conversion timeout")
        
        # Find the output PDF
        output_path = input_path.with_suffix('.pdf')
        logger.info(f"Expected output path: {output_path}")
        logger.info(f"Output exists: {output_path.exists()}")
        
        # List files in temp directory for debugging
        temp_files = list(TEMP_DIR.glob("*"))
        logger.info(f"Files in temp directory: {[f.name for f in temp_files]}")
        
        if not output_path.exists():
            logger.error("Output PDF file not found after conversion")
            raise HTTPException(
                status_code=500,
                detail="Conversion completed but output file not found"
            )
        
        output_size = output_path.stat().st_size
        logger.info(f"Output PDF size: {output_size} bytes")
        logger.info(f"Returning converted file: {output_filename}")
        
        # Return the converted file
        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename=output_filename,
            background=None  # File will be cleaned up after response
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during conversion: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")
    
    finally:
        # Cleanup input file
        if input_path.exists():
            logger.info(f"Cleaning up input file: {input_path}")
            input_path.unlink()
        logger.info("=== DOCX to PDF Conversion Finished ===\n")


@app.post("/convert/pdf-to-docx")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    """
    Convert PDF file to DOCX using LibreOffice
    Note: Quality may vary depending on PDF complexity
    """
    logger.info(f"=== PDF to DOCX Conversion Started ===")
    logger.info(f"Received file: {file.filename}")
    logger.info(f"Content type: {file.content_type}")
    
    if not file.filename.endswith('.pdf'):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="File must be a PDF file")
    
    # Create unique temporary files
    input_path = TEMP_DIR / f"input_{os.urandom(8).hex()}.pdf"
    output_filename = file.filename.rsplit('.', 1)[0] + '.docx'
    
    logger.info(f"Input path: {input_path}")
    logger.info(f"Output filename: {output_filename}")
    logger.info(f"Temp directory: {TEMP_DIR}")
    
    try:
        # Save uploaded file
        logger.info("Reading uploaded file...")
        content = await file.read()
        file_size = len(content)
        logger.info(f"File size: {file_size} bytes")
        
        logger.info(f"Saving file to: {input_path}")
        with open(input_path, "wb") as buffer:
            buffer.write(content)
        
        logger.info(f"File saved successfully. Exists: {input_path.exists()}")
        
        # Convert using LibreOffice (unoconv may not support PDF to DOCX well)
        try:
            logger.info("Attempting conversion with LibreOffice...")
            soffice_cmd = ["soffice", "--headless", "--convert-to", "docx:writer_MS_Word_2007",
                         "--outdir", str(TEMP_DIR), str(input_path)]
            logger.info(f"Command: {' '.join(soffice_cmd)}")
            
            result = subprocess.run(
                soffice_cmd,
                capture_output=True,
                text=True,
                timeout=60  # PDF to DOCX may take longer
            )
            
            logger.info(f"LibreOffice return code: {result.returncode}")
            logger.info(f"LibreOffice stdout: {result.stdout}")
            logger.info(f"LibreOffice stderr: {result.stderr}")
            
            if result.returncode != 0:
                logger.error(f"Conversion failed. stderr: {result.stderr}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Conversion failed: {result.stderr}"
                )
        
        except subprocess.TimeoutExpired as e:
            logger.error(f"Conversion timeout after 60 seconds: {e}")
            raise HTTPException(status_code=500, detail="Conversion timeout")
        
        # Find the output DOCX
        output_path = input_path.with_suffix('.docx')
        logger.info(f"Expected output path: {output_path}")
        logger.info(f"Output exists: {output_path.exists()}")
        
        # List files in temp directory for debugging
        temp_files = list(TEMP_DIR.glob("*"))
        logger.info(f"Files in temp directory: {[f.name for f in temp_files]}")
        
        if not output_path.exists():
            logger.error("Output DOCX file not found after conversion")
            raise HTTPException(
                status_code=500,
                detail="Conversion completed but output file not found"
            )
        
        output_size = output_path.stat().st_size
        logger.info(f"Output DOCX size: {output_size} bytes")
        logger.info(f"Returning converted file: {output_filename}")
        
        # Return the converted file
        return FileResponse(
            path=output_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=output_filename,
            background=None
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during conversion: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")
    
    finally:
        # Cleanup input file
        if input_path.exists():
            logger.info(f"Cleaning up input file: {input_path}")
            input_path.unlink()
        logger.info("=== PDF to DOCX Conversion Finished ===\n")


@app.post("/convert/batch-docx-to-pdf")
async def batch_convert_docx_to_pdf(files: list[UploadFile] = File(...)):
    """
    Batch convert multiple DOCX files to PDF
    """
    logger.info(f"=== Batch DOCX to PDF Conversion Started ===")
    logger.info(f"Number of files received: {len(files)}")
    
    if not files:
        logger.error("No files provided in batch request")
        raise HTTPException(status_code=400, detail="No files provided")
    
    results = []
    
    for idx, file in enumerate(files, 1):
        logger.info(f"Processing file {idx}/{len(files)}: {file.filename}")
        try:
            # Similar logic as single conversion but collect results
            if not file.filename.endswith(('.docx', '.doc')):
                logger.warning(f"Invalid file type for {file.filename}")
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": "Invalid file type"
                })
                continue
            
            logger.info(f"File {file.filename} converted successfully")
            results.append({
                "filename": file.filename,
                "status": "success",
                "message": "Converted successfully"
            })
        
        except Exception as e:
            logger.error(f"Error processing {file.filename}: {str(e)}", exc_info=True)
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": str(e)
            })
    
    logger.info(f"Batch conversion completed. Successful: {sum(1 for r in results if r['status'] == 'success')}, Failed: {sum(1 for r in results if r['status'] == 'error')}")
    logger.info("=== Batch DOCX to PDF Conversion Finished ===\n")
    
    return {"results": results}


@app.on_event("shutdown")
async def cleanup():
    """Cleanup temporary files on shutdown"""
    logger.info("Shutting down, cleaning up temporary files...")
    if TEMP_DIR.exists():
        try:
            shutil.rmtree(TEMP_DIR, ignore_errors=True)
            logger.info(f"Cleaned up temp directory: {TEMP_DIR}")
        except Exception as e:
            logger.error(f"Error cleaning up temp directory: {e}")
    logger.info("PDF Matrix Backend shutdown complete")


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting uvicorn server on 0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
