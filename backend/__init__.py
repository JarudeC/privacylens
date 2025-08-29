from Predict import process_video

# Custom video path
video_path = "/Users/weesi/Downloads/TechJam/Code/privacylens/backend/assets/Clear test.MOV"

# Call the function
results = process_video(video_path, conf=0.85, save=False)

print(results)