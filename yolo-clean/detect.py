from ultralytics import YOLO

def detect_video(input_video_path, model_path):
    """Run YOLO detection+tracking, return a list of (frame, result) pairs."""
    model = YOLO(model_path)

    results_data = []

    # Run YOLO tracking (generator)
    results = model.track(
        source=input_video_path,
        # tracker="bytetrack.yaml",
        stream=True,
        # show=True
    )

    for result in results:
        frame = result.orig_img.copy()
        results_data.append((frame, result))

    return results_data