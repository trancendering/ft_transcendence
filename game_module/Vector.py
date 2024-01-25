"""물리적 2차원 벡터를 표현하기 위한 Vector 클래스 정의"""
from math import sqrt
from dataclasses import dataclass
from typing import Dict


@dataclass
class Vector:
    """
    2차원 벡터와 그 연산을 정의한다.
    """
    x: float
    y: float

    def __add__(self, other: 'Vector') -> 'Vector':
        """
        벡터합을 수행하고 더해진 새로운 벡터를 반환한다.
        """
        return Vector(self.x + other.x, self.y + other.y)

    def __iadd__(self, other: 'Vector') -> 'Vector':
        """
        벡터합을 수행하여 대입한다.
        """
        self.x += other.x
        self.y += other.y
        return self

    def __sub__(self, other: 'Vector') -> 'Vector':
        """
        벡터차를 수행하고 더해진 새로운 벡터를 반환한다.
        """
        return Vector(self.x - other.x, self.y - other.y)

    def __isub__(self, other: 'Vector') -> 'Vector':
        """
        벡터차를 수행하여 대입한다.
        """
        self.x -= other.x
        self.y -= other.y
        return self

    def __mul__(self, other: 'int | float | Vector') -> 'int | float | Vector':  # 실수배 or 내적
        """
        수(실수 또는 정수)를 받은 경우 실수배 연산을 수행
        다른 벡터를 받은 경우 내적 연산 수행하고 새로운 결과 벡터 반환
        """
        if type(other) is int or type(other) is float:
            return Vector(self.x * other, self.y * other)
        else:
            return self.x * other.x + self.y * other.y

    def __imul__(self, other: int | float) -> 'Vector':
        """
        실수배를 수행하고 대입
        """
        self.x *= other
        self.y *= other
        return self

    def __rmul__(self, other: int | float) -> 'Vector':
        """
        실수 * 벡터 형태의 연산을 지원하기 위함. 실수배를 수행함
        """
        return Vector(self.x * other, self.y * other)

    def __neg__(self) -> 'Vector':
        """
        마이너스 부호를 사용할 수 있도록 함
        """
        return Vector(-self.x, -self.y)

    def __len__(self) -> float:
        """
        벡터의 크기를 구해서 반환
        """
        return sqrt(self.x * self.x + self.y * self.y)

    def cast_dict(self) -> Dict[str, float]:
        """
        현재 객체를 딕셔너리로 변환
        """
        return {"x": self.x, "y": self.y}

    def zero(self) -> 'Vector':
        """
        현재 객체를 영벡터로 변환
        """
        self.x = 0
        self.y = 0
        return self

    def nomalize(self) -> 'Vector':
        """
        정규화된 벡터(크기는 1이고 방향은 동일)를 반환
        """
        return (self * (1 / len(self)))

    def basis_translate(self, x_bas: 'Vector', y_bas: 'Vector') -> 'Vector | None':
        """
        2차원 벡터 기저 변환 함수
        
        만약 불가능할 경우 None반환
        """
        if x_bas * y_bas == 0:
            return None
        return Vector(self.x * y_bas.y + self.y * -y_bas.x, self.x * -x_bas.y + self.y * x_bas.x)
