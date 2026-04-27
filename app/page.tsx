"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Meal = {
  id?: string;
  name: string;
  tags: string[];
  ingredients: string[];
};

const availableTags = ["winter", "summer", "quick", "healthy", "comfort"];

const vibes = [
  { name: "cosy", label: "🤗 Cosy", tags: ["comfort", "winter"] },
  { name: "fresh", label: "🥗 Fresh", tags: ["healthy", "summer"] },
  { name: "indulgent", label: "🤤 Indulgent", tags: ["comfort"] },
];

function getSeason() {
  const month = new Date().getMonth();
  return month >= 4 && month <= 8 ? "summer" : "winter";
}

export default function Home() {
  const [meal, setMeal] = useState<Meal | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [recentMeals, setRecentMeals] = useState<string[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showList, setShowList] = useState(false);

  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load meals from Supabase
  useEffect(() => {
    async function loadMeals() {
      const { data, error } = await supabase.from("meals").select("*");

      if (error) {
        console.error(error);
        return;
      }

      if (data) setMeals(data);
    }

    loadMeals();
  }, []);

  // Load recent meals (local only)
  useEffect(() => {
    const saved = localStorage.getItem("recentMeals");
    if (saved) setRecentMeals(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("recentMeals", JSON.stringify(recentMeals));
  }, [recentMeals]);

  function toggleTag(tag: string, current: string[], setter: any) {
    setter(
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]
    );
  }

  async function reloadMeals() {
    const { data } = await supabase.from("meals").select("*");
    if (data) setMeals(data);
  }

  function pickMeal() {
    const season = getSeason();

    let filtered = meals.filter(
      (m) => m.tags.includes(season) || !m.tags.includes("winter")
    );

    // Apply vibe
    if (selectedVibe) {
      const vibe = vibes.find((v) => v.name === selectedVibe);
      if (vibe) {
        const vibeMatches = filtered.filter((m) =>
          vibe.tags.some((tag) => m.tags.includes(tag))
        );
        if (vibeMatches.length > 0) filtered = vibeMatches;
      }
    }

    // Remove recent meals
    let withoutRecent = filtered.filter(
      (m) => !recentMeals.includes(m.name)
    );

    if (withoutRecent.length === 0) {
      withoutRecent = filtered;
    }

    if (withoutRecent.length === 0) {
      alert("No meals available 😅");
      return;
    }

    const random =
      withoutRecent[Math.floor(Math.random() * withoutRecent.length)];

    const updatedRecent = [
      random.name,
      ...recentMeals.filter((n) => n !== random.name),
    ].slice(0, 5);

    setRecentMeals(updatedRecent);

    setMeal(null);
    setTimeout(() => setMeal(random), 100);
  }

  async function saveMeal() {
    if (!name) return;

    const newMeal = {
      name,
      tags: selectedTags,
      ingredients: ingredients.split(",").map((i) => i.trim()),
    };

    if (editingIndex !== null) {
      const mealToUpdate = meals[editingIndex];

      await supabase
        .from("meals")
        .update(newMeal)
        .eq("id", mealToUpdate.id);
    } else {
      await supabase.from("meals").insert(newMeal);
    }

    await reloadMeals();

    setName("");
    setIngredients("");
    setSelectedTags([]);
    setEditingIndex(null);
    setShowAdd(false);
  }

  function editMeal(index: number) {
    const m = meals[index];
    setName(m.name);
    setIngredients(m.ingredients.join(", "));
    setSelectedTags(m.tags);
    setEditingIndex(index);
    setShowAdd(true);
  }

  async function deleteMeal(index: number) {
    const mealToDelete = meals[index];

    await supabase
      .from("meals")
      .delete()
      .eq("id", mealToDelete.id);

    await reloadMeals();
  }

  function copyIngredients() {
    if (!meal) return;
    navigator.clipboard.writeText(meal.ingredients.join("\n"));
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex flex-col items-center p-6 gap-6">

      <h1 className="text-3xl font-semibold text-gray-900">
        🍽️ What should we eat?
      </h1>

      {/* Vibes */}
      <div className="flex gap-3">
        {vibes.map((v) => (
          <button
            key={v.name}
            onClick={() =>
              setSelectedVibe(selectedVibe === v.name ? null : v.name)
            }
            className={`px-4 py-2 rounded-full text-sm border transition ${
              selectedVibe === v.name
                ? "bg-black text-white"
                : "bg-white text-gray-800"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={pickMeal}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl text-lg shadow-md active:scale-95 transition"
      >
        Suggest meal
      </button>

      {/* Result */}
      {meal && (
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-sm text-center animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {meal.name}
          </h2>

          <p className="text-sm text-gray-800 mb-3">
            {meal.ingredients.join(", ")}
          </p>

          <button
            onClick={copyIngredients}
            className="text-sm underline text-gray-700 hover:text-black"
          >
            Copy ingredients
          </button>
        </div>
      )}

      {/* Recently */}
      {recentMeals.length > 0 && (
        <p className="text-xs text-gray-500">
          Recently: {recentMeals.join(", ")}
        </p>
      )}

      {/* Toggles */}
      <div className="flex gap-4 text-sm">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="underline text-gray-700"
        >
          {showAdd ? "Close" : "Add meal"}
        </button>

        <button
          onClick={() => setShowList(!showList)}
          className="underline text-gray-700"
        >
          {showList ? "Hide meals" : "View meals"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="w-full max-w-sm bg-white shadow-md rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
          <input
            className="border border-gray-300 rounded p-2"
            placeholder="Meal name (🌮 encouraged)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border border-gray-300 rounded p-2"
            placeholder="Ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  toggleTag(tag, selectedTags, setSelectedTags)
                }
                className={`px-2 py-1 text-xs rounded-full border ${
                  selectedTags.includes(tag)
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={saveMeal}
            className="bg-black text-white py-2 rounded"
          >
            {editingIndex !== null ? "Update meal" : "Add meal"}
          </button>
        </div>
      )}

      {/* Meal list */}
      {showList && (
        <div className="w-full max-w-sm">
          {meals.map((m, i) => (
            <div
              key={m.id || i}
              className="bg-white shadow-sm rounded-xl p-4 mb-3 flex justify-between"
            >
              <span className="text-sm font-medium text-gray-900">
                {m.name}
              </span>

              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => editMeal(i)}
                  className="text-gray-600 hover:text-black"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteMeal(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}