import cv2
import os
from collections import deque
from ultralytics import YOLO

# Store IDs that must always be blurred
blurred_ids = set()

# Store counters for temporal blurring (forward buffering)
blur_counters = {}  # {track_id: frames_remaining}
BUFFER_FRAMES = 10  # how many frames before/after to keep blurring

def process_video(input_video_path, output_video_path, model_path, conf_lvl):
    model = YOLO(model_path)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_video_path), exist_ok=True)

    # Get video properties (FPS, width, height)
    cap = cv2.VideoCapture(input_video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_video_path, fourcc, fps if fps > 0 else 30, (width, height))

    # Frame buffer for backward blurring
    frame_buffer = deque(maxlen=BUFFER_FRAMES)

    # Run YOLO tracking (generator)
    results = model.track(
        source=input_video_path,
        # tracker="bytetrack.yaml",
        stream=True,
        show=True,
    )

    for result in results:
        frame = result.orig_img.copy()

        # Add current frame + result to buffer
        frame_buffer.append([frame, result])

        # Process detection & update blurred IDs
        new_ids = process_frame(frame, result, conf_lvl)

        # If new IDs detected → retroactively blur in buffer
        if new_ids:
            for past_frame, past_result in frame_buffer:
                retro_blur(past_frame, past_result, new_ids)

        # Decrement counters every frame
        update_counters()

        # Write oldest frame in buffer once buffer is full
        if len(frame_buffer) == BUFFER_FRAMES:
            oldest_frame, _ = frame_buffer.popleft()
            out.write(oldest_frame)

    # Flush remaining frames in buffer
    while frame_buffer:
        oldest_frame, _ = frame_buffer.popleft()
        out.write(oldest_frame)

    out.release()
    print(f"Processing complete. Output saved to: {output_video_path}")


def process_frame(frame, result, conf_lvl):
    """ Process detections in a single frame, return any newly activated IDs """
    global blurred_ids, blur_counters
    new_ids = set()

    boxes_xyxy = result.boxes.xyxy.cpu().numpy().astype(int)
    confidences = result.boxes.conf.cpu().numpy()
    class_ids = result.boxes.cls.cpu().numpy().astype(int)
    names = [result.names[cls_id] for cls_id in class_ids]
    track_ids = result.boxes.id.cpu().numpy().astype(int) if result.boxes.id is not None else None

    if track_ids is None:
        return new_ids

    for i, box in enumerate(boxes_xyxy):
        x1, y1, x2, y2 = box
        track_id = track_ids[i]
        conf = confidences[i]

        # If confidence passes threshold → activate blur
        if conf >= conf_lvl and track_id not in blurred_ids:
            blurred_ids.add(track_id)
            new_ids.add(track_id)
            blur_counters[track_id] = BUFFER_FRAMES

        # Blur if this ID is active or still has buffer left
        if track_id in blurred_ids or blur_counters.get(track_id, 0) > 0:
            apply_blur(frame, box)

            # Debug label (optional)
            label = f"{names[i]} {conf:.2f} ID:{track_id}"
            cv2.putText(frame, label, (x1, max(0, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    return new_ids


def retro_blur(frame, result, new_ids):
    """ Retroactively blur new IDs in past buffered frames """
    boxes_xyxy = result.boxes.xyxy.cpu().numpy().astype(int)
    track_ids = result.boxes.id.cpu().numpy().astype(int) if result.boxes.id is not None else None
    if track_ids is None:
        return

    for i, box in enumerate(boxes_xyxy):
        if track_ids[i] in new_ids:
            apply_blur(frame, box)


def apply_blur(frame, box):
    """ Apply Gaussian blur to region defined by box """
    x1, y1, x2, y2 = box
    roi = frame[y1:y2, x1:x2]
    if roi.size > 0:
        blurred_roi = cv2.GaussianBlur(roi, (51, 51), 30)
        frame[y1:y2, x1:x2] = blurred_roi


def update_counters():
    """ Decrement all active blur counters each frame """
    global blur_counters
    for tid in list(blur_counters.keys()):
        blur_counters[tid] = max(0, blur_counters[tid] - 1)


if __name__ == "__main__":
    input_video = "input/Credit Card test 2.MOV"
    output_video = "blur/output_blurred_video.mp4"
    model_path = "models/detblur.pt"

    process_video(input_video, output_video, model_path, 0.9)
