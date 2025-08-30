from ultralytics import YOLO
import os
import cv2
import uuid

# Load the model once globally so it's not reloaded each time
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "best.pt")
model = YOLO(MODEL_PATH)

def process_video(video_path: str, conf: float, save: bool = True):
    """
    Processes a video with YOLO tracking.

    Args:
        video_path (str): Path to the video file.
        conf (float): Confidence threshold.
        tracker (str): Tracker type (e.g., "bytetrack").
        save (bool): Whether to save the output.

    Returns:
        list: YOLO results objects.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")
    
    # Determine FPS for timestamp estimation
    fps = _get_video_fps(video_path) or 30.0

    results = model.track(
        source=video_path,
        conf=conf,
        save=save,
        show=True
    )

    # Build JSON-friendly summary of first-seen tracks with crop and timestamp
    save_dir = None
    try:
        
        # Most Ultralytics results include save_dir attribute when save=True
        if len(results) > 0 and hasattr(results[0], "save_dir") and results[0].save_dir is not None:
            save_dir = str(results[0].save_dir)
    except Exception:
        pass

    unique_tracks = _extract_unique_tracks(results, fps=fps, base_save_dir=save_dir)
    
    return {"unique_tracks": unique_tracks, "fps": fps}


def main(video_path=None):
    if video_path is None:
        video_path = os.path.join(os.path.dirname(__file__), "videos", "example.mp4")
    process_video(video_path, conf=0.85,tracker="bytetrack.yaml", save=True)
# Process tracking results


def _get_video_fps(video_path: str) -> float:
    cap = cv2.VideoCapture(video_path)
    try:
        fps = cap.get(cv2.CAP_PROP_FPS)
        return round(float(fps)) if fps and fps > 0 else 0.0
    finally:
        cap.release()


def _ensure_dir(path: str) -> None:
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)


def _extract_unique_tracks(results, fps: float, base_save_dir: str | None = None):
    unique_by_track = {}
    # print(len(results))

    # Where to store our first-instance crops
    if base_save_dir is None:
        base_save_dir = os.path.join(os.path.dirname(__file__), "runs", "detect", "track")
    custom_crop_dir = os.path.join(base_save_dir, "first_instance_crops")
    _ensure_dir(custom_crop_dir)

    for frame_index, result in enumerate(results):
        # print(result.boxes.id.cpu().numpy().astype(int)) if result.boxes.id is not None else None
        if result.boxes is None or result.boxes.id is None:
            continue

        # CPU tensors to numpy for indexing
        ids_tensor = result.boxes.id
        cls_tensor = result.boxes.cls
        xyxy_tensor = result.boxes.xyxy

        if ids_tensor is None:
            continue

        ids = ids_tensor.int().cpu().numpy().tolist()

        for i, track_id in enumerate(ids):
            if track_id in unique_by_track:
                continue

            class_id = int(cls_tensor[i].item()) if cls_tensor is not None else -1
            class_name = result.names.get(class_id, str(class_id)) if hasattr(result, "names") else str(class_id)
            xyxy = xyxy_tensor[i].cpu().numpy().tolist()

            # Compute timestamp assuming constant FPS
            timestamp_seconds = frame_index / fps if fps and fps > 0 else frame_index / 30.0

            # Crop from original image for first instance
            crop_path = None
            try:
                img = result.orig_img  # numpy array (H,W,3) in BGR
                if img is not None:
                    x1, y1, x2, y2 = [int(max(0, v)) for v in xyxy]
                    h, w = img.shape[:2]
                    x1 = max(0, min(x1, w - 1))
                    x2 = max(0, min(x2, w))
                    y1 = max(0, min(y1, h - 1))
                    y2 = max(0, min(y2, h))
                    if x2 > x1 and y2 > y1:
                        filename = f"track_{track_id}_frame_{frame_index}_{uuid.uuid4().hex[:8]}.jpg"
                        crop_path = os.path.join(custom_crop_dir, filename)
                        crop_img = img[y1:y2, x1:x2]
                        cv2.imwrite(crop_path, crop_img)
            except Exception:
                # If cropping fails, leave crop_path as None
                crop_path = None

            unique_by_track[track_id] = {
                "track_id": int(track_id),
                "class": class_name,
                "first_seen_frame": int(frame_index),
                "first_seen_timestamp": float(timestamp_seconds),
                "bbox_xyxy": [float(v) for v in xyxy],
                "crop_path": crop_path,
            }

    # Return as list sorted by first_seen_frame
    return sorted(unique_by_track.values(), key=lambda x: x["first_seen_frame"]) 
