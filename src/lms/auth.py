import hmac
import hashlib
import secrets
import json
import base64
from typing import Optional
from datetime import datetime, timedelta

from src.lms.models import get_egypt_now

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
    """Verifies a password against a hash using constant-time comparison."""
    if not password or not hashed:
        return False
    computed = hash_password(password)
    return hmac.compare_digest(computed.encode('utf-8'), hashed.encode('utf-8'))

# Simple Session Token Store
_SESSIONS = {}

def create_session_token(user_id: str, role: str) -> str:
    token = secrets.token_hex(32)
    _SESSIONS[token] = {
        "user_id": user_id,
        "role": role,
        "created_at": get_egypt_now()
    }
    return token

def get_session_user(token: str) -> Optional[dict]:
    if not token or token not in _SESSIONS:
        return None
    session = _SESSIONS[token]
    # Expire sessions after 24 hours
    if get_egypt_now() - session["created_at"] > timedelta(hours=24):
        del _SESSIONS[token]
        return None
    return session

def destroy_session(token: str):
    if token in _SESSIONS:
        del _SESSIONS[token]
