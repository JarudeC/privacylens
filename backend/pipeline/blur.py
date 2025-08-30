import cv2
from collections import deque

# Store IDs that must always be blurred
blurred_ids = set()
blur_counters = {}  # {track_id: frames_remaining}
BUFFER_FRAMES = 10  # temporal window before/after to blur

def blur_video(results_data, output_video_path, blur_ids):
    """
    Blur only the specified track IDs in blur_ids.
    results_data: list of Results objects
    output_video_path: path to save blurred video
    blur_ids: list or set of track IDs to blur
    Returns output_video_path
    """
    global blurred_ids, blur_counters
    blurred_ids.clear()
    blur_counters.clear()

    blurred_ids.update(set(blur_ids))

    # Get video props from first frame
    h, w = results_data[0].orig_img.shape[:2]
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(output_video_path), fourcc, 30, (w, h))

    frame_buffer = deque(maxlen=BUFFER_FRAMES)

    for result in results_data:
        frame = result.orig_img.copy()
        frame_buffer.append([frame, result])
        process_frame(frame, result, blurred_ids)

        update_counters()

        if len(frame_buffer) == BUFFER_FRAMES:
            oldest_frame, _ = frame_buffer.popleft()
            out.write(oldest_frame)

    while frame_buffer:
        oldest_frame, _ = frame_buffer.popleft()
        out.write(oldest_frame)

    out.release()
    print(f"Blurring complete. Output saved to: {output_video_path}")
    return str(output_video_path)


def process_frame(frame, result, blur_ids):
    """
    Blur only detections with track_id in blur_ids.
    """
    boxes_xyxy = result.boxes.xyxy.cpu().numpy().astype(int)
    class_ids = result.boxes.cls.cpu().numpy().astype(int)
    names = [result.names[cls_id] for cls_id in class_ids]
    track_ids = (
        result.boxes.id.cpu().numpy().astype(int)
        if result.boxes.id is not None else None
    )

    if track_ids is None:
        return

    for i, box in enumerate(boxes_xyxy):
        track_id = track_ids[i]
        if track_id in blur_ids:
            apply_blur(frame, box)
            label = f"{names[i]} ID:{track_id}"
            x1, y1, _, _ = box
            cv2.putText(frame, label, (x1, max(0, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

def retro_blur(frame, result, new_ids):
    """ Retroactively blur new IDs in past buffered frames """
    boxes_xyxy = result.boxes.xyxy.cpu().numpy().astype(int)
    track_ids = (
        result.boxes.id.cpu().numpy().astype(int)
        if result.boxes.id is not None else None
    )
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
    global blur_counters
    for tid in list(blur_counters.keys()):
        blur_counters[tid] = max(0, blur_counters[tid] - 1)
