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
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [current, setCurrent] = useState<Meal | null>(null);
  const [next, setNext] = useState<Meal | null>(null);
  const [weekPlan, setWeekPlan] = useState<Record<string, Meal | null>>({});
  const [ingredients, setIngredients] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    fetchMeals();
    initWeek();
  }, []);

  async function fetchMeals() {
    const { data } = await supabase.from("meals").select("*");
    if (data) {
      setMeals(data);
      pickTwo(data);
    }
  }

  function initWeek() {
    const obj: Record<string, Meal | null> = {};
    DAYS.forEach((d) => (obj[d] = null));
    setWeekPlan(obj);
  }

  function pickTwo(list: Meal[]) {
    if (list.length < 2) return;
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setCurrent(shuffled[0]);
    setNext(shuffled[1]);
  }

  function swipe(choice: "left" | "right") {
    const picked = choice === "right" ? current : next;
    setCurrent(picked || null);
    pickTwo(meals);
  }

  function assignToDay(day: string) {
    if (!current) return;
    setWeekPlan((prev) => ({ ...prev, [day]: current }));
  }

  function generateShoppingList() {
    const items = Object.values(weekPlan)
      .filter(Boolean)
      .flatMap((m) => m!.ingredients.split(","))
      .map((i) => i.trim());

    return [...new Set(items)];
  }

  async function getAISuggestion() {
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ ingredients }),
    });
    const data = await res.json();
    setAiSuggestion(data.result);
  }

  return (
    <main className="container">
      <h1>🍽️ What's for dinner?</h1>

      {/* SWIPE UI */}
      {current && next && (
        <div className="card">
          <h3>Choose a meal</h3>

          <div style={{ display: "flex", gap: 12 }}>
            <div className="pill" style={{ flex: 1 }}>
              {current.name}
            </div>
            <div className="pill" style={{ flex: 1 }}>
              {next.name}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="cta secondary" onClick={() => swipe("left")}>
              ← Skip
            </button>
            <button className="cta" onClick={() => swipe("right")}>
              Pick →
            </button>
          </div>
        </div>
      )}

      {/* WEEK PLANNER */}
      <div className="card">
        <h3>Plan your week</h3>

        {DAYS.map((day) => (
          <div
            key={day}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span>{day}</span>
            <button
              className="cta secondary"
              onClick={() => assignToDay(day)}
            >
              {weekPlan[day]?.name || "Assign"}
            </button>
          </div>
        ))}
      </div>

      {/* SHOPPING LIST */}
      <div className="card">
        <h3>Shopping list</h3>
        <ul>
          {generateShoppingList().map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* AI SUGGESTION */}
      <div className="card">
        <h3>AI meal suggestion</h3>

        <textarea
          placeholder="Enter ingredients..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />

        <button className="cta" onClick={getAISuggestion}>
          Generate meal
        </button>

        {aiSuggestion && <p>{aiSuggestion}</p>}
      </div>
    </main>
  );
}