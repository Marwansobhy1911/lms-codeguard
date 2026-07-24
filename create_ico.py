from PIL import Image

def create_icon(input_file, output_file):
    try:
        img = Image.open(input_file)
        
        # Crop to square
        width, height = img.size
        min_dim = min(width, height)
        left = (width - min_dim) / 2
        top = (height - min_dim) / 2
        right = (width + min_dim) / 2
        bottom = (height + min_dim) / 2
        img = img.crop((left, top, right, bottom))
        
        # Save as multi-resolution icon
        icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (24, 24), (16, 16)]
        img.save(output_file, format='ICO', sizes=icon_sizes)
        print("Icon successfully created.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_icon('logo 1.jpeg', 'icon.ico')
