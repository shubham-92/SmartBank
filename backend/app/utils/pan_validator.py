import re

def is_valid_pan(pan: str) -> bool:
    pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]$"
    return bool(re.match(pattern, pan))
