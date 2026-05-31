import os
from cryptography.fernet import Fernet
from django.conf import settings
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64


def get_cipher():
    password = settings.ENCRYPTION_KEY
    salt = b'pet_medical_ai_salt_2024'
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password))
    return Fernet(key)


def encrypt_image(image_data):
    cipher = get_cipher()
    return cipher.encrypt(image_data)


def decrypt_image(encrypted_data):
    cipher = get_cipher()
    return cipher.decrypt(encrypted_data)


def encrypt_file(file_path, output_path=None):
    cipher = get_cipher()
    with open(file_path, 'rb') as f:
        data = f.read()
    encrypted = cipher.encrypt(data)
    if output_path:
        with open(output_path, 'wb') as f:
            f.write(encrypted)
    return encrypted


def decrypt_file(encrypted_path, output_path=None):
    cipher = get_cipher()
    with open(encrypted_path, 'rb') as f:
        encrypted_data = f.read()
    decrypted = cipher.decrypt(encrypted_data)
    if output_path:
        with open(output_path, 'wb') as f:
            f.write(decrypted)
    return decrypted
