from typing import Dict, Literal

from .GameRoom import GameRoom
from .TournamentRoom import TournamentRoom

# game room
game_room: Dict[str, GameRoom | TournamentRoom] = {}


async def player_ready(sid: str, data: Dict[str, str]) -> Literal["OK"]:
    """
    플레이어 준비 이벤트 수신 함수

    parameter
    * sid: 클라이언트의 sid
    * data: {
        "roomName"
    }
    """
    if data["roomName"] in game_room:
        await game_room[str(data["roomName"])].ready_player(sid)
    return "OK"


async def bar_move(sid: str, data: Dict[str, str]) -> Literal["OK"]:
    """
    플레이어 바 이동 이벤트 수신 함수

    parameter
    * sid: 클라이언트의 sid
    * data: {
        "roomName", "userSide", "paddlePosition"
    }

    바의 y 좌표로 게임의 바를 이동
    """
    if data["roomName"] in game_room:
        await game_room[str(data["roomName"])].bar_move(float(data["paddlePosition"]), str(data["userSide"]))
    return "OK"
