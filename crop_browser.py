from PIL import Image
import sys

def process(file_in, file_out):
    img = Image.open(file_in)
    w, h = img.size
    # Crop the top 120 pixels (standard browser URL bar height)
    # and maybe bottom 40 pixels (dock/taskbar)
    cropped = img.crop((0, 120, w, h - 40))
    # Resize back to 1600x900
    resized = cropped.resize((1600, 900), Image.Resampling.LANCZOS)
    resized.save(file_out)
    print(f"Processed {file_out}")

process("/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/marketing_screenshots/screenshot_1_fixed.png", "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/marketing_screenshots/screenshot_1_clean.png")
process("/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/marketing_screenshots/screenshot_2_fixed.png", "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/marketing_screenshots/screenshot_2_clean.png")
