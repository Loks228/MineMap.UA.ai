from PIL import Image, ImageDraw
import os

# Directory for images
image_dir = os.path.join("static", "images")
os.makedirs(image_dir, exist_ok=True)

# Flag design function
def create_flag(color_name, main_color, dark_color, size=(48, 48)):
    # Create a new image with transparent background
    img = Image.new('RGBA', size, color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw the flag pole
    draw.rectangle((20, 4, 22, 44), fill=(77, 77, 77))  # #4D4D4D
    draw.rectangle((20, 4, 21, 44), fill=(26, 26, 26))  # #1A1A1A
    
    # Draw elliptical base
    # Dark outer ellipse
    draw.ellipse((17, 42, 25, 46), fill=(77, 77, 77))  # #4D4D4D
    # Lighter inner ellipse
    draw.ellipse((18, 42.5, 24, 45.5), fill=(51, 51, 51))  # #333333
    
    # Draw flag right side (dark)
    draw.rectangle((21, 6, 45, 22), fill=dark_color)
    # Draw flag right side (light)
    draw.rectangle((21, 6, 45, 18), fill=main_color)
    
    # Draw flag left side (dark)
    draw.rectangle((3, 6, 21, 22), fill=dark_color)
    # Draw flag left side (light)
    draw.rectangle((3, 6, 21, 18), fill=main_color)
    
    # Save the image
    file_path = os.path.join(image_dir, f"flag_{color_name}.png")
    img.save(file_path, "PNG")
    print(f"Created flag design for {color_name} at {file_path}")
    return file_path

# Create flag designs
flags = [
    # color_name, main_color, dark_color
    ("purple", (139, 92, 246), (75, 0, 130)),  # Purple with Indigo shade
    ("gray", (128, 128, 128), (64, 64, 64)),   # Gray with darker gray
]

# Generate flags
for color_name, main_color, dark_color in flags:
    create_flag(color_name, main_color, dark_color)

print("Flag designs created successfully!") 