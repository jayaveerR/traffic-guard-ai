import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://example.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "dummy")

try:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception:
    supabase_client = None
