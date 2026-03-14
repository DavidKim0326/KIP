/**
 * KIP Hook — Session persistence & deferred intent detection
 *
 * 1. On every prompt, reads .kip.json and injects queue state into context
 *    so the model always knows the current queue — even at session start.
 * 2. Detects deferred intent signals and reminds the model to capture them.
 *
 * This solves the "auto-creation" problem: instead of relying on the model
 * to remember to read .kip.json, the hook does it on every interaction.
 */

const fs = require("fs");
const path = require("path");

/**
 * Read .kip.json from project root (cwd).
 * Returns parsed queue or null if not found/malformed.
 */
function readKipQueue() {
  const kipPath = path.join(process.cwd(), ".kip.json");
  try {
    const raw = fs.readFileSync(kipPath, "utf8");
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.queue)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect deferred intent signals in user prompt.
 */
const DEFERRED_SIGNALS = [
  // English
  /\blater\b/i,
  /\bafter\s+this\b/i,
  /\bwhen\s+(we'?re\s+)?done\b/i,
  /\balso\s+need\s+to\b/i,
  /\bdon'?t\s+forget\b/i,
  /\bremind\s+me\b/i,
  /\bshould\s+also\b/i,
  /\bbefore\s+we\s+ship\b/i,
  /\bat\s+some\s+point\b/i,
  /\beventually\b/i,
  // Korean
  /나중에/,
  /일단\s*넘어가고/,
  /참고로/,
  /끝나면/,
  /해야\s*하는데/,
  /잊지\s*말고/,
  // Explicit triggers
  /\binsert\s+kip\b/i,
  /\bkip\s+insert\b/i,
  /\badd\s+to\s+kip\b/i,
  /킵에\s*넣어/,
  /킵\s*추가/,
];

function detectDeferredIntent(prompt) {
  const matches = [];
  for (const pattern of DEFERRED_SIGNALS) {
    const match = prompt.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches;
}

// ── Main ──

function main() {
  let input = "";
  const stdin = process.stdin;
  stdin.setEncoding("utf8");

  stdin.on("data", (chunk) => {
    input += chunk;
  });

  stdin.on("end", () => {
    try {
      const hookData = JSON.parse(input);
      const prompt = hookData.message?.content || hookData.prompt || "";

      const parts = [];

      // 1. Inject current queue state
      const kipData = readKipQueue();
      if (kipData && kipData.queue.length > 0) {
        const items = kipData.queue.map((item) => {
          const cond = item.condition || "⚑";
          const ctx = item.context ? `${item.context}` : "anytime";
          return `  ${cond} ${ctx} → ${item.label}  "${item.original || ""}"`;
        });
        parts.push(
          `[KIP] Queue loaded from .kip.json (${kipData.queue.length} items):\n${items.join("\n")}\nShow this queue as the KIP status line. After ANY queue change (capture, done, clear), IMMEDIATELY write the updated queue to .kip.json using the Write tool.`
        );
      } else {
        parts.push(
          "[KIP] No .kip.json found or queue is empty. If a deferred task is captured, create .kip.json with the Write tool immediately."
        );
      }

      // 2. Flag deferred intent if detected
      if (prompt) {
        const signals = detectDeferredIntent(prompt);
        if (signals.length > 0) {
          parts.push(
            `[KIP] Deferred intent detected: ${signals.join(", ")}. Remember to capture this as a KIP queue item AND write to .kip.json.`
          );
        }
      }

      console.log(
        JSON.stringify({
          result: "pass",
          message: parts.join("\n"),
        })
      );
    } catch {
      console.log(JSON.stringify({ result: "pass" }));
    }
  });
}

main();

if (typeof module !== "undefined") {
  module.exports = { readKipQueue, detectDeferredIntent, DEFERRED_SIGNALS };
}
