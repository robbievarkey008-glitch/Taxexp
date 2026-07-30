from PIL import Image

def process():
    in_path = "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/.user_uploaded/media__1785373612891.png"
    out_path = "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/marketing_screenshots/screenshot_1_v2_sharp.png"
    
    # 1. Open original image (1024 x 587)
    img = Image.open(in_path).convert("RGBA")
    w, h = img.size
    
    # 2. Crop out the black bars (top ~32px, bottom ~46px)
    # Just to be safe, crop top 40px, bottom 50px
    cropped = img.crop((0, 40, w, h - 50))
    cw, ch = cropped.size
    
    # 3. Create a 1600x900 canvas
    # Sample the background color from the top left of the cropped image
    bg_color = cropped.getpixel((10, 10))
    canvas = Image.new("RGBA", (1600, 900), bg_color)
    
    # 4. Paste the cropped image in the center
    x = (1600 - cw) // 2
    y = (900 - ch) // 2
    canvas.paste(cropped, (x, y))
    
    # 5. Save the sharp image
    canvas.save(out_path)
    print("Sharp padded image saved successfully!")

process()
