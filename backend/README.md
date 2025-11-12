# PDF Matrix Backend

Backend API for PDF Matrix with document conversion support using LibreOffice and unoconv.

## System Requirements

- Python 3.11+
- LibreOffice (for document conversion)
- unoconv

## Installation

### 1. Install LibreOffice (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y libreoffice libreoffice-writer libreoffice-calc
```

### 2. Install unoconv

```bash
sudo apt-get install -y unoconv
```

Or via pip:
```bash
pip install unoconv
```

### 3. Install Python Dependencies

Using uv (recommended):
```bash
uv sync
```

Or using pip:
```bash
pip install -r requirements.txt
```

## Usage

### Start the FastAPI server

```bash
uv run uvicorn script:app --reload --host 0.0.0.0 --port 8000
```

Or with uvicorn directly:
```bash
uvicorn script:app --reload --host 0.0.0.0 --port 8000
```

### Document Conversion Examples

#### Using unoconv command line:
```bash
# Convert DOCX to PDF
unoconv -f pdf document.docx

# Convert PDF to DOCX
unoconv -f docx document.pdf
```

#### Using LibreOffice directly:
```bash
# Convert DOCX to PDF
soffice --headless --convert-to pdf document.docx

# Convert to different formats
soffice --headless --convert-to docx document.pdf
```

## API Endpoints

- `GET /` - Health check
- `POST /convert/docx-to-pdf` - Convert DOCX to PDF
- `POST /convert/pdf-to-docx` - Convert PDF to DOCX
- Add more endpoints as needed

## Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI
- **python-multipart**: For handling file uploads
- **pypdf**: PDF manipulation library
- **unoconv**: Python wrapper for LibreOffice conversion
- **python-docx**: Working with DOCX files
- **Pillow**: Image processing

## Notes

- LibreOffice must be installed on the system for document conversion to work
- unoconv uses LibreOffice in headless mode for conversions
- This is a fully open-source solution with no paid SDKs required
