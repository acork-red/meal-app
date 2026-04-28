"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Meal = {
  id?: number;
  name: string;
  ingredients: string;
  tags: string[];
  last_eaten?: string | null;
};

const ALL_TAGS = ["winter", "summer", "quick", "healthy", "comfort"];
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

  // Fetch meals
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

    // Avoid recently eaten
    pool = pool.filter((m) => {
      if (!m.last_eaten) return true;
      const days =
        (Date.now() - new Date(m.last_eaten).getTime()) /
        (1000 * 60 * 60 * 24);
      return days > 2;
    });

    if (!pool.length) pool = meals;

    const choice = pool[Math.floor(Math.random() * pool.length)];
    setSelectedMeal(choice);

    // Update last eaten
    supabase
      .from("meals")
      .update({ last_eaten: new Date().toISOString() })
      .eq("id", choice.id);
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
    <main className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-200 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">
        🍽️ What should we eat?
      </h1>

      {/* Vibes */}
      <div className="flex gap-2 mb-4">
        {VIBES.map((v) => (
          <button
            key={v}
            onClick={() => setVibe(v)}
            className={`px-4 py-2 rounded-full border ${
              vibe === v ? "bg-black text-white" : "bg-white"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleFilter(tag)}
            className={`px-4 py-2 rounded-full border ${
              filters.includes(tag)
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={suggestMeal}
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition"
      >
        Suggest meal
      </button>

      {/* Result */}
      {selectedMeal && (
        <div className="bg-white mt-8 p-6 rounded-2xl shadow-md w-full max-w-md text-center animate-fade-in">
          <h2 className="text-xl font-semibold mb-2">
            {selectedMeal.name}
          </h2>
          <p className="text-gray-600 mb-4">
            {selectedMeal.ingredients}
          </p>

          <button
            onClick={copyIngredients}
            className="text-sm underline"
          >
            Copy ingredients
          </button>
        </div>
      )}

      {/* Toggle manager */}
      <button
        onClick={() => setShowManager(!showManager)}
        className="mt-6 underline text-sm"
      >
        Add / Edit meals
      </button>

      {/* Manager */}
      {showManager && (
        <div className="bg-white mt-4 p-6 rounded-2xl shadow-md w-full max-w-md">
          <h3 className="font-semibold mb-2">Add a meal</h3>

          <input
            placeholder="Meal name"
            className="w-full border p-2 mb-2 rounded"
            value={newMeal.name}
            onChange={(e) =>
              setNewMeal({ ...newMeal, name: e.target.value })
            }
          />

          <textarea
            placeholder="Ingredients"
            className="w-full border p-2 mb-2 rounded"
            value={newMeal.ingredients}
            onChange={(e) =>
              setNewMeal({
                ...newMeal,
                ingredients: e.target.value,
              })
            }
          />

          <div className="flex gap-2 flex-wrap mb-3">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full border ${
                  newMeal.tags.includes(tag)
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={addMeal}
            className="bg-black text-white px-4 py-2 rounded w-full"
          >
            Add meal
          </button>

          {/* Existing meals */}
          <div className="mt-6 space-y-2">
            {meals.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>{m.name}</span>
                <button
                  onClick={async () => {
                    await supabase
                      .from("meals")
                      .delete()
                      .eq("id", m.id);
                    fetchMeals();
                  }}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}