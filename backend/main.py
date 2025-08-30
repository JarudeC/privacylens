"""
PrivacyLens Backend - FastAPI Entry Point
==========================================

This is the main FastAPI application that handles video upload and PII detection/protection.

✅ CURRENT IMPLEMENTATION: Real video processing with mock PII detection
🚀 AI TEAM TODO: Integrate YOLO + AI for production PII detection and blurring

ENDPOINTS:
1. POST /api/v1/video/upload - Upload video, extract real frames, return PII detections
2. POST /api/v1/video/protect - Create protected video with blurred PII regions  
3. GET /frames/{filename} - Serve extracted frame images
4. GET /protected/{filename} - Serve protected videos

✅ WORKING COMPONENTS:
- File upload/storage ✅
- Real video frame extraction using OpenCV ✅
- Frame serving with proper URLs ✅
- CORS middleware ✅
- Error handling ✅
- Response formatting ✅

🚀 AI TEAM INTEGRATION POINTS:

1. YOLO OBJECT DETECTION (replace mock PII detection):
   - Location: extract_video_frame() function - lines 112-126
   - Current: Mock PII boxes drawn on frames  
   - Replace with: YOLO model to detect credit cards, IDs, addresses, faces
   - Return: Real bounding box coordinates, confidence scores, classifications

2. SMART FRAME SELECTION (replace fixed 1,2,3 second timestamps):
   - Location: upload_and_analyze_video() function - lines 243-246
   - Current: Fixed timestamps at 1.0, 2.0, 3.0 seconds
   - Replace with: AI-powered frame selection based on content analysis
   - Method: Use YOLO to scan entire video, select frames with highest PII probability

3. AI VIDEO BLURRING (replace mock emoji prefix protection):
   - Location: create_mock_protected_video() function - lines 318-347
   - Current: Just copies original file with emoji prefix
   - Replace with: AI-powered selective blurring using detected bounding boxes
   - Method: Apply gaussian blur, pixelation, or blackout to specific regions
   - Preserve: Original video quality in non-PII regions

DEPLOYMENT:
- Backend runs on Render with OpenCV support
- Frontend gets real video frames with PII annotations
- Static file serving for frames and protected videos
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import uuid
import time
import asyncio
import os
import shutil
import base64
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
import subprocess
from pipeline.blur import blur_video
from pipeline.detect import detect_video
from pipeline.extract import process_video
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Get base URL from environment or default to localhost for development
BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")

# Create directories for file storage
UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")
FRAMES_DIR = Path("frames")
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True) 
FRAMES_DIR.mkdir(exist_ok=True)
CREDIT_MODEL_DIR = Path("models/Credit.pt")
last_results = None

app = FastAPI(title="PrivacyLens API", version="1.0.0")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frame images (static files work fine for images)
app.mount("/frames", StaticFiles(directory="frames"), name="frames")

# Custom video streaming endpoint for protected videos
@app.get("/protected/{filename}")
async def stream_protected_video(filename: str, request: Request):
    """
    🎥 STREAMING VIDEO ENDPOINT - Serves protected videos with proper HTTP range headers
    
    Supports:
    - Range requests for video streaming
    - Proper MIME types for video files  
    - CORS headers for React Native
    - Large file streaming without memory issues
    
    This replaces the static file mount for /protected to handle video streaming properly
    """
    video_path = PROCESSED_DIR / filename
    
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Protected video not found")
    
    # Get file stats
    file_size = video_path.stat().st_size
    
    # Handle range requests for video streaming
    range_header = request.headers.get("Range")
    
    if range_header:
        # Parse range header (e.g., "bytes=0-1023" or "bytes=0-")
        try:
            range_match = range_header.replace("bytes=", "")
            start, end = range_match.split("-")
            start = int(start) if start else 0
            end = int(end) if end else file_size - 1
            end = min(end, file_size - 1)
        except:
            start, end = 0, file_size - 1
            
        # Read the requested chunk
        with open(video_path, "rb") as video_file:
            video_file.seek(start)
            chunk_size = end - start + 1
            chunk = video_file.read(chunk_size)
            
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_size),
            "Content-Type": "video/mp4",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Range, Content-Type",
        }
        
        return Response(chunk, status_code=206, headers=headers)
    
    else:
        # No range request, serve entire file
        return FileResponse(
            video_path,
            media_type="video/mp4", 
            headers={
                "Accept-Ranges": "bytes",
                "Content-Type": "video/mp4",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*",
                "Content-Length": str(file_size)
            }
        )


# Pydantic models for request/response
class PIIDetection(BaseModel):
    type: str  # 'credit_card', 'id_card', 'address'
    confidence: float
    description: str
    severity: str  # 'low', 'medium', 'high'

class PIIFrame(BaseModel):
    id: str
    frameUri: str  # URL to frame image
    timestamp: float
    detections: List[PIIDetection]

class VideoUploadResponse(BaseModel):
    videoId: str
    piiFrames: List[PIIFrame]
    totalFramesAnalyzed: int
    processingTime: int

class ProtectionRequest(BaseModel):
    videoId: str
    piiFrames: List[PIIFrame]

class ProtectionResponse(BaseModel):
    protectedVideoUri: str

# In-memory storage for demo (use database in production)
video_storage = {}

@app.get("/")
async def root():
    return {"message": "PrivacyLens API is running", "version": "1.0.0"}

@app.post("/api/v1/video/upload", response_model=VideoUploadResponse)
async def upload_and_analyze_video(video: UploadFile = File(...)):
    try:
        logger.info(f"Received upload request: {video.filename}")
        
        # Save uploaded video
        video_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{video_id}_{video.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        logger.info(f"Saved video to: {file_path}")

        # Convert if needed
        if file_path.suffix.lower() == ".mov":
            file_path = convert_mov_to_mp4(file_path)
            logger.info(f"Converted to MP4: {file_path}")

        # Run detection
        start_time = time.time()
        try:
            results = detect_video(str(file_path), CREDIT_MODEL_DIR)
            logger.info(f"Detection complete: {len(results)} frames processed")
        except Exception as e:
            logger.error(f"Detection failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

        # Process results
        try:
            unique_results = process_video(results, str(file_path))
            logger.info(f"Extracted {len(unique_results)} unique detections")
        except Exception as e:
            logger.error(f"Processing failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

        # Create PII frames
        pii_frames = []
        for result in unique_results["unique_tracks"]:
            pii_frames.append(
                PIIFrame(
                    id=str(result["track_id"]),
                    frameUri=result["crop_path"],
                    timestamp=result["first_seen_timestamp"],
                    detections=[
                        PIIDetection(
                            type=result["type"],
                            confidence=result["max_confidence"],
                            description=f"{result['type']} detected",
                            severity="high"
                        )
                    ]
                )
            )

        # Store results for later
        video_storage[video_id] = {
            "original_path": str(file_path),
            "results": results,  # Store for blur_video
            "pii_frames": [frame.dict() for frame in pii_frames],
            "upload_time": time.time()
        }

        processing_time = int((time.time() - start_time) * 1000)
        return VideoUploadResponse(
            videoId=video_id,
            piiFrames=pii_frames,
            totalFramesAnalyzed=len(results),
            processingTime=processing_time
        )

    except Exception as e:
        logger.error(f"Upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/video/protect", response_model=ProtectionResponse)
async def create_protected_video(request: ProtectionRequest):
    try:
        if request.videoId not in video_storage:
            raise HTTPException(status_code=404, detail="Video not found")

        video_info = video_storage[request.videoId]
        results = video_info["results"]

        # Get IDs to blur from request
        blur_ids = [int(frame.id) for frame in request.piiFrames]
        logger.info(f"Blurring IDs: {blur_ids}")

        # Create output path
        output_path = PROCESSED_DIR / f"{request.videoId}_protected.mp4"

        try:
            protected_path = blur_video(results, str(output_path), blur_ids)
            logger.info(f"Created protected video: {protected_path}")
        except Exception as e:
            logger.error(f"Blurring failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Blurring failed: {str(e)}")

        video_storage[request.videoId]["protected_path"] = protected_path

        return ProtectionResponse(
            protectedVideoUri=f"/videos/protected/{Path(protected_path).name}"
        )

    except Exception as e:
        logger.error(f"Protection failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Note: Frame and protected video serving is handled by StaticFiles middleware above
# Files are automatically served from:
# - /frames/{filename} -> frames/ directory  
# - /protected/{filename} -> processed/ directory

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "videos_processed": len(video_storage)
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for better error responses"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "message": "Internal server error",
                "details": str(exc)
            }
        }
    )

def convert_mov_to_mp4(input_path: Path) -> Path:
    """
    Converts a .mov video file to .mp4 using ffmpeg.
    Returns the new .mp4 file path.
    """
    if input_path.suffix.lower() != ".mov":
        return input_path  # No conversion needed

    mp4_path = input_path.with_suffix(".mp4")
    import subprocess
    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", str(input_path),
            "-c:v", "libx264", "-c:a", "aac", str(mp4_path)
        ], check=True)
    except Exception as e:
        import logging
        logging.error(f"ffmpeg conversion failed: {e}")
        raise RuntimeError(f"Failed to convert .mov to .mp4: {e}")
    return mp4_path

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Use PORT environment variable for Render, default to 8000 for local dev
    port = int(os.environ.get("PORT", 8000))
    
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=False,  # Disable reload in production
        log_level="info"
    )