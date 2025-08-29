import cv2
import os
from ultralytics import YOLO

def process_video(input_video_path, output_video_path, model_path):
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

    # Run YOLO tracking (generator)
    results = model.track(
        source=input_video_path,
        # tracker="bytetrack.yaml",
        stream=True,
        conf=0.8,
        # verbose=False
    )

    for result in results:
        frame = result.orig_img

        if result.boxes is not None:
            process_frame(frame, result)

        out.write(frame)

    out.release()
    print(f"Processing complete. Output saved to: {output_video_path}")

def process_frame(frame, result):
    boxes_xyxy = result.boxes.xyxy.cpu().numpy().astype(int)
    confidences = result.boxes.conf.cpu().numpy()
    class_ids = result.boxes.cls.cpu().numpy().astype(int)
    names = [result.names[cls_id] for cls_id in class_ids]
    track_ids = result.boxes.id.cpu().numpy().astype(int) if result.boxes.id is not None else None

    for i, box in enumerate(boxes_xyxy):
        x1, y1, x2, y2 = box
        roi = frame[y1:y2, x1:x2]

        if roi.size == 0:  # Skip invalid ROIs
            continue

        blurred_roi = cv2.GaussianBlur(roi, (51, 51), 30)
        frame[y1:y2, x1:x2] = blurred_roi

        label = f"{names[i]} {confidences[i]:.2f}"
        if track_ids is not None:
            label += f" ID:{track_ids[i]}"
        cv2.putText(frame, label, (x1, max(0, y1 - 10)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

if __name__ == "__main__":
    input_video = "/Users/desso/Downloads/Credit Card test 2.MOV"
    output_video = "blur/output_blurred_video.mp4"
    model_path = "models/detblur.pt"

    process_video(input_video, output_video, model_path)
