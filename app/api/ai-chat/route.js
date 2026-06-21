import { NextResponse } from "next/server";
import { getConfig } from "@/lib/db";

export async function POST(req) {
  try {
    const { messages, systemPrompt } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
    }

    // Use system prompt from DB if available (set via control panel)
    const dbPrompt = await getConfig("ai_system_prompt");
    const system   = systemPrompt ?? dbPrompt ?? 
      "You are a helpful assistant for Yobest Studio, a Roblox game development studio. Help users with Roblox game development, Lua scripting, and community questions. Be friendly, concise, and practical.";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:  "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 1024,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Anthropic error ${res.status}: ${text}` }, { status: 502 });
    }

    const data  = await res.json();
    const reply = data.content?.[0]?.text ?? "";
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
