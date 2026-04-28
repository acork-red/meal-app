"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const VIBES = ["Cosy", "Fresh", "Indulgent"];
const TAGS = ["Winter", "Summer", "Quick", "Healthy", "Comfort"];

export default function Home() {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [meal, setMeal] = useState<any | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const getSuggestion = async () => {
    const { data } = await supabase.from("meals").select("*");

    if (!data) return;

    const filtered = data.filter((m) => {
      const vibeMatch = selectedVibe
        ? m.vibes?.includes(selectedVibe)
        : true;

      const tagMatch =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => m.tags?.includes(tag));

      return vibeMatch && tagMatch;
    });

    const pool = filtered.length > 0 ? filtered : data;

    const random = pool[Math.floor(Math.random() * pool.length)];

    setMeal(random);
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
        <button className="primary" onClick={getSuggestion}>
          Suggest meal
        </button>

        {/* RESULT CARD */}
        {meal && (
          <div className="result">
            <div className="emoji">{meal.emoji}</div>
            <h2>{meal.name}</h2>

            <div className="ingredients">
              {meal.ingredients?.map((i: string, idx: number) => (
                <span key={idx}>{i}</span>
              ))}
            </div>

            <button className="secondary" onClick={getSuggestion}>
              Try again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}