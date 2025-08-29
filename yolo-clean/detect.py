from ultralytics import YOLO

model = YOLO("models/detblur.pt")

results = model.track(
    "input/Credit Card test 2.MOV",
    # conf=0.8,
    show=True,
    # tracker="bytetrack.yaml"
    save=True,
)