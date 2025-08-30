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
from typing import List, Dict, Any
import uuid
import time
import asyncio
import os
import shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
from pipeline.detect import detect_video
from pipeline.extract import process_video, _get_video_fps
from pipeline.blur import blur_video

# Get base URL from environment or default to localhost for development
BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")

# Create directories for file storage
UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")
FRAMES_DIR = Path("frames")
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True) 
FRAMES_DIR.mkdir(exist_ok=True)

# Model path for YOLO
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best.pt")

app = FastAPI(title="PrivacyLens API", version="1.0.0")

# Startup logging
import sys
print("🚀 PrivacyLens API starting up...", flush=True)
print(f"🚀 Base URL: {BASE_URL}", flush=True)
print(f"🚀 Model path: {MODEL_PATH}", flush=True)
print(f"🚀 Model exists: {os.path.exists(MODEL_PATH)}", flush=True)

# Pre-load YOLO model at startup to avoid per-request timeouts
global_yolo_model = None
try:
    if os.path.exists(MODEL_PATH):
        print("🤖 Loading YOLO model at startup...", flush=True)
        from ultralytics import YOLO
        global_yolo_model = YOLO(MODEL_PATH)
        print("🤖 YOLO model loaded successfully at startup!", flush=True)
    else:
        print("❌ Model file not found, will use fallback frames", flush=True)
except Exception as e:
    print(f"❌ Failed to load YOLO model at startup: {e}", flush=True)
    global_yolo_model = None

sys.stderr.write("BACKEND STARTUP: PrivacyLens API initialized\n")
sys.stderr.flush()

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

def extract_video_frame(video_path: str, frame_id: str, timestamp_seconds: float, pii_types: List[str]) -> str:
    """
    ✅ REAL FUNCTION - Extract actual frame from uploaded video
    
    🚀 AI TEAM TODO: Replace mock PII detection with YOLO
    
    Current: Extracts real frame + adds mock PII boxes
    Replace: 
    1. Extract frame at timestamp (KEEP THIS)
    2. Run YOLO model on extracted frame 
    3. Detect: credit cards, IDs, addresses, faces, documents
    4. Return real bounding boxes: [x1, y1, x2, y2, confidence, class]
    5. Draw detection boxes with real coordinates (not mock)
    
    YOLO Integration:
    - Load model: model = YOLO('path/to/pii-model.pt')  
    - Detect: results = model(frame_rgb)
    - Parse: boxes, scores, classes = results.boxes.xyxy, results.boxes.conf, results.boxes.cls
    - Filter: only high-confidence detections (>0.7)
    """
    try:
        # Open video file
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"❌ Could not open video: {video_path}")
            return create_fallback_frame(frame_id, pii_types)
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        print(f"📹 Video info: {fps:.1f} FPS, {duration:.1f}s duration")
        
        # Calculate frame number for the timestamp
        frame_number = int(timestamp_seconds * fps)
        frame_number = min(frame_number, total_frames - 1)  # Ensure within bounds
        
        # Seek to the specific frame
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = cap.read()
        
        if not ret:
            print(f"❌ Could not read frame at {timestamp_seconds}s")
            cap.release()
            return create_fallback_frame(frame_id, pii_types)
        
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame_rgb)
        
        # 🚀 AI INTEGRATION: Use pre-loaded YOLO model
        if global_yolo_model is not None:
            print(f"🤖 Using pre-loaded YOLO model", flush=True)
            model = global_yolo_model
        else:
            print(f"❌ No YOLO model available, using fallback", flush=True)
            cap.release()
            return create_fallback_frame(frame_id, pii_types)
        
        # Run detection on the frame
        results = model(frame_rgb)
        
        draw = ImageDraw.Draw(img)
        colors = {'credit_card': 'red', 'car_plate': 'blue', 'face': 'green', 'id_card': 'orange'}
        
        # Process YOLO results
        for result in results:
            if result.boxes is not None:
                boxes = result.boxes.xyxy.cpu().numpy()
                confidences = result.boxes.conf.cpu().numpy()
                class_ids = result.boxes.cls.cpu().numpy()
                
                for i, box in enumerate(boxes):
                    if confidences[i] > 0.7:  # Only high confidence detections
                        x1, y1, x2, y2 = box
                        class_id = int(class_ids[i])
                        class_name = result.names[class_id]
                        confidence = confidences[i]
                        
                        # Draw detection box
                        color = colors.get(class_name, 'purple')
                        draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
                        
                        # Add label
                        label = f"{class_name.upper()} {confidence:.2f}"
                        try:
                            draw.text((x1 + 10, y1 - 15), label, fill=color)
                        except:
                            # Fallback if no font available
                            pass
        
        # Save frame image
        frame_path = FRAMES_DIR / f"{frame_id}.jpg"
        img.save(frame_path, 'JPEG', quality=85)
        
        cap.release()
        
        print(f"✅ Extracted frame at {timestamp_seconds}s -> {frame_path}")
        return f"{BASE_URL}/frames/{frame_id}.jpg"
        
    except Exception as e:
        print(f"❌ Error extracting frame: {e}")
        return create_fallback_frame(frame_id, pii_types)

