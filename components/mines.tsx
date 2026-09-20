"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Diamond,
  SketchLogo,
  Bomb,
  Shuffle,
  Info,
  SpeakerHigh,
  SpeakerSlash,
  CaretRight,
  ShieldCheck,
  ArrowLeft,
  X,
} from "@phosphor-icons/react";
import { useGame, Logo } from "./shell";
import {
  finish,
  makeMines,
  type Round,
  multiplier,
  randomInt,
  reveal,
} from "@/lib/game";
import { currencies, formatMoney, type Currency } from "@/lib/currency";
export function Mines() {
  const { state, setState, ready, currency, format } = useGame();
  const [bet, setBet] = useState("10.00");
  const [size, setSize] = useState(5);
  const [mineCount, setMineCount] = useState(3);
  const [error, setError] = useState("");
  const [sound, setSound] = useState(false);
  const [help, setHelp] = useState(false);
  const r = state.round;
  const [result, setResult] = useState<{
    round: Round;
    currency: Currency;
  } | null>(null);
  const previous = useRef({ status: r?.status, currency });
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      previous.current.currency === currency &&
      previous.current.status === "playing" &&
      r?.status === "won"
    ) {
      setResult({ round: r, currency });
    } else if (
      previous.current.currency !== currency ||
      r?.status === "playing"
    )
      setResult(null);
    previous.current = { status: r?.status, currency };
  }, [r, currency]);
  useEffect(() => {
    if (!result) return;
    if (window.matchMedia("(max-width: 600px)").matches)
      resultRef.current?.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setResult(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result]);
  const active = r?.status === "playing";
  const boardSize = r?.size || size;
  const count = r?.mines.length || mineCount;
  const picks = r?.revealed.filter((i) => !r.mines.includes(i)).length || 0;
  const mult = multiplier(boardSize ** 2, count, picks);
  const total = boardSize ** 2;
  const next = multiplier(total, count, Math.min(picks + 1, total - count));
  function beep(lost = false) {
    if (!sound) return;
    try {
      const a = new AudioContext();
      const o = a.createOscillator();
      const g = a.createGain();
      o.connect(g);
      g.connect(a.destination);
      o.frequency.value = lost ? 130 : 680;
      g.gain.setValueAtTime(0.04, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.15);
      o.start();
      o.stop(a.currentTime + 0.15);
      o.onended = () => a.close();
    } catch {}
  }
  function start(mode: "lose" | "win") {
    const amount = Math.round(Number(bet) * 100);
    if (!Number.isFinite(amount) || amount < 1) {
      setError(`Enter a bet of at least ${format(1)}.`);
      return;
    }
    if (amount > state.balance) {
      setError("Not enough virtual credits. Top up your wallet.");
      return;
    }
    setError("");
    setState((s) =>
      s.round?.status === "playing" || amount > s.balance
        ? s
        : {
            ...s,
            balance: s.balance - amount,
            round: {
              mode,
              loseAt:
                mode === "lose"
                  ? Math.min(3 + randomInt(3), size ** 2 - mineCount)
                  : undefined,
              size,
              mines: makeMines(size ** 2, mineCount),
              revealed: [],
              bet: amount,
              status: "playing",
              payout: 0,
            },
          },
    );
  }
  function pick(i: number) {
    beep(
      r?.mode
        ? r.mode === "lose" && r.revealed.length + 1 >= (r.loseAt ?? 3)
        : r?.mines.includes(i),
    );
    setState((s) => reveal(s, i));
  }
  function cashout() {
    setState((s) =>
      s.round?.status === "playing" ? finish(s, s.round, true) : s,
    );
    beep();
  }
  function random() {
    if (!r || !active) return;
    const options = Array.from({ length: total }, (_, i) => i).filter(
      (i) => !r.revealed.includes(i),
    );
    pick(options[randomInt(options.length)]);
  }
  return (
    <div className="content mines-page">
      <div className="breadcrumb">
        <Link href="/">
          <ArrowLeft />
          Casino
        </Link>
        <CaretRight size={13} />
        <span>Stake Originals</span>
        <CaretRight size={13} />
        <strong>Mines</strong>
      </div>
      <div className="game-title">
        <div>
          <Diamond size={28} weight="fill" />
          <h1>Mines</h1>
          <span className="original-tag">STAKE ORIGINALS</span>
        </div>
      </div>
      <section className="game-panel">
        <div className="game-controls">
          <div className="manual-tab">
            Manual <span>You’re in control</span>
          </div>
          <label htmlFor="bet">
            Bet Amount <span>{currency}</span>
          </label>
          <div className="bet-input">
            <div>
              <input
                id="bet"
                type="number"
                step="0.01"
                min="0.01"
                value={bet}
                disabled={active}
                onChange={(e) => setBet(e.target.value)}
              />
              <span className="coin">{currencies[currency].symbol}</span>
            </div>
            <button
              disabled={active}
              onClick={() => setBet(Math.max(0.01, Number(bet) / 2).toFixed(2))}
            >
              ½
            </button>
            <button
              disabled={active}
              onClick={() =>
                setBet(
                  Math.min(state.balance / 100, Number(bet) * 2).toFixed(2),
                )
              }
            >
              2×
            </button>
          </div>
          <div className="control-pair">
            <div>
              <label htmlFor="size">Grid Size</label>
              <select
                id="size"
                disabled={active}
                value={active ? boardSize : size}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setSize(n);
                  setMineCount(Math.min(mineCount, n * n - 1));
                  setState((s) => ({ ...s, round: null }));
                }}
              >
                {[3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} × {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mine-count">
                Mines <Bomb size={13} />
              </label>
              <select
                id="mine-count"
                disabled={active}
                value={active ? count : mineCount}
                onChange={(e) => {
                  setMineCount(Number(e.target.value));
                  setState((s) => ({ ...s, round: null }));
                }}
              >
                {Array.from({ length: size ** 2 - 1 }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n}>{n}</option>
                  ),
                )}
              </select>
            </div>
          </div>
          <div className="difficulty">
            <span>Risk level</span>
            <strong>
              {(active ? count / total : mineCount / size ** 2) < 0.2
                ? "Low"
                : (active ? count / total : mineCount / size ** 2) < 0.45
                  ? "Medium"
                  : "High"}
            </strong>
            <div>
              {[1, 2, 3, 4, 5].map((n) => (
                <i
                  key={n}
                  className={
                    n <=
                    Math.ceil(
                      (active ? count / total : mineCount / size ** 2) * 5,
                    )
                      ? "lit"
                      : ""
                  }
                />
              ))}
            </div>
          </div>
          <button
            className="green-button bet-button"
            disabled={!ready}
            onClick={(event) => {
              if (active) {
                cashout();
                return;
              }
              const bounds = event.currentTarget.getBoundingClientRect();
              // Keyboard/assistive activation uses the right-half default.
              const leftHalf =
                event.detail !== 0 &&
                event.clientX < bounds.left + bounds.width / 2;
              start(leftHalf ? "lose" : "win");
            }}
          >
            {active ? `Cash Out · ${format(Math.floor(r.bet * mult))}` : "Bet"}
            {!active && <Diamond size={19} weight="fill" />}
          </button>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {active && (
            <button className="secondary-button random-button" onClick={random}>
              <Shuffle size={18} />
              Pick a random tile
            </button>
          )}
          <div className="profit-box">
            <label>
              Total Profit <span>({mult.toFixed(2)}×)</span>
            </label>
            <strong
              className={
                r?.status === "lost" ? "red-text" : picks ? "green-text" : ""
              }
            >
              {format(
                r?.status === "lost"
                  ? -r.bet
                  : r?.status === "won"
                    ? r.payout - r.bet
                    : Math.floor((r?.bet || 0) * mult) - (r?.bet || 0),
              )}
            </strong>
            <Diamond size={21} weight="fill" />
          </div>
          <div className="control-note">
            <ShieldCheck size={17} />
            <span>
              Virtual credits. Real excitement.
              <br />
              No deposits or real money.
            </span>
          </div>
        </div>
        <div className="board-area">
          <div className="board-top">
            <span>
              <Diamond weight="fill" className="green-text" />{" "}
              {total - count - picks} gems
            </span>
            <span>
              <Bomb weight="fill" /> {count} mines
            </span>
          </div>
          <div
            className={`mine-grid ${r?.status === "lost" ? "lost-board" : ""}`}
            style={{ gridTemplateColumns: `repeat(${boardSize},1fr)` }}
          >
            {Array.from({ length: total }, (_, i) => {
              const revealed = r?.revealed.includes(i);
              const show = revealed || (r && r.status !== "playing");
              const bomb = r?.mines.includes(i);
              return (
                <button
                  key={`${boardSize}-${i}`}
                  aria-label={`Tile ${i + 1}${show ? (bomb ? ", mine" : ", gem") : ""}`}
                  className={`mine-tile ${show ? (bomb ? "is-bomb" : "is-gem") : ""} ${show && !revealed ? "unpicked" : ""} ${bomb && revealed ? "exploded" : ""}`}
                  disabled={!active || revealed}
                  onClick={() => pick(i)}
                >
                  {show ? (
                    bomb ? (
                      <Bomb weight="fill" />
                    ) : (
                      <SketchLogo weight="fill" />
                    )
                  ) : (
                    <span />
                  )}
                </button>
              );
            })}
          </div>
          {result && (
            <div
              className="win-result"
              ref={resultRef}
              role="dialog"
              aria-label="Bet result"
              aria-modal="false"
            >
              <button
                className="win-close"
                aria-label="Dismiss bet result"
                onClick={() => setResult(null)}
              >
                <X size={17} />
              </button>
              <SketchLogo size={30} weight="fill" aria-hidden="true" />
              <strong className="win-multiplier">
                {multiplier(
                  result.round.size ** 2,
                  result.round.mines.length,
                  result.round.revealed.length,
                ).toFixed(2)}
                ×
              </strong>
              <div className="win-divider" />
              <span className="win-label">TOTAL PROFIT</span>
              <strong className="win-profit" data-testid="result-profit">
                {formatMoney(
                  result.round.payout - result.round.bet,
                  result.currency,
                )}
              </strong>
              <span className="win-payout">
                Payout{" "}
                <b>{formatMoney(result.round.payout, result.currency)}</b>
              </span>
              <span className="win-currency">{result.currency}</span>
            </div>
          )}
          <div
            className={`board-status ${r?.status === "won" ? "won" : r?.status === "lost" ? "lost" : ""}`}
            role="status"
            aria-live="polite"
          >
            {!r ? (
              <>
                <Diamond size={17} />
                Place your bet to start uncovering gems
              </>
            ) : r.status === "lost" ? (
              <>
                <Bomb size={18} />
                You hit a mine. Try a new round.
              </>
            ) : r.status === "won" ? (
              <>
                <Diamond size={18} weight="fill" />
                Cashed out {format(r.payout)} at {mult.toFixed(2)}×
              </>
            ) : (
              <>
                Next gem <strong>{next.toFixed(2)}×</strong>
                <span>·</span>Pick a tile or cash out
              </>
            )}
          </div>
        </div>
        <div className="game-toolbar">
          <button
            aria-label={sound ? "Mute sound" : "Enable sound"}
            onClick={() => setSound(!sound)}
          >
            {sound ? <SpeakerHigh size={19} /> : <SpeakerSlash size={19} />}
          </button>
          <button aria-label="Game information" onClick={() => setHelp(!help)}>
            <Info size={19} />
          </button>
          <Logo />
          <button onClick={() => setHelp(!help)}>
            <ShieldCheck size={16} />
            Game rules
          </button>
        </div>
      </section>
      {help && (
        <div className="info-panel">
          <h3>How Mines works</h3>
          <p>
            The left half of Bet starts a preset-loss round: a mine appears on
            pick 3, 4, or 5. Boards with fewer safe tiles lose on their final
            available pick. The right half starts an always-win round: every
            pick reveals a gem, with automatic cash-out after all gems. You can
            cash out early in either mode. Mine positions adapt to the selected
            outcome; these rounds are not random or provably fair. Payouts use
            the displayed multiplier with a 1% house edge.
          </p>
          <p>
            This is a virtual-credit game, not a verified real-money or provably
            fair casino system.
          </p>
        </div>
      )}
      <div className="under-game">
        <div>
          <h2>Every gem is a new possibility.</h2>
          <p>Set your risk. Uncover gems. Know when to take the win.</p>
        </div>
        <button className="secondary-button" onClick={() => setHelp(!help)}>
          <Info size={18} />
          How to play
        </button>
      </div>
      <section className="history">
        <div className="section-heading">
          <h2>My Bets</h2>
          <span className="muted">Your last 50 rounds</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Time</th>
                <th>Bet Amount</th>
                <th>Multiplier</th>
                <th>Payout</th>
              </tr>
            </thead>
            <tbody>
              {state.history.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Diamond size={16} weight="fill" />
                    Mines
                  </td>
                  <td>
                    {new Date(e.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>{format(e.bet)}</td>
                  <td>{e.multiplier.toFixed(2)}×</td>
                  <td className={e.payout ? "green-text" : ""}>
                    {format(e.payout)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!state.history.length && (
            <div className="empty-state">
              <Diamond size={25} />
              <p>Your next story starts with a gem.</p>
              <small>Play a round to see your results here.</small>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
