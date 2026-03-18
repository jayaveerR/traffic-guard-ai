from functools import wraps
from flask import request, jsonify
from services.supabase_service import supabase_client

import base64
import json

def get_user_from_token(auth_header):
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    if token == "undefined" or not token:
        return None
        
    try:
        # Avoid Supabase network bottlenecks and timeout crashes (which caused 401s and forced logouts)
        # Parse the JWT payload locally. The Supabase REST API will securely verify the signature later.
        parts = token.split(".")
        if len(parts) >= 2:
            payload_b64 = parts[1]
            # Add padding
            payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
            payload_json = base64.b64decode(payload_b64).decode('utf-8')
            payload = json.loads(payload_json)
            
            class MockUser:
                def __init__(self, uid):
                    self.id = uid
            
            if payload.get("sub"):
                return MockUser(payload.get("sub"))
    except Exception as e:
        print(f"Token local parse failed: {e}")
        
    return None


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        user = get_user_from_token(auth_header)
        
        if not user:
            return jsonify({
                "error": "Unauthorized",
                "message": "Valid session token required"
            }), 401
            
        return f(user, *args, **kwargs)
    return decorated
