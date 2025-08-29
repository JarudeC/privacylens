"""
PrivacyLens Backend - FastAPI Entry Point
==========================================

This is the main FastAPI application that handles video upload and PII detection/protection.

🔄 CURRENT IMPLEMENTATION: Mock data for frontend testing
🚀 FUTURE REPLACEMENT: Real AI/ML processing

ENDPOINTS:
1. POST /api/v1/video/upload - Upload video, return PII detections (MOCK)
2. POST /api/v1/video/protect - Create protected video with blurred PII (MOCK)
3. GET /frames/{filename} - Serve frame images (MOCK)
4. GET /protected/{filename} - Serve protected videos (WORKING)

MOCK COMPONENTS TO REPLACE:
- mock_pii_frames: Replace with real AI PII detection
- Frame extraction: Replace with actual video frame extraction
- Blur processing: Replace with real video blurring AI
- Static frame URLs: Replace with actual frame serving

WORKING COMPONENTS:
- File upload/storage
- CORS middleware
- Error handling
- Response formatting
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
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

# Create directories for file storage
UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")
FRAMES_DIR = Path("frames")
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True) 
FRAMES_DIR.mkdir(exist_ok=True)

app = FastAPI(title="PrivacyLens API", version="1.0.0")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files for frames and protected videos
app.mount("/frames", StaticFiles(directory="frames"), name="frames")
app.mount("/protected", StaticFiles(directory="processed"), name="protected")

def create_mock_frame_image(frame_id: str, pii_types: List[str]) -> str:
    """
    🔄 MOCK FUNCTION - Replace with real video frame extraction
    
    Creates a mock frame image with PII detection annotations
    In production, this should extract actual frames from the video
    """
    # Create a simple mock frame image
    width, height = 640, 360
    img = Image.new('RGB', (width, height), color='lightblue')
    draw = ImageDraw.Draw(img)
    
    # Add some mock content
    draw.rectangle([50, 50, width-50, height-50], outline='black', width=2)
    draw.text((60, 60), f"MOCK FRAME {frame_id}", fill='black')
    
    # Add mock PII annotations
    y_offset = 100
    colors = {'credit_card': 'red', 'id_card': 'orange', 'address': 'blue'}
    
    for pii_type in pii_types:
        color = colors.get(pii_type, 'purple')
        # Draw mock PII detection box
        box = [100, y_offset, 300, y_offset + 50]
        draw.rectangle(box, outline=color, width=3)
        draw.text((110, y_offset + 10), f"{pii_type.upper()} DETECTED", fill=color)
        y_offset += 70
    
    # Save frame image
    frame_path = FRAMES_DIR / f"{frame_id}.jpg"
    img.save(frame_path)
    
    return f"http://localhost:8000/frames/{frame_id}.jpg"

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
    
    🔄 MOCK IMPLEMENTATION:
    - Saves video file ✅ (WORKING)
    - Creates mock frame images ✅ (REPLACE with real frame extraction)
    - Returns mock PII detections (REPLACE with real AI detection)
    - Multiple PII instances per frame (card1, card2, etc.) ✅
    
    🚀 TO REPLACE:
    1. Frame extraction: Use CV2/FFmpeg to extract real video frames
    2. AI PII detection: Integrate your AI model for credit cards, IDs, addresses
    3. Confidence scoring: Real confidence values from AI model
    4. Bounding boxes: Real detection coordinates
    """
    
    if not video.content_type or not video.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Generate unique video ID
    video_id = str(uuid.uuid4())
    
    # ✅ WORKING: Save uploaded video file
    file_path = UPLOAD_DIR / f"{video_id}_{video.filename}"
    try:
        with open(file_path, "wb") as buffer:
            content = await video.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {str(e)}")
    
    # Simulate AI processing time
    start_time = time.time()
    await asyncio.sleep(2)  # 🔄 MOCK: Remove this delay in production
    
    # 🔄 MOCK: Create frame images with PII annotations
    # 🚀 REPLACE: Extract real frames from video and run AI detection
    frame_1_uri = create_mock_frame_image(f"{video_id}_frame_1", ["credit_card"])
    frame_2_uri = create_mock_frame_image(f"{video_id}_frame_2", ["address", "credit_card"]) 
    frame_3_uri = create_mock_frame_image(f"{video_id}_frame_3", ["id_card"])
    
    # 🔄 MOCK PII detection results - REPLACE with real AI/ML processing
    mock_pii_frames = [
        PIIFrame(
            id=f"{video_id}_frame_1",
            frameUri=frame_1_uri,
            timestamp=5.2,
            detections=[
                PIIDetection(
                    type="credit_card",
                    confidence=0.95,
                    description="Visa credit card ending in 4532",
                    severity="high"
                )
            ]
        ),
        PIIFrame(
            id=f"{video_id}_frame_2", 
            frameUri=frame_2_uri,
            timestamp=12.8,
            detections=[
                PIIDetection(
                    type="address",
                    confidence=0.87,
                    description="Street address: 123 Main St, City",
                    severity="medium"
                ),
                PIIDetection(
                    type="credit_card",
                    confidence=0.92,
                    description="Mastercard ending in 8901",
                    severity="high"
                )
            ]
        ),
        PIIFrame(
            id=f"{video_id}_frame_3",
            frameUri=frame_3_uri, 
            timestamp=8.4,
            detections=[
                PIIDetection(
                    type="id_card",
                    confidence=0.92,
                    description="Driver's license detected",
                    severity="high"
                )
            ]
        )
    ]
    
    processing_time = int((time.time() - start_time) * 1000)
    
    # ✅ WORKING: Store video info for later processing
    video_storage[video_id] = {
        "original_path": str(file_path),
        "pii_frames": [frame.dict() for frame in mock_pii_frames],
        "upload_time": time.time()
    }
    
    response = VideoUploadResponse(
        videoId=video_id,
        piiFrames=mock_pii_frames,
        totalFramesAnalyzed=245,  # 🔄 MOCK: Real frame count
        processingTime=processing_time
    )
    
    return response

