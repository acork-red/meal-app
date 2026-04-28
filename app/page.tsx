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
  const [showManager, setShowManager] = useState(false);

  const [newMeal, setNewMeal] = useState<Meal>({
    name: "",
    ingredients: "",
    tags: [],
  });

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

    const choice = pool[Math.floor(Math.random() * pool.length)];
    setSelectedMeal(choice);
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
      <h1>🍽️ What should we eat?</h1>

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

      <button className="cta" onClick={suggestMeal}>
        Suggest meal
      </button>

      <button className="link" onClick={() => setShowManager(!showManager)}>
        Add / Edit meals
      </button>

      {selectedMeal && (
        <div className="card">
          <h2>{selectedMeal.name}</h2>
          <p>{selectedMeal.ingredients}</p>
          <button className="link" onClick={copyIngredients}>
            Copy ingredients
          </button>
        </div>
      )}

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

          <button className="cta small" onClick={addMeal}>
            Add meal
          </button>
        </div>
      )}
    </main>
  );
}