import os
import base64
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from passlib.context import CryptContext

SECRET_KEY = os.getenv("SECRET_KEY", "changeme-default-key-for-development").encode()
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _derive_key(key: bytes) -> bytes:
    h = SHA256.new()
    h.update(key)
    return h.digest()


def encrypt_value(plaintext: str) -> str:
    key = _derive_key(SECRET_KEY)
    iv = os.urandom(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded = plaintext.encode().ljust(16 * ((len(plaintext) // 16) + 1), b' ')
    encrypted = cipher.encrypt(padded)
    return base64.b64encode(iv + encrypted).decode()


def decrypt_value(encrypted: str) -> str:
    try:
        key = _derive_key(SECRET_KEY)
        data = base64.b64decode(encrypted.encode())
        iv = data[:16]
        encrypted_bytes = data[16:]
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(encrypted_bytes).rstrip(b' ')
        return decrypted.decode()
    except Exception:
        return ""


def hash_password(password: str) -> str:
    truncated = password[:72] if len(password) > 72 else password
    return PWD_CONTEXT.hash(truncated)


def verify_password(plaintext: str, hashed: str) -> bool:
    return PWD_CONTEXT.verify(plaintext, hashed)


def test_azure_connection(tenant_id: str, client_id: str, client_secret: str) -> bool:
    try:
        from msal import ConfidentialClientApplication
        app = ConfidentialClientApplication(
            client_id=client_id,
            client_credential=client_secret,
            authority=f"https://login.microsoftonline.com/{tenant_id}"
        )
        result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
        return "access_token" in result
    except Exception:
        return False
