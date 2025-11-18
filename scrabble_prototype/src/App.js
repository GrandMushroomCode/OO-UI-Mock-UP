import "./App.css";
import { useState } from "react";

const TILE_SCORES = {
  A: 1, E: 1, I: 1, L: 1, N: 1, O: 1, R: 1, S: 1, T: 1, U: 1,
  D: 2, G: 2,
  B: 3, C: 3, M: 3, P: 3,
  F: 4, H: 4, V: 4, W: 4, Y: 4,
  K: 5,
  J: 8, X: 8,
  Q: 10, Z: 10
};

const BONUS_LAYOUT = {
  // Triple Word
  "0,0": "TW", "0,7": "TW", "0,14": "TW",
  "7,0": "TW", "7,14": "TW",
  "14,0": "TW", "14,7": "TW", "14,14": "TW",

  // Double Word (diagonals)
  "1,1": "DW", "2,2": "DW", "3,3": "DW", "4,4": "DW",
  "10,10": "DW", "11,11": "DW", "12,12": "DW", "13,13": "DW",

  "1,13": "DW", "2,12": "DW", "3,11": "DW", "4,10": "DW",
  "10,4": "DW", "11,3": "DW", "12,2": "DW", "13,1": "DW",

  // Triple Letter
  "1,5": "TL", "1,9": "TL",
  "5,1": "TL", "5,5": "TL", "5,9": "TL", "5,13": "TL",
  "9,1": "TL", "9,5": "TL", "9,9": "TL", "9,13": "TL",
  "13,5": "TL", "13,9": "TL",

  // Double Letter
  "0,3": "DL", "0,11": "DL",
  "2,6": "DL", "2,8": "DL",
  "3,0": "DL", "3,7": "DL", "3,14": "DL",
  "6,2": "DL", "6,6": "DL", "6,8": "DL", "6,12": "DL",
  "7,3": "DL", "7,11": "DL",
  "8,2": "DL", "8,6": "DL", "8,8": "DL", "8,12": "DL",
  "11,0": "DL", "11,7": "DL", "11,14": "DL",
  "12,6": "DL", "12,8": "DL",
  "14,3": "DL", "14,11": "DL",

  //Starting tile
  "7,7": "STAR"
};

