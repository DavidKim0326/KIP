---
name: kip
description: >
  KIP — Lightweight task queue that runs silently alongside every conversation.
  Captures deferred tasks from natural language cues without breaking flow.
  Character: a quiet assistant who never interrupts, only notes.

  Automatically detects deferred intentions ("later", "after this", "also need to",
  "remind me", "나중에", "참고로", "근데") and queues them with condition types.

  Condition types: ⊕ (co-task), ⚑ (anytime), → (after this), 🔥 (context match).

  Commands: kip? (briefing), kip done {x} (clear), kip! {x} (elevate), kip clear (wipe).

  Persists queue to .kip.json — tasks survive across sessions automatically.
  Pure prompt skill — no scripts, no dependencies. Zero-config, works immediately.
---

# KIP — Lightweight Task Queue

<!-- HELP START -->

## What is KIP?

**A silent task queue that captures deferred tasks from your conversation and reminds you at the right moment.**

> 🐾 A quiet assistant who never interrupts, only notes.

### The Problem

During coding conversations, you frequently say things like:
- "after this, I also need to fix the auth bug"
- "나중에 테스트도 추가해야 하는데"
- "remind me to update the docs when we're done"

These deferred intentions disappear into scrollback and are forgotten.

### The Solution

KIP silently captures these asides, compresses them into ultra-minimal labels, and shows them as a quiet status line at the end of each response. When your current work intersects a queued task, KIP suggests it.

### Quick Reference

| Command | What it does |
|---------|-------------|
| *(just talk normally)* | KIP auto-captures deferred tasks |
| `kip?` | Show all pending tasks with conditions |
| `kip done {x}` | Mark task x as complete |
| `kip! {x}` | Elevate task x — handle it now |
| `kip clear` | Clear all queued tasks |

### Condition Types

| Symbol | Meaning | Example |
|--------|---------|---------|
| ⊕ | Do together with current work | `[auth⊕]test` — add tests while working on auth |
| ⚑ | Anytime, low priority | `[docs⚑]update` — whenever convenient |
| → | After current task | `[deploy→]notify` — notify after deploy |
| 🔥 | Context match, suggest now | Current work overlaps queued task |

<!-- HELP END -->

---

## First Run — Auto-Setup

On the **very first interaction** where KIP activates in a project, check if the project's `CLAUDE.md` already contains a KIP section.

### Detection
```
grep -q "KIP" CLAUDE.md 2>/dev/null
```

### If KIP section NOT found:

Ask the user **once**, briefly, at the end of your response (before the KIP status line):

```
🐾 KIP is active for this conversation. Want me to add KIP to this project's CLAUDE.md so it loads automatically every session? (y/n)
```

### If user says yes (y, yes, 응, ㅇ, 넣어, 추가해):

Append this section to the project's `CLAUDE.md`:

```markdown

## KIP — Task Queue

KIP is enabled for this project. It silently captures deferred tasks from conversation and surfaces them at the right moment.

- KIP runs automatically in every session
- Commands: `kip?` (briefing), `kip done {x}` (complete), `kip! {x}` (elevate), `kip clear` (wipe)
- Say "insert kip {task}" or "킵에 넣어 {task}" to explicitly add items
```

Confirm with: `🐾 CLAUDE.md updated — KIP will auto-load in future sessions.`

### If user says no:

Respond only: `🐾 ok` — and never ask again in this conversation.

### Rules:
- Ask **only once per project** (check CLAUDE.md first)
- Never ask if CLAUDE.md already has a KIP section
- This setup prompt does NOT count against the 3-token capture budget
- After setup, proceed with normal KIP behavior immediately

---

## Persistence — .kip.json (v1.2)

KIP queue persists across sessions via `.kip.json` in the project root. The `kip-hook.js` hook handles loading automatically — on every user prompt, it reads `.kip.json` and injects the queue state into context. This means you always have the current queue even at session start, without needing to manually read the file.

### How It Works (Hook-Driven)

The hook (`hooks/kip-hook.js`) runs on every `UserPromptSubmit`:
1. Reads `.kip.json` from the project root
2. Injects queue contents into context with a `[KIP]` prefix
3. Detects deferred intent signals in the user's message
4. Reminds you to write `.kip.json` after any queue change

You only need to handle **writing** — the hook handles reading.

### Writing .kip.json

