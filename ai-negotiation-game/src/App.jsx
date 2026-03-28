import React, { useState, useRef } from "react";
import "./App.css";

// Function to create a new AI seller for each round
const createAISeller = (basePrice) => {
  const minPrice = (basePrice * (0.6 + Math.random() * 0.1)).toFixed(2); // random min price
  const targetProfit = (basePrice * (0.9 + Math.random() * 0.05)).toFixed(2); // random target profit
  const strategy = ["firm", "flexible", "counter"];
  let round = 0;

  const respond = (offer) => {
    round += 1;
    const aiStrategy = strategy[Math.floor(Math.random() * strategy.length)];
    let counter = offer;

    if (offer < minPrice) {
      return { reply: `I can't go below $${minPrice}`, counterOffer: minPrice };
    }
    if (aiStrategy === "firm") {
      counter = Math.max(minPrice, offer + (targetProfit - offer) * 0.5);
      return { reply: `Hmm, I can do $${counter.toFixed(2)}`, counterOffer: counter };
    }
    if (aiStrategy === "flexible") {
      counter = Math.max(minPrice, offer - Math.random() * 5);
      return { reply: `Okay, $${counter.toFixed(2)} seems fair`, counterOffer: counter };
    }
    if (aiStrategy === "counter") {
      counter = Math.max(minPrice, offer + Math.random() * 5);
      return { reply: `I counter with $${counter.toFixed(2)}`, counterOffer: counter };
    }
  };

  return { respond, round, minPrice, targetProfit, strategy: strategy[Math.floor(Math.random() * strategy.length)] };
};

export default function App() {
  const basePrice = 150;
  const maxRounds = 3;

  const [chat, setChat] = useState([]);
  const [offer, setOffer] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const [seller, setSeller] = useState(createAISeller(basePrice)); // dynamic seller
  const [leaderboard, setLeaderboard] = useState({
    bestDeal: "?",
    globalRank: "--",
    topPlayers: [
      { name: "Player123", price: 30 },
      { name: "BargainMaster", price: 45 },
      { name: "DealSeeker", price: 55 },
    ],
  });

  const sendOffer = () => {
    if (!offer) return;
    const userOffer = parseFloat(offer);
    const aiResponse = seller.respond(userOffer);

    setChat((prev) => [
      ...prev,
      { sender: "You", message: `$${userOffer.toFixed(2)}` },
      { sender: "AI Seller", message: aiResponse.reply },
    ]);

    setOffer("");

    if (userOffer >= seller.minPrice || seller.round >= maxRounds) {
      setGameOver(true);

      const finalPrice = Math.max(userOffer, seller.minPrice);
      setChat((prev) => [
        ...prev,
        { sender: "System", message: `Negotiation ended! Final price: $${finalPrice.toFixed(2)}` },
      ]);

      // Update leaderboard dynamically
      setLeaderboard((prev) => ({
        ...prev,
        bestDeal: `$${finalPrice.toFixed(2)}`,
        globalRank: Math.floor(Math.random() * 100) + 1, // random rank for demo
      }));
    }
  };

  // Reset game for next deal
  const nextDeal = () => {
    const newSeller = createAISeller(basePrice);
    setSeller(newSeller);  // update left panel
    setChat([]);           // clear chat
    setOffer("");          // clear input
    setGameOver(false);    // enable game
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Negotiation Challenge 💰</h1>
      <p className="game-subtitle">Can you get the best deal?</p>

      <div className="game-main">
        {/* Left Panel - AI Seller */}
        <div className="panel seller-panel">
          <div className="seller-avatar">🤖</div>
          <p>The starting price for this gadget is ${basePrice}. Make your offer!</p>
          <div className="seller-profile">
            <div>Minimum Price: ${seller.minPrice}</div>
            <div>Target Profit: ${seller.targetProfit}</div>
            <div>Toughness: {seller.strategy}</div>
          </div>
        </div>

        {/* Center Panel - Product & Chat */}
        <div className="panel product-panel">
          <div className="product-image">⌚</div>
          <p>Current Price: ${basePrice}</p>
          <p>Rounds Left: {maxRounds - seller.round}</p>

          <div className="chat-box">
            {chat.map((c, idx) => (
              <p key={idx} className="chat-message">
                <strong>{c.sender}:</strong> {c.message}
              </p>
            ))}
          </div>

          {!gameOver ? (
            <div className="input-area">
              <input
                type="number"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="Enter your offer..."
              />
              <button onClick={sendOffer}>Submit Offer</button>
              <button className="persuade-btn">Use Persuade Tactic</button>
            </div>
          ) : (
            <>
              <p className="game-over">🎉 Game over! Try again to beat the AI.</p>
              <button onClick={nextDeal} className="next-deal-btn">
                🔄 Next Deal
              </button>
            </>
          )}
        </div>

        {/* Right Panel - Leaderboard */}
        <div className="panel leaderboard-panel">
          <h3>Your Progress</h3>
          <p>Best Deal: {leaderboard.bestDeal}</p>
          <p>Global Rank: {leaderboard.globalRank}</p>
          <h3>Leaderboard</h3>
          <ol>
            {leaderboard.topPlayers.map((player, idx) => (
              <li key={idx}>
                {player.name} – ${player.price}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
