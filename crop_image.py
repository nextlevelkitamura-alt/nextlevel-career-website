from PIL import Image
import sys

def crop_image(input_path, output_path):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        bbox = img.getbbox()
        if bbox:
            cropped_img = img.crop(bbox)
            cropped_img.save(output_path, "PNG")
            print(f"Successfully cropped image. Saved to {output_path}")
        else:
            print("Image is empty or transparent.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python crop_image.py <input_path> <output_path>")
    else:
        crop_image(sys.argv[1], sys.argv[2])
