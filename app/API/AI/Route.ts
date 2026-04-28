import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { ingredients } = await req.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: `Suggest a meal using these ingredients: ${ingredients}`,
        },
      ],
    }),
  });

  const data = await res.json();

  return NextResponse.json({
    result: data.choices?.[0]?.message?.content || "No suggestion",
  });
}