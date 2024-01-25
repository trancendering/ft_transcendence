from typing import List, Dict
from enum import Enum
import random
import asyncio
import time
import math

from socketio import AsyncServer

from .Vector import Vector


class GameRoom:
    """
    유저 두 명이 1대1 핑퐁 게임을 할 수 있는 게임방 인스턴스 정의
    현재 게임의 상태 및 내부변수들이 정의되어 있고,
    게임에 참가한 모든 플레이어에게 계속하여 실시간으로 게임 상태를 전송한다.(stateful game server)
    """

    def __init__(self, sio: AsyncServer, player: List[str], room_name: str, mode: str) -> None:
        # 게임 규격을 결정하는 상수
        self.FIELD_WIDTH = 800  # 게임 화면 가로길이
        self.FIELD_HEIGHT = 400  # 게임 화면 세로길이
        self.BALL_SIZE = 5  # 공의 크기(반지름)
        self.BAR_SIZE = 40  # 판의 크기(길이)
        self.UPDATE_FREQUENCY: int = 20  # 업데이트 빈도(프레임)
        self.ENDSCORE = 5  # 목표 점수
        self.ROUND_READY_TIME = 1  # 매 라운드 시작 시 준비 시간

        # 게임 객체를 정의하는 내부 변수
        self._server: AsyncServer = sio  # 서버 인스턴스
        self._player: List[str] = player  # 플레이어 sid
        self._room_name: str = room_name  # 방 이름
        self._game_start: bool = False  # 게임 시작 여부
        self._ready: Dict[str, bool] = {player[0]: False, player[1]: False}  # 클라이언트 준비 여부
        self._game_mode: str = mode  # 게임 모드(normal, speed)
        self._stay_state: bool = True
        self._stay_time: float = time.time()
        self._async_task: asyncio.Task | None = None
        self._ball_speed: float = 10 if self._game_mode == "normal" else 15
        self._ball_velocity: Vector = Vector(0, 0)  # ball 속도벡터
        self._ball_rad = 0
        self._kill = False

        # 사용자에게 전송되는 게임 현재 상태 변수
        self._ball_loc: Vector = Vector(0, 0)  # ball의 위치벡터
        self._bar_loc_1: float = 0  # player[0]의 bar위치
        self._bar_loc_2: float = 0  # player[1]의 bar위치
        self._score: Dict[str, int] = {player[0]: 0, player[1]: 0}  # 게임 스코어

    async def ready_player(self, sid: str) -> None:
        """
        플레이어의 준비 이벤트를 수신함
        모든 플레이어가 준비된 경우, 게임을 시작

        ../game_module/game_core.py의 player_ready에서 호출됨
        """
        self._ready[sid] = True

        # All Ready
        if self._game_start is False and False not in self._ready.values():
            task = asyncio.create_task(self._new_game())  # 게임 시작(비동기 수행)
            self._async_task = task  # 비동기 작업 저장, 저장하지 않으면 GC가 작업을 날려먹는다.
            self._game_start = True

    async def _new_game(self):
        """
        새 게임 시작
        """
        # 초기화 작업 여기서 시행
        self._ball_loc.zero()
        self._reset_ball_velocity()
        await asyncio.sleep(0.5)
        self._stay_state = False
        isError = await self._state_updata_loop()
        await self._game_end("normal" if not isError else "opponentLeft")

    async def _state_updata_loop(self):
        """
        게임 진행 루프를 실행하여 지속적으로 게임 상태 업데이트
        공의 궤적과 충돌을 계산하여 공의 위치를 조정함

        충돌 시에 공과 구조물이 겹치는 현상을 방지하기 위해
        해당 프레임에 이동 거리를 조정하여 공과 구조물이 접하게 렌더링 후
        조정된 거리만큼 다음 프레임에서 추가적으로 이동
        """
        class Collusion(Enum):
            """
            공과 바의 충돌 여부를 나타냄

            NO_COLLUSION: 바에 충돌하지 않음
            EDGE_COLLUSION: 바의 모서리에 충돌
            SIDE_COLLUSION: 바의 면에 충돌
            """
            NO_COLLUSION = 0
            TOP_EDGE_COLLUSION = 1
            BOT_EDGE_COLLUSION = 2
            SIDE_COLLUSION = 3

        def bar_collusion(self: 'GameRoom') -> Collusion:
            """
            공과 바의 충돌 여부를 판정

            parameter
            * self: 현재 GameRoom 객체
            """
            # 우측에 충돌 시
            if self._ball_velocity.x > 0:
                bar_top = self._bar_loc_2 + self.BAR_SIZE/2
                bar_bottom = self._bar_loc_2 - self.BAR_SIZE/2
                collusion_baseline = (
                    (self.FIELD_WIDTH/2 - self._ball_loc.x)
                    * (self._ball_velocity.y / self._ball_velocity.x)
                    + self._ball_loc.y
                )
                top_side_bound = bar_top + (
                    self.BALL_SIZE * (self._ball_velocity.y / self._ball_velocity.x)
                )
                bottom_side_bound = bar_bottom + (
                    self.BALL_SIZE * (self._ball_velocity.y / self._ball_velocity.x)
                )
                if bottom_side_bound <= collusion_baseline <= top_side_bound:
                    return Collusion.SIDE_COLLUSION
                if self._ball_velocity.y > 0:
                    if (
                        bar_bottom - self.BALL_SIZE
                        < collusion_baseline <
                        bar_top + (self.BALL_SIZE / math.cos(self._ball_rad))
                    ):
                        return Collusion.TOP_EDGE_COLLUSION if collusion_baseline > top_side_bound \
                            else Collusion.BOT_EDGE_COLLUSION
                else:
                    if (
                        bar_bottom - (self.BALL_SIZE / math.cos(self._ball_rad))
                        < collusion_baseline <
                        bar_top + self.BALL_SIZE
                    ):
                        return Collusion.TOP_EDGE_COLLUSION if collusion_baseline > top_side_bound \
                            else Collusion.BOT_EDGE_COLLUSION
            # 좌측에 충돌 시
            else:
                bar_top = self._bar_loc_1 + self.BAR_SIZE/2
                bar_bottom = self._bar_loc_1 - self.BAR_SIZE/2
                collusion_baseline = (
                    (-self.FIELD_WIDTH/2 - self._ball_loc.x)
                    * (self._ball_velocity.y / self._ball_velocity.x)
                    + self._ball_loc.y)
                top_side_bound = bar_top - (
                    self.BALL_SIZE * (self._ball_velocity.y / self._ball_velocity.x)
                )
                bottom_side_bound = bar_bottom - (
                    self.BALL_SIZE * (self._ball_velocity.y / self._ball_velocity.x)
                )
                if bottom_side_bound <= collusion_baseline <= top_side_bound:
                    return Collusion.SIDE_COLLUSION
                if self._ball_velocity.y > 0:
                    if (
                        bar_bottom - self.BALL_SIZE
                        < collusion_baseline <
                        bar_top + (-self.BALL_SIZE / math.cos(self._ball_rad))
                    ):
                        return Collusion.TOP_EDGE_COLLUSION if collusion_baseline > top_side_bound \
                            else Collusion.BOT_EDGE_COLLUSION
                else:
                    if (
                        bar_bottom - (-self.BALL_SIZE / math.cos(self._ball_rad))
                        < collusion_baseline <
                        bar_top + self.BALL_SIZE
                    ):
                        return Collusion.TOP_EDGE_COLLUSION if collusion_baseline > top_side_bound \
                            else Collusion.BOT_EDGE_COLLUSION
            return Collusion.NO_COLLUSION

        def edge_collusion(self: 'GameRoom', edge_loc: float) -> tuple[float, Vector]:
            """
            공의 모서리 충돌 위치 계산 함수

            반환값:
            공이 충돌지점까지 이동한 위치(modified_val), 이동 후 공의 위치(_ball_loc)
            """
            if self._ball_velocity.x > 0:
                ball_to_edge = Vector(self.FIELD_WIDTH/2, edge_loc) - self._ball_loc
            else:
                ball_to_edge = Vector(-self.FIELD_WIDTH/2, edge_loc) - self._ball_loc
            norm_velocity = self._ball_velocity.nomalize()
            b_to_e_other_basis = ball_to_edge.basis_translate(
                norm_velocity, Vector(-norm_velocity.y, norm_velocity.x)
            )
            ball_to_edge_dencity = b_to_e_other_basis.x - math.sqrt(
                self.BALL_SIZE ** 2 - b_to_e_other_basis.y ** 2
            )
            modified_val = ball_to_edge_dencity / self._ball_speed
            return (modified_val, self._ball_loc + (self._ball_velocity * modified_val))

        def edge_collusion_velocity(self: 'GameRoom', edge_loc: float) -> Vector:
            """
            공의 모서리 충돌 후 속도 변화 계산

            반환값:
            충돌 후 공의 속도(_ball_velocity)
            """
            if self._ball_velocity.x > 0:
                ball_to_edge = Vector(self.FIELD_WIDTH/2, edge_loc) - self._ball_loc
            else:
                ball_to_edge = Vector(-self.FIELD_WIDTH/2, edge_loc) - self._ball_loc
            original_velocity = self._ball_velocity
            impulse = -2 * ((self._ball_velocity * ball_to_edge) / len(ball_to_edge)) * ball_to_edge
            return (original_velocity - impulse)

        # 충돌 보정값
        correction_val: float = 0

        while not self._kill:
            # 게임 현재 상태 전송
            await self._state_send()
            loop_sleep = asyncio.create_task(asyncio.sleep(1 / self.UPDATE_FREQUENCY))

            # 우측 득점
            if self._ball_loc.x <= -self.FIELD_WIDTH / 2:
                if await self._get_score(self._player[1]) is True:
                    return True  # 게임 종료
            # 좌측 득점
            elif self._ball_loc.x >= self.FIELD_WIDTH / 2:
                if await self._get_score(self._player[0]) is True:
                    return True  # 게임 종료
            # 상단 충돌
            elif self._ball_velocity.y > 0 and \
                    self._ball_loc.y + self.BALL_SIZE > self.FIELD_HEIGHT / 2 - self._ball_velocity.y:
                ball_top = self._ball_loc.y + self.BALL_SIZE
                modified_val = ((self.FIELD_HEIGHT / 2) - ball_top) / (self._ball_velocity.y)
                self._ball_loc += self._ball_velocity * modified_val
                correction_val += 1 - modified_val
                self._ball_velocity.y *= -1
            # 하단 충돌
            elif self._ball_velocity.y < 0 and \
                    self._ball_loc.y - self.BALL_SIZE < -self.FIELD_HEIGHT / 2 - self._ball_velocity.y:
                ball_bottom = self._ball_loc.y - self.BALL_SIZE
                modified_val = ((self.FIELD_HEIGHT / 2) + ball_bottom) / (self._ball_velocity.y)
                self._ball_loc += self._ball_velocity * modified_val
                correction_val += 1 - modified_val
                self._ball_velocity.y *= -1
            # 우측 바 충돌
            elif self._ball_velocity.x > 0 and \
                    self._ball_loc.x + self.BALL_SIZE > self.FIELD_WIDTH / 2 - self._ball_velocity.x and \
                    (collusion := bar_collusion(self)) is not Collusion.NO_COLLUSION:
                if collusion is Collusion.TOP_EDGE_COLLUSION:
                    modified_val, self._ball_loc = edge_collusion(self, self._bar_loc_2 + 20)
                    self._ball_velocity = edge_collusion_velocity(self, self._bar_loc_2 + 20)
                    correction_val += 1 - modified_val
                elif collusion is Collusion.BOT_EDGE_COLLUSION:
                    modified_val, self._ball_loc = edge_collusion(self, self._bar_loc_2 - 20)
                    self._ball_velocity = edge_collusion_velocity(self, self._bar_loc_2 - 20)
                    correction_val += 1 - modified_val
                else:
                    ball_right = self._ball_loc.x + self.BALL_SIZE
                    modified_val = ((self.FIELD_WIDTH / 2) - ball_right) / (self._ball_velocity.x)
                    self._ball_loc += self._ball_velocity * modified_val
                    correction_val += 1 - modified_val
                    self._ball_velocity.x *= -1
            # 좌측 바 충돌
            elif self._ball_velocity.x < 0 and \
                    self._ball_loc.x - self.BALL_SIZE < -self.FIELD_WIDTH / 2 - self._ball_velocity.x and \
                    (collusion := bar_collusion(self)) is not Collusion.NO_COLLUSION:
                if collusion is Collusion.TOP_EDGE_COLLUSION:
                    modified_val, self._ball_loc = edge_collusion(self, self._bar_loc_1 + 20)
                    self._ball_velocity = edge_collusion_velocity(self, self._bar_loc_1 + 20)
                    correction_val += 1 - modified_val
                elif collusion is Collusion.BOT_EDGE_COLLUSION:
                    modified_val, self._ball_loc = edge_collusion(self, self._bar_loc_1 - 20)
                    self._ball_velocity = edge_collusion_velocity(self, self._bar_loc_1 - 20)
                    correction_val += 1 - modified_val
                else:
                    ball_left = self._ball_loc.x - self.BALL_SIZE
                    modified_val = ((self.FIELD_WIDTH / 2) + ball_left) / (self._ball_velocity.x)
                    self._ball_loc += self._ball_velocity * modified_val
                    correction_val += 1 - modified_val
                    self._ball_velocity.x *= -1
            # 충돌하지 않음, 속도에 따른 공 위치 갱신
            else:
                self._ball_loc += self._ball_velocity * (1 + correction_val)
                correction_val = 0

            # 현재 라운드 간 준비시간일 경우
            if self._stay_state is True:
                if time.time() - self._stay_time >= self.ROUND_READY_TIME:
                    self._stay_time = False  # 게임 재개
                else:
                    self._ball_loc.zero()
            # 루프 대기
            await loop_sleep

        return False

    async def _state_send(self):
        """
        현재 게임 상태를 모든 플레이어에게 전파
        """
        def _vector_translate(vec: Vector) -> Vector:
            """
            프론트와 백엔드에서 다른 좌표계를 사용할 경우, 좌표 변환을 수행한다.

            백엔드의 경우, field의 중앙이 원점, y축이 정방향으로 되어 있는 좌표계를 사용하고
            프론트의 경우 field의 좌측 상단이 원점, y축이 역방향으로 되어 있는 좌표계를 사용한다.
            """
            return Vector(self.x + 400, -(self.y - 200))

        now_state = {
            "ballPosition": _vector_translate(self._ball_loc).cast_dict(),
            "leftPaddlePosition": 200 - self._bar_loc_1,
            "rightPaddlePosition": 200 - self._bar_loc_2,
        }
        await self._server.emit("updateGameStatus", now_state, room=self._room_name, namespace="/game")

    async def _get_score(self, player: str) -> bool:
        """
        player가 점수를 얻은 경우

        parameter
        * player: 점수를 획득한 플레이어 (sid)

        True가 리턴된 경우 게임을 종료
        False인 경우 게임 속행
        """
        self._stay_time = time.time()
        self._stay_state = True
        self._score[player] += 1
        score_data = {
            "leftUserScore": self._score[self._player[0]],
            "rightUserScore": self._score[self._player[1]]
        }
        end_game = False
        if self._score[player] >= self.ENDSCORE:
            end_game = True
        await self._server.emit(
            "updateGameScore", score_data, room=self._room_name, namespace="/game"
        )
        self._ball_loc.zero()
        self._reset_ball_velocity()
        return end_game

    async def _game_end(self, end_reason: str) -> None:
        """
        게임이 종료되었을 경우 해당 함수 호출

        parameter
        * end_reason: 종료 사유

        normal: 정상 종료
        opponentLeft: 상대가 나감
        """
        await self._server.emit(
            "endGame", {"reason": end_reason}, room=self._room_name, namespace="/game"
        )
        await self._server.close_room(self._room_name, namespace="/game")
        await self._server.disconnect(self._player[0], namespace="/game")
        await self._server.disconnect(self._player[1], namespace="/game")

    def _reset_ball_velocity(self) -> None:
        """
        공의 방향을 재설정한다.
        이 때 공의 방향은 랜덤으로 하고, 축 방향과 적어도 10도 이상 차이나게 한다.
        축 방향과 비슷할 경우 공이 너무 단조롭게 운동할 수 있기 때문이다.
        """
        ball_rad = random.randrange(10, 350)
        while ball_rad % 90 < 20 or ball_rad % 90 > 70:
            ball_rad = random.randrange(10, 350)
        self._ball_rad = math.radians(ball_rad)
        self._ball_velocity.x = math.cos(self._ball_rad)
        self._ball_velocity.y = math.sin(self._ball_rad)
        self._ball_velocity *= self._ball_speed

    async def bar_move(self, bar_loc: float, side: str) -> None:
        if side == "left":
            self._bar_loc_1 = 200 - bar_loc
        else:
            self._bar_loc_2 = 200 - bar_loc

    async def kill_room(self) -> None:
        self._kill = True
        await self._async_task
