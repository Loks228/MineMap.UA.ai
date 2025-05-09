import os
import sys
from PIL import Image
import io

def verify_png(file_path):
    """Verify if a file is a valid PNG image"""
    try:
        # Try to open the file with PIL
        img = Image.open(file_path)
        img.verify()  # Verify it's actually an image
        
        # Get image details
        img = Image.open(file_path)  # Need to reopen after verify
        width, height = img.size
        format = img.format
        mode = img.mode
        
        return {
            "valid": True,
            "width": width, 
            "height": height,
            "format": format,
            "mode": mode,
            "size_bytes": os.path.getsize(file_path)
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "size_bytes": os.path.getsize(file_path)
        }

def fix_png_if_needed(file_path):
    """Try to fix PNG file if it's invalid"""
    result = verify_png(file_path)
    
    if result["valid"]:
        print(f"✅ {os.path.basename(file_path)} is valid. No fix needed.")
        return False
    
    print(f"❌ {os.path.basename(file_path)} is invalid. Attempting to fix...")
    
    try:
        # Read file as binary
        with open(file_path, 'rb') as f:
            data = f.read()
        
        # Try to find PNG signature
        png_signature = b'\x89PNG\r\n\x1a\n'
        if png_signature in data:
            # Extract from PNG signature
            start_idx = data.find(png_signature)
            fixed_data = data[start_idx:]
            
            # Save fixed file
            with open(file_path, 'wb') as f:
                f.write(fixed_data)
            
            # Verify again
            result = verify_png(file_path)
            if result["valid"]:
                print(f"✅ Successfully fixed {os.path.basename(file_path)}")
                return True
        
        # If that didn't work, try a more aggressive approach: create a new PNG
        print(f"Trying alternative fix for {os.path.basename(file_path)}...")
        
        # Create a new flag image with same color
        color = os.path.basename(file_path).split('_')[1].split('.')[0]
        flag_colors = {
            'red': (255, 0, 0),
            'green': (0, 160, 0),
            'yellow': (255, 204, 0),
            'purple': (139, 92, 246),
            'gray': (128, 128, 128),
            'blue': (0, 102, 204)
        }
        
        rgb_color = flag_colors.get(color, (0, 0, 255))  # Default to blue
        img = Image.new('RGBA', (48, 48), color=(*rgb_color, 255))
        
        # Save as PNG
        img.save(file_path, 'PNG')
        
        result = verify_png(file_path)
        if result["valid"]:
            print(f"✅ Successfully created new {os.path.basename(file_path)}")
            return True
            
        print(f"❌ Failed to fix {os.path.basename(file_path)}")
        return False
    
    except Exception as e:
        print(f"❌ Error fixing {os.path.basename(file_path)}: {e}")
        return False

def main():
    # Directory to check
    image_dir = os.path.join("static", "images")
    
    if not os.path.exists(image_dir):
        print(f"Directory {image_dir} not found!")
        return
    
    # Get all PNG files
    png_files = [f for f in os.listdir(image_dir) if f.startswith("flag_") and f.endswith(".png")]
    
    if not png_files:
        print(f"No flag PNG files found in {image_dir}")
        return
    
    print(f"Found {len(png_files)} flag PNG files to verify:\n")
    
    # Verify each file
    for png_file in png_files:
        file_path = os.path.join(image_dir, png_file)
        result = verify_png(file_path)
        
        if result["valid"]:
            print(f"✅ {png_file}: Valid PNG ({result['width']}x{result['height']}, {result['format']}, {result['size_bytes']} bytes)")
        else:
            print(f"❌ {png_file}: Invalid ({result['size_bytes']} bytes) - {result['error']}")
            fix_png_if_needed(file_path)

if __name__ == "__main__":
    main() 