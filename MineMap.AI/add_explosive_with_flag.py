import os
import subprocess
import sys
import time

def main():
    # Check if Pillow is installed
    try:
        from PIL import Image
        print("Pillow already installed.")
    except ImportError:
        print("Installing required packages...")
        subprocess.run([sys.executable, "-m", "pip", "install", "Pillow", "requests"], check=True)
        print("Packages installed successfully.")
    
    # Step 1: Generate the red flag image
    print("\nStep 1: Generating red flag image...")
    try:
        subprocess.run([sys.executable, "create_red_flag.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error generating red flag image: {str(e)}")
        return

    # Alternative: If we want to use the mine image from the example
    if len(sys.argv) > 1 and sys.argv[1] == "--use-mine-image":
        print("\nUsing the mine image from URL...")
        # Use the image of the mine instead of the red flag
        # You can replace this with the direct URL to the mine image
        mine_image_url = "https://example.com/mine_image.jpg"  # Replace with actual URL
        try:
            subprocess.run([sys.executable, "add_explosive_object.py", mine_image_url], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error adding explosive object with mine image: {str(e)}")
            return
    else:
        # Step 2: Add the explosive object with the red flag image
        print("\nStep 2: Adding explosive object to database...")
        try:
            subprocess.run([sys.executable, "add_explosive_object.py"], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error adding explosive object: {str(e)}")
            return
    
    print("\nProcess completed successfully!")
    print("Red flag marker has been added to the map. You can now view it in the application.")

if __name__ == "__main__":
    main() 