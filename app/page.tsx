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
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  const [vibe, setVibe] = useState<string | null>(null);
  const [showManager, setShowManager] = useState(false);

  const [newMeal, setNewMeal] = useState<Meal>({
    name: "",
    ingredients: "",
    tags: [],
  });

  useEffect(() => {
    fetchMeals();

    const saved = localStorage.getItem("lastMeal");
    const recent = localStorage.getItem("recentMeals");

    if (saved) setSelectedMeal(JSON.parse(saved));
    if (recent) setRecentMeals(JSON.parse(recent));
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

  function toggleTag(tag: string) {
    setNewMeal((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  function suggestMeal() {
    let pool = meals;

    if (filters.length) {
      pool = pool.filter((m) =>
        filters.every((f) => m.tags?.includes(f))
      );
    }

    if (!pool.length) pool = meals;

    // remove recently used meals
    const recentIds = recentMeals.map((m) => m.id);
    const filtered = pool.filter((m) => !recentIds.includes(m.id));

    const finalPool = filtered.length ? filtered : pool;

    const choice =
      finalPool[Math.floor(Math.random() * finalPool.length)];

    setSelectedMeal(choice);

    const updatedRecent = [choice, ...recentMeals].slice(0, 5);
    setRecentMeals(updatedRecent);

    localStorage.setItem("lastMeal", JSON.stringify(choice));
    localStorage.setItem("recentMeals", JSON.stringify(updatedRecent));
  }

  async function addMeal() {
    if (!newMeal.name) return;

    await supabase.from("meals").insert([newMeal]);
    setNewMeal({ name: "", ingredients: "", tags: [] });
    fetchMeals();
  }

  function copyIngredients() {
    if (!selectedMeal) return;
    navigator.clipboard.writeText(selectedMeal.ingredients);
  }

  return (
    <main className="container">
      <h1>🍽️ What's for dinner?</h1>

      {!selectedMeal && (
        <p style={{ color: "#6b7280", marginBottom: "10px" }}>
          Pick a vibe and we’ll decide for you
        </p>
      )}

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

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <button className="cta" onClick={suggestMeal}>
          Suggest meal
        </button>

        <button
          className="cta secondary"
          onClick={() => setShowManager(!showManager)}
        >
          Add / Edit meals
        </button>
      </div>

      {/* Result */}
      {selectedMeal && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div className="card">
            <h2>{selectedMeal.name}</h2>
            <p>{selectedMeal.ingredients}</p>

            <button className="cta secondary" onClick={copyIngredients}>
              Copy ingredients
            </button>

            <button className="cta" onClick={suggestMeal}>
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Recent meals */}
      {recentMeals.length > 0 && (
        <div className="card">
          <h3>Recent</h3>
          <ul style={{ paddingLeft: 16 }}>
            {recentMeals.map((m, i) => (
              <li key={i}>{m.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      {showManager && (
        <div className="card">
          <input
            placeholder="Meal name"
            value={newMeal.name}
            onChange={(e) =>
              setNewMeal({ ...newMeal, name: e.target.value })
            }
          />

          <textarea
            placeholder="Ingredients"
            value={newMeal.ingredients}
            onChange={(e) =>
              setNewMeal({
                ...newMeal,
                ingredients: e.target.value,
              })
            }
          />

          <div className="row">
            {TAGS.map((tag) => (
              <button
                key={tag}
                className={
                  newMeal.tags.includes(tag) ? "pill active" : "pill"
                }
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <button className="cta secondary" onClick={addMeal}>
            Add meal
          </button>
        </div>
      )}
    </main>
  );
}