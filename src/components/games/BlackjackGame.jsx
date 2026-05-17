import { useState } from "react";

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// ===== DECK CREATION =====
function createDeck() {
  return suits
    .flatMap((suit) =>
      ranks.map((rank) => ({
        id: `${rank}${suit}-${Math.random()}`,
        rank,
        suit,
        color:
          suit === "♥" || suit === "♦"
            ? "text-rose-600"
            : "text-slate-950",
      }))
    )
    .sort(() => Math.random() - 0.5);
}

// ===== CARD / HAND HELPERS =====
function getCardValue(card) {
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  if (card.rank === "A") return 11;
  return Number(card.rank);
}

function getHandInfo(hand) {
  let total = hand.reduce((sum, card) => sum + getCardValue(card), 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return {
    total,
    soft: aces > 0,
    blackjack: hand.length === 2 && total === 21,
    bust: total > 21,
  };
}

function canSplitHand(hand) {
  if (hand.length !== 2) return false;
  return getCardValue(hand[0]) === getCardValue(hand[1]);
}

function drawCard(currentDeck) {
  const [card, ...remainingDeck] = currentDeck;
  return { card, remainingDeck };
}

function makePlayerHand(cards, label = "Hand 1") {
  return {
    id: `${label}-${Math.random()}`,
    label,
    cards,
    completed: false,
    result: "",
  };
}

// ===== PLAYING CARD COMPONENT =====
function Card({ card, hidden = false, compact = false }) {
  const cardClass = compact
    ? "h-[70px] w-[48px] rounded-lg p-1.5"
    : "h-[82px] w-[56px] rounded-xl p-2";

  const hiddenClass = compact
    ? "h-[70px] w-[48px] rounded-lg"
    : "h-[82px] w-[56px] rounded-xl";

  const rankClass = compact ? "text-[11px]" : "text-xs";
  const suitClass = compact ? "text-xl" : "text-2xl";

  if (hidden) {
    return (
      <div
        className={`flex ${hiddenClass} items-center justify-center border-4 border-white/30 bg-slate-800 shadow`}
      >
        <div className="rounded-md border border-white/20 px-2 py-3 text-xs text-white/60">
          ★
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${cardClass} flex-col justify-between bg-white shadow`}>
      <div className={`${rankClass} font-black ${card.color}`}>
        {card.rank}
      </div>

      <div
        className={`text-center ${suitClass} font-black leading-none ${card.color}`}
      >
        {card.suit}
      </div>

      <div className={`rotate-180 ${rankClass} font-black ${card.color}`}>
        {card.rank}
      </div>
    </div>
  );
}

// ===== DEALER HAND DISPLAY =====
function DealerHand({ hand, hideFirstCard, compact = false, tr }) {
  const info = getHandInfo(hand);
  const value = hideFirstCard ? "?" : info.total;

  return (
    <div className="grid h-full grid-cols-[112px_1fr] items-center gap-3 rounded-2xl bg-white/10 p-3">
      <div>
        <h3 className="text-xl font-black text-white">
          {tr("blackjack_dealer", "Dealer")}
        </h3>

        <div className="text-xs font-bold text-white/50">
          {tr("blackjack_total", "Total")}: {value}
        </div>
      </div>

      <div className="flex min-h-0 flex-wrap items-center gap-2 overflow-hidden">
        {hand.length === 0 ? (
          <div className="flex h-[82px] w-[56px] items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-[10px] font-bold text-white/40">
            {tr("blackjack_waiting", "Waiting")}
          </div>
        ) : (
          hand.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              hidden={hideFirstCard && index === 0}
              compact={compact}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ===== PLAYER HANDS DISPLAY / CONTROLS =====
function PlayerHandsFrame({
  hands,
  activeHandIndex,
  phase,
  splitUsed,
  onHit,
  onStand,
  onSplit,
  tr,
}) {
  const hasSplit = hands.length > 1;
  const activeHand = hands[activeHandIndex];
  const canAct = phase === "playerTurn" && activeHand;
  const canSplit = Boolean(
    canAct && !splitUsed && hands.length === 1 && canSplitHand(activeHand.cards)
  );

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl bg-white/10 p-3">
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-black text-white">
            {tr("blackjack_you", "You")}
          </h3>

          <div className="text-xs font-bold text-white/50">
            {hasSplit
              ? tr(
                  "blackjack_split_controls",
                  "Controls affect highlighted hand."
                )
              : tr("blackjack_player_hand", "Player hand")}
          </div>
        </div>

        {canAct && (
          <div className="rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-950">
            {tr("blackjack_playing", "Playing")} {activeHand.label}
          </div>
        )}
      </div>

      <div
        className={`grid min-h-0 flex-1 gap-2 ${
          hasSplit ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {hands.length === 0 ? (
          <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-2">
            <div className="flex h-[82px] w-[56px] items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-[10px] font-bold text-white/40">
              {tr("blackjack_waiting", "Waiting")}
            </div>
          </div>
        ) : (
          hands.map((hand, index) => {
            const info = getHandInfo(hand.cards);
            const active = phase === "playerTurn" && index === activeHandIndex;

            return (
              <div
                key={hand.id}
                className={`flex min-h-0 flex-col rounded-2xl p-2 transition ${
                  active
                    ? "bg-white/15 ring-2 ring-emerald-300"
                    : "bg-white/5 ring-1 ring-white/10"
                }`}
              >
                <div className="mb-1 flex shrink-0 items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-black text-white">
                      {hand.label}
                    </div>

                    <div className="text-[10px] font-bold text-white/50">
                      {tr("blackjack_total", "Total")}: {info.total}
                      {info.soft ? ` ${tr("blackjack_soft", "soft")}` : ""}
                    </div>
                  </div>

                  {hand.result && (
                    <div className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-950">
                      {hand.result}
                    </div>
                  )}
                </div>

                <div className="flex min-h-0 flex-1 flex-wrap items-center gap-1.5 overflow-hidden">
                  {hand.cards.map((card) => (
                    <Card key={card.id} card={card} compact={hasSplit} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {canAct && (
        <div className="mt-2 grid shrink-0 grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onHit}
            className="rounded-xl bg-emerald-300 px-3 py-2 text-sm font-black text-emerald-950 shadow"
          >
            {tr("blackjack_hit", "Hit")}
          </button>

          <button
            type="button"
            onClick={onStand}
            className="rounded-xl bg-sky-300 px-3 py-2 text-sm font-black text-sky-950 shadow"
          >
            {tr("blackjack_stand", "Stand")}
          </button>

          <button
            type="button"
            onClick={onSplit}
            disabled={!canSplit}
            className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-black text-amber-950 shadow disabled:opacity-40"
          >
            {tr("blackjack_split", "Split")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlackjackGame({ t = (key) => key }) {
  // ===== STATIC TRANSLATION HELPER =====
  function tr(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  // ===== GAME STATE =====
  const [deck, setDeck] = useState(() => createDeck());
  const [dealerHand, setDealerHand] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [message, setMessage] = useState(
    tr("blackjack_start_message", "Tap Deal to start a practice round.")
  );
  const [splitUsed, setSplitUsed] = useState(false);

  // ===== SCORE STATE =====
  const [score, setScore] = useState({
    player: 0,
    dealer: 0,
    pushes: 0,
    blackjack: 0,
  });

  // ===== SCORE RESET =====
  function resetScore() {
    setScore({
      player: 0,
      dealer: 0,
      pushes: 0,
      blackjack: 0,
    });
  }

  const activeHand = playerHands[activeHandIndex];
  const hasSplit = playerHands.length > 1;

  // ===== SCORE UPDATE HELPER =====
  function scoreResult(result) {
    if (result === "Blackjack") {
      setScore((current) => ({
        ...current,
        player: current.player + 2,
        blackjack: current.blackjack + 1,
      }));
      return;
    }

    if (result === "Win") {
      setScore((current) => ({ ...current, player: current.player + 1 }));
      return;
    }

    if (result === "Dealer") {
      setScore((current) => ({ ...current, dealer: current.dealer + 1 }));
      return;
    }

    if (result === "Push") {
      setScore((current) => ({ ...current, pushes: current.pushes + 1 }));
    }
  }

  // ===== FINAL RESULT RESOLUTION =====
  function applyFinalResults(
    finalPlayerHands,
    finalDealerHand,
    hadSplit = splitUsed
  ) {
    const dealerInfo = getHandInfo(finalDealerHand);

    const resolvedHands = finalPlayerHands.map((hand) => {
      const playerInfo = getHandInfo(hand.cards);
      let result = "";

      if (playerInfo.blackjack && !dealerInfo.blackjack && !hadSplit) {
        result = "Blackjack";
      } else if (playerInfo.blackjack && dealerInfo.blackjack && !hadSplit) {
        result = "Push";
      } else if (playerInfo.bust) {
        result = "Dealer";
      } else if (dealerInfo.bust) {
        result = "Win";
      } else if (playerInfo.total > dealerInfo.total) {
        result = "Win";
      } else if (dealerInfo.total > playerInfo.total) {
        result = "Dealer";
      } else {
        result = "Push";
      }

      scoreResult(result);

      return {
        ...hand,
        completed: true,
        result,
      };
    });

    setPlayerHands(resolvedHands);
    setPhase("roundOver");
    setActiveHandIndex(0);
    setMessage(
      tr("blackjack_round_complete", "Round complete. Tap Deal for a new round.")
    );
  }

  // ===== DEALER PLAY LOOP =====
  function runDealerAndFinish(
    finalPlayerHands,
    currentDeck,
    currentDealerHand,
    hadSplit = splitUsed
  ) {
    let nextDeck = currentDeck;
    let nextDealerHand = [...currentDealerHand];

    while (true) {
      const info = getHandInfo(nextDealerHand);
      if (info.total >= 17) break;

      const drawn = drawCard(nextDeck);
      nextDealerHand = [...nextDealerHand, drawn.card];
      nextDeck = drawn.remainingDeck;
    }

    setDeck(nextDeck);
    setDealerHand(nextDealerHand);
    applyFinalResults(finalPlayerHands, nextDealerHand, hadSplit);
  }

  // ===== PLAYER HAND FINISH ROUTER =====
  function finishPlayerHand(updatedHands, currentDeck = deck, reason = "") {
    const nextUnfinishedIndex = updatedHands.findIndex(
      (hand, index) => index > activeHandIndex && !hand.completed
    );

    if (nextUnfinishedIndex >= 0) {
      setPlayerHands(updatedHands);
      setActiveHandIndex(nextUnfinishedIndex);
      setMessage(
        `${tr("blackjack_playing", "Playing")} ${updatedHands[nextUnfinishedIndex].label}.`
      );
      return;
    }

    setPlayerHands(updatedHands);

    const allBust = updatedHands.every((hand) => getHandInfo(hand.cards).bust);

    if (allBust) {
      const resolvedHands = updatedHands.map((hand) => ({
        ...hand,
        completed: true,
        result: "Dealer",
      }));

      resolvedHands.forEach(() => scoreResult("Dealer"));

      setPlayerHands(resolvedHands);
      setPhase("roundOver");
      setMessage(
        tr("blackjack_all_busted", "All player hands busted. Dealer wins.")
      );
      return;
    }

    setPhase("dealerTurn");
    setMessage(reason || tr("blackjack_dealer_playing", "Dealer is playing."));
    runDealerAndFinish(updatedHands, currentDeck, dealerHand);
  }

  // ===== DEAL NEW ROUND =====
  function dealRound() {
    let freshDeck = createDeck();
    const playerCards = [];
    const dealerCards = [];

    for (let i = 0; i < 2; i += 1) {
      let drawn = drawCard(freshDeck);
      playerCards.push(drawn.card);
      freshDeck = drawn.remainingDeck;

      drawn = drawCard(freshDeck);
      dealerCards.push(drawn.card);
      freshDeck = drawn.remainingDeck;
    }

    const initialPlayerHand = makePlayerHand(
      playerCards,
      tr("blackjack_hand_1", "Hand 1")
    );
    const playerInfo = getHandInfo(playerCards);
    const dealerInfo = getHandInfo(dealerCards);

    setDeck(freshDeck);
    setDealerHand(dealerCards);
    setPlayerHands([initialPlayerHand]);
    setActiveHandIndex(0);
    setSplitUsed(false);

    if (playerInfo.blackjack || dealerInfo.blackjack) {
      applyFinalResults([initialPlayerHand], dealerCards, false);

      if (playerInfo.blackjack && dealerInfo.blackjack) {
        setMessage(tr("blackjack_both_blackjack", "Both have blackjack. Push."));
      } else if (playerInfo.blackjack) {
        setMessage(tr("blackjack_you_win", "Blackjack! You win this round."));
      } else {
        setMessage(tr("blackjack_dealer_blackjack", "Dealer has blackjack."));
      }

      return;
    }

    setPhase("playerTurn");
    setMessage(
      tr("blackjack_your_turn", "Your turn. Hit, stand, or split if available.")
    );
  }

  // ===== PLAYER HIT =====
  function hit() {
    if (phase !== "playerTurn" || !activeHand) return;

    const drawn = drawCard(deck);
    const nextDeck = drawn.remainingDeck;

    const updatedHands = playerHands.map((hand, index) => {
      if (index !== activeHandIndex) return hand;

      const nextCards = [...hand.cards, drawn.card];
      const info = getHandInfo(nextCards);

      return {
        ...hand,
        cards: nextCards,
        completed: info.bust || info.total === 21,
        result: info.bust ? "Bust" : info.total === 21 ? "21" : "",
      };
    });

    setDeck(nextDeck);

    const updatedActiveInfo = getHandInfo(updatedHands[activeHandIndex].cards);

    if (updatedActiveInfo.bust) {
      setMessage(
        `${updatedHands[activeHandIndex].label} ${tr("blackjack_busted", "busted")}.`
      );
      finishPlayerHand(updatedHands, nextDeck);
      return;
    }

    if (updatedActiveInfo.total === 21) {
      setMessage(
        `${updatedHands[activeHandIndex].label} ${tr("blackjack_reached_21", "reached 21")}.`
      );
      finishPlayerHand(
        updatedHands,
        nextDeck,
        tr("blackjack_dealer_playing", "Dealer is playing.")
      );
      return;
    }

    setPlayerHands(updatedHands);
    setMessage(tr("blackjack_hit_or_stand", "Hit or stand."));
  }

  // ===== PLAYER STAND =====
  function stand() {
    if (phase !== "playerTurn" || !activeHand) return;

    const updatedHands = playerHands.map((hand, index) =>
      index === activeHandIndex
        ? { ...hand, completed: true, result: "Stood" }
        : hand
    );

    finishPlayerHand(updatedHands);
  }

  // ===== PLAYER SPLIT =====
  function split() {
    if (
      phase !== "playerTurn" ||
      !activeHand ||
      splitUsed ||
      playerHands.length !== 1 ||
      !canSplitHand(activeHand.cards)
    ) {
      return;
    }

    let nextDeck = deck;

    const firstDraw = drawCard(nextDeck);
    nextDeck = firstDraw.remainingDeck;

    const secondDraw = drawCard(nextDeck);
    nextDeck = secondDraw.remainingDeck;

    const firstHand = makePlayerHand(
      [activeHand.cards[0], firstDraw.card],
      tr("blackjack_hand_1", "Hand 1")
    );
    const secondHand = makePlayerHand(
      [activeHand.cards[1], secondDraw.card],
      tr("blackjack_hand_2", "Hand 2")
    );

    const firstInfo = getHandInfo(firstHand.cards);
    const secondInfo = getHandInfo(secondHand.cards);

    firstHand.completed = firstInfo.total === 21;
    firstHand.result = firstInfo.total === 21 ? "21" : "";

    secondHand.completed = secondInfo.total === 21;
    secondHand.result = secondInfo.total === 21 ? "21" : "";

    const updatedHands = [firstHand, secondHand];
    const firstPlayableIndex = updatedHands.findIndex((hand) => !hand.completed);

    setDeck(nextDeck);
    setPlayerHands(updatedHands);
    setSplitUsed(true);

    if (firstPlayableIndex === -1) {
      setActiveHandIndex(0);
      setPhase("dealerTurn");
      setMessage(
        tr(
          "blackjack_split_both_21",
          "Both split hands reached 21. Dealer is playing."
        )
      );
      runDealerAndFinish(updatedHands, nextDeck, dealerHand, true);
      return;
    }

    setActiveHandIndex(firstPlayableIndex);
    setMessage(
      `${tr("blackjack_split_once", "Split once. Playing")} ${
        updatedHands[firstPlayableIndex].label
      }.`
    );
  }

  const hideDealerFirstCard = phase === "playerTurn" && dealerHand.length > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-5 text-white">
      {/* ===== BLACKJACK HEADER / SCOREBOARD ===== */}
      <div className="grid shrink-0 gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-white/50">
            {tr("blackjack_practice", "Practice blackjack")}
          </div>

          <h3 className="text-3xl font-black leading-tight">
            {tr("games_blackjack", "Blackjack")}
          </h3>

          <p className="mt-1 max-w-2xl text-xs text-white/60">
            {tr(
              "blackjack_disclaimer",
              "Entertainment only. Dealer stands on soft 17. One split allowed."
            )}
          </p>
        </div>

        <div className="flex items-stretch gap-2">
          <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-white/10 p-2 text-center text-xs font-black">
            <div>
              <div className="text-white/50">{tr("blackjack_you", "You")}</div>
              <div className="text-xl">{score.player}</div>
            </div>

            <div>
              <div className="text-white/50">
                {tr("blackjack_dealer", "Dealer")}
              </div>
              <div className="text-xl">{score.dealer}</div>
            </div>

            <div>
              <div className="text-white/50">{tr("blackjack_push", "Push")}</div>
              <div className="text-xl">{score.pushes}</div>
            </div>

            <div>
              <div className="text-white/50">BJ</div>
              <div className="text-xl">{score.blackjack}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={resetScore}
            className="rounded-2xl bg-white/10 px-3 text-[10px] font-black leading-tight text-white hover:bg-white/20"
          >
            {tr("blackjack_reset_score", "Reset")}
          </button>
        </div>
      </div>

      {/* ===== ROUND STATUS MESSAGE ===== */}
      <div className="mt-3 flex h-[42px] shrink-0 items-center overflow-hidden rounded-2xl bg-white/10 px-4 text-sm font-black text-white">
        {message}
      </div>

      {/* ===== DEALER / PLAYER TABLE ===== */}
      <div className="mt-3 grid min-h-0 flex-1 grid-rows-[104px_minmax(0,1fr)] gap-3 overflow-hidden">
        <DealerHand
          hand={dealerHand}
          hideFirstCard={hideDealerFirstCard}
          compact={hasSplit}
          tr={tr}
        />

        <PlayerHandsFrame
          hands={playerHands}
          activeHandIndex={activeHandIndex}
          phase={phase}
          splitUsed={splitUsed}
          onHit={hit}
          onStand={stand}
          onSplit={split}
          tr={tr}
        />
      </div>

      {/* ===== DEAL CONTROL ===== */}
      <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={dealRound}
          className="rounded-2xl bg-white px-5 py-3 text-base font-black text-slate-950 shadow-lg"
        >
          {tr("blackjack_deal", "Deal")}
        </button>

        <p className="text-xs text-white/50">
          {tr(
            "blackjack_dealer_reveal",
            "Dealer reveals after all player hands finish."
          )}
        </p>
      </div>
    </div>
  );
}
