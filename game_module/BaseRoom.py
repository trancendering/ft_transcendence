from typing import List, Dict
from enum import Enum
import random
import asyncio
import time
import math

from socketio import AsyncServer

from .Vector import Vector


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
        # 게임 규격을 결정하는 상수
        self.FIELD_WIDTH = 800  # 게임 화면 가로길이
        self.FIELD_HEIGHT = 400  # 게임 화면 세로길이
        self.BALL_SIZE = 5  # 공의 크기(반지름)
        self.BAR_SIZE = 40  # 판의 크기(길이)
        self.UPDATE_FREQUENCY = 30  # 업데이트 빈도(프레임)
        self.ENDSCORE = 5  # 목표 점수
        self.ROUND_READY_TIME = 1  # 매 라운드 시작 시 준비 시간

        # 게임 객체를 정의하는 내부 변수
        self._server: AsyncServer = sio  # 서버 인스턴스
        self._namespace: str = namespace  # socketio에서 사용하는 네임스페이스
        self._player: List[str] = player  # 플레이어 sid
        self._room_name: str = room_name  # 방 이름
        self._game_start: bool = False  # 게임 시작 여부
        self._ready: Dict[str, str] = {player_sid: False for player_sid in self._player}  # 클라이언트 준비 여부
        self._game_mode: str = mode  # 게임 모드(normal, speed)
        self._stay_state: bool = True  # 게임 진행 중단 여부(라운드 간 초기화 후 공 잠깐 멈춤)
        self._stay_time: float = time.time()  # 게임 중단 시간
        self._async_task: asyncio.Task | None = None  # 실행되는 비동기 Task
        self._ball_speed: float = 9 if self._game_mode == "normal" else 10  # 공의 속력
        self._ball_velocity: Vector = Vector(0, 0)  # 공의 속도벡터
        self._correction_val: float = 0  # 충돌 보정값
        self._ball_rad: float = 0  # 공이 날아가는 각도
        self._kill = False  # 해당 게임 종료 여부(일반적으로 플레이어 탈주 플래그로 사용)
        self._left_player: str = ""  # 왼쪽 바를 움직이는 플레이어
        self._right_player: str = ""  # 오른쪽 바를 움직이는 플레이어

        # 사용자에게 전송되는 게임 현재 상태 변수
        self._ball_loc: Vector = Vector(0, 0)  # ball의 위치벡터
        self._bar_loc_left: float = 0  # player_1의 bar위치
        self._bar_loc_right: float = 0  # player_2의 bar위치
        self._score: Dict[str, int] = {player[0]: 0, player[1]: 0}  # 게임 스코어

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
                print(f"Error Occurred!!\nError: {e}")

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
        while not self._kill:
            # 게임 현재 상태 전송
            await self._state_send()
            # update 연산 간 딜레이
            await asyncio.sleep(1 / self.UPDATE_FREQUENCY)

            # 우측 득점
            if self._ball_loc.x <= -self.FIELD_WIDTH / 2:
                if await self._get_score(self._right_player) is True:
                    return False  # 게임 종료
            # 좌측 득점
            elif self._ball_loc.x >= self.FIELD_WIDTH / 2:
                if await self._get_score(self._left_player) is True:
                    return False  # 게임 종료

            # 현재 라운드 간 준비시간일 경우
            if self._stay_state is True:
                if time.time() - self._stay_time >= self.ROUND_READY_TIME:
                    self._stay_state = False  # 게임 재개
                else:
                    self._ball_loc.zero()  # 공의 위치 고정
            else:
                self._ball_move_update()  # 공 위치 갱신
        return True  # 비정상(사용자 탈주 등) 종료

    async def _state_send(self):
        """
        현재 게임 상태를 모든 플레이어에게 전파
        """
        now_state = {
            "ballPosition": self._ball_loc.cast_dict(),
            "leftPaddlePosition": self._bar_loc_left,
            "rightPaddlePosition": self._bar_loc_right,
        }
        await self._server.emit("updateGameStatus", now_state, room=self._room_name, namespace=self._namespace)

    def _ball_move_update(self):
        """
        공의 움직임을 기술한 함수
        공의 위치, 속도, 위치 보정값을 수정한다
        """
        def bar_collusion(self: 'BaseRoom') -> Collusion:
            """
            공과 바의 충돌 여부를 판정

            parameter
            * self: 현재 BaseRoom 객체

            반환형:
            충돌 여부 (Collusion 열거형)
            """
            # 우측에 충돌 시
            if self._ball_velocity.x > 0:
                bar_top = self._bar_loc_right + self.BAR_SIZE/2
                bar_bottom = self._bar_loc_right - self.BAR_SIZE/2
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
                if self._ball_loc.x <= self.FIELD_WIDTH/2 - self.BALL_SIZE and \
                        bottom_side_bound <= collusion_baseline <= top_side_bound:
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
                bar_top = self._bar_loc_left + self.BAR_SIZE/2
                bar_bottom = self._bar_loc_left - self.BAR_SIZE/2
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
                if self._ball_loc.x >= -self.FIELD_WIDTH/2 + self.BALL_SIZE and \
                        bottom_side_bound <= collusion_baseline <= top_side_bound:
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

        def edge_collusion(self: 'BaseRoom', edge_loc: float) -> tuple[float, Vector]:
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

        def edge_collusion_velocity(self: 'BaseRoom', edge_loc: float) -> Vector:
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
            impulse = -2 * ((self._ball_velocity * ball_to_edge) / ball_to_edge.size()) * ball_to_edge.nomalize()
            return (original_velocity + impulse)

        # 상단 충돌
        if self._ball_velocity.y > 0 and \
                self._ball_loc.y + self.BALL_SIZE > self.FIELD_HEIGHT / 2 - self._ball_velocity.y:
            ball_top = self._ball_loc.y + self.BALL_SIZE
            modified_val = ((self.FIELD_HEIGHT / 2) - ball_top) / (self._ball_velocity.y)
            self._ball_loc += self._ball_velocity * modified_val
            self._correction_val += 1 - modified_val
            self._ball_velocity.y *= -1
        # 하단 충돌
        elif self._ball_velocity.y < 0 and \
                self._ball_loc.y - self.BALL_SIZE < -self.FIELD_HEIGHT / 2 - self._ball_velocity.y:
            ball_bottom = self._ball_loc.y - self.BALL_SIZE
            modified_val = ((self.FIELD_HEIGHT / 2) + ball_bottom) / (-self._ball_velocity.y)
            self._ball_loc += self._ball_velocity * modified_val
            self._correction_val += 1 - modified_val
            self._ball_velocity.y *= -1
        # 우측 바 충돌
        elif self._ball_velocity.x > 0 and \
                self._ball_loc.x + self.BALL_SIZE > self.FIELD_WIDTH / 2 - self._ball_velocity.x and \
                (collusion := bar_collusion(self)) is not Collusion.NO_COLLUSION:
            if collusion is Collusion.TOP_EDGE_COLLUSION:
                modified_val, self._ball_loc = edge_collusion(self, self._bar_loc_right + 20)
                self._ball_velocity = edge_collusion_velocity(self, self._bar_loc_right + 20)
                self._correction_val += 1 - modified_val
            elif collusion is Collusion.BOT_EDGE_COLLUSION:
                modified_val, self._ball_loc = edge_collusion(self, self._bar_loc_right - 20)
                self._ball_velocity = edge_collusion_velocity(self, self._bar_loc_right - 20)
                self._correction_val += 1 - modified_val
            else:
                ball_right = self._ball_loc.x + self.BALL_SIZE
                modified_val = ((self.FIELD_WIDTH / 2) - ball_right) / (self._ball_velocity.x)
                self._ball_loc += self._ball_velocity * modified_val
                self._correction_val += 1 - modified_val
                self._ball_velocity.x *= -1
        # 좌측 바 충돌
        elif self._ball_velocity.x < 0 and \
                self._ball_loc.x - self.BALL_SIZE < -self.FIELD_WIDTH / 2 - self._ball_velocity.x and \
                (collusion := bar_collusion(self)) is not Collusion.NO_COLLUSION:
            if collusion is Collusion.TOP_EDGE_COLLUSION:
                modified_val, self._ball_loc = edge_collusion(self, self._bar_loc_left + 20)
                self._ball_velocity = edge_collusion_velocity(self, self._bar_loc_left + 20)
                self._correction_val += 1 - modified_val
            elif collusion is Collusion.BOT_EDGE_COLLUSION:
                modified_val, self._ball_loc = edge_collusion(self, self._bar_loc_left - 20)
                self._ball_velocity = edge_collusion_velocity(self, self._bar_loc_left - 20)
                self._correction_val += 1 - modified_val
            else:
                ball_left = self._ball_loc.x - self.BALL_SIZE
                modified_val = ((self.FIELD_WIDTH / 2) + ball_left) / (-self._ball_velocity.x)
                self._ball_loc += self._ball_velocity * modified_val
                self._correction_val += 1 - modified_val
                self._ball_velocity.x *= -1
        # 충돌하지 않음, 속도에 따른 공 위치 갱신
        else:
            self._ball_loc += self._ball_velocity * (1 + self._correction_val)
            self._correction_val = 0

            # 데드라인에 도달한 경우 이동을 데드라인에서 중단한 것처럼 보이게 함, 렌더링이 겹치는 것을 막기 위함
            if self._ball_loc.x < -self.FIELD_WIDTH / 2:
                self._ball_loc -= (
                    (-self.FIELD_WIDTH/2 - self._ball_loc.x) / -self._ball_velocity.x
                    * self._ball_velocity
                    )
            elif self._ball_loc.x > self.FIELD_WIDTH / 2:
                self._ball_loc -= (
                    (self._ball_loc.x - self.FIELD_WIDTH/2) / self._ball_velocity.x
                    * self._ball_velocity
                    )

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

    def bar_move(self, bar_loc: float, side: str) -> None:
        """
        바를 움직이는 함수

        parameter
        * bar_loc: 바의 위치, 바의 중심을 기준으로 받는다
        * side: "left", "right" 중 바가 움직이는 쪽의 방향을 받음
        """
        if side == "left":
            self._bar_loc_left = bar_loc
        else:
            self._bar_loc_right = bar_loc

    def kill_room(self) -> None:
        """
        해당 방의 실행을 중지시킴
        """
        self._kill = True
