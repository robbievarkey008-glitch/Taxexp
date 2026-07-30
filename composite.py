from PIL import Image

def is_green(pixel):
    r, g, b = pixel[:3]
    return g > 150 and r < 100 and b < 100

def process():
    base_path = "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/laptop_base_mockup_1785374170410.jpg"
    ui_path = "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/.user_uploaded/media__1785374002524.png"
    out_path = "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/marketing_screenshots/feature_image_perfect.jpg"
    
    base = Image.open(base_path).convert("RGB")
    ui = Image.open(ui_path).convert("RGB")
    
    w, h = base.size
    min_x, min_y = w, h
    max_x, max_y = 0, 0
    
    # Find bounding box of green screen
    pixels = base.load()
    for y in range(h):
        for x in range(w):
            if is_green(pixels[x, y]):
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    # Add a slight margin to avoid green edges
    min_x += 2
    min_y += 2
    max_x -= 2
    max_y -= 2
    
    target_w = max_x - min_x
    target_h = max_y - min_y
    
    print(f"Green screen bounding box: {min_x},{min_y} to {max_x},{max_y} ({target_w}x{target_h})")
    
    # Resize UI to fit perfectly
    ui_resized = ui.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Paste UI over green screen
    base.paste(ui_resized, (min_x, min_y))
    
    # Save final image
    base.save(out_path, quality=95)
    print("Successfully created perfect feature image!")

process()
