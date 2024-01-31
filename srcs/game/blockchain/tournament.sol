// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TournamentStorage {
    struct Player {
        string name;
        uint score;
    }

    struct Game {
        int256 game_id;
        Player winner;
        Player loser;
    }

    struct Tournament {
        Game game1;
        Game game2;
        Game game3;
    }

    Tournament[] tournaments;

    function store(Tournament memory one_tournament) public {
        tournaments.push(one_tournament);
    }

    function retrieve() public view returns (Tournament[] memory) {
        return tournaments;
    }
}
