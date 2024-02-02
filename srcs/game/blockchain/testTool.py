from executeContract import retrieve_transaction, record_transaction
import time


class Tournament:
    def __init__(self):
        self.tournament = []

    @staticmethod
    def make_player(name, score):
        return {"name": name, "score": score}

    def add_game_log(self, winner, loser, order):
        self.tournament.append({"game_id": order, "winner": winner, "loser": loser})

    def add_timestamp(self):
        self.tournament.append(int(time.time()))


# retrieve_transaction()

t = Tournament()
t.add_game_log(t.make_player("a", 1), t.make_player("b", 0), 1)
t.add_game_log(t.make_player("a", 2), t.make_player("b", 1), 2)
t.add_game_log(t.make_player("a", 3), t.make_player("b", 2), 3)
t.add_timestamp()


record_transaction(t.tournament)
retrieve_transaction()
