import { test, expect } from "@playwright/test";
import { initialState, reveal, type GameState } from "../lib/game";
for (const loseAt of [3, 4, 5]) {
  test(`preset loss happens exactly on pick ${loseAt}`, () => {
    let state: GameState = {
      ...initialState,
      round: {
        size: 5,
        mines: [0, 1, 2],
        revealed: [],
        bet: 1000,
        status: "playing",
        payout: 0,
        mode: "lose",
        loseAt,
      },
    };
    for (let pick = 1; pick <= loseAt; pick++) {
      state = reveal(state, pick - 1);
      expect(state.round?.status).toBe(pick === loseAt ? "lost" : "playing");
      expect(new Set(state.round?.mines).size).toBe(3);
    }
    expect(state.history).toHaveLength(1);
    expect(state.history[0].payout).toBe(0);
    expect(reveal(state, 20)).toEqual(state);
  });
}
test("always-win cannot lose on any board size or mine count", () => {
  for (const size of [3, 4, 5, 6])
    for (let count = 1; count < size * size; count++) {
      let state: GameState = {
        ...initialState,
        round: {
          size,
          mines: Array.from({ length: count }, (_, i) => i),
          revealed: [],
          bet: 1000,
          status: "playing",
          payout: 0,
          mode: "win",
        },
      };
      for (let i = 0; i < size * size - count; i++) {
        state = reveal(state, i);
        expect(state.round?.status).not.toBe("lost");
        expect(new Set(state.round?.mines).size).toBe(count);
        expect(
          state.round?.revealed.some((cell) =>
            state.round!.mines.includes(cell),
          ),
        ).toBe(false);
      }
      expect(state.round?.status).toBe("won");
      expect(state.history).toHaveLength(1);
    }
});
