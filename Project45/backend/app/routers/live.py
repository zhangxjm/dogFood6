from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from datetime import datetime
import json
import asyncio

from ..database import get_db
from ..models import User, LiveRoom, LiveChat
from ..schemas import (
    LiveRoomCreate, LiveRoomResponse,
    LiveChatCreate, LiveChatResponse, LiveStreamStats
)
from ..services.auth import get_current_user
from ..services.live_sdk import live_sdk_service

router = APIRouter(prefix="/live", tags=["直播"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: dict, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass


manager = ConnectionManager()


@router.get("", response_model=List[LiveRoomResponse], summary="获取直播列表")
def get_live_rooms(
    is_live: Optional[bool] = None,
    craft_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(LiveRoom)
    if is_live is not None:
        query = query.filter(LiveRoom.is_live == is_live)
    if craft_id:
        query = query.filter(LiveRoom.craft_id == craft_id)
    return query.order_by(LiveRoom.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=LiveRoomResponse, summary="创建直播间")
def create_live_room(
    room_data: LiveRoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    live_config = live_sdk_service.create_live_room(
        user_id=current_user.id,
        title=room_data.title,
        craft_id=room_data.craft_id,
        low_latency=room_data.is_low_latency
    )

    room = LiveRoom(
        **room_data.model_dump(exclude={"host_id"}),
        host_id=current_user.id,
        stream_key=live_config["stream_key"],
        stream_url=live_config["stream_url"],
        hls_url=live_config["hls_url"],
        webrtc_url=live_config["webrtc_url"],
        is_live=True,
        started_at=datetime.utcnow()
    )

    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.get("/{room_id}", response_model=LiveRoomResponse, summary="获取直播间详情")
def get_live_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(LiveRoom).filter(LiveRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="直播间不存在"
        )
    return room


@router.post("/{room_id}/join", summary="加入直播间")
def join_live_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(LiveRoom).filter(LiveRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="直播间不存在"
        )

    room.viewer_count += 1
    db.commit()

    room_id_str = f"room_{room.host_id}_{int(room.started_at.timestamp()) if room.started_at else 0}"
    live_sdk_service.simulate_viewer_join(room_id_str)

    webrtc_config = live_sdk_service.generate_webrtc_offer(
        room_id_str,
        f"viewer_{room.viewer_count}"
    )

    return {
        "viewer_count": room.viewer_count,
        "webrtc_config": webrtc_config,
        "hls_url": room.hls_url,
        "webrtc_url": room.webrtc_url,
        "low_latency_enabled": room.is_low_latency
    }


@router.post("/{room_id}/end", summary="结束直播")
def end_live_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(LiveRoom).filter(LiveRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="直播间不存在"
        )

    if room.host_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有主播或管理员可以结束直播"
        )

    room.is_live = False
    room.ended_at = datetime.utcnow()
    db.commit()

    return {"message": "直播已结束", "viewer_count": room.viewer_count, "duration": (room.ended_at - room.started_at).total_seconds()}


@router.get("/{room_id}/stats", response_model=LiveStreamStats, summary="获取直播统计")
def get_live_stats(room_id: int, db: Session = Depends(get_db)):
    room = db.query(LiveRoom).filter(LiveRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="直播间不存在"
        )

    room_id_str = f"room_{room.host_id}_{int(room.started_at.timestamp()) if room.started_at else 0}"
    stats = live_sdk_service.get_stream_stats(room_id_str)

    return LiveStreamStats(**stats)


@router.get("/{room_id}/chat", response_model=List[LiveChatResponse], summary="获取直播间聊天记录")
def get_live_chat(
    room_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    chats = db.query(LiveChat).filter(
        LiveChat.live_room_id == room_id
    ).order_by(LiveChat.timestamp.desc()).offset(skip).limit(limit).all()
    return list(reversed(chats))


@router.post("/{room_id}/chat", response_model=LiveChatResponse, summary="发送聊天消息")
def send_chat_message(
    room_id: int,
    chat_data: LiveChatCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    room = db.query(LiveRoom).filter(LiveRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="直播间不存在"
        )

    chat = LiveChat(
        live_room_id=room_id,
        user_id=current_user.id if current_user else None,
        username=chat_data.username or (current_user.username if current_user else "匿名用户"),
        message=chat_data.message,
        message_type=chat_data.message_type
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, db: Session = Depends(get_db)):
    await manager.connect(websocket, room_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type", "chat")

                if message_type == "chat":
                    username = message_data.get("username", "匿名用户")
                    message = message_data.get("message", "")

                    room = db.query(LiveRoom).filter(LiveRoom.id == int(room_id)).first()
                    if room:
                        chat = LiveChat(
                            live_room_id=int(room_id),
                            username=username,
                            message=message,
                            message_type="chat"
                        )
                        db.add(chat)
                        db.commit()

                    broadcast_data = {
                        "type": "chat",
                        "username": username,
                        "message": message,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    await manager.broadcast(broadcast_data, room_id)

                elif message_type == "like":
                    room = db.query(LiveRoom).filter(LiveRoom.id == int(room_id)).first()
                    if room:
                        room.like_count += 1
                        db.commit()
                        await manager.broadcast({
                            "type": "like",
                            "like_count": room.like_count
                        }, room_id)

                elif message_type == "stats":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    })

            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)


@router.post("/{room_id}/optimize-latency", summary="优化直播延迟")
def optimize_latency(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    room = db.query(LiveRoom).filter(LiveRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="直播间不存在"
        )

    room.is_low_latency = True
    db.commit()

    room_id_str = f"room_{room.host_id}_{int(room.started_at.timestamp()) if room.started_at else 0}"
    stats = live_sdk_service.get_stream_stats(room_id_str)

    return {
        "message": "低延迟模式已启用",
        "target_latency_ms": 500,
        "current_latency_ms": stats.get("latency_ms", 1000),
        "optimization_applied": [
            "GOP设置为1帧",
            "启用WebRTC传输",
            "自适应码率调整",
            "丢帧策略启用"
        ]
    }
