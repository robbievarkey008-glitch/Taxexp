from PIL import Image

def process(input_path, output_path):
    img = Image.open(input_path)
    
    # Target size
    TARGET_W, TARGET_H = 1600, 900
    
    # Calculate scale factor to fit within 1600x900
    scale = min(TARGET_W / img.width, TARGET_H / img.height)
    new_w = int(img.width * scale)
    new_h = int(img.height * scale)
    
    # Resize
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    
    # Create new 1600x900 image with black background (to blend with Shopify's black top/bottom bar in the screenshot)
    # The screenshot has a black bar at the top and bottom.
    bg = Image.new('RGB', (TARGET_W, TARGET_H), (0, 0, 0))
    
    # Paste resized image into center
    x = (TARGET_W - new_w) // 2
    y = (TARGET_H - new_h) // 2
    bg.paste(resized, (x, y))
    
    bg.save(output_path, quality=95)
    print(f"Saved {output_path}")

process("/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/.user_uploaded/media__1785302115501.png", "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/marketing_screenshots/screenshot_1_fixed.jpg")