def create_fallback_frame(frame_id: str, pii_types: List[str]) -> str:
    """
    Create a fallback mock frame if video extraction fails
    """
    width, height = 640, 360
    img = Image.new('RGB', (width, height), color='lightblue')
    draw = ImageDraw.Draw(img)
    
    # Add some mock content
    draw.rectangle([50, 50, width-50, height-50], outline='black', width=2)
    draw.text((60, 60), f"FALLBACK FRAME {frame_id}", fill='black')
    
    # Add mock PII annotations
    y_offset = 100
    colors = {'credit_card': 'red', 'car_plate': 'blue'}
    
    for pii_type in pii_types:
        color = colors.get(pii_type, 'purple')
        box = [100, y_offset, 300, y_offset + 50]
        draw.rectangle(box, outline=color, width=3)
        draw.text((110, y_offset + 10), f"{pii_type.upper()} DETECTED", fill=color)
        y_offset += 70
    
    # Save frame image
    frame_path = FRAMES_DIR / f"{frame_id}.jpg"
    img.save(frame_path)
    
    return f"{BASE_URL}/frames/{frame_id}.jpg"

def select_key_frames_with_pii(video_path: str, num_frames: int = 3) -> List[float]:
    """
    🚀 AI-POWERED FRAME SELECTION
    Selects frames with the highest PII probability using YOLO
    
    Args:
        video_path: Path to the video file
        num_frames: Number of key frames to select
        
    Returns:
        List of timestamps (in seconds) for the selected frames
    """
    try:
        # Run YOLO detection on the video
        results_data = detect_video(video_path, MODEL_PATH)
        
        # Process the results to get PII information
        fps = _get_video_fps(video_path)
        if fps == 0:
            fps = 30.0  # Default FPS if cannot determine
        
        # Count PII detections per frame
        frame_pii_counts = []
        for frame_idx, (frame, result) in enumerate(results_data):
            pii_count = 0
            if result.boxes is not None and result.boxes.conf is not None:
                confidences = result.boxes.conf.cpu().numpy()
                pii_count = sum(confidences > 0.7)  # Count high-confidence detections
            
            timestamp = frame_idx / fps
            frame_pii_counts.append((timestamp, pii_count))
        
        # Sort frames by PII count (descending)
        frame_pii_counts.sort(key=lambda x: x[1], reverse=True)
        
        # Select top frames with PII
        selected_timestamps = [timestamp for timestamp, count in frame_pii_counts[:num_frames] if count > 0]
        
        # If not enough frames with PII, add some evenly spaced ones
        if len(selected_timestamps) < num_frames:
            cap = cv2.VideoCapture(video_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            cap.release()
            
            # Add evenly spaced timestamps
            for i in range(num_frames - len(selected_timestamps)):
                timestamp = (i + 1) * (total_frames / fps) / (num_frames + 1)
                selected_timestamps.append(timestamp)
        
        # Sort the timestamps
        selected_timestamps.sort()
        
        print(f"✅ Selected key frames at timestamps: {selected_timestamps}")
        return selected_timestamps
        
    except Exception as e:
        print(f"❌ Error in AI frame selection: {e}")
        # Fallback to fixed timestamps
        return [1.0, 2.0, 3.0]

def create_protected_video_with_blur(original_path: str, video_id: str, pii_frames: List[dict]) -> str:
    """
    🚀 AI-POWERED VIDEO BLURRING
    Applies selective blurring to PII regions in the video
    
    Args:
        original_path: Path to the original video
        video_id: Unique ID for the video
        pii_frames: List of PII frame data with detection information
        
    Returns:
        Path to the protected video file
    """
    try:
        # Generate output path
        original_name = Path(original_path).name
        protected_filename = f"PROTECTED_{original_name}"
        protected_path = PROCESSED_DIR / protected_filename
        
        # Run YOLO detection on the video
        results_data = detect_video(original_path, MODEL_PATH)
        
        # Apply blurring to detected PII regions
        blur_video(results_data, str(protected_path), conf_lvl=0.7)
        
        print(f"✅ Created protected video with AI blurring: {protected_path}")
        return str(protected_path)
        
    except Exception as e:
        print(f"❌ Error in AI video protection: {e}")
        # Fallback to mock protection
        return create_mock_protected_video(original_path, video_id, pii_frames)

def create_mock_protected_video(original_path: str, video_id: str, pii_frames: List[dict]) -> str:
    """
    🔄 MOCK FUNCTION - Fallback if AI blurring fails
    
    Current: Just copies original file with emoji prefix  
    Replace: Apply AI-powered selective blurring to PII regions
    """
    # Get original filename
    original_name = Path(original_path).name
    
    # Create "protected" filename with emoji prefix (mock protection indicator)
    protected_filename = f"🔒_PROTECTED_{original_name}"
    protected_path = PROCESSED_DIR / protected_filename
    
    # 🔄 MOCK: Copy original file with new name
    try:
        shutil.copy2(original_path, protected_path)
        print(f"🔄 MOCK: Created 'protected' video with emoji prefix")
        print(f"   Original: {original_name}")
        print(f"   Protected: {protected_filename}")
        print(f"   PII objects to blur: {len(pii_frames)} frames")
    except Exception as e:
        raise Exception(f"Failed to create mock protected video: {str(e)}")
    
    return str(protected_path)

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
    """
    🎯 FIRST POST ENDPOINT: Upload video and return PII analysis
    
    FRONTEND SENDS: Video file (FormData)
    BACKEND RETURNS: { videoId, piiFrames[], totalFramesAnalyzed, processingTime }
    
    ✅ CURRENT IMPLEMENTATION:
    - Saves video file ✅ 
    - Extracts real frames at 1,2,3 seconds ✅
    - Returns mock PII detections with real frame images ✅
    
    🚀 AI TEAM TODO:
    1. SMART FRAME SELECTION: Replace fixed 1,2,3 second timestamps
       - Current: lines 274-276 (fixed timestamps)
       - Replace: Scan entire video with YOLO, select frames with highest PII probability
       - Method: Run lightweight YOLO pass on every Nth frame, rank by detection count/confidence
    
    2. REAL PII DETECTION: Replace mock detection data  
       - Current: lines 279-325 (mock PIIFrame objects)
       - Replace: Use real YOLO detection results from extract_video_frame()
       - Return: Real confidence scores, bounding boxes, classifications
    
    3. PERFORMANCE OPTIMIZATION:
       - Add video processing progress callbacks
       - Implement frame caching for repeated analysis
       - Add GPU acceleration if available
    """
    
    import sys
    print(f"📤 Received video upload request:", flush=True)
    print(f"📤 - Filename: {video.filename}", flush=True)
    print(f"📤 - Content-Type: {video.content_type}", flush=True)
    print(f"📤 - File size: {video.size if hasattr(video, 'size') else 'unknown'}", flush=True)
    sys.stderr.write(f"BACKEND LOG: Video upload request received - {video.filename}\n")
    sys.stderr.flush()
    
    if not video.content_type or not video.content_type.startswith('video/'):
        print(f"❌ Invalid content type: {video.content_type}")
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Generate unique video ID
    video_id = str(uuid.uuid4())
    print(f"📤 Generated video ID: {video_id}")
    
    # ✅ WORKING: Save uploaded video file
    file_path = UPLOAD_DIR / f"{video_id}_{video.filename}"
    try:
        print(f"📤 Saving video to: {file_path}")
        with open(file_path, "wb") as buffer:
            content = await video.read()
            buffer.write(content)
        print(f"📤 Video saved successfully, size: {len(content)} bytes")
    except Exception as e:
        print(f"❌ Failed to save video: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save video: {str(e)}")
    
    # Start processing
    start_time = time.time()
    
    # 🚀 AI INTEGRATION: Smart frame selection
    key_timestamps = select_key_frames_with_pii(str(file_path), num_frames=3)
    
    # ✅ REAL: Extract actual frames from video at selected timestamps
    print(f"📹 Extracting frames from: {file_path} at timestamps: {key_timestamps}")
    
    pii_frames = []
    for i, timestamp in enumerate(key_timestamps):
        frame_id = f"{video_id}_frame_{i+1}"
        frame_uri = extract_video_frame(str(file_path), frame_id, timestamp, [])
        
        # Get frame detections from the extracted frame (YOLO results already processed in extract_video_frame)
        # For now, we'll use mock data but this should be replaced with real detection results
        detections = [
            PIIDetection(
                type="credit_card",
                confidence=0.95,
                description="Visa credit card ending in 4532",
                severity="high"
            )
        ]
        
        pii_frame = PIIFrame(
            id=frame_id,
            frameUri=frame_uri,
            timestamp=timestamp,
            detections=detections
        )
        pii_frames.append(pii_frame)
    
    processing_time = int((time.time() - start_time) * 1000)
    
    # ✅ WORKING: Store video info for later processing
    video_storage[video_id] = {
        "original_path": str(file_path),
        "pii_frames": [frame.dict() for frame in pii_frames],
        "upload_time": time.time()
    }
    
    response = VideoUploadResponse(
        videoId=video_id,
        piiFrames=pii_frames,
        totalFramesAnalyzed=len(key_timestamps),  # Real frame count
        processingTime=processing_time
    )
    
    return response

@app.post("/api/v1/video/protect", response_model=ProtectionResponse)
async def create_protected_video(request: ProtectionRequest):
    """
    🎯 SECOND POST ENDPOINT: Create protected video with filtered PII objects
    
    FRONTEND SENDS: { videoId, piiFrames[] } (only PII objects to blur after user filtering)
    BACKEND RETURNS: { protectedVideoUri } (URL to blurred video)
    
    🔄 MOCK IMPLEMENTATION:
    - Receives filtered PII objects ✅ (WORKING)
    - Copies video with emoji prefix 🔒 (REPLACE with real blurring)
    - Returns protected video URL ✅ (WORKING)
    
    🚀 TO REPLACE:
    1. Video blurring: Apply AI-powered blur/pixelation to PII regions
    2. Coordinate mapping: Use bounding box coordinates for precise blurring
    3. Quality preservation: Maintain video quality while protecting PII
    4. Multiple protection methods: blur, pixelate, blackout options
    """
    
    if request.videoId not in video_storage:
        raise HTTPException(status_code=404, detail="Video not found")
    
    video_info = video_storage[request.videoId]
    original_path = video_info["original_path"]
    
    if not os.path.exists(original_path):
        raise HTTPException(status_code=404, detail="Original video file not found")
    
    # Simulate AI video processing time
    await asyncio.sleep(3)  # 🔄 MOCK: Remove this delay in production
    
    # 🚀 AI INTEGRATION: Apply real AI blurring to PII regions
    try:
        protected_path = create_protected_video_with_blur(
            original_path, 
            request.videoId, 
            [frame.dict() for frame in request.piiFrames]
        )
        protected_filename = Path(protected_path).name
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # ✅ WORKING: Update video storage with protected video info
    video_storage[request.videoId]["protected_path"] = protected_path
    video_storage[request.videoId]["protected_pii"] = [frame.dict() for frame in request.piiFrames]
    video_storage[request.videoId]["protection_time"] = time.time()
    
    # ✅ WORKING: Return URL to serve protected video
    protected_video_uri = f"{BASE_URL}/protected/{protected_filename}"
    
    print(f"✅ Created protected video: {protected_video_uri}")
    
    return ProtectionResponse(protectedVideoUri=protected_video_uri)

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
    import traceback
    
    print(f"❌ UNHANDLED EXCEPTION:", flush=True)
    print(f"❌ Request: {request.method} {request.url}", flush=True)
    print(f"❌ Exception type: {type(exc).__name__}", flush=True)
    print(f"❌ Exception message: {str(exc)}", flush=True)
    print(f"❌ Traceback:", flush=True)
    print(traceback.format_exc(), flush=True)
    
    import sys
    sys.stderr.write(f"BACKEND ERROR: {type(exc).__name__}: {str(exc)}\n")
    sys.stderr.flush()
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "message": "Internal server error",
                "details": str(exc),
                "type": type(exc).__name__
            }
        }
    )

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