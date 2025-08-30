# PrivacyLens – AI-Powered Video Privacy Protection Platform

A comprehensive mobile application that integrates AI-powered privacy protection into the video sharing experience. The platform utilizes custom-trained YOLO models to detect sensitive information such as credit cards and license plates in user-uploaded videos, providing real-time analysis and automated content protection.

## Project Overview

PrivacyLens enhances the traditional video sharing workflow by implementing intelligent privacy safeguards. The system performs background analysis of uploaded content while users interact with the standard editing interface, ensuring minimal disruption to user experience. Upon completion of the AI analysis, users are presented with detailed review screens showing flagged content, allowing for false positive removal and informed decision-making regarding content protection options.

## Technical Architecture

**Frontend (React Native):**
- React Native with Expo
- Expo Router for navigation
- Expo Video for video playback
- React Native Reanimated for smooth animations
- TypeScript for type safety
- NativeWind/Tailwind for styling

**Backend (Python AI):**
- FastAPI for high-performance API
- YOLO (You Only Look Once) for real-time object detection
- OpenCV (cv2) for video frame extraction and processing
- Custom trained AI models for credit card & license plate detection
- Pydantic for data validation
- Deployed on Render for cloud scalability

**AI/ML Pipeline:**
- YOLO models fine-tuned for privacy-sensitive object detection
- Real-time video frame analysis and processing
- Automated bounding box detection and classification
- Advanced blurring algorithms with quality preservation

## Core Features

### Privacy Detection System
- Real-time AI scanning using YOLO architecture for credit card and license plate detection
- Background processing during user editing sessions to optimize response times
- High-accuracy detection models specifically trained for privacy-sensitive objects
- Comprehensive frame-by-frame analysis at precise timestamps

### User Experience Design
- Intuitive social media-style interface for familiar user interaction patterns
- Interactive review system with visual flagging and bounding box overlays
- Streamlined false positive removal process with user-controlled filtering
- Optimized pre-processing pipeline ensuring rapid screen transitions

### Content Protection Options
- Dual upload pathways: original content with privacy warnings or AI-protected versions
- Selective automated blurring targeting only flagged sensitive areas
- Quality preservation algorithms maintaining original video fidelity in non-sensitive regions
- Complete user transparency and control over detection and protection processes

### Advanced Processing Capabilities
- Multi-format video support with scalable cloud-based processing infrastructure
- Professional-grade blurring techniques producing natural visual results
- Distributed processing architecture supporting concurrent user sessions
- Comprehensive error handling and fallback mechanisms
  
## Project Structure

```
privacylens/
├─ frontend/                ← React Native Mobile App
│   ├─ app/                 ← Expo Router screens
│   │   ├─ (tabs)/          ← Tab navigation screens
│   │   └─ upload/          ← Video upload flow screens
│   ├─ components/          ← Reusable UI components
│   │   ├─ ui/              ← Base UI components
│   │   └─ upload/          ← Upload-specific components
│   ├─ lib/                 ← Utilities and configurations
│   │   ├─ services/        ← API services
│   │   ├─ types/           ← TypeScript definitions
│   │   └─ data/            ← Mock data for development
│   └─ assets/              ← Images, videos, fonts
├─ backend/                 ← Python FastAPI Server
│   ├─ main.py              ← FastAPI application entry point
│   ├─ requirements.txt     ← Python dependencies
│   ├─ models/              ← Fintuned AI computer vision models
│   ├─ pipeline/            ← Pipeline to perform video detection, blurring, or extraction
│   ├─ frames/              ← Extracted video frames storage
│   ├─ processed/           ← Blurred/protected videos storage
│   └─ uploads/             ← Original video uploads
└─ README.md                ← This documentation
```

## System Workflow

### Stage 1: Content Acquisition
Users interact with the standard video upload interface, selecting existing content from device storage or recording new material through the integrated camera functionality.

### Stage 2: Automated Analysis
The uploaded video content is automatically transmitted to the backend processing pipeline for comprehensive YOLO-based analysis. This processing occurs asynchronously while users continue with standard editing activities, ensuring optimal user experience through intelligent pre-processing.

### Stage 3: Results Review and Validation
Upon completion of the AI analysis, users are presented with a detailed review interface displaying all flagged content with precise bounding box annotations. The system provides intuitive controls for false positive removal and content validation.

### Stage 4: Publication Decision
Users are offered two distinct publication pathways: uploading the original content with comprehensive privacy risk notifications, or selecting the AI-generated protected version featuring selective blurring of only the confirmed sensitive areas.

## Application Screenshots

| Upload Flow | Privacy Review | Protected Result |
|-------------|----------------|------------------|
| (photo1) | (photo2) | (photo3) |

## Development Setup

### System Requirements
- Node.js version 18.0 or higher
- Python version 3.8 or higher
- Expo CLI (install globally: `npm install -g expo-cli`)

### Backend Configuration
```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Launch development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Configuration
```bash
cd frontend
npm install

# Initialize Expo development environment
npx expo start

# Device deployment options
# iOS: Scan QR code using iPhone camera application
# Android: Scan QR code using Expo Go application
```

## Production Deployment

### Backend Infrastructure
The backend system is configured for deployment on Render cloud platform, providing scalable infrastructure for video processing and AI model inference with support for concurrent user sessions and automated scaling based on demand.

### Mobile Application Distribution
The frontend application supports standard mobile deployment pipelines using Expo build tools for both iOS App Store and Google Play Store distribution channels.
