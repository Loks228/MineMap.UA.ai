import requests
import os
import sys

def download_image(url, destination_path):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        with open(destination_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Image successfully downloaded and saved to {destination_path}")
        return True
    except Exception as e:
        print(f"Error downloading image: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python download_image.py <image_url> [output_path]")
        sys.exit(1)
    
    url = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "temp_image.jpg"
    
    download_image(url, output_path) 