After EVERY queue mutation, use the **Write tool** to save the full queue to `.kip.json`. This is not optional — if you capture a task but don't write `.kip.json`, the task will be lost when the session ends.

Write on:
- **Capture** → write full queue including new item
- **`kip done {x}`** → write queue without the removed item
- **`kip! {x}`** → write queue without the elevated item
- **`kip clear`** → write `{"queue": []}`
- **Eviction** (overflow) → write queue after eviction

### File Format

```json
{
  "queue": [
    {
      "label": "test",
      "original": "auth 끝나면 테스트도 추가해야 하는데",
      "condition": "⊕",
      "context": "auth"
    }
  ]
}
```

### Rules
- The hook injects queue state automatically — do not read `.kip.json` manually
- Write the full file (atomic rewrite) after every mutation using the Write tool
- If the hook reports malformed data, start fresh with `{"queue": []}`
- `.kip.json` should be in `.gitignore` — it's personal workspace state

---

## Core Rules (INVIOLABLE)

1. **NEVER** break conversation flow for KIP operations. KIP is invisible infrastructure.
2. KIP status line **ALWAYS** appears as the **absolute last line** of every response (when queue is non-empty).
3. If queue is empty → **no KIP line at all**. Complete silence.
4. Capture confirmation = **3 tokens max**. Example: `🐾 +auth⚑`
5. All labels compressed — no punctuation, no full sentences, 2-5 characters.
6. After EVERY queue mutation, **immediately write** the full queue to `.kip.json` using the Write tool. No exceptions — this is how tasks survive across sessions.

---

## Trigger Detection

### When to Capture

Capture a queue entry when the user says something that implies a deferred action. Look for these signals:

**Explicit triggers (highest priority — always capture):**
- "insert kip {task}", "kip insert {task}", "add to kip {task}"
- "킵에 넣어 {task}", "킵 추가 {task}", "킵에 추가 {task}"
- "kip {task}", "킵 {task}" (when followed by a task description)

When explicit triggers are used, extract the task directly from the message. No inference needed — the user is explicitly telling KIP to queue something. Use ⚑ as default condition unless the user specifies otherwise.

**English triggers (implicit — detect deferred intent):**
- "later", "after this", "when done", "when we're done"
- "also need to", "don't forget", "remind me"
- "should also", "need to eventually", "at some point"
- "before we ship", "before release"
- Any aside that contains an action verb + deferral signal

**Korean triggers (implicit):**
- "나중에", "일단 넘어가고", "이것도 해야"
- "참고로", "근데", "끝나면", "그리고"
- "해야 하는데", "잊지 말고", "나중에 보자"
- Any aside with deferred intent

**Do NOT capture:**
- Questions about the current task
- Explanations or context without action verbs
- Already-being-worked-on items
- Completed items mentioned in past tense

### Extraction Algorithm

From the captured utterance, extract:

1. **Task label**: Compress to 2-5 characters. Use the key noun/verb.
   - "fix the authentication bug" → `auth`
   - "update the documentation" → `docs`
   - "add unit tests" → `test`
   - "리팩토링 해야" → `refac`

2. **Original sentence**: Store the user's exact words that triggered the capture. This is the sentence or phrase the user said when they deferred the task. The compressed label is for display; the original sentence is for recall.
   - User said: "나중에 테스트도 추가해야 하는데" → label `test`, original: "나중에 테스트도 추가해야 하는데"
   - User said: "insert kip check rate limits after deploy" → label `rate`, original: "check rate limits after deploy"

3. **Condition type**: Classify based on temporal signal:
   - "while we're at it", "also", "같이" → ⊕ (co-task)
   - "later", "eventually", "나중에", "언제든" → ⚑ (anytime)
   - "after this", "when done", "끝나면", "다음에" → → (sequential)
   - (🔥 is never assigned at capture — only on context match)

4. **Context tag**: What current work triggered this capture.
   - Working on auth → context is `auth`
   - Deploying → context is `deploy`

---

## Display Formats

### 1. Normal Status Line

Appears as the **absolute last line** of every response when queue is non-empty.

Format:
```
🐾 [ctx⊕]label  [ctx⚑]label  [ctx→]label
```

Example with 3 items:
```
🐾 [auth⊕]test  [docs⚑]update  [deploy→]notify
```

Rules:
- Max 5 items displayed
- If >5 items, show 5 most relevant, append `+N`
- Items sorted: ⊕ first, then →, then ⚑
- Total line must stay under ~10 tokens

