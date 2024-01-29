from collections import deque
from typing import List
from socketio import AsyncServer

from .GameRoom import GameRoom
from .game_ctl import game_room


# normal game mode waiting queue
game_normal_room: int = 0
normal_matching_queue: deque[str] = deque()

# speed-up game mode waiting queue
game_speed_room: int = 0
speed_matching_queue: deque[str] = deque()


async def matching_enqueue(sio: AsyncServer, sid: str, is_speed: str) -> None:
    """
    플레이어를 매칭 큐에 넣는다

    parameter
    * sid: 플레이어의 sid
    * is_speed: "normal", "speed" 중 알맞은 게임 모드를 받음
    """
    if is_speed == "normal":
        await _normal_game_enqueue(sio, sid)
    else:
        await _speed_game_enqueue(sio, sid)


async def _normal_game_enqueue(sio: AsyncServer, sid: str) -> None:
    """
    일반 게임 매칭 큐 삽입

    parameter
    * sio: 실행하는 서버
    * sid: 플레이어의 sid
    """
    global game_normal_room
    global normal_matching_queue
    global game_room

    normal_matching_queue.appendleft(sid)
    num_waiting = len(normal_matching_queue)

    # 두 명이 넘을 경우 새로운 방 생성
    if num_waiting >= 2:
        game_normal_room += 1
        player = [normal_matching_queue.pop(), normal_matching_queue.pop()]
        room_number = game_normal_room
        room_name = "normal" + str(room_number)
        await _enter_room(sio, room_name, player, "normal")


async def _speed_game_enqueue(sio: AsyncServer, sid: str) -> None:
    """
    속도 업 모드 게임 매칭 큐 삽입

    parameter
    * sio: 실행하는 서버
    * sid: 플레이어의 sid
    """
    global game_speed_room
    global speed_matching_queue
    global game_room

    speed_matching_queue.appendleft(sid)
    num_waiting = len(speed_matching_queue)

    # 두 명이 넘을 경우 새로운 방 생성
    if num_waiting >= 2:
        game_speed_room += 1
        player = [speed_matching_queue.pop(), speed_matching_queue.pop()]
        room_number = game_speed_room
        room_name = "speed" + str(room_number)
        await _enter_room(sio, room_name, player, "speed")


async def _enter_room(sio: AsyncServer, room_name: str, player: List[str], mode: str) -> None:
    """
    대기 중인 플레이어 명수가 방 정원에 도달한 경우, 해당 플레이어들을 넣어 GameRoom객체를 생성한다.

    parameter
    * sio: 플레이하는 서버
    * room_name: 방의 이름
    * player: 플레이하는 유저의 sid 리스트
    * mode: "normal" or "speed"
    """
    await sio.enter_room(player[0], room_name, namespace="/single")
    await sio.enter_room(player[1], room_name, namespace="/single")
    async with sio.session(player[0], namespace="/single") as session:
        session["room_name"] = room_name
    async with sio.session(player[1], namespace="/single") as session:
        session["room_name"] = room_name
    user1_session = await sio.get_session(player[0], namespace="/single")
    user2_session = await sio.get_session(player[1], namespace="/single")
    send_info = {
        "roomName": room_name,
        "intraId": [user1_session["intraId"], user2_session["intraId"]],
        "nickname": [user1_session["nickname"], user2_session["nickname"]],
    }
    await sio.emit("userFullEvent", send_info, room=room_name, namespace="/single")  # 플레이어 위치 정보 송신
    game_room[room_name] = GameRoom(sio, player, room_name, mode)


def matching_dequeue(sio: AsyncServer, sid: str, mode: str) -> None:
    """
    아직 게임을 시작하지 않은 플레이어가 나간 경우, 큐에서 해당 플레이어를 제거한다.
    socketio의 disconnect이벤트에서 호출됨
    """
    if mode == "normal":
        if sid in normal_matching_queue:
            normal_matching_queue.remove(sid)
    else:
        if sid in speed_matching_queue:
            speed_matching_queue.remove(sid)
