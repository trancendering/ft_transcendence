from collections import deque
from typing import Dict

from .GameRoom import GameRoom

# normal game mode waiting queue
game_normal_room: int = 0
normal_matching_queue: deque[str] = deque()

# speed-up game mode waiting queue
game_speed_room: int = 0
speed_matching_queue: deque[str] = deque()

# game room
game_room: Dict[str, GameRoom] = {}


async def player_ready(sid, data):
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


async def bar_move(sid, data):
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


async def matching_enqueue(sio, sid, is_speed):
    if is_speed == "normal":
        await _normal_game_enqueue(sio, sid)
    else:
        await _speed_game_enqueue(sio, sid)


async def _normal_game_enqueue(sio, sid):
    global game_normal_room
    global normal_matching_queue
    global game_room

    normal_matching_queue.appendleft(sid)
    num_waiting = len(normal_matching_queue)

    if num_waiting >= 2:
        print("\n\n\n", num_waiting, "\n\n\n")
        game_normal_room += 1
        matcher = [normal_matching_queue.pop(), normal_matching_queue.pop()]
        room_number = game_normal_room
        room_name = "normal" + str(room_number)
        await sio.enter_room(matcher[0], room_name, namespace="/game")
        await sio.enter_room(matcher[1], room_name, namespace="/game")
        async with sio.session(matcher[0]) as session:
            session["room_name"] = room_name
        async with sio.session(matcher[1]) as session:
            session["room_name"] = room_name
        user1_session = await sio.get_session(matcher[0], namespace="/game")
        user2_session = await sio.get_session(matcher[1], namespace="/game")
        send_info = {
            "roomName": room_name,
            "leftUser": user1_session["intraId"],
            "rightUser": user2_session["intraId"],
        }
        await sio.emit("userFullEvent", send_info, room=room_name, namespace="/game")  # 플레이어 위치 정보 송신
        game_room[room_name] = GameRoom(sio, matcher, room_name, "normal")


async def _speed_game_enqueue(sio, sid):
    global game_speed_room
    global speed_matching_queue
    global game_room

    speed_matching_queue.appendleft(sid)
    num_waiting = len(speed_matching_queue)

    if num_waiting >= 2:
        game_speed_room += 1
        matcher = [speed_matching_queue.pop(), speed_matching_queue.pop()]
        room_number = game_speed_room
        room_name = "speed" + str(room_number)
        await sio.enter_room(matcher[0], room_name, namespace="/game")
        await sio.enter_room(matcher[1], room_name, namespace="/game")
        user1_session = await sio.get_session(matcher[0], namespace="/game")
        user2_session = await sio.get_session(matcher[1], namespace="/game")
        send_info = {
            "roomName": room_name,
            "leftUser": user1_session["intraId"],
            "rightUser": user2_session["intraId"],
        }
        await sio.emit("userFullEvent", send_info, room=room_name, namespace="/game")
        game_room[room_name] = GameRoom(sio, matcher, room_name, "speed")


async def matching_dequeue(sio, sid, mode):
    if mode == "normal":
        if sid in normal_matching_queue:
            normal_matching_queue.remove(sid)
    else:
        if sid in speed_matching_queue:
            speed_matching_queue.remove(sid)
