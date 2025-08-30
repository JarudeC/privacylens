"""
PrivacyLens Backend - Production FastAPI with YOLO Integration
===========================================================

🎯 PRODUCTION IMPLEMENTATION: Real YOLO PII detection and blurring
✅ COMPLETE INTEGRATION: Frontend -> YOLO -> Blurring -> Protected Video

FLOW:
1. Frontend uploads video -> POST /api/v1/video/upload
2. Backend runs YOLO detection on video frames
3. Returns real PII detections with frame crops
4. Frontend shows review screen, user filters false positives  
5. Frontend sends filtered PII -> POST /api/v1/video/protect
6. Backend applies selective blurring to specific track IDs
7. Returns URL to protected video for playback

KEY FEATURES:
✅ Model preloading at startup for performance
✅ Real YOLO detection with tracking
✅ Frame extraction and crop generation  
✅ Selective video blurring based on track IDs
✅ Proper error handling and logging
✅ Render deployment ready
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import uuid
import time
import asyncio
import os
import shutil
import logging
from pathlib import Path
from PIL import Image
import cv2
import numpy as np

# Import our pipeline modules
from pipeline.detect import detect_video
from pipeline.extract import process_video
from pipeline.blur import blur_video

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get base URL from environment or default to localhost for development  
BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")
MODEL_PATH = "models/Credit.pt"

# Create directories for file storage
UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed") 
FRAMES_DIR = Path("frames")
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)
FRAMES_DIR.mkdir(exist_ok=True)

# Global model instance (preloaded at startup)
yolo_model = None

def load_yolo_model():
    """
    🚀 CRITICAL: Load YOLO model at startup for performance
    This prevents loading the model on every request
    """
    global yolo_model
    try:
        if os.path.exists(MODEL_PATH):
            logger.info(f"🤖 Loading YOLO model from {MODEL_PATH}...")
            from ultralytics import YOLO
            yolo_model = YOLO(MODEL_PATH)
            logger.info("✅ YOLO model loaded successfully!")
            return True
        else:
            logger.error(f"❌ Model file not found: {MODEL_PATH}")
            return False
    except Exception as e:
        logger.error(f"❌ Failed to load YOLO model: {e}")
        return False

def get_video_info(video_path: str) -> dict:
    """Extract basic video information"""
    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps > 0 else 0
        cap.release()
        
        return {
            "fps": fps,
            "frame_count": frame_count,
            "duration": duration
        }
    except Exception as e:
        logger.error(f"Error getting video info: {e}")
        return {"fps": 30, "frame_count": 0, "duration": 0}

def create_frame_image_from_crop(crop_path: str, frame_id: str) -> str:
    """
    Convert YOLO crop to frame image for frontend display
    """
    try:
        if crop_path and os.path.exists(crop_path):
            # Copy crop to frames directory with expected naming
            frame_filename = f"{frame_id}.jpg"
            frame_path = FRAMES_DIR / frame_filename
            shutil.copy2(crop_path, frame_path)
            return f"{BASE_URL}/frames/{frame_filename}"
        else:
            # Create fallback frame if crop doesn't exist
            return create_fallback_frame_image(frame_id)
    except Exception as e:
        logger.error(f"Error creating frame image: {e}")
        return create_fallback_frame_image(frame_id)

def create_fallback_frame_image(frame_id: str) -> str:
    """Create fallback frame image if crop processing fails"""
    try:
        width, height = 640, 360
        img = Image.new('RGB', (width, height), color='lightblue')
        frame_path = FRAMES_DIR / f"{frame_id}.jpg" 
        img.save(frame_path)
        return f"{BASE_URL}/frames/{frame_id}.jpg"
    except Exception as e:
        logger.error(f"Error creating fallback frame: {e}")
        return ""

# Initialize FastAPI app
app = FastAPI(title="PrivacyLens API", version="2.0.0")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frame images
app.mount("/frames", StaticFiles(directory="frames"), name="frames")

@app.on_event("startup")
async def startup_event():
    """🚀 Load YOLO model at startup"""
    logger.info("🔄 Starting PrivacyLens backend...")
    success = load_yolo_model()
    if not success:
        logger.warning("⚠️  YOLO model not loaded - check model path")
    logger.info("✅ Backend startup complete")

@app.get("/protected/{filename}")
async def stream_protected_video(filename: str, request: Request):
    """
    🎥 Stream protected videos with HTTP range support for React Native
    """
    video_path = PROCESSED_DIR / filename
    
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Protected video not found")
    
    file_size = video_path.stat().st_size
    range_header = request.headers.get("Range")
    
    if range_header:
        try:
            range_match = range_header.replace("bytes=", "")
            start, end = range_match.split("-")
            start = int(start) if start else 0
            end = int(end) if end else file_size - 1
            end = min(end, file_size - 1)
        except:
            start, end = 0, file_size - 1
            
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
        }
        
        return Response(chunk, status_code=206, headers=headers)
    
    else:
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

# Pydantic models for API
class PIIDetection(BaseModel):
    type: str  # 'credit_card', 'car_plate' etc
    confidence: float
    description: str
    severity: str  # 'low', 'medium', 'high'

class PIIFrame(BaseModel):
    id: str
    frameUri: str  # URL to frame/crop image
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

# In-memory storage (use database in production)
video_storage = {}

@app.get("/")
async def root():
    model_status = "loaded" if yolo_model is not None else "not loaded"
    return {
        "message": "PrivacyLens API is running", 
        "version": "2.0.0",
        "model_status": model_status
    }

@app.post("/api/v1/video/upload", response_model=VideoUploadResponse)
async def upload_and_analyze_video(video: UploadFile = File(...)):
    """
    🎯 MAIN ENDPOINT: Upload video and detect PII with YOLO
    
    FLOW:
    1. Save uploaded video
    2. Run YOLO detection + tracking on video
    3. Extract unique tracks (first occurrence of each credit card/plate)
    4. Generate frame crops for frontend review
    5. Return PII detections with frame URLs
    """
    
    if not video.content_type or not video.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    if yolo_model is None:
        raise HTTPException(status_code=503, detail="YOLO model not loaded")
    
    # Generate unique video ID
    video_id = str(uuid.uuid4())
    
    # Save uploaded video
    file_path = UPLOAD_DIR / f"{video_id}_{video.filename}"
    try:
        with open(file_path, "wb") as buffer:
            content = await video.read()
            buffer.write(content)
        logger.info(f"📹 Saved video: {file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {str(e)}")
    
    start_time = time.time()
    
    try:
        # 🤖 STEP 1: Run YOLO detection + tracking on entire video
        logger.info("🔍 Running YOLO detection...")
        results_data = detect_video(str(file_path), MODEL_PATH)
        
        if not results_data:
            raise HTTPException(status_code=422, detail="No detection results from video")
        
        # 📊 STEP 2: Process results to extract unique tracks
        logger.info("📊 Processing detection results...")
        processed_data = process_video(results_data, str(file_path))
        unique_tracks = processed_data.get("unique_tracks", [])
        fps = processed_data.get("fps", 30)
        
        if not unique_tracks:
            logger.warning("No PII objects detected in video")
        
        # 🖼️ STEP 3: Convert tracks to frontend PII format
        pii_frames = []
        for i, track in enumerate(unique_tracks):
            track_id = track["track_id"]
            track_type = track["type"]
            timestamp = track["first_seen_timestamp"]
            confidence = track["max_confidence"]
            crop_path = track.get("crop_path")
            
            # Create frame ID for frontend
            frame_id = f"{video_id}_track_{track_id}"
            
            # Create frame image from crop
            frame_uri = create_frame_image_from_crop(crop_path, frame_id)
            
            # Map YOLO class to frontend PII type
            pii_type = track_type.lower()
            if pii_type not in ['credit_card', 'car_plate']:
                pii_type = 'credit_card'  # Default fallback
            
            # Determine severity based on confidence
            if confidence >= 0.9:
                severity = "high"
            elif confidence >= 0.7:
                severity = "medium"  
            else:
                severity = "low"
            
            # Create PII detection
            detection = PIIDetection(
                type=pii_type,
                confidence=float(confidence),
                description=f"{track_type} detected (ID: {track_id})",
                severity=severity
            )
            
            # Create PII frame
            pii_frame = PIIFrame(
                id=frame_id,
                frameUri=frame_uri,
                timestamp=float(timestamp),
                detections=[detection]
            )
            
            pii_frames.append(pii_frame)
            
        processing_time = int((time.time() - start_time) * 1000)
        
        # Store video info for protection step
        video_storage[video_id] = {
            "original_path": str(file_path),
            "results_data": results_data,  # Store for blurring step
            "pii_frames": [frame.dict() for frame in pii_frames],
            "fps": fps,
            "upload_time": time.time()
        }
        
        logger.info(f"✅ Analysis complete: {len(pii_frames)} PII objects detected")
        
        response = VideoUploadResponse(
            videoId=video_id,
            piiFrames=pii_frames,
            totalFramesAnalyzed=len(results_data),
            processingTime=processing_time
        )
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Error during video analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")

@app.post("/api/v1/video/protect", response_model=ProtectionResponse)
async def create_protected_video(request: ProtectionRequest):
    """
    🎯 PROTECTION ENDPOINT: Create blurred video with selected PII objects
    
    FLOW:
    1. Get stored video info and YOLO results
    2. Extract track IDs from user-filtered PII frames  
    3. Run blur_video() to selectively blur those track IDs
    4. Return URL to protected video
    """
    
    if request.videoId not in video_storage:
        raise HTTPException(status_code=404, detail="Video not found")
    
    video_info = video_storage[request.videoId]
    original_path = video_info["original_path"]
    results_data = video_info["results_data"]
    
    if not os.path.exists(original_path):
        raise HTTPException(status_code=404, detail="Original video file not found")
    
    try:
        # Extract track IDs that user wants to blur
        blur_track_ids = []
        for pii_frame in request.piiFrames:
            # Extract track ID from frame ID format: {video_id}_track_{track_id}
            frame_id = pii_frame.id
            if "_track_" in frame_id:
                track_id_str = frame_id.split("_track_")[-1]
                try:
                    track_id = int(track_id_str)
                    blur_track_ids.append(track_id)
                except ValueError:
                    logger.warning(f"Could not parse track ID from {frame_id}")
        
        if not blur_track_ids:
            raise HTTPException(status_code=422, detail="No valid track IDs found for blurring")
        
        logger.info(f"🎭 Blurring track IDs: {blur_track_ids}")
        
        # Create output path for protected video
        original_name = Path(original_path).name
        protected_filename = f"protected_{original_name}"
        protected_path = PROCESSED_DIR / protected_filename
        
        # 🎭 STEP 1: Apply selective blurring using pipeline
        logger.info("🎭 Applying selective blurring...")
        final_path = blur_video(results_data, str(protected_path), blur_track_ids)
        
        # Update storage with protected video info
        video_storage[request.videoId]["protected_path"] = final_path
        video_storage[request.videoId]["blur_track_ids"] = blur_track_ids
        video_storage[request.videoId]["protection_time"] = time.time()
        
        # Return streaming URL 
        protected_video_uri = f"{BASE_URL}/protected/{protected_filename}"
        
        logger.info(f"✅ Protected video created: {protected_video_uri}")
        
        return ProtectionResponse(protectedVideoUri=protected_video_uri)
        
    except Exception as e:
        logger.error(f"❌ Error creating protected video: {e}")
        raise HTTPException(status_code=500, detail=f"Video protection failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint for Render deployment"""
    model_loaded = yolo_model is not None
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "videos_processed": len(video_storage),
        "model_loaded": model_loaded,
        "model_path": MODEL_PATH
    }

@app.exception_handler(Exception) 
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {exc}")
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

if __name__ == "__main__":
    import uvicorn
    
    # Use PORT environment variable for Render
    port = int(os.environ.get("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )