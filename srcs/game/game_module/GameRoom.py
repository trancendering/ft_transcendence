from typing import List
import asyncio
import time

from socketio import AsyncServer

from .BaseRoom import BaseRoom


class GameRoom(BaseRoom):
    """
    유저 두 명이 1대1 핑퐁 게임을 할 수 있는 게임방 인스턴스 정의

    BaseRoom 객체를 상속받는다
    """

    def __init__(self, sio: AsyncServer, player: List[str], room_name: str, mode: str) -> None:
        super().__init__(sio, player, room_name, mode, "/single")

    async def _new_game(self) -> None:
        """
        새 게임 시작
        """
        # 초기화 작업 여기서 시행
        self._left_player, self._right_player = self._player
        self._game_state.reset_state()
        await asyncio.sleep(0.5)
        self._stay_state = False
        isError = await self._state_updata_loop()
        await self._game_end("normal" if not isError else "opponentLeft")

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
            "leftUserScore": self._score[self._left_player],
            "rightUserScore": self._score[self._right_player]
        }
        end_game = False
        if self._score[player] >= self.ENDSCORE:
            end_game = True
        await self._server.emit(
            "updateGameScore", score_data, room=self._room_name, namespace=self._namespace
        )
        self._game_state.reset_ball()
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
            "endGame", {"reason": end_reason}, room=self._room_name, namespace=self._namespace
        )
        await self._server.close_room(self._room_name, namespace=self._namespace)
        for player in self._player:
            await self._server.disconnect(player, namespace=self._namespace)
