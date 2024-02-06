from typing import Dict, Tuple
from enum import Enum
import random
import math
import sys

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


class GameStateManager:
    def __init__(self, *,
        field_width: int = 800, field_height: int = 400, 
        ball_speed: float = 6, ball_size: int = 5, bar_size: int = 40
    ):
        # 게임 규격을 결정하는 상수
        self.FIELD_WIDTH = field_width  # 게임 화면 가로길이
        self.FIELD_HEIGHT = field_height  # 게임 화면 세로길이
        self.BALL_SIZE = ball_size  # 공의 크기(반지름)
        self.BAR_SIZE = bar_size  # 판의 크기(길이)

        # 게임 현재 상태를 나타내는 변수
        self._ball_speed: float = ball_speed  # 공의 속력
        self._ball_velocity: Vector = Vector(0, 0)  # 공의 속도벡터
        self._correction_val: float = 0  # 충돌 보정값
        self._ball_rad: float = 0  # 공이 날아가는 각도

        self._ball_loc: Vector = Vector(0, 0)  # ball의 위치벡터
        self._bar_loc_left: float = 0  # player_1의 bar위치
        self._bar_loc_right: float = 0  # player_2의 bar위치

    def reset_ball(self) -> None:
        self._reset_ball_velocity()
        self._ball_loc.zero()

    def reset_state(self) -> None:
        self.reset_ball()
        self._bar_loc_left, self._bar_loc_right = 0, 0

    def update_next_state(self) -> None:
        self._ball_move_update()

    def is_get_score(self) -> Tuple[bool]:
        # 우측 득점
        if self._ball_loc.x <= -self.FIELD_WIDTH / 2:
            return False, True
        # 좌측 득점
        if self._ball_loc.x >= self.FIELD_WIDTH / 2:
            return True, False
        return False, False

    def get_current_ball_location(self) -> Dict[str, float]:
        return self._ball_loc.cast_dict()

    @property
    def left_bar(self) -> float:
        return self._bar_loc_left

    @property
    def right_bar(self) -> float:
        return self._bar_loc_right

    @left_bar.setter
    def left_bar(self, bar_loc: float) -> None:
        if -self.FIELD_HEIGHT/2 <= bar_loc <= self.FIELD_HEIGHT/2:
            self._bar_loc_left = bar_loc

    @right_bar.setter
    def right_bar(self, bar_loc: float) -> None:
        if -self.FIELD_HEIGHT/2 <= bar_loc <= self.FIELD_HEIGHT/2:
            self._bar_loc_right = bar_loc

    def _ball_move_update(self) -> None:
        """
        공의 움직임을 기술한 함수
        공의 위치, 속도, 위치 보정값을 수정한다
        """
        # 상단 충돌
        if self._ball_velocity.y > 0 and \
                self._ball_loc.y + self.BALL_SIZE > self.FIELD_HEIGHT / 2 - self._ball_velocity.y:
            ball_top = self._ball_loc.y + self.BALL_SIZE
            modified_val = ((self.FIELD_HEIGHT / 2) - ball_top) / (self._ball_velocity.y)
            self._ball_loc += self._ball_velocity * modified_val
            self._correction_val += 1 - modified_val
            self._ball_velocity.y *= -1
            self._ball_rad = -self._ball_rad + 2 * math.pi
        # 하단 충돌
        elif self._ball_velocity.y < 0 and \
                self._ball_loc.y - self.BALL_SIZE < -self.FIELD_HEIGHT / 2 - self._ball_velocity.y:
            ball_bottom = self._ball_loc.y - self.BALL_SIZE
            modified_val = ((self.FIELD_HEIGHT / 2) + ball_bottom) / (-self._ball_velocity.y)
            self._ball_loc += self._ball_velocity * modified_val
            self._correction_val += 1 - modified_val
            self._ball_velocity.y *= -1
            self._ball_rad = -self._ball_rad + 2 * math.pi
        # 우측 바 충돌
        elif self._ball_velocity.x > 0 and \
                self._ball_loc.x + self.BALL_SIZE > self.FIELD_WIDTH / 2 - self._ball_velocity.x and \
                (collusion := self._bar_collusion()) is not Collusion.NO_COLLUSION:
            if collusion is Collusion.TOP_EDGE_COLLUSION:
                modified_val, self._ball_loc = self._edge_collusion(self._bar_loc_right + 20)
                self._ball_velocity = self._edge_collusion_velocity(self._bar_loc_right + 20)
                self._correction_val += 1 - modified_val
                self._ball_rad = math.atan2(self._ball_velocity.y, self._ball_velocity.x)
                if self._ball_rad < 0:
                    self._ball_rad += 2 * math.pi
            elif collusion is Collusion.BOT_EDGE_COLLUSION:
                modified_val, self._ball_loc = self._edge_collusion(self._bar_loc_right - 20)
                self._ball_velocity = self._edge_collusion_velocity(self._bar_loc_right - 20)
                self._correction_val += 1 - modified_val
                self._ball_rad = math.atan2(self._ball_velocity.y, self._ball_velocity.x)
                if self._ball_rad < 0:
                    self._ball_rad += 2 * math.pi
            else:
                ball_right = self._ball_loc.x + self.BALL_SIZE
                modified_val = ((self.FIELD_WIDTH / 2) - ball_right) / (self._ball_velocity.x)
                self._ball_loc += self._ball_velocity * modified_val
                self._correction_val += 1 - modified_val
                self._ball_velocity.x *= -1
                self._ball_rad = math.pi - self._ball_rad
                if self._ball_rad < 0:
                    self._ball_rad += 2 * math.pi
        # 좌측 바 충돌
        elif self._ball_velocity.x < 0 and \
                self._ball_loc.x - self.BALL_SIZE < -self.FIELD_WIDTH / 2 - self._ball_velocity.x and \
                (collusion := self._bar_collusion()) is not Collusion.NO_COLLUSION:
            if collusion is Collusion.TOP_EDGE_COLLUSION:
                modified_val, self._ball_loc = self._edge_collusion(self._bar_loc_left + 20)
                self._ball_velocity = self._edge_collusion_velocity(self._bar_loc_left + 20)
                self._correction_val += 1 - modified_val
                self._ball_rad = math.atan2(self._ball_velocity.y, self._ball_velocity.x)
                if self._ball_rad < 0:
                    self._ball_rad += 2 * math.pi
            elif collusion is Collusion.BOT_EDGE_COLLUSION:
                modified_val, self._ball_loc = self._edge_collusion(self._bar_loc_left - 20)
                self._ball_velocity = self._edge_collusion_velocity(self._bar_loc_left - 20)
                self._correction_val += 1 - modified_val
                self._ball_rad = math.atan2(self._ball_velocity.y, self._ball_velocity.x)
                if self._ball_rad < 0:
                    self._ball_rad += 2 * math.pi
            else:
                ball_left = self._ball_loc.x - self.BALL_SIZE
                modified_val = ((self.FIELD_WIDTH / 2) + ball_left) / (-self._ball_velocity.x)
                self._ball_loc += self._ball_velocity * modified_val
                self._correction_val += 1 - modified_val
                self._ball_velocity.x *= -1
                self._ball_rad = math.pi - self._ball_rad
                if self._ball_rad < 0:
                    self._ball_rad += 2 * math.pi
        # 충돌하지 않음, 속도에 따른 공 위치 갱신
        else:
            self._ball_loc += self._ball_velocity * (1 + min(0.1, self._correction_val))
            self._correction_val -= min(0.1, self._correction_val)

            # 데드라인에 도달한 경우 이동을 데드라인에서 중단한 것처럼 보이게 함, 렌더링이 겹치는 것을 막기 위함
            if self._ball_loc.x < -self.FIELD_WIDTH / 2:
                self._ball_loc -= (
                    (-self.FIELD_WIDTH/2 - self._ball_loc.x) / -self._ball_velocity.x
                    * self._ball_velocity)
            elif self._ball_loc.x > self.FIELD_WIDTH / 2:
                self._ball_loc -= (
                    (self._ball_loc.x - self.FIELD_WIDTH/2) / self._ball_velocity.x
                    * self._ball_velocity)

    def _bar_collusion(self) -> Collusion:
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

            if self._ball_loc.x > self.FIELD_WIDTH/2 - self.BALL_SIZE:
                if bar_bottom <= self._ball_loc.y <= bar_top:
                    return Collusion.SIDE_COLLUSION
                ball_to_top_edge = Vector(self.FIELD_WIDTH/2 - self._ball_loc.x, self._ball_loc.y - bar_top)
                if bar_top < self._ball_loc.y and \
                        ball_to_top_edge.size() < self.BALL_SIZE:
                    return Collusion.TOP_EDGE_COLLUSION
                ball_to_bot_edge = Vector(self.FIELD_WIDTH/2 - self._ball_loc.x, bar_bottom - self._ball_loc.y)
                if bar_bottom > self._ball_loc.y and \
                        ball_to_bot_edge.size() < self.BALL_SIZE:
                    return Collusion.BOT_EDGE_COLLUSION
                return Collusion.NO_COLLUSION

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
            bar_top = self._bar_loc_left + self.BAR_SIZE/2
            bar_bottom = self._bar_loc_left - self.BAR_SIZE/2

            if self._ball_loc.x < -self.FIELD_WIDTH/2 + self.BALL_SIZE:
                if bar_bottom <= self._ball_loc.y <= bar_top:
                    return Collusion.SIDE_COLLUSION
                ball_to_top_edge = Vector(self.FIELD_WIDTH/2 - self._ball_loc.x, self._ball_loc.y - bar_top)
                if bar_top < self._ball_loc.y and \
                        ball_to_top_edge.size() < self.BALL_SIZE:
                    return Collusion.TOP_EDGE_COLLUSION
                ball_to_bot_edge = Vector(self.FIELD_WIDTH/2 - self._ball_loc.x, bar_bottom - self._ball_loc.y)
                if bar_bottom > self._ball_loc.y and \
                        ball_to_bot_edge.size() < self.BALL_SIZE:
                    return Collusion.BOT_EDGE_COLLUSION
                return Collusion.NO_COLLUSION

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

    def _edge_collusion(self, edge_loc: float) -> tuple[float, Vector]:
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
        try:
            ball_to_edge_dencity = b_to_e_other_basis.x - math.sqrt(
                self.BALL_SIZE ** 2 - b_to_e_other_basis.y ** 2
            )
        except Exception as e:
            print("\n", file=sys.stderr)
            print("norm_velocity: ", norm_velocity, file=sys.stderr)
            print("ball_to_edge: ", ball_to_edge, file=sys.stderr)
            print("b_to_e_other_basis: ", b_to_e_other_basis, file=sys.stderr)
            print("ball_velo: ", self._ball_velocity, file=sys.stderr)
            print("ball_loc: ", self._ball_loc, file=sys.stderr)
            print("ball_rad: ", self._ball_rad, file=sys.stderr)
            print("correction_val: ", self._correction_val, file=sys.stderr)
            print("left_bar: ", self._bar_loc_left, file=sys.stderr)
            print("right_bar: ", self._bar_loc_right, file=sys.stderr)
            print("\n", file=sys.stderr)
            raise e
        modified_val = ball_to_edge_dencity / self._ball_speed
        return (modified_val, self._ball_loc + (self._ball_velocity * modified_val))

    def _edge_collusion_velocity(self, edge_loc: float) -> Vector:
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