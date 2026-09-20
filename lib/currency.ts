import type { GameState, WalletState } from "./game";

export const currencies = {
  USD: { symbol: "$", name: "US Dollar", locale: "en-US" },
  INR: { symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  EUR: { symbol: "€", name: "Euro", locale: "en-US" },
  GBP: { symbol: "£", name: "British Pound", locale: "en-GB" },
} as const;
export type Currency = keyof typeof currencies;
export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && Object.hasOwn(currencies, value);
}
export function formatMoney(cents: number, currency: Currency = "USD") {
  return (
    currencies[currency].symbol +
    (cents / 100).toLocaleString(currencies[currency].locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
export function switchCurrency(
  state: GameState,
  currency: Currency,
): GameState {
  const current = state.currency ?? "USD";
  if (
    !isCurrency(currency) ||
    current === currency ||
    state.round?.status === "playing"
  )
    return state;
  const snapshot: WalletState = {
    balance: state.balance,
    round: state.round,
    history: state.history,
  };
  const target = state.wallets?.[currency] ?? {
    balance: 100000,
    round: null,
    history: [],
  };
  return {
    ...state,
    ...target,
    currency,
    wallets: { ...state.wallets, [current]: snapshot },
  };
}
