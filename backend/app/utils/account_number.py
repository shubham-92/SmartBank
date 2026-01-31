import random
import string

def generate_account_number():
    # Example: SBK + 9 digits
    digits = "".join(random.choices(string.digits, k=9))
    return f"SBK{digits}"
