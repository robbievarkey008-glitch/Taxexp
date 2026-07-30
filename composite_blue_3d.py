import cv2
import numpy as np

def process():
    base_path = "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/laptop_blue_mockup_1785374493740.jpg"
    ui_path = "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/.user_uploaded/media__1785374460878.png"
    out_path = "/Users/rob/.gemini/antigravity/brain/eba81820-0b8e-4e34-8fe7-41904d21cf27/marketing_screenshots/feature_image_blue_3d_perfect.jpg"
    
    base = cv2.imread(base_path)
    hsv = cv2.cvtColor(base, cv2.COLOR_BGR2HSV)
    lower_green = np.array([35, 100, 100])
    upper_green = np.array([85, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(contours, key=cv2.contourArea)
    
    pts = c.reshape(-1, 2)
    s = pts.sum(axis=1)
    diff = pts[:, 0] - pts[:, 1]
    
    tl = pts[np.argmin(s)]
    br = pts[np.argmax(s)]
    tr = pts[np.argmax(diff)]
    bl = pts[np.argmin(diff)]
    
    # Slight expansion to cover green edges perfectly
    rect = np.array([tl, tr, br, bl], dtype="float32")
    
    ui = cv2.imread(ui_path)
    h, w = ui.shape[:2]
    # Crop the UI image tightly around the modal form
    crop_w, crop_h = 480, 520
    x, y = (w - crop_w) // 2, (h - crop_h) // 2
    ui_cropped = ui[y:y+crop_h, x:x+crop_w]
    ui_h, ui_w = ui_cropped.shape[:2]
    
    src_pts = np.array([[0, 0], [ui_w - 1, 0], [ui_w - 1, ui_h - 1], [0, ui_h - 1]], dtype="float32")
    
    M = cv2.getPerspectiveTransform(src_pts, rect)
    warped_ui = cv2.warpPerspective(ui_cropped, M, (base.shape[1], base.shape[0]), flags=cv2.INTER_CUBIC)
    
    mask_ui = np.zeros_like(mask)
    cv2.fillConvexPoly(mask_ui, np.int32(rect), 255)
    
    # Optional morphological close to ensure no gaps at edges
    kernel = np.ones((3,3), np.uint8)
    mask_ui = cv2.dilate(mask_ui, kernel, iterations=1)
    
    mask_inv = cv2.bitwise_not(mask_ui)
    base_bg = cv2.bitwise_and(base, base, mask=mask_inv)
    warped_fg = cv2.bitwise_and(warped_ui, warped_ui, mask=mask_ui)
    
    result = cv2.add(base_bg, warped_fg)
    
    final_result = cv2.resize(result, (1600, 900), interpolation=cv2.INTER_AREA)
    cv2.imwrite(out_path, final_result)
    print("Perspective composite generated successfully!")

process()
