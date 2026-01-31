import pytesseract
from PIL import Image
import re

PAN_REGEX = r"[A-Z]{5}[0-9]{4}[A-Z]"

def extract_pan_from_image(image_path: str):
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image)

    match = re.search(PAN_REGEX, text)
    if match:
        return match.group()
    return None
