from collections import deque
from typing import List
from socketio import AsyncServer

from .TournamentRoom import TournamentRoom
from .game_ctl import game_room


# normal tournament mode waiting queue
tournament_normal_room: int = 0
normal_tournament_queue: deque[str] = deque()

# speed-up tournament mode waiting queue
tournament_speed_room: int = 0
speed_tournament_queue: deque[str] = deque()


async def tournament_enqueue(sio: AsyncServer, sid: str, is_speed: str) -> None:
    if is_speed == "normal":
        await _normal_tournament_enqueue(sio, sid)
    else:
        await _speed_tournament_enqueue(sio, sid)


async def _normal_tournament_enqueue(sio: AsyncServer, sid: str) -> None:
    global tournament_normal_room
    global normal_tournament_queue

    normal_tournament_queue.appendleft(sid)
    num_waiting = len(normal_tournament_queue)

    if num_waiting >= 4:
        tournament_normal_room += 1
        player = [
            normal_tournament_queue.pop(), normal_tournament_queue.pop(),
            normal_tournament_queue.pop(), normal_tournament_queue.pop()
            ]
        room_number = tournament_normal_room
        room_name = "tour_normal" + str(room_number)
        await _enter_room(sio, room_name, player, "normal")


async def _speed_tournament_enqueue(sio: AsyncServer, sid: str) -> None:
    global tournament_speed_room
    global speed_tournament_queue

    speed_tournament_queue.appendleft(sid)
    num_waiting = len(speed_tournament_queue)

    if num_waiting >= 4:
        tournament_speed_room += 1
        player = [
            speed_tournament_queue.pop(), speed_tournament_queue.pop(),
            speed_tournament_queue.pop(), speed_tournament_queue.pop()
            ]
        room_number = tournament_speed_room
        room_name = "tour_speed" + str(room_number)
        await _enter_room(sio, room_name, player, "speed")


async def _enter_room(sio: AsyncServer, room_name: str, player: List[str], mode: str) -> None:
    for player_sid in player:
        await sio.enter_room(player_sid, room_name, namespace="/tournament")
        async with sio.session(player_sid, namespace="/tournament") as session:
            session["room_name"] = room_name
    user_session = [
        await sio.get_session(player_sid, namespace="/tournament") for player_sid in player
        ]
    user_id = [session["intraId"] for session in user_session]
    user_nick = [session["nickname"] for session in user_session]
    send_info = {
        "roomName": room_name,
        "intraId": user_id,
        "nickname": user_nick,
    }
    await sio.emit("userFullEvent", send_info, room=room_name, namespace="/tournament")  # 플레이어 위치 정보 송신
    game_room[room_name] = TournamentRoom(sio, player, room_name, mode)


def tournament_dequeue(sio: AsyncServer, sid: str, mode: str) -> None:
    if mode == "normal":
        if sid in normal_tournament_queue:
            normal_tournament_queue.remove(sid)
    else:
        if sid in speed_tournament_queue:
            speed_tournament_queue.remove(sid)
