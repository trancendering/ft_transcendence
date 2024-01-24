import socketio

from .game_core import player_ready, bar_move, matching_enqueue, matching_dequeue, \
    game_room, game_normal_room, game_speed_room

# 서버 객체
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins='*')
# 서버 이벤트 등록
sio.on("userReadyEvent", player_ready, namespace="/game")
sio.on("updatePaddlePosition", bar_move, namespace="/game")


def _log(command: str, name: str, sid: str) -> None:
    """
    로그 출력 함수

    parameter
    * command: 실행된 명령어(또는 이벤트) 이름
    * name: 클라이언트 이름
    * sid: 클라이언트 sid
    """
    print(f"[{command}] \nclient: {name} \nsid: {sid}\n")


@sio.on("connect", namespace="/game")
async def connect_game(sid, environ):
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
    query = dict([key_val.split("=") for key_val in query_str.split("&") if key_val.count("=") == 1])

    # 필수 키가 없는 경우 연결 거부
    for essential in ["nickname", "intraId", "isSpeedUp"]:
        if essential not in query:
            print(f"Connection Fail: no {essential}\n")
            raise ConnectionRefusedError(f"Query has no \"{essential}\" field")

    # 클라이언트 세션 저장
    await sio.save_session(sid, query, namespace="/game")
    _log("Connect", query["intraId"], sid)
    await matching_enqueue(sio, sid, query["isSpeedUp"])


@sio.on("disconnect", namespace="/game")
async def disconnect_game(sid):
    """
    소켓 연결이 종료될 때 호출되는 함수

    parameter
    * sid: 연결을 종료하는 클라이언트의 sid

    만약 게임이 진행중일 경우, 해당 게임방 폭파
    만약 대기중일 경우, 큐에서 제거
    그 외의 경우, 동작하지 않음
    """
    global game_room

    session = await sio.get_session(sid, namespace="/game")
    _log("Disconnect", session["intraId"], sid)
    if session["isSpeedUp"] == "normal" and sid in game_normal_room:
        await matching_dequeue(sio, sid, "normal")
    elif session["isSpeedUp"] == "speed" and sid in game_speed_room:
        await matching_dequeue(sio, sid, "speed")
    if "room_name" in session and session["room_name"] in game_room:
        await game_room[session["room_name"]].kill_room()
        del game_room[session["room_name"]]


@sio.on("ping", namespace="/game")
async def ping(sid, data):
    session = await sio.get_session(sid, namespace="/game")
    _log("PING", session["name"], sid)
    return "pong"
