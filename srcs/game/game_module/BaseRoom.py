from typing import List, Dict
from enum import Enum
import random
import asyncio
import time
import math
import sys

from socketio import AsyncServer

from .Vector import Vector
from .GameStateManager import GameStateManager


async def precide_sleep(delay):
    end_time = time.time_ns() / 1000000000 + delay
    await asyncio.sleep(delay * 0.8)
    while time.time_ns() / 1000000000 < end_time:
        await asyncio.sleep(0)


class Collusion(Enum):
    """
    NO_COLLUSION: 바에 충돌하지 않음
    TOP_EDGE_COLLUSION: 바의 상단 모서리에 충돌
    BOT_EDGE_COLLUSION: 바의 하단 모서리에 충돌
    SIDE_COLLUSION: 바의 면에 충돌
    """
    NO_COLLUSION = 0
    TOP_EDGE_COLLUSION = 1
    BOT_EDGE_COLLUSION = 2
    SIDE_COLLUSION = 3


class BaseRoom:
    """
    핑퐁 게임을 할 수 있는 게임방 base객체 정의
    사용 가능한 게임의 상태 및 내부변수들이 정의되어 있고, 공의 운동과 충돌 모델이 구현되어 있으며
    게임에 참가한 모든 플레이어에게 계속하여 실시간으로 게임 상태를 전송한다.(stateful game server)
    """

    def __init__(self, sio: AsyncServer, player: List[str], room_name: str, mode: str, namespace: str) -> None:
        #  게임 상수 데이터
        self.ENDSCORE = 5  # 목표 점수
        self.UPDATE_FREQUENCY = 60  # 업데이트 빈도(프레임)
        self.ROUND_READY_TIME = 1  # 매 라운드 시작 시 준비 시간

        # 게임 객체를 정의하는 내부 변수
        self._server: AsyncServer = sio  # 서버 인스턴스
        self._namespace: str = namespace  # socketio에서 사용하는 네임스페이스
        self._player: List[str] = player  # 플레이어 sid
        self._room_name: str = room_name  # 방 이름
        self._game_start: bool = False  # 게임 시작 여부
        self._game_expire: bool = False  # 게임 방 종료 여부
        self._ready: Dict[str, str] = {player_sid: False for player_sid in self._player}  # 클라이언트 준비 여부
        self._game_mode: str = mode  # 게임 모드(normal, speed)
        self._stay_state: bool = True  # 게임 진행 중단 여부(라운드 간 초기화 후 공 잠깐 멈춤)
        self._stay_time: float = time.time()  # 게임 중단 시간
        self._async_task: asyncio.Task | None = None  # 실행되는 비동기 Task
        self._kill = False  # 해당 게임 종료 여부(일반적으로 플레이어 탈주 플래그로 사용)
        self._left_player: str = ""  # 왼쪽 바를 움직이는 플레이어
        self._right_player: str = ""  # 오른쪽 바를 움직이는 플레이어
        self._score: Dict[str, int] = {player[0]: 0, player[1]: 0}  # 게임 스코어

        self._game_state: GameStateManager = GameStateManager(
            ball_speed=(3 if self._game_mode == "normal" else 5)
        )

    # 비동기 게임 루프의 entrypoint
    async def _new_game(self):
        raise NotImplementedError('Must be implemented in subclasses')

    # 득점 시 호출되는 함수, 해당 라운드 종료 여부를 리턴
    async def _get_score(self, player) -> bool:
        raise NotImplementedError('Must be implemented in subclasses')

    # 게임(토너먼트에선 라운드) 종료 시 호출되는 함수
    async def _game_end(self, end_reason: str) -> None:
        raise NotImplementedError('Must be implemented in subclasses')

    async def ready_player(self, sid: str) -> None:
        """
        플레이어의 준비 이벤트를 수신함
        모든 플레이어가 준비된 경우, 게임을 시작

        ../game_module/game_core.py의 player_ready에서 호출됨
        """
        def _game_end_callback(task: asyncio.Future):
            """
            게임 비동기 루프가 끝난 경우 호출,
            예외로 끝난 경우 예외를 출력하고 그 외에는 Game end 출력
            """
            try:
                task.result()
                print("Game End!")
            except Exception as e:
                print(f"Error Occurred!!\nError: {e.with_traceback()}")

        self._ready[sid] = True

        # All Ready
        if self._game_start is False and False not in self._ready.values():
            task = asyncio.create_task(self._new_game())  # 게임 시작(비동기 수행)
            self._async_task = task  # 비동기 작업 저장, 저장하지 않으면 GC가 작업을 날려먹음
            self._async_task.add_done_callback(_game_end_callback)
            self._game_start = True

    async def _state_updata_loop(self) -> bool:
        """
        게임 진행 루프를 실행하여 지속적으로 게임 상태 업데이트
        공의 궤적과 충돌을 계산하여 공의 위치를 조정함

        충돌 시에 공과 구조물이 겹치는 현상을 방지하기 위해
        해당 프레임에 이동 거리를 조정하여 공과 구조물이 접하게 렌더링 후
        조정된 거리만큼 다음 프레임에서 추가적으로 이동
        """
        update_send = True
        cal_delay = 0
        while not self._kill:
            # 게임 현재 상태 전송 및 연산 간 딜레이 생성
            if (update_send):
                await precide_sleep(1 / self.UPDATE_FREQUENCY - cal_delay)
                cal_delay = time.time_ns()
                await self._state_send()
                # await asyncio.gather(self._state_send(), precide_sleep(1000 / self.UPDATE_FREQUENCY - cal_delay))
            else:
                await precide_sleep(1 / self.UPDATE_FREQUENCY - cal_delay)
                cal_delay = time.time_ns()

            left_get_score, right_get_score = self._game_state.is_get_score()
            # 우측 득점
            if right_get_score is True:
                if await self._get_score(self._right_player) is True:
                    return False  # 게임 종료
            # 좌측 득점
            elif left_get_score is True:
                if await self._get_score(self._left_player) is True:
                    return False  # 게임 종료

            # 현재 라운드 간 준비시간일 경우
            if self._stay_state is True:
                update_send = False
                if time.time() - self._stay_time >= self.ROUND_READY_TIME:
                    update_send = True
                    self._stay_state = False  # 게임 재개
            else:
                update_send = self._game_state.update_next_state()  # 공 위치 갱신
                # print(cal_delay, file=sys.stderr)
            cal_delay = (time.time_ns() - cal_delay) / 100000000
        return True  # 비정상(사용자 탈주 등) 종료

    async def _state_send(self):
        """
        현재 게임 상태를 모든 플레이어에게 전파
        """
        now_state = {
            "ballPosition": self._game_state.get_current_ball_location(),
            "ballVelocity": self._game_state.get_current_ball_velocity(),
        }
        await self._server.emit("updateBallState", now_state, room=self._room_name, namespace=self._namespace)

    async def bar_move(self, bar_loc: float, side: str) -> None:
        """
        바를 움직이는 함수

        parameter
        * bar_loc: 바의 위치, 바의 중심을 기준으로 받는다
        * side: "left", "right" 중 바가 움직이는 쪽의 방향을 받음
        """
        if side == "left":
            self._game_state.left_bar = bar_loc
        else:
            self._game_state.right_bar = bar_loc
        send_bar_loc = {
            "left": self._game_state.left_bar,
            "right": self._game_state.right_bar,
        }
        await self._server.emit("updatePaddlePosition", send_bar_loc, room=self._room_name, namespace=self._namespace)

    async def kill_room(self) -> None:
        """
        해당 방의 실행을 중지시킴
        """
        self._kill = True
        if self._game_start is False:
            await self._game_end("opponentLeft")
