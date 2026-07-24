import hashlib
import secrets
import json
import base64
from typing import Optional
from datetime import datetime, timedelta

SALT = b"codeguard_lms_secure_salt_2026"

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2 with HMAC-SHA256."""
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        SALT,
        100000
    )
    return key.hex()

def verify_password(password: str, hashed: str) -> bool:
    """Verifies a password against a hash."""
    return hash_password(password) == hashed

# Simple Session Token Store
_SESSIONS = {}

def create_session_token(user_id: str, role: str) -> str:
    token = secrets.token_hex(32)
    _SESSIONS[token] = {
        "user_id": user_id,
        "role": role,
        "created_at": datetime.now()
    }
    return token

def get_session_user(token: str) -> Optional[dict]:
    if not token or token not in _SESSIONS:
        return None
    session = _SESSIONS[token]
    # Expire sessions after 24 hours
    if datetime.now() - session["created_at"] > timedelta(hours=24):
        del _SESSIONS[token]
        return None
    return session

def destroy_session(token: str):
    if token in _SESSIONS:
        del _SESSIONS[token]
