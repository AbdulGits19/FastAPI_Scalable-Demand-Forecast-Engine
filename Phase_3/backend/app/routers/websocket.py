from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict

router = APIRouter(prefix="/ws", tags=["websockets"])

class ConnectionManager:
    """
    Stateful memory manager tracking all active real-time frontend connection pipes.
    """
    def __init__(self):
        # Maps active user IDs to a list of their open WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"🔌 WebSocket Connected: User {user_id} spawned a new monitoring pipeline.")

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"❌ WebSocket Disconnected: Cleared tracking wrapper for User {user_id}.")

    async def broadcast_to_user(self, user_id: int, message: dict):
        """
        Pushes transactional payloads strictly to active clients owned by the target user.
        """
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Stale pipe handling
                    pass

# Instantiate our global live broadcasting manager
manager = ConnectionManager()

@router.websocket("/live-sales/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """
    Stateful WebSocket Gateway Route. Keeps an uninterrupted network line active
    to instantly pipe analytics changes to the React user interface canvas.
    """
    await manager.connect(user_id, websocket)
    try:
        # Keep the socket pipeline alive to listen for client responses if any
        while True:
            data = await websocket.receive_text()
            # Echo back or handle incoming message checks if necessary
            await websocket.send_json({"status": "Alive", "echo": data})
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)