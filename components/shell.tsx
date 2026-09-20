"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  List,
  House,
  Star,
  Clock,
  Diamond,
  GameController,
  Gift,
  Trophy,
  Headset,
  Globe,
  CaretDown,
  Wallet,
  User,
  ChatCircle,
  DiceFive,
  Fire,
  Spade,
  Lightning,
  X,
  MagnifyingGlass,
  ShieldCheck,
} from "@phosphor-icons/react";
import { initialState, type GameState, money } from "@/lib/game";
const Store = createContext<{
  state: GameState;
  setState: Dispatch<SetStateAction<GameState>>;
  ready: boolean;
}>({ state: initialState, setState: () => {}, ready: false });
export const useGame = () => useContext(Store);
export function Logo() {
  return (
    <span className="logo">
      Stake<span>.</span>
    </span>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState("");
  const path = usePathname();
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("stake-demo-v1") || "null");
      if (
        s &&
        Number.isSafeInteger(s.balance) &&
        s.balance >= 0 &&
        Array.isArray(s.history)
      )
        setState(s);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("stake-demo-v1", JSON.stringify(state));
      } catch {}
  }, [state, ready]);
  useEffect(() => {
    setMenu(false);
  }, [path]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal("");
        setMenu(false);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const nav = [
    { label: "Casino Home", icon: House, href: "/" },
    { label: "Favourites", icon: Star },
    { label: "Recent", icon: Clock },
    { label: "Stake Originals", icon: DiceFive, href: "/#originals" },
    { label: "Slots", icon: Spade, href: "/#catalog" },
    { label: "Live Casino", icon: GameController, href: "/#catalog" },
    { label: "Game Shows", icon: Trophy, href: "/#catalog" },
    { label: "New Releases", icon: Lightning, href: "/#catalog" },
  ];
  return (
    <Store.Provider value={{ state, setState, ready }}>
      <header className="topbar">
        <div className="brand">
          <button
            className="icon-button"
            aria-label="Toggle menu"
            onClick={() => setMenu(!menu)}
          >
            <List size={23} />
          </button>
          <Link href="/" aria-label="Stake home">
            <Logo />
          </Link>
        </div>
        <div className="wallet">
          <span data-testid="balance">
            ${money(state.balance)} <span className="coin">$</span>
            <CaretDown size={12} />
          </span>
          <button className="blue-button" onClick={() => setModal("Wallet")}>
            <Wallet size={18} />
            <span>Wallet</span>
          </button>
        </div>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Profile"
            onClick={() => setModal("Your account")}
          >
            <User size={20} weight="fill" />
          </button>
          <button
            className="icon-button chat-desktop"
            aria-label="Help"
            onClick={() => setModal("How to play")}
          >
            <ChatCircle size={21} weight="fill" />
          </button>
        </div>
      </header>
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="casino-switch">
          <Link href="/">
            <DiceFive weight="fill" /> Casino
          </Link>
          <span>
            <Trophy weight="fill" /> Sports
          </span>
        </div>
        <nav>
          <div className="nav-group">
            {nav.map((n) =>
              n.href ? (
                <Link
                  className={
                    path === "/" && n.label === "Casino Home" ? "active" : ""
                  }
                  href={n.href}
                  key={n.label}
                >
                  <n.icon size={19} weight="fill" />
                  {n.label}
                  {n.label === "Stake Originals" && (
                    <span className="nav-count">6</span>
                  )}
                </Link>
              ) : (
                <button key={n.label} onClick={() => setModal(n.label)}>
                  <n.icon size={19} weight="fill" />
                  {n.label}
                </button>
              ),
            )}
          </div>
          <div className="nav-group">
            <button onClick={() => setModal("Promotions")}>
              <Gift size={19} weight="fill" />
              Promotions
              <CaretDown size={12} />
            </button>
            <button onClick={() => setModal("VIP Club")}>
              <Trophy size={19} weight="fill" />
              VIP Club
            </button>
            <button onClick={() => setModal("Challenges")}>
              <Lightning size={19} weight="fill" />
              Challenges
            </button>
          </div>
          <div className="nav-group">
            <button onClick={() => setModal("How to play")}>
              <Headset size={19} weight="fill" />
              Help & Support
            </button>
            <button onClick={() => setModal("Language")}>
              <Globe size={19} />
              English
              <CaretDown size={12} />
            </button>
          </div>
        </nav>
        <div className="sidebar-bottom">
          <ShieldCheck size={22} />
          <div>
            Play for the experience.
            <small>100% virtual credits. Zero risk.</small>
          </div>
        </div>
      </aside>
      <main className="main">
        {children}
        <footer>
          <Logo />
          <p>
            Made for the fun of the game.
            <br />
            Virtual credits only. Not affiliated with Stake.com.
          </p>
          <span className="footer-note">
            <ShieldCheck size={18} /> Play responsibly · 18+
          </span>
        </footer>
      </main>
      <nav className="mobile-nav">
        <button onClick={() => setMenu(!menu)}>
          <List />
          Browse
        </button>
        <Link href="/">
          <House />
          Casino
        </Link>
        <Link href="/casino/games/mines">
          <Diamond />
          Mines
        </Link>
        <button onClick={() => setModal("Wallet")}>
          <Wallet />
          Wallet
        </button>
        <button onClick={() => setModal("How to play")}>
          <Headset />
          Help
        </button>
      </nav>
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal("")}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={modal}
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              aria-label="Close dialog"
              onClick={() => setModal("")}
            >
              <X size={23} />
            </button>
            <div className="modal-symbol">
              {modal === "Wallet" ? (
                <Wallet size={32} />
              ) : (
                <Diamond size={32} />
              )}
            </div>
            <h2>{modal}</h2>
            {modal === "Wallet" ? (
              <>
                <p>Your balance</p>
                <h1>${money(state.balance)}</h1>
                <p>
                  These are virtual credits, with no monetary value. Top up and
                  keep exploring Mines.
                </p>
                <button
                  className="green-button"
                  disabled={state.round?.status === "playing"}
                  onClick={() => {
                    setState((s) => ({ ...s, balance: s.balance + 100000 }));
                    setModal("");
                  }}
                >
                  Add $1,000 virtual credits
                </button>
                {state.round?.status === "playing" && (
                  <small>Finish your current round to add credits.</small>
                )}
              </>
            ) : modal === "How to play" ? (
              <>
                <p>
                  Choose your bet, board size, and number of mines. More mines
                  means more risk and higher payouts.
                </p>
                <p>
                  Reveal tiles to find gems. Every gem increases your
                  multiplier. Cash out whenever you want; hitting a mine loses
                  your bet.
                </p>
                <Link
                  className="green-button"
                  href="/casino/games/mines"
                  onClick={() => setModal("")}
                >
                  Play Mines
                </Link>
              </>
            ) : (
              <>
                <p>
                  {modal === "Language"
                    ? "The site is available in English."
                    : modal === "Recent"
                      ? "Your completed Mines rounds appear in My Bets on the Mines page."
                      : modal === "Favourites"
                        ? "Mines is ready to play. The other games are display-only samples."
                        : "Explore the casino and play Mines with virtual credits. This feature is a preview in this preview."}
                </p>
                <button className="blue-button" onClick={() => setModal("")}>
                  Got it
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </Store.Provider>
  );
}
