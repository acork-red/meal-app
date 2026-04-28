"use client";

import { useState } from "react";

const VIBES = ["Cosy", "Fresh", "Indulgent"];
const TAGS = ["Winter", "Summer", "Quick", "Healthy", "Comfort"];

export default function Home() {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <main className="container">
      <div className="card">
        <h1 className="title">🍽️ What’s for dinner?</h1>

        <p className="subtitle">
          Pick a vibe and we’ll decide for you
        </p>

        {/* Vibes */}
        <div className="row">
          {VIBES.map((vibe) => (
            <button
              key={vibe}
              onClick={() => setSelectedVibe(vibe)}
              className={`pill ${selectedVibe === vibe ? "active" : ""}`}
            >
              {vibe === "Cosy" && "🧣 "}
              {vibe === "Fresh" && "🥗 "}
              {vibe === "Indulgent" && "😋 "}
              {vibe}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div className="row wrap">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`pill small ${
                selectedTags.includes(tag) ? "active" : ""
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button className="primary">
          Suggest meal
        </button>

        {/* Secondary CTA */}
        <button className="secondary">
          Add / Edit meals
        </button>
      </div>
    </main>
  );
}