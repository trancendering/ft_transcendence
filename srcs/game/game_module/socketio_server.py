from typing import Dict
import sys

import socketio

from .game_ctl import player_ready, bar_move, game_room
from .game_queue import matching_enqueue, matching_dequeue, \
        normal_matching_queue, speed_matching_queue
from .tournament_queue import tournament_enqueue, tournament_dequeue, \
        normal_tournament_queue, speed_tournament_queue

# 서버 객체
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins='*')
# 서버 이벤트 등록
sio.on("userReadyEvent", player_ready, namespace="/single")
sio.on("userReadyEvent", player_ready, namespace="/tournament")
sio.on("sendPaddlePosition", bar_move, namespace="/single")
sio.on("sendPaddlePosition", bar_move, namespace="/tournament")


def _log(command: str, name: str, sid: str) -> None:
    """
    로그 출력 함수

    parameter
    * command: 실행된 명령어(또는 이벤트) 이름
    * name: 클라이언트 이름
    * sid: 클라이언트 sid
    """
    print(f"[{command}] \nclient: {name} \nsid: {sid}\n", file=sys.stderr)


def _is_query_valid(key: str, val: str) -> bool:
    if key == "nickname":
        if len(val) > 10 or not val.isalpha():
            return False
    elif key == "isSpeedUp":
        if val != "normal" and val != "fast":
            return False
    return True


@sio.on("connect", namespace="/single")
async def connect_game(sid: str, environ: Dict[str, str]) -> None:
    """
    클라이언트 연결 시 호출되는 함수

    parameter
    * sid: 클라이언트 고유값
    * environ: HTTP헤더를 포함한 요청 정보

    클라이언트 연결 시도
    만약 입력 쿼리에 "name", "nick", "game_mod"이 포함되지 않은 경우, 입력 거부
    모두 있을 경우, 세션에 저장
    """
    print("\nTry connect: ", sid, "\n")
    query_str: str = environ["QUERY_STRING"]  # 쿼리 문자열
    # 쿼리 문자열을 dictionary 형태로 변환
    query: Dict[str, str] = dict([key_val.split("=") for key_val in query_str.split("&") if key_val.count("=") == 1])

    # 필수 키가 없는 경우 연결 거부
    for essential in ["nickname", "intraId", "isSpeedUp"]:
        if essential not in query or _is_query_valid(essential, query[essential]) is False:
            print(f"Connection Fail: no {essential}\n")
            raise ConnectionRefusedError(f"Query has no \"{essential}\" field")

    # 클라이언트 세션 저장
    await sio.save_session(sid, query, namespace="/single")
    _log("Connect", query["intraId"], sid)
    print("single", query, "\n\n", file=sys.stderr)
    await matching_enqueue(sio, sid, query["isSpeedUp"])


@sio.on("disconnect", namespace="/single")
async def disconnect_game(sid: str) -> None:
    """
    소켓 연결이 종료될 때 호출되는 함수

    parameter
    * sid: 연결을 종료하는 클라이언트의 sid

    만약 게임이 진행중일 경우, 해당 게임방 폭파
    만약 대기중일 경우, 큐에서 제거
    그 외의 경우, 동작하지 않음
    """
    session: Dict[str, str] = await sio.get_session(sid, namespace="/single")
    _log("Disconnect", session["intraId"], sid)
    if session["isSpeedUp"] == "normal" and sid in normal_matching_queue:
        matching_dequeue(sio, sid, "normal")
    elif session["isSpeedUp"] == "fast" and sid in speed_matching_queue:
        matching_dequeue(sio, sid, "fast")
    if "room_name" in session and session["room_name"] in game_room:
        await game_room[session["room_name"]].kill_room()
        if session["room_name"] in game_room:
            del game_room[session["room_name"]]


@sio.on("connect", namespace="/tournament")
async def connect_tournament(sid: str, environ: Dict[str, str]) -> None:
    """
    클라이언트 연결 시 호출되는 함수

    parameter
    * sid: 클라이언트 고유값
    * environ: HTTP헤더를 포함한 요청 정보

    클라이언트 연결 시도
    만약 입력 쿼리에 "name", "nick", "game_mod"이 포함되지 않은 경우, 입력 거부
    모두 있을 경우, 세션에 저장
    """
    print("\nTry connect: ", sid, "\n")
    query_str: str = environ["QUERY_STRING"]  # 쿼리 문자열
    # 쿼리 문자열을 dictionary 형태로 변환
    query: Dict[str, str] = dict([key_val.split("=") for key_val in query_str.split("&") if key_val.count("=") == 1])

    # 필수 키가 없는 경우 연결 거부
    for essential in ["nickname", "intraId", "isSpeedUp"]:
        if essential not in query or _is_query_valid(essential, query[essential]) is False:
            print(f"Connection Fail: no {essential}\n")
            raise ConnectionRefusedError(f"Query has no \"{essential}\" field")

    # 클라이언트 세션 저장
    await sio.save_session(sid, query, namespace="/tournament")
    _log("Connect", query["intraId"], sid)
    print("tour", query, "\n\n", file=sys.stderr)
    await tournament_enqueue(sio, sid, query["isSpeedUp"])


@sio.on("disconnect", namespace="/tournament")
async def disconnect_tournament(sid: str) -> None:
    """
    소켓 연결이 종료될 때 호출되는 함수

    parameter
    * sid: 연결을 종료하는 클라이언트의 sid

    만약 게임이 진행중일 경우, 해당 게임방 폭파
    만약 대기중일 경우, 큐에서 제거
    그 외의 경우, 동작하지 않음
    """
    session: Dict[str, str] = await sio.get_session(sid, namespace="/tournament")
    _log("Disconnect", session["intraId"], sid)
    if session["isSpeedUp"] == "normal" and sid in normal_tournament_queue:
        tournament_dequeue(sio, sid, "normal")
    elif session["isSpeedUp"] == "fast" and sid in speed_tournament_queue:
        tournament_dequeue(sio, sid, "fast")
    if "room_name" in session and session["room_name"] in game_room:
        await game_room[session["room_name"]].kill_room()
        if session["room_name"] in game_room:
            del game_room[session["room_name"]]


@sio.on("ping", namespace="/single")
async def ping(sid: str, data: str) -> str:
    """
    디버깅용으로 쓸려고 만들...었는데 안 써봄 흑흑
    """
    print("ping", sid, file=sys.stderr)
    # session: Dict[str, str] = await sio.get_session(sid, namespace=namespace)
    # _log("PING", session["name"], sid, data)
    return "pong"
