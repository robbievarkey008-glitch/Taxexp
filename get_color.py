import cv2
import numpy as np

logo_path = "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/tax_exempt_logo_1200x1200.jpg"
img = cv2.imread(logo_path)
if img is not None:
    # Convert to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Reshape to list of pixels
    pixels = img.reshape(-1, 3)
    
    # Filter out pure white or near white pixels (background)
    mask = (pixels[:, 0] < 240) | (pixels[:, 1] < 240) | (pixels[:, 2] < 240)
    colored_pixels = pixels[mask]
    
    if len(colored_pixels) > 0:
        # Get median or mean color
        median_color = np.median(colored_pixels, axis=0)
        hex_color = '#{:02x}{:02x}{:02x}'.format(int(median_color[0]), int(median_color[1]), int(median_color[2]))
        print(f"Main logo color: {hex_color}")
    else:
        print("Logo is mostly white")
else:
    print("Could not load logo")