function App() {
  const emptyBoard = Array.from({ length: 15 }, () =>
    Array.from({ length: 15 }, () => null)
  );

  function randomTile() {
    const letters = Object.keys(TILE_SCORES);
    const randomIndex = Math.floor(Math.random() * letters.length);
    const letter = letters[randomIndex];

    const value = TILE_SCORES[letter];

    return { letter, value };
  }

  function generateRandomRack() {
    return Array.from({ length: 7 }, () => randomTile());
  }

  function toggleRackSelection(index) {
    setSelectedRackIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index); // unselect
      }
      return [...prev, index]; // select
    });
  }

  function handleEndTurn() {
    if (placedThisTurn.length === 0) {
      // nothing placed: you can either skip scoring or still advance
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      return;
    }

    // simple score: sum of placed tiles' base values (no bonuses)
    const turnScore = placedThisTurn.reduce(
      (sum, move) => sum + move.tile.value,
      0
    );

    // update current player's score
    setPlayers((prevPlayers) =>
      prevPlayers.map((p, idx) =>
        idx === currentPlayerIndex
          ? { ...p, score: p.score + turnScore }
          : p
      )
    );

    // refill rack: any null slot gets a new random tile
    setRack((prevRack) =>
      prevRack.map((slot) => (slot === null ? randomTile() : slot))
    );

    // clear placements for next turn
    setPlacedThisTurn([]);

    // advance to next player
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);

    // reset swap state just in case
    setIsSwapping(false);
    setSelectedRackIndices([]);
    setDraggedRackIndex(null);
  }

  function handlePassTurn() {
    // For now: only allow pass if no tiles were placed this turn
    if (placedThisTurn.length > 0) {
      // You could later implement "undo placements" here if you want.
      return;
    }

    // Just advance to the next player and reset any transient state
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);

    setIsSwapping(false);
    setSelectedRackIndices([]);
    setDraggedRackIndex(null);
    // placedThisTurn is already empty by invariant, but reset anyway
    setPlacedThisTurn([]);
  }

  const [board, setBoard] = useState(emptyBoard);
  const [rack, setRack] = useState(generateRandomRack);
  const [draggedRackIndex, setDraggedRackIndex] = useState(null);
  const [players, setPlayers] = useState([
    { id: "me", name: "You", score: 0 },
    { id: "p2", name: "Player 2", score: 0 },
    { id: "p3", name: "Player 3", score: 0 },
    { id: "p4", name: "Player 4", score: 0 }
  ]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedRackIndices, setSelectedRackIndices] = useState([]);
  const [placedThisTurn, setPlacedThisTurn] = useState([]);

  const currentPlayer = players[currentPlayerIndex];
  const me = players[0];
  const otherPlayers = players.slice(1);

  return (
    <div className="layout">
      <div className="game-area">
        {/* LEFT: your score */}
        <div className="score-column score-column--left">
          <div className="player-score player-score--me">
            <div className="player-name">{me.name}</div>
            <div className="player-score-value">{me.score}</div>
          </div>
        </div>

        {/* CENTER: current player label + board + rack + button */}
        <div className="center-area">
          <div className="current-player">
            {currentPlayer.name}'s Turn
          </div>

          <div className="board">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r},${c}`;
                const bonus = BONUS_LAYOUT[key];
                const cellClass = bonus ? `cell cell--${bonus}` : "cell";

                return (
                  <div
                    key={key}
                    className={cellClass}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedRackIndex === null) return;
                      if (board[r][c]) return;

                      const tileFromRack = rack[draggedRackIndex];
                      if (!tileFromRack) return;

                      setBoard((prevBoard) => {
                        const copy = prevBoard.map((row) => row.slice());
                        copy[r][c] = tileFromRack;
                        return copy;
                      });

                      setRack((prevRack) => {
                        const copy = [...prevRack];
                        copy[draggedRackIndex] = null;
                        return copy;
                      });

                      // remember this placement for scoring / refill
                      setPlacedThisTurn((prev) => [
                        ...prev,
                        { row: r, col: c, tile: tileFromRack }
                      ]);

                      setDraggedRackIndex(null);
                    }}
                  >
                    {cell ? (
                      <div className="tile">
                        <span className="letter">{cell.letter}</span>
                        <span className="value">{cell.value}</span>
                      </div>
                    ) : (
                      bonus && <span className="bonus-label">{bonus}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="rack">
            {rack.map((tile, i) => {
              const isSelected = selectedRackIndices.includes(i);
              const tileClass = isSelected ? "tile tile--selected" : "tile";

              return (
                <div
                  key={i}
                  className="rack-slot"
                  onDragOver={(e) => {
                    if (!isSwapping) e.preventDefault(); // allow drag-drop only when not swapping
                  }}
                  onDrop={() => {
                    if (isSwapping) return; // disable rack swapping in swap mode
                    if (draggedRackIndex === null || draggedRackIndex === i) return;

                    setRack((prev) => {
                      const next = [...prev];
                      const moving = next[draggedRackIndex];
                      next[draggedRackIndex] = next[i];
                      next[i] = moving;
                      return next;
                    });

                    setDraggedRackIndex(null);
                  }}
                >
                  {tile && (
                    <div
                      className={tileClass}
                      draggable={!isSwapping} // cannot drag when selecting
                      onDragStart={() => {
                        if (isSwapping) return;
                        setDraggedRackIndex(i);
                      }}
                      onClick={() => {
                        if (isSwapping) {
                          toggleRackSelection(i);
                        }
                      }}
                    >
                      <span className="letter">{tile.letter}</span>
                      <span className="value">{tile.value}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="controls">
            {!isSwapping && (
              <button
                onClick={() => {
                  setIsSwapping(true);
                  setSelectedRackIndices([]);
                }}
                disabled={placedThisTurn.length > 0}  // optional: block swap after placing
              >
                Swap Tiles
              </button>
            )}

            {isSwapping && (
              <>
                <button
                  onClick={() => {
                    // replace selected tiles with random ones
                    setRack((prevRack) => {
                      const next = [...prevRack];
                      selectedRackIndices.forEach((i) => {
                        next[i] = randomTile();
                      });
                      return next;
                    });

                    // clear UI state for current player
                    setSelectedRackIndices([]);
                    setIsSwapping(false);
                    setPlacedThisTurn([]);
                    setDraggedRackIndex(null);

                    // advance to next player, no score change
                    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
                  }}
                  disabled={selectedRackIndices.length === 0}
                >
                  Confirm Swap
                </button>

                <button
                  onClick={() => {
                    setSelectedRackIndices([]);
                    setIsSwapping(false);
                  }}
                >
                  Cancel
                </button>
              </>
            )}

            {/* PASS: allowed only if nothing placed this turn and not swapping */}
            <button
              onClick={handlePassTurn}
              disabled={placedThisTurn.length > 0 || isSwapping}
            >
              Pass
            </button>

            {/* END TURN: only when tiles have been placed */}
            <button
              onClick={handleEndTurn}
              disabled={placedThisTurn.length === 0}
            >
              End Turn
            </button>

            <button onClick={() => setRack(generateRandomRack())}>
              New Rack
            </button>
          </div>
        </div>

        {/* RIGHT: other players stacked */}
        <div className="score-column score-column--right">
          {otherPlayers.map((p) => (
            <div key={p.id} className="player-score">
              <div className="player-name">{p.name}</div>
              <div className="player-score-value">{p.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
