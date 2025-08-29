from detect import detect_video
from blur import blur_video

def main():
    input_video = "input/Credit Card test 2.MOV"
    output_video = "blur/output_blurred_video.mp4"
    model_path = "models/best_detblur.pt"

    detections = detect_video(input_video, model_path)
    blur_video(detections, output_video, conf_lvl=0.85)

if __name__ == "__main__":
    main()
