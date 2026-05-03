/**
 * Custom Sanity Studio input component for the `translationBody` field.
 *
 * Renders a "Translate with Gemini" button above the standard BlockContent
 * editor. When clicked it reads the current `body` field value, sends it to
 * /api/translate, and patches `translationBody` with the result.
 *
 * The component is registered via `components.input` in postType.ts.
 */
"use client";

import { useState } from "react";
import { useFormValue, set } from "sanity";
import type { InputProps } from "sanity";

export function TranslationBodyInput(props: InputProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Read the sibling `body` field from the document form
  const bodyValue = useFormValue(["body"]) as unknown[] | undefined;

  const handleTranslate = async () => {
    if (!bodyValue?.length) {
      setErrorMsg("Body field is empty — nothing to translate.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    console.group("[TranslateWithGemini]");
    console.log("→ Sending body to /api/translate (%d blocks):", bodyValue.length, bodyValue);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: bodyValue }),
      });

      console.log("← HTTP status:", res.status, res.statusText);

      const data = await res.json().catch(() => ({}));
      console.log("← Response JSON:", data);

      if (!res.ok) {
        if (data.raw) {
          console.error("← Gemini raw output (first 2000 chars):", data.raw);
        }
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      console.log("← Translated body (%d blocks):", data.translatedBody?.length, data.translatedBody);
      props.onChange(set(data.translatedBody));
      setStatus("ok");
    } catch (e: unknown) {
      console.error("← Error:", e);
      setErrorMsg(e instanceof Error ? e.message : "Translation failed.");
      setStatus("error");
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* ── Translate button ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={status === "loading"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 6,
            border: "1px solid #4a6fa5",
            background: status === "loading" ? "#2a3f5f" : "#1d3557",
            color: "#e8f4f8",
            fontSize: 13,
            fontWeight: 600,
            cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: status === "loading" ? 0.7 : 1,
            transition: "background 0.2s",
          }}
        >
          {status === "loading" ? "⏳ Translating…" : "🌐 Translate with Gemini (TR → EN)"}
        </button>

        {status === "ok" && (
          <span style={{ color: "#4caf50", fontSize: 13, fontWeight: 600 }}>
            ✓ Translation applied
          </span>
        )}
        {status === "error" && (
          <span style={{ color: "#f44336", fontSize: 13 }}>
            ✗ {errorMsg}
          </span>
        )}
      </div>

      {/* ── Standard blockContent editor ── */}
      {props.renderDefault(props)}
    </div>
  );
}
