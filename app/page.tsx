"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Meal = {
  id?: number;
  name: string;
  ingredients: string;
  tags: string[];
};

const TAGS = ["Winter", "Summer", "Quick", "Healthy", "Comfort"];
const VIBES = ["🤗 Cosy", "🥗 Fresh", "🤤 Indulgent"];

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [filters, setFilters] = useState<string[]>([]);
  const [vibe, setVibe] = useState<string | null>(null);

  const [showExtras, setShowExtras] = useState(false);
  const [activeExtra, setActiveExtra] = useState<"swipe" | "plan" | "ai" | null>(null);

  const [ingredients, setIngredients] = useState("");
  const [aiResult, setAiResult] = useState("");

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    const { data } = await supabase.from("meals").select("*");
    if (data) setMeals(data);
  }

  function toggleFilter(tag: string) {
    setFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function suggestMeal() {
    let pool = meals;

    if (filters.length) {
      pool = pool.filter((m) =>
        filters.every((f) => m.tags?.includes(f))
      );
    }

    if (!pool.length) pool = meals;

    const choice = pool[Math.floor(Math.random() * pool.length)];
    setSelectedMeal(choice);
  }

  async function getAI() {
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ ingredients }),
    });
    const data = await res.json();
    setAiResult(data.result);
  }

  return (
    <main className="container">
      <h1>🍽️ What's for dinner?</h1>

      {/* Vibes */}
      <div className="row">
        {VIBES.map((v) => (
          <button
            key={v}
            className={vibe === v ? "pill active" : "pill"}
            onClick={() => setVibe(v)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="row">
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={filters.includes(tag) ? "pill active" : "pill"}
            onClick={() => toggleFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* MAIN CTA */}
      <button className="cta" onClick={suggestMeal}>
        Suggest meal
      </button>

      {/* RESULT */}
      {selectedMeal && (
        <div className="card">
          <h2>{selectedMeal.name}</h2>
          <p>{selectedMeal.ingredients}</p>

          <button className="cta secondary" onClick={suggestMeal}>
            Try again
          </button>
        </div>
      )}

      {/* MORE BUTTON */}
      <button
        className="cta secondary"
        style={{ marginTop: 20 }}
        onClick={() => setShowExtras(true)}
      >
        More options
      </button>

      {/* DRAWER */}
      {showExtras && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            boxShadow: "0 -10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={() => setActiveExtra("swipe")}>Swipe</button>
            <button onClick={() => setActiveExtra("plan")}>Plan</button>
            <button onClick={() => setActiveExtra("ai")}>AI</button>
            <button onClick={() => setShowExtras(false)}>Close</button>
          </div>

          {/* SWIPE */}
          {activeExtra === "swipe" && (
            <div>
              <p>Swipe-style chooser coming next (we’ll upgrade this)</p>
            </div>
          )}

          {/* PLAN */}
          {activeExtra === "plan" && (
            <div>
              <p>Weekly planner coming next</p>
            </div>
          )}

          {/* AI */}
          {activeExtra === "ai" && (
            <div>
              <textarea
                placeholder="Enter ingredients..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
              <button className="cta" onClick={getAI}>
                Generate
              </button>
              {aiResult && <p>{aiResult}</p>}
            </div>
          )}
        </div>
      )}
    </main>
  );
}