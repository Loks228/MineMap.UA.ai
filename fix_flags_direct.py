import base64
import os

# Flag colors to fix
flags_to_fix = ["gray", "purple"]

# Hardcoded Base64 data from the files
base64_data = {
    "gray": "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5wgZACk/jGK/tQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAJvSURBVGje1ZoxSFtRFIa/e5OYYAhCEGILBRehiyg4OImDdLAUKbiI1MGpSyc7OBQcXMTBpbQ4OIh0cHAQ6SAiUhyK6CCCSxdLHZqQ5J6Tt2+em3vfTd7L0+Q/EO69557/P+fee+65Jw9CRBkGgG4AXfx+iuBf2rFVnMlmuCv1AJgEMJB3PwAwC2BL5o3oKcxbLbsPdzOuIt4OYB7ALIC3zQJQYmwBeML77k3D41uaGGlOQV308X4/gQ8UfbKIcZ4/z+QqsL+XOs/6XOHTAKYALFMQEv+LAM7y/hCbxCSLvQOD1YyoWVDjFOd8hNfzxOTvcnzC/q9hRvINAD8D77RuhYIf5vgY5y0w3/bk5M/w/ge6Nqo1vNy+OT7I4ybnfo+TMwNeA/gJ4DP76+PYvOMK/QIwx/FvHK+b6h9M46QjrK2POeb/f8YG8EadBHeCC+AtUG5pF5le0c4ezM863rvM+7Mx+46NAVeZyqveCeBDWeR3mD79NwAqtbYv7W71HfunAASiEhewxG9zzlkA7k5Bvpv9XUcJJVDhEr5kel3T1rDY9k95+pwhW4hE8pNZy4gy5RfF/kJ9jVdfzBaryPk090/7CZFJdquk/5rKTwJTH3n6DwUJoEKWPRY1Omb8bgUB1xZ5UYkpmISdc1YNIG+uHQdwgA+R+PojAMbb8XuKjXyZD7gNYJIHDafRl9imVgA4BuAaN9uwzX26PMwAPPCKDExy7Bd9/vfonD42EFTiB6LO51sCyBTED/iBCIow3xJAabUkIjrXtwRQVkTnO1SKUCGAMm5Sj60Celz/AMwfhf0d6D9jAAAAAElFTkSuQmCC",
    "purple": "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5wgZACk6zxvdTAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAJ1SURBVGje1Zo7bxNBEMf/s3dnOwkhkhEChQIJCQkJCUEBDR0dDRIdFR0VQuILUNFRUdJDRYdExYegoEGixkCDRAUIWUoRii/O+x677M7eHnd7vkTO/ynyzc7O/v7zmp0zBAnhQg+AIYBjvO8D2Bc9tojZcoHbVA+AZQBLS/cPAYwAjGXekJZhHmreNfI14yriCQBrAEYAxtYByCK2APxF4D0lMHwD4JkEj5Tn+Jbcp+/gKCnQJYr4Gc5XRcDnASwBGFMwkPxfB/CQ95fZJc6z2wCcaOZE3SIGnaPg83S9Lh7+Bsf77P8aZiXfAFAB3hLdNgXPcXyB88aZ71KY8lmafEDnhUCDP9y+OT7J4yYF7YqDcwa8D+AngM+874rHVpkG1C8Aqxz/xvGaaf7+NO5rwo76mBPsXz9gAXijzx9XjAXgf6BqaVeZXpF2D+YnHdfc4fPlhLZnSYCrTOVV7wXwoSn59zhx+m8AlFtrX9rdajv2zwAIRSUuYYk/5pyzANyDkD/O/q6jhBKocglfML2uaWuYbfunfPqcZ7YQieRns5YRZcovxZFCY41XX8wxq8j5pvoX3WQIF+xWSf8tlZ8Epj7n6d8XJICqefZk1Ohka27rCFyyRV5UYgomYcecpQaQN8+OAzjFh0h8/REAy0H9nsIiX+YDbgJY5UHDafQltqlVAA4AWOLN3rDNly57EwAPoioMLHPsF33+j+jeQzSQqcQPhFvMmwIwD8QP+YEIizDfEkBpdSWict1KAKVFVL5DuQgVA2jiJvXYYqDH9Q9XmIJA73JLDgAAAABJRU5ErkJggg=="
}

# Directory path
target_dir = os.path.join("static", "images")

# Ensure target directory exists
os.makedirs(target_dir, exist_ok=True)

for flag in flags_to_fix:
    try:
        # Decode Base64 data
        binary_data = base64.b64decode(base64_data[flag])
        
        # Write to the target PNG file
        png_file = os.path.join(target_dir, f"flag_{flag}.png")
        with open(png_file, 'wb') as f:
            f.write(binary_data)
        
        print(f"Successfully created {png_file} with direct Base64 data")
    
    except Exception as e:
        print(f"Error processing {flag} flag: {e}")

print("Flag conversion complete!") 