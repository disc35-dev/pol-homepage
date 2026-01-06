from PIL import Image, ImageFilter
import os
print("Starting composite_cake.py...")

def remove_white_background_pil(img, threshold=230):
    """
    Converts white pixels to transparent using pure PIL.
    """
    img = img.convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # Check if pixel is white-ish
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            # Make transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    return img

def create_styled_image():
    # Paths
    # Use relative path now that we copied the file
    cake_path = "images/unnamed.jpg"
    bg_source_path = "images/pol.jpg"
    output_path = "images/pound_cake_final.png"
    
    # Target size
    canvas_size = (800, 800)
    
    print("Processing images (PURE PIL VERSION)...")
    
    try:
        # 1. Prepare Cake Image
        print(f"Loading cake from {cake_path}")
        if not os.path.exists(cake_path):
            print(f"Error: Cake image not found at {cake_path}")
            # Try looking in current dir just in case
            local_cake = "../uploaded_image_1766467351728_A4.jpg"
            if os.path.exists(local_cake):
                cake_path = local_cake
                print("Found in current directory.")
            else:
                return

        cake_img = Image.open(cake_path)
        
        # Remove background
        print("Removing background...")
        cake_no_bg = remove_white_background_pil(cake_img, threshold=230)
        
        # 2. Prepare Background
        bg_final = None
        if os.path.exists(bg_source_path):
            print(f"Loading background from {bg_source_path}")
            bg_img = Image.open(bg_source_path).convert("RGBA")
            
            # Resize bg to fill canvas (center crop)
            bg_ratio = bg_img.width / bg_img.height
            canvas_ratio = canvas_size[0] / canvas_size[1]
            
            if bg_ratio > canvas_ratio:
                new_h = canvas_size[1]
                new_w = int(new_h * bg_ratio)
            else:
                new_w = canvas_size[0]
                new_h = int(new_w / bg_ratio)
                
            bg_img = bg_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            left = (new_w - canvas_size[0]) // 2
            top = (new_h - canvas_size[1]) // 2
            bg_cropped = bg_img.crop((left, top, left + canvas_size[0], top + canvas_size[1]))
            
            # Blur
            bg_final = bg_cropped.filter(ImageFilter.GaussianBlur(radius=15))
            
        else:
            print("Background image not found, using gradient.")
            bg_final = Image.new("RGBA", canvas_size, (245, 240, 230, 255))

        # 3. Composite
        print("Compositing...")
        scale = 0.85
        cake_width_target = int(canvas_size[0] * scale)
        cake_ratio = cake_no_bg.width / cake_no_bg.height
        cake_height_target = int(cake_width_target / cake_ratio)
        
        cake_resized = cake_no_bg.resize((cake_width_target, cake_height_target), Image.Resampling.LANCZOS)
        
        cake_x = (canvas_size[0] - cake_width_target) // 2
        cake_y = (canvas_size[1] - cake_height_target) // 2
        
        final_comp = bg_final.copy()
        final_comp.paste(cake_resized, (cake_x, cake_y), cake_resized)
        
        final_comp.save(output_path)
        print(f"Success! Saved to {output_path}")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_styled_image()
