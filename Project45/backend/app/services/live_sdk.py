import hmac
import hashlib
import time
import uuid
import random
from typing import Dict, Optional
from datetime import datetime

from ..config import settings


class LiveSDKService:
    def __init__(self):
        self.app_id = settings.ZEGO_APP_ID
        self.server_secret = settings.ZEGO_SERVER_SECRET
        self.live_streams: Dict[str, Dict] = {}

    def generate_stream_key(self, user_id: int, craft_id: Optional[int] = None) -> str:
        unique_id = str(uuid.uuid4()).replace("-", "")
        return f"live_{user_id}_{craft_id or 'general'}_{unique_id[:16]}"

    def generate_stream_url(self, stream_key: str, protocol: str = "rtmp") -> str:
        base_urls = {
            "rtmp": f"rtmp://live.example.com/live/{stream_key}",
            "hls": f"https://live.example.com/live/{stream_key}/playlist.m3u8",
            "webrtc": f"webrtc://live.example.com/live/{stream_key}"
        }
        return base_urls.get(protocol, base_urls["rtmp"])

    def generate_token(self, user_id: str, room_id: str, privilege: int = 1) -> str:
        timestamp = int(time.time())
        nonce = str(random.randint(1, 1000000))
        secret_bytes = self.server_secret.encode("utf-8")

        payload = f"{self.app_id}{user_id}{room_id}{privilege}{timestamp}{nonce}"
        signature = hmac.new(secret_bytes, payload.encode("utf-8"), hashlib.sha256).hexdigest()

        token_parts = [
            f"a={self.app_id}",
            f"u={user_id}",
            f"r={room_id}",
            f"p={privilege}",
            f"t={timestamp}",
            f"n={nonce}",
            f"s={signature}"
        ]
        return "?".join(token_parts)

    def optimize_for_low_latency(self, stream_config: Dict) -> Dict:
        return {
            **stream_config,
            "codec": "h264",
            "profile": "baseline",
            "gop": 1,
            "fps": 30,
            "bitrate": 2500,
            "buffer_size": settings.LIVE_BUFFER_SIZE,
            "latency_mode": "ultra_low",
            "target_latency_ms": 500,
            "max_latency_ms": 1000,
            "drop_frame_on_latency": True,
            "adaptive_bitrate": True
        }

    def create_live_room(self, user_id: int, title: str, craft_id: Optional[int] = None, low_latency: bool = True) -> Dict:
        stream_key = self.generate_stream_key(user_id, craft_id)
        room_id = f"room_{user_id}_{int(time.time())}"

        stream_config = {
            "stream_key": stream_key,
            "stream_url": self.generate_stream_url(stream_key, "rtmp"),
            "hls_url": self.generate_stream_url(stream_key, "hls"),
            "webrtc_url": self.generate_stream_url(stream_key, "webrtc"),
            "token": self.generate_token(str(user_id), room_id),
            "room_id": room_id
        }

        if low_latency:
            stream_config = self.optimize_for_low_latency(stream_config)

        self.live_streams[room_id] = {
            "user_id": user_id,
            "title": title,
            "craft_id": craft_id,
            "stream_key": stream_key,
            "start_time": datetime.utcnow(),
            "viewer_count": 0,
            "is_live": True,
            "config": stream_config
        }

        return stream_config

    def end_live_room(self, room_id: str) -> bool:
        if room_id in self.live_streams:
            self.live_streams[room_id]["is_live"] = False
            self.live_streams[room_id]["end_time"] = datetime.utcnow()
            return True
        return False

    def get_stream_stats(self, room_id: str) -> Dict:
        if room_id not in self.live_streams:
            return {}

        stream = self.live_streams[room_id]
        duration = 0
        if stream.get("start_time"):
            duration = int((datetime.utcnow() - stream["start_time"]).total_seconds())

        base_latency = 300 if stream.get("config", {}).get("latency_mode") == "ultra_low" else 1500
        latency_variance = random.randint(-50, 150)

        return {
            "viewer_count": stream.get("viewer_count", 0),
            "like_count": random.randint(0, 1000),
            "duration_seconds": duration,
            "bitrate": 2000 + random.randint(-500, 500),
            "latency_ms": max(100, base_latency + latency_variance),
            "resolution": "1080p",
            "fps": 28 + random.randint(0, 4),
            "connection_quality": "excellent" if random.random() > 0.1 else "good"
        }

    def simulate_viewer_join(self, room_id: str) -> int:
        if room_id in self.live_streams:
            self.live_streams[room_id]["viewer_count"] += 1
            return self.live_streams[room_id]["viewer_count"]
        return 0

    def generate_webrtc_offer(self, room_id: str, viewer_id: str) -> Dict:
        return {
            "type": "offer",
            "sdp": "v=0\r\no=- 1234567890 1234567890 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n",
            "ice_servers": [
                {"urls": "stun:stun.l.google.com:19302"},
                {"urls": "turn:turn.example.com:3478", "username": "user", "credential": "pass"}
            ],
            "low_latency_mode": True
        }


live_sdk_service = LiveSDKService()
