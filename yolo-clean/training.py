from ultralytics import YOLO

# Load a model
model = YOLO("models/yolo11m.pt")

# Train the model
results = model.train(
    data="datasets/cc.v3i.yolov11/data.yaml",
    epochs=100,
    imgsz=320,
    device="mps"
)
