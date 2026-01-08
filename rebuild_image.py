from PIL import Image

# Config
input_path = "images/pound_cake_new.png"
output_path = "images/pound_cake_final.png"
bg_color = (253, 251, 247, 255) # #FDFBF7 (Site background light)
# bg_color = (232, 220, 196, 255) # #E8DCC4 (Secondary cream color - slightly darker)

target_size = (600, 600)  # Square canvas
scale_factor = 0.75       # Subject size relative to canvas

try:
    img = Image.open(input_path).convert("RGBA")
    
    # Calculate new size for the subject
    width, height = img.size
    aspect_ratio = width / height
    
    # Determine resizing based on fitting within target_size * scale_factor
    new_w = int(target_size[0] * scale_factor)
    new_h = int(new_w / aspect_ratio)
    
    if new_h > target_size[1] * scale_factor:
        new_h = int(target_size[1] * scale_factor)
        new_w = int(new_h * aspect_ratio)
        
    img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Create background
    background = Image.new("RGBA", target_size, bg_color)
    
    # Center the image
    offset_x = (target_size[0] - new_w) // 2
    offset_y = (target_size[1] - new_h) // 2
    
    # Composite
    background.paste(img_resized, (offset_x, offset_y), img_resized)
    
    # Save
    background.save(output_path)
    print(f"Successfully created {output_path}")

except Exception as e:
    print(f"Error: {e}")
