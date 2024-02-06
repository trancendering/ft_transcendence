from collections import deque
from typing import List
import sys

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
    """
    플레이어를 매칭 큐에 넣는다

    parameter
    * sid: 플레이어의 sid
    * is_speed: "normal", "fast" 중 알맞은 게임 모드를 받음
    """
    if is_speed == "normal":
        await _normal_tournament_enqueue(sio, sid)
    else:
        await _speed_tournament_enqueue(sio, sid)


async def _normal_tournament_enqueue(sio: AsyncServer, sid: str) -> None:
    """
    일반 토너먼트 게임 매칭 큐 삽입

    parameter
    * sio: 실행하는 서버
    * sid: 플레이어의 sid
    """
    global tournament_normal_room
    global normal_tournament_queue

    normal_tournament_queue.appendleft(sid)
    num_waiting = len(normal_tournament_queue)

    # 네 명이 넘을 경우 새로운 방 생성
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
    """
    속도 업 모드 토너먼트 게임 매칭 큐 삽입

    parameter
    * sio: 실행하는 서버
    * sid: 플레이어의 sid
    """
    global tournament_speed_room
    global speed_tournament_queue

    speed_tournament_queue.appendleft(sid)
    num_waiting = len(speed_tournament_queue)

    # 네 명이 넘을 경우 새로운 방 생성
    if num_waiting >= 4:
        tournament_speed_room += 1
        player = [
            speed_tournament_queue.pop(), speed_tournament_queue.pop(),
            speed_tournament_queue.pop(), speed_tournament_queue.pop()
            ]
        room_number = tournament_speed_room
        room_name = "tour_speed" + str(room_number)
        await _enter_room(sio, room_name, player, "fast")


async def _enter_room(sio: AsyncServer, room_name: str, player: List[str], mode: str) -> None:
    """
    대기 중인 플레이어 명수가 방 정원에 도달한 경우, 해당 플레이어들을 넣어 TournamentRoom객체를 생성한다.

    parameter
    * sio: 플레이하는 서버
    * room_name: 방의 이름
    * player: 플레이하는 유저의 sid 리스트
    * mode: "normal" or "fast"
    """
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
        "socketId": player,
    }
    print(send_info, "tournament_send", file=sys.stderr)
    await sio.emit("userFullEvent", send_info, room=room_name, namespace="/tournament")  # 플레이어 위치 정보 송신
    game_room[room_name] = TournamentRoom(sio, player, room_name, mode)


def tournament_dequeue(sio: AsyncServer, sid: str, mode: str) -> None:
    """
    아직 게임을 시작하지 않은 플레이어가 나간 경우, 큐에서 해당 플레이어를 제거한다.
    socketio의 disconnect이벤트에서 호출됨
    """
    if mode == "normal":
        if sid in normal_tournament_queue:
            normal_tournament_queue.remove(sid)
    else:
        if sid in speed_tournament_queue:
            speed_tournament_queue.remove(sid)
