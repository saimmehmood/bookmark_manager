from PIL import Image, ImageDraw
import os

def create_icon(size):
    # Create a new image with a transparent background
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Calculate dimensions
    padding = size // 8
    width = size - (2 * padding)
    height = int(size * 0.875)
    corner_radius = size // 16
    
    # Draw the bookmark background
    draw.rounded_rectangle(
        [padding, padding, padding + width, padding + height],
        corner_radius,
        fill='#1a73e8'
    )
    
    # Draw the bookmark fold
    fold_points = [
        (size * 0.34375, padding),  # Top left
        (size * 0.65625, padding),  # Top right
        (size * 0.65625, size * 0.6875),  # Bottom right
        (size * 0.5, size * 0.53125),  # Center
        (size * 0.34375, size * 0.6875),  # Bottom left
    ]
    draw.polygon(fold_points, fill='white')
    
    return image

def main():
    # Create icons directory if it doesn't exist
    if not os.path.exists('icons'):
        os.makedirs('icons')
    
    # Generate icons in different sizes
    sizes = [16, 48, 128]
    for size in sizes:
        icon = create_icon(size)
        icon.save(f'icons/icon{size}.png')

if __name__ == '__main__':
    main() 