def create_mock_protected_video(original_path: str, video_id: str, pii_frames: List[dict]) -> str:
    """
    🔄 MOCK FUNCTION - Replace with real video blurring AI
    
    For demo: Creates a "protected" video by adding emoji prefix to filename
    In production: Apply real AI-powered blurring to detected PII regions
    
    🚀 TO REPLACE:
    1. Video processing: Use FFmpeg/OpenCV for real video manipulation
    2. AI blurring: Apply blur/pixelation to detected PII coordinates
    3. Multiple formats: Support different protection methods (blur, pixelate, blackout)
    """
    # Get original filename
    original_name = Path(original_path).name
    
    # Create "protected" filename with emoji prefix (mock protection indicator)
    protected_filename = f"🔒_PROTECTED_{original_name}"
    protected_path = PROCESSED_DIR / protected_filename
    
    # 🔄 MOCK: Copy original file with new name
    # 🚀 REPLACE: Apply real blurring AI to PII regions in video
    try:
        shutil.copy2(original_path, protected_path)
        print(f"🔄 MOCK: Created 'protected' video with emoji prefix")
        print(f"   Original: {original_name}")
        print(f"   Protected: {protected_filename}")
        print(f"   PII objects to blur: {len(pii_frames)} frames")
    except Exception as e:
        raise Exception(f"Failed to create mock protected video: {str(e)}")
    
    return str(protected_path)

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
    
    # 🔄 MOCK: Create "protected" video with emoji prefix
    # 🚀 REPLACE: Apply real AI blurring to PII regions
    try:
        protected_path = create_mock_protected_video(
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
    protected_video_uri = f"http://localhost:8000/protected/{protected_filename}"
    
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