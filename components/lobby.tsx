"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  House,
  Diamond,
  DiceFive,
  Fire,
  Lightning,
  Spade,
  GameController,
  MagnifyingGlass,
  ArrowRight,
  CaretLeft,
  CaretRight,
  ShieldCheck,
  Trophy,
  Gift,
} from "@phosphor-icons/react";
import { useGame } from "./shell";
const games = [
  { id: "mines", name: "Mines", tag: "PLAY NOW" },
  { id: "plinko", name: "Plinko" },
  { id: "dice", name: "Dice" },
  { id: "limbo", name: "Limbo" },
  { id: "keno", name: "Keno" },
  { id: "hilo", name: "Hilo" },
];
export function Gem({ className = "" }: { className?: string }) {
  return (
    <div className={`gem-art ${className}`}>
      <div className="gem-top" />
      <div className="gem-left" />
      <div className="gem-right" />
      <div className="gem-center" />
    </div>
  );
}
export function Lobby() {
  const { format } = useGame();
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Lobby");
  const tabs = [
    { name: "Lobby", icon: House },
    { name: "Stake Originals", icon: DiceFive },
    { name: "Slots", icon: Spade },
    { name: "Live Casino", icon: GameController },
    { name: "New Releases", icon: Lightning },
  ];
  const visible = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="content lobby">
      <div className="page-intro">
        <h1>
          <GameController size={24} weight="fill" />
          Casino
        </h1>
        <span>
          <span className="status-dot" /> Your next favourite starts here
        </span>
      </div>
      <section className="promos">
        <div className="hero-promo">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-logo">Stake</span> ORIGINALS
            </span>
            <h2>
              A little risk.
              <br />
              <span>A lot of possibility.</span>
            </h2>
            <p>
              Find the gems. Dodge the mines.
              <br />
              Make your next move count.
            </p>
            <Link href="/casino/games/mines" className="green-button">
              Play Mines <ArrowRight size={18} weight="bold" />
            </Link>
            <small>
              <ShieldCheck size={13} /> Play with virtual credits
            </small>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="floating-tile tile-one">
              <Gem />
            </div>
            <div className="floating-tile tile-two">
              <Gem />
            </div>
            <div className="floating-tile tile-three">
              <span className="bomb-art">✹</span>
            </div>
            <span className="spark spark-one">✦</span>
            <span className="spark spark-two">✦</span>
            <span className="art-label">MINES</span>
          </div>
        </div>
        <div className="side-promos">
          <div className="side-promo vip">
            <div>
              <span className="eyebrow">THE VIP EXPERIENCE</span>
              <h3>
                Every play.
                <br />A level above.
              </h3>
              <span className="promo-caption">
                Make yourself at home <ArrowRight size={14} />
              </span>
            </div>
            <Trophy className="promo-icon" weight="fill" />
          </div>
          <div className="side-promo credit">
            <div>
              <span className="eyebrow">ALL THE FUN. ZERO RISK.</span>
              <h3>
                Your first {format(100000)}
                <br />
                is on us.
              </h3>
              <span className="promo-caption">
                Virtual credits. Real excitement.
              </span>
            </div>
            <Gift className="promo-icon" weight="fill" />
          </div>
        </div>
      </section>
      <div className="search-field">
        <MagnifyingGlass size={21} />
        <input
          ref={searchRef}
          aria-label="Search games"
          placeholder="Search your game"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span>⌘ K</span>
      </div>
      <div className="category-tabs">
        {tabs.map((t) => (
          <button
            key={t.name}
            className={category === t.name ? "selected" : ""}
            onClick={() => setCategory(t.name)}
          >
            <t.icon size={18} weight="fill" />
            {t.name}
          </button>
        ))}
      </div>
      <section id="originals" className="games-section">
        <div className="section-heading">
          <h2>
            <DiceFive size={22} weight="fill" />
            {category === "Lobby" ? "Stake Originals" : category}
          </h2>
          <div>
            <span className="exclusive">EXCLUSIVELY ON STAKE</span>
            <span className="arrows">
              <CaretLeft />
              <CaretRight />
            </span>
          </div>
        </div>
        {category === "Lobby" ||
        category === "Stake Originals" ||
        category === "New Releases" ? (
          <>
            <div className="game-grid">
              {visible.map((g) => (
                <div className="game-item" key={g.id}>
                  {g.id === "mines" ? (
                    <Link
                      className="game-cover playable"
                      href="/casino/games/mines"
                      aria-label="Play Mines"
                    >
                      <Image
                        src={`/games/${g.id}.jpg`}
                        alt={`${g.name} game cover`}
                        width={300}
                        height={400}
                      />
                      <span className="play-cover">
                        Play Mines <ArrowRight />
                      </span>
                    </Link>
                  ) : (
                    <div
                      className="game-cover"
                      aria-label={`${g.name}, display only`}
                    >
                      <Image
                        src={`/games/${g.id}.jpg`}
                        alt={`${g.name} game cover`}
                        width={300}
                        height={400}
                      />
                      <span className="sample-badge">Preview</span>
                    </div>
                  )}
                  <div className="game-caption">
                    <span>{g.name}</span>
                    {g.tag ? (
                      <span className="available-dot">● Play now</span>
                    ) : (
                      <span>Stake Originals</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!visible.length && (
              <div className="empty-state">
                No games found. Try searching for “Mines”.
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            {category} are display-only in this preview. Explore our Stake
            Originals collection.
          </div>
        )}
      </section>
      <section className="mines-callout">
        <div className="callout-symbol">
          <Diamond size={36} weight="fill" />
        </div>
        <div>
          <span className="eyebrow">SIMPLE TO PLAY. HARD TO PUT DOWN.</span>
          <h3>Your next gem is one click away.</h3>
          <p>
            Choose your risk, trust your instincts, and cash out on your terms.
          </p>
        </div>
        <Link className="secondary-button" href="/casino/games/mines">
          Discover Mines <ArrowRight size={17} />
        </Link>
      </section>
      <section id="catalog" className="how-section">
        <div className="section-heading">
          <h2>
            <ShieldCheck size={22} weight="fill" />A better way to play
          </h2>
          <span className="muted">All the experience. None of the stakes.</span>
        </div>
        <div className="benefits">
          <div>
            <span>01</span>
            <h3>Make it your game</h3>
            <p>
              Choose a board and set your difficulty. You’re in control of every
              round.
            </p>
          </div>
          <div>
            <span>02</span>
            <h3>Find your winning moment</h3>
            <p>
              Every gem boosts your multiplier. Keep exploring or take your
              winnings.
            </p>
          </div>
          <div>
            <span>03</span>
            <h3>Just play. Enjoy. Repeat.</h3>
            <p>
              Start with {format(100000)} in virtual credits. Top up your wallet
              whenever you need.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
