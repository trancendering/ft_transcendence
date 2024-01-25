from collections import deque
from typing import Dict, Literal, List
from socketio import AsyncServer

from .GameRoom import GameRoom

# normal game mode waiting queue
game_normal_room: int = 0
normal_matching_queue: deque[str] = deque()

# speed-up game mode waiting queue
game_speed_room: int = 0
speed_matching_queue: deque[str] = deque()

# game room
game_room: Dict[str, GameRoom] = {}


async def player_ready(sid: str, data: Dict[str, str]) -> Literal["OK"]:
    """
    플레이어 준비 이벤트 수신 함수

    parameter
    * sid: 클라이언트의 sid
    * data: {
        "roomName"
    }
    """
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
    await game_room[str(data["roomName"])].bar_move(float(data["paddlePosition"]), str(data["userSide"]))
    return "OK"


async def matching_enqueue(sio: AsyncServer, sid: str, is_speed: str) -> None:
    if is_speed == "normal":
        await _normal_game_enqueue(sio, sid)
    else:
        await _speed_game_enqueue(sio, sid)


async def _normal_game_enqueue(sio: AsyncServer, sid: str) -> None:
    global game_normal_room
    global normal_matching_queue
    global game_room

    normal_matching_queue.appendleft(sid)
    num_waiting = len(normal_matching_queue)

    if num_waiting >= 2:
        game_normal_room += 1
        player = [normal_matching_queue.pop(), normal_matching_queue.pop()]
        room_number = game_normal_room
        room_name = "normal" + str(room_number)
        await _enter_room(sio, room_name, player, "normal")


async def _speed_game_enqueue(sio: AsyncServer, sid: str) -> None:
    global game_speed_room
    global speed_matching_queue
    global game_room

    speed_matching_queue.appendleft(sid)
    num_waiting = len(speed_matching_queue)

    if num_waiting >= 2:
        game_speed_room += 1
        player = [speed_matching_queue.pop(), speed_matching_queue.pop()]
        room_number = game_speed_room
        room_name = "speed" + str(room_number)
        await _enter_room(sio, room_name, player, "speed")


async def _enter_room(sio: AsyncServer, room_name: str, player: List[str], mode: str) -> None:
    global game_room

    await sio.enter_room(player[0], room_name, namespace="/game")
    await sio.enter_room(player[1], room_name, namespace="/game")
    async with sio.session(player[0], namespace="/game") as session:
        session["room_name"] = room_name
    async with sio.session(player[1], namespace="/game") as session:
        session["room_name"] = room_name
    user1_session = await sio.get_session(player[0], namespace="/game")
    user2_session = await sio.get_session(player[1], namespace="/game")
    send_info = {
        "roomName": room_name,
        "leftUserId": user1_session["intraId"],
        "rightUserId": user2_session["intraId"],
        "leftUserNickname": user1_session["nickname"],
        "rightUserNickname": user2_session["nickname"],
    }
    await sio.emit("userFullEvent", send_info, room=room_name, namespace="/game")  # 플레이어 위치 정보 송신
    game_room[room_name] = GameRoom(sio, player, room_name, mode)


def matching_dequeue(sio: AsyncServer, sid: str, mode: str) -> None:
    if mode == "normal":
        if sid in normal_matching_queue:
            normal_matching_queue.remove(sid)
    else:
        if sid in speed_matching_queue:
            speed_matching_queue.remove(sid)
