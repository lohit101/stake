import type { Currency } from "./currency";
export type Round = {
  mode?: "lose" | "win";
  loseAt?: number;
  size: number;
  mines: number[];
  revealed: number[];
  bet: number;
  status: "playing" | "won" | "lost";
  payout: number;
};
export type Entry = {
  id: string;
  bet: number;
  multiplier: number;
  payout: number;
  time: string;
};
export type WalletState = {
  balance: number;
  round: Round | null;
  history: Entry[];
};
export type GameState = WalletState & {
  currency?: Currency;
  wallets?: Partial<Record<Currency, WalletState>>;
};
export const initialState: GameState = {
  balance: 100000,
  round: null,
  history: [],
};
export function multiplier(total: number, mines: number, picks: number) {
  if (!picks) return 1;
  let result = 0.99;
  for (let i = 0; i < picks; i++) result *= (total - i) / (total - mines - i);
  return result;
}
export function randomInt(max: number) {
  const limit = Math.floor(4294967296 / max) * max;
  const a = new Uint32Array(1);
  do {
    crypto.getRandomValues(a);
  } while (a[0] >= limit);
  return a[0] % max;
}
export function makeMines(total: number, count: number) {
  const cells = Array.from({ length: total }, (_, i) => i);
  for (let i = 0; i < count; i++) {
    const j = i + randomInt(total - i);
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, count);
}
export function finish(
  state: GameState,
  round: Round,
  won: boolean,
): GameState {
  const mult = won
    ? multiplier(round.size ** 2, round.mines.length, round.revealed.length)
    : 0;
  const payout = won ? Math.floor(round.bet * mult) : 0;
  return {
    ...state,
    balance: state.balance + payout,
    round: { ...round, status: won ? "won" : "lost", payout },
    history: [
      {
        id: crypto.randomUUID(),
        bet: round.bet,
        multiplier: mult,
        payout,
        time: new Date().toISOString(),
      },
      ...state.history,
    ].slice(0, 50),
  };
}
export function reveal(state: GameState, index: number) {
  let r = state.round;
  if (
    !r ||
    r.status !== "playing" ||
    r.revealed.includes(index) ||
    index < 0 ||
    index >= r.size ** 2
  )
    return state;
  // Preset rounds relocate only unrevealed mines, preserving mine count and
  // every previously revealed gem. Existing rounds retain random behavior.
  if (r.mode) {
    const mustLose =
      r.mode === "lose" && r.revealed.length + 1 >= (r.loseAt ?? 3);
    const isMine = r.mines.includes(index);
    if (mustLose !== isMine) {
      const mines = [...r.mines];
      if (mustLose) {
        mines[0] = index;
      } else {
        const replacement = Array.from(
          { length: r.size ** 2 },
          (_, i) => i,
        ).find(
          (i) => i !== index && !r!.revealed.includes(i) && !mines.includes(i),
        );
        if (replacement === undefined) return state;
        mines[mines.indexOf(index)] = replacement;
      }
      r = { ...r, mines };
    }
  }
  if (r.mines.includes(index))
    return finish(state, { ...r, revealed: [...r.revealed, index] }, false);
  const next = { ...r, revealed: [...r.revealed, index] };
  return next.revealed.length === r.size ** 2 - r.mines.length
    ? finish(state, next, true)
    : { ...state, round: next };
}
export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
