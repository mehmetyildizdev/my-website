/**
 * POST /api/translate
 *
 * Body: { body: PortableText[] }
 * Returns: { translatedBody: PortableText[] }
 *
 * Uses Gemini REST API (no SDK required) to translate Turkish→English
 * while preserving the full Portable Text / block structure.
 */

import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are a precise JSON translator. Your job is to translate Turkish text to English inside a Portable Text JSON array (used by Sanity CMS).

Rules — follow them exactly:
1. Return ONLY the JSON array, no markdown fences, no explanation, no preamble.
2. Preserve ALL keys, _type, _key, marks, markDefs, and non-text values exactly as-is.
3. For "block" type objects: translate ONLY the "text" field of each child span (where _type === "span").
4. For "markdownBlock" type objects: translate the "content" field value (it is markdown — preserve markdown syntax, only translate the human-readable words).
5. For "image" type objects: translate "alt" and "caption" if present.
6. For "code" type objects: DO NOT translate — return them unchanged.
7. For "embedBlock" type objects: translate "alt" and "caption" if present. DO NOT touch "embedUrl" or "htmlCode".
8. For "htmlVisual" type objects: DO NOT translate — return unchanged.
9. Do NOT translate URLs, slugs, _type values, _key values, language codes, or any technical identifiers.
10. If a text value is already in English or is empty, leave it unchanged.

The JSON array to translate follows. Reply with ONLY the translated JSON array:`;

/** Attempt to extract a JSON array from anywhere in the raw Gemini text output. */
function extractJsonArray(raw: string): unknown[] | null {
  // 1. Try direct parse first (cleanest path)
  try {
    const parsed = JSON.parse(raw.trim());
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // 2. Strip a single pair of markdown fences then try again
  const stripped = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/m, "")
    .trim();
  try {
    const parsed = JSON.parse(stripped);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // 3. Find the first '[' and the matching closing ']' via bracket counting
  const start = raw.indexOf("[");
  if (start === -1) return null;

  let depth = 0;
  let end = -1;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === "[") depth++;
    else if (raw[i] === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) return null;

  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  return null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured." },
      { status: 500 },
    );
  }

  let body: unknown[];
  try {
    const json = await req.json();
    body = json.body;
    if (!Array.isArray(body)) throw new Error("body must be an array");
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const userPrompt = `${SYSTEM_PROMPT}\n\n${JSON.stringify(body, null, 2)}`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  let geminiRes: Response;
  try {
    geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 65536,
          responseMimeType: "application/json", // instruct Gemini to output raw JSON
        },
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Gemini API." },
      { status: 502 },
    );
  }

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    console.error("[translate] Gemini HTTP error:", err);
    return NextResponse.json(
      { error: `Gemini API error: ${err}` },
      { status: 502 },
    );
  }

  const geminiData = await geminiRes.json();
  const rawText: string =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Log full raw output server-side so you can inspect it in the terminal
  console.log("[translate] Gemini raw output (first 500 chars):", rawText.slice(0, 500));

  const translatedBody = extractJsonArray(rawText);

  if (!translatedBody) {
    console.error("[translate] Could not extract JSON array. Full raw output:\n", rawText);
    return NextResponse.json(
      {
        error: "Gemini returned non-JSON output. Check server logs for the raw text.",
        raw: rawText.slice(0, 2000), // send first 2000 chars to client for debugging
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ translatedBody });
}
