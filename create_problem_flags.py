import base64
import os
from PIL import Image
import io

# Paths
target_dir = os.path.join("static", "images")

# Flag SVG templates with different colors
flag_svg_templates = {
    "gray": """<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <g>
            <rect fill="#404040" x="21" y="6" width="24" height="16"/>
            <rect fill="#808080" x="21" y="6" width="24" height="12"/>
            <rect fill="#404040" x="3" y="6" width="18" height="16"/>
            <rect fill="#808080" x="3" y="6" width="18" height="12"/>
            <rect fill="#4D4D4D" x="20" y="4" width="2" height="40"/>
            <rect fill="#1A1A1A" x="20" y="4" width="1" height="40"/>
            <ellipse fill="#4D4D4D" cx="21" cy="44" rx="4" ry="2"/>
            <ellipse fill="#333333" cx="21" cy="44" rx="3" ry="1.5"/>
        </g>
    </svg>""",
    
    "purple": """<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <g>
            <rect fill="#4B0082" x="21" y="6" width="24" height="16"/>
            <rect fill="#8B5CF6" x="21" y="6" width="24" height="12"/>
            <rect fill="#4B0082" x="3" y="6" width="18" height="16"/>
            <rect fill="#8B5CF6" x="3" y="6" width="18" height="12"/>
            <rect fill="#4D4D4D" x="20" y="4" width="2" height="40"/>
            <rect fill="#1A1A1A" x="20" y="4" width="1" height="40"/>
            <ellipse fill="#4D4D4D" cx="21" cy="44" rx="4" ry="2"/>
            <ellipse fill="#333333" cx="21" cy="44" rx="3" ry="1.5"/>
        </g>
    </svg>"""
}

# Ensure the target directory exists
os.makedirs(target_dir, exist_ok=True)

try:
    import cairosvg
    
    # If cairosvg is available, use it for conversion (better quality)
    for color, svg_content in flag_svg_templates.items():
        output_file = os.path.join(target_dir, f"flag_{color}.png")
        
        # Convert SVG to PNG using cairosvg
        cairosvg.svg2png(bytestring=svg_content.encode('utf-8'), write_to=output_file)
        print(f"Created {output_file} using cairosvg")
        
except ImportError:
    # If cairosvg is not available, use Base64 encoding
    print("CairoSVG not available, using alternative method...")
    
    for color, svg_content in flag_svg_templates.items():
        output_file = os.path.join(target_dir, f"flag_{color}.png")
        
        # Create Base64 data for SVG
        svg_base64 = base64.b64encode(svg_content.encode('utf-8')).decode('utf-8')
        
        # Create a data URI
        data_uri = f"data:image/svg+xml;base64,{svg_base64}"
        
        # Here we would normally use a web browser to render this,
        # but since we can't do that in this script, we'll just
        # create a basic image and save it as a placeholder
        
        # Create a blank PNG image (red for now, just so it's visible)
        if color == "gray":
            rgb = (128, 128, 128)  # Gray
        else:  # purple
            rgb = (139, 92, 246)   # Purple
            
        # Create a simple colored image
        img = Image.new('RGB', (48, 48), rgb)
        
        # Save the image
        img.save(output_file)
        print(f"Created simple {color} flag image at {output_file}")
        
        # Write the SVG to a file for reference
        with open(os.path.join(target_dir, f"flag_{color}.svg"), 'w') as f:
            f.write(svg_content)
        
print("\nFlag creation complete!") 