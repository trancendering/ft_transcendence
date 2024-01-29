from typing import List
import asyncio
import time

from socketio import AsyncServer

from .BaseRoom import BaseRoom


class TournamentRoom(BaseRoom):
    def __init__(self, sio: AsyncServer, player: List[str], room_name: str, mode: str) -> None:
        super().__init__(sio, player, room_name, mode, "/tournament")
        self._winner: List[str] = []
        self._winner_side: str = ""
        self._round = 0

    async def _new_game(self):
        """
        새 게임 시작
        """
        # 초기화 작업 여기서 시행
        self._round += 1
        if self._round == 1:
            self._left_player, self._right_player = self._player[:2]
        elif self._round == 2:
            self._left_player, self._right_player = self._player[2:]
        elif self._round == 3:
            self._left_player, self._right_player = self._winner[:2]
        self._score[self._left_player] = 0
        self._score[self._right_player] = 0
        self._ball_loc.zero()
        self._reset_ball_velocity()
        await asyncio.sleep(0.5)
        self._stay_state = False
        isError = await self._state_updata_loop()
        await self._game_end("normal" if not isError else "opponentLeft")

    async def _get_score(self, player) -> bool:
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
            if self._score[self._left_player] > self._score[self._right_player]:
                self._winner.append(self._left_player)
                self._winner_side = "left"
            else:
                self._winner.append(self._right_player)
                self._winner_side = "right"
        await self._server.emit(
            "updateGameScore", score_data, room=self._room_name, namespace=self._namespace
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
        send_info = {
            "round": self._round,
            "reason": end_reason,
            "winnerSide": self._winner_side
        }
        self._game_start = False
        for player_sid in self._ready:
            self._ready[player_sid] = False
        await self._server.emit(
            "endGame", send_info, room=self._room_name, namespace=self._namespace
        )
        if self._round == 3 or end_reason == "opponentLeft":
            await self._server.close_room(self._room_name, namespace=self._namespace)
            for player in self._player:
                await self._server.disconnect(player, namespace=self._namespace)
