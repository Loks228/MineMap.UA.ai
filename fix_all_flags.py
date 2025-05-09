import base64
import os

# Define all flag colors
flags = ["red", "green", "yellow", "purple", "gray", "blue"]

# Directory paths
source_dir = os.path.join("MineMap.AI", "static", "images")
target_dir = os.path.join("static", "images")

# Ensure target directory exists
os.makedirs(target_dir, exist_ok=True)

for flag in flags:
    # Read Base64 data from the source file
    b64_file = os.path.join(source_dir, f"flag_{flag}.png.b64")
    
    try:
        with open(b64_file, 'r') as f:
            b64_data = f.read().strip()
        
        # Decode Base64 data
        binary_data = base64.b64decode(b64_data)
        
        # Write to the target PNG file
        png_file = os.path.join(target_dir, f"flag_{flag}.png")
        with open(png_file, 'wb') as f:
            f.write(binary_data)
        
        print(f"Successfully created {png_file}")
    
    except Exception as e:
        print(f"Error processing {flag} flag: {e}")

print("All flag conversions complete!") 