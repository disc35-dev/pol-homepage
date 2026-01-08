from PIL import Image, ImageFilter
import os

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

def create_styled_crepe():
    # Paths
    cake_path = "images/crepe2.png"
    bg_source_path = "images/pol.jpg"
    output_path = "images/crepe_refined.png"
    
    # Target size
    canvas_size = (800, 800)
    
    print("Processing crepe image...")
    
    try:
        # 1. Prepare Crepe Image
        print(f"Loading crepe from {cake_path}")
        if not os.path.exists(cake_path):
            print(f"Error: Crepe image not found at {cake_path}")
            return

        crepe_img = Image.open(cake_path)
        
        # Remove background (assuming it might have white background, similar to other product images)
        print("Removing background...")
        crepe_no_bg = remove_white_background_pil(crepe_img, threshold=240)
        
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
            
            # Blur to make it stylish/elegant
            bg_final = bg_cropped.filter(ImageFilter.GaussianBlur(radius=10))
            
        else:
            print("Background image not found, using gradient.")
            bg_final = Image.new("RGBA", canvas_size, (245, 240, 230, 255))

        # 3. Composite
        print("Compositing...")
        # Scale 0.65 to make it look "zoomed out" / show more background
        scale = 0.65 
        
        crepe_width_target = int(canvas_size[0] * scale)
        crepe_ratio = crepe_no_bg.width / crepe_no_bg.height
        crepe_height_target = int(crepe_width_target / crepe_ratio)
        
        crepe_resized = crepe_no_bg.resize((crepe_width_target, crepe_height_target), Image.Resampling.LANCZOS)
        
        # Center the crepe
        crepe_x = (canvas_size[0] - crepe_width_target) // 2
        crepe_y = (canvas_size[1] - crepe_height_target) // 2
        
        final_comp = bg_final.copy()
        final_comp.paste(crepe_resized, (crepe_x, crepe_y), crepe_resized)
        
        final_comp.save(output_path)
        print(f"Success! Saved to {output_path}")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_styled_crepe()