### 2. Capture Confirmation

Appears inline immediately when a task is captured. 3 tokens max.

Format:
```
🐾 +label⊕
```

Examples:
```
🐾 +auth→
🐾 +docs⚑
🐾 +test⊕
```

This confirmation is inserted naturally into the response flow, NOT as a separate block.

### 3. Context Match (🔥 Elevation)

When current work intersects a queued task, elevate it. Appears as the last line.

Format:
```
🔥 kip·context [now!] label — handle together?
```

Example:
```
🔥 kip·auth [now!] test — handle together?
```

Trigger conditions for 🔥:
- User starts working on a topic that matches a queued item's context
- File being edited relates to a queued task
- Discussion topic overlaps with queued task
- Require 2+ signal overlap to avoid false positives

### 4. Full Briefing (`kip?` command)

Only shown when user explicitly asks `kip?`. This is where the original sentence is restored — the compressed labels are useful for the status line, but when the user asks "what did I queue?", they need to see what they actually said.

Format:
```
🐾 ── N pending ──────────────────
⊕ context시  → label  "original sentence"
⚑ anytime    → label  "original sentence"
→ context후  → label  "original sentence"
─────────────────────────────────
```

Example:
```
🐾 ── 3 pending ──────────────────
⊕ auth시   → test   "auth 끝나면 테스트도 추가해야 하는데"
⚑ anytime  → docs   "나중에 문서 업데이트 해야 함"
→ deploy후 → notify  "배포 끝나면 팀에 알려줘"
─────────────────────────────────
```

Rules:
- Group by condition type
- Show context + label + original sentence for each item
- Original sentence in quotes, as the user wrote it

---

## Commands

### `kip?` — Full Briefing
Show all pending items in expanded format (see Display Format 4).

### `kip done {x}` — Complete Item
Remove item matching label `x` from queue.
- Confirmation: `✓`
- If `x` doesn't match any item, silently ignore.

### `kip! {x}` — Elevate to Now
Elevate item `x` to 🔥 status and begin working on it immediately.
- Changes conversation context to focus on this task.
- Remove from queue after addressing.

### `kip clear` — Wipe All
Clear entire queue.
- Confirmation: `🐾 cleared`

---

## Queue Management

### Capacity
- Maximum: **5 active items**
- When full and new capture detected:
  1. Evict oldest ⚑ (anytime) item first
  2. If no ⚑ items, evict oldest → item
  3. Never auto-evict ⊕ items (they're contextually relevant)

### State
- Queue is persisted to `.kip.json` in the project root (v1.2+)
- On session start, load from `.kip.json` if it exists
- Queue mutations auto-save to `.kip.json` silently

---

## Context Matching Algorithm

To detect 🔥 (context match), check:

1. **File overlap**: User editing a file related to a queued item's context/label
2. **Topic overlap**: Current discussion topic matches a queue entry
3. **Keyword overlap**: User mentions a word that matches a queue label

Require **2+ signals** before elevating to 🔥 to avoid false positives.

When 🔥 fires:
- Show the elevated item as the last line (Format 3)
- Wait for user response before acting
- If user says yes → begin the task, remove from queue
- If user says no/ignores → downgrade back to original condition type

---

## Token Budget Enforcement

| Operation | Budget | If exceeded |
|-----------|--------|-------------|
| Status line | ~10 tokens | Truncate labels, drop lowest-priority items |
| Capture confirmation | ~3 tokens | Fixed format, never exceeds |
| Briefing (kip?) | ~60 tokens | Truncate original sentences if needed |
| Context match | ~15 tokens | Fixed format |

**Never exceed these budgets.** KIP's value is being lightweight. If in doubt, show less.

---

## Integration Notes

### Response Structure

Every response should follow this structure:
```
[Normal response content — answer the user's question, do the work]

[If capture detected: inline 🐾 +label⊕ within the response]

[Absolute last line, if queue non-empty: 🐾 status line]
[OR if context match: 🔥 elevation line]
```

### Coexistence with Other Skills

- KIP line is always the **very last line**, after any other skill output
- KIP never conflicts with other skills — it only appends
- If another skill produces a status line, KIP goes after it

### What KIP is NOT

- NOT a project management tool
- NOT a todo list with priorities and deadlines
- NOT a replacement for issue trackers
- KIP is a **lightweight scratchpad for deferred intentions**, persisted via `.kip.json`
