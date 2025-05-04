from PIL import Image, ImageDraw
import os

def create_red_flag_image(output_path="temp_image.jpg", width=200, height=200):
    try:
        # Create a white background
        image = Image.new('RGB', (width, height), (255, 255, 255))
        draw = ImageDraw.Draw(image)
        
        # Draw a pole (gray rectangle)
        pole_width = width // 10
        pole_height = height - 20
        pole_x = width // 4
        pole_y = 10
        draw.rectangle([(pole_x, pole_y), (pole_x + pole_width, pole_y + pole_height)], fill=(100, 100, 100))
        
        # Draw a flag (red triangle)
        flag_height = height // 3
        flag_width = width // 2
        flag_x = pole_x + pole_width
        flag_y = pole_y + pole_height // 6
        
        # Draw the flag as a filled red polygon
        draw.polygon([
            (flag_x, flag_y),  # top-left
            (flag_x + flag_width, flag_y + flag_height // 2),  # right-middle
            (flag_x, flag_y + flag_height)  # bottom-left
        ], fill=(255, 0, 0))
        
        # Save the image
        image.save(output_path, "JPEG")
        print(f"Red flag image created and saved to {output_path}")
        return True
    except Exception as e:
        print(f"Error creating red flag image: {str(e)}")
        return False

if __name__ == "__main__":
    create_red_flag_image() 