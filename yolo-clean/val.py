from ultralytics import YOLO

# Load a model
model = YOLO("models/detblur.pt")

# Validate the model
metrics = model.val()  # no arguments needed, dataset and settings remembered
metrics.top1  # top1 accuracy
metrics.top5  # top5 accuracy