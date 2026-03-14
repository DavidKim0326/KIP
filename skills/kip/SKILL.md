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

## Core Rules (INVIOLABLE)

1. **NEVER** break conversation flow for KIP operations. KIP is invisible infrastructure.
2. KIP status line **ALWAYS** appears as the **absolute last line** of every response (when queue is non-empty).
3. If queue is empty → **no KIP line at all**. Complete silence.
4. Capture confirmation = **3 tokens max**. Example: `🐾 +auth⚑`
5. All labels compressed — no punctuation, no full sentences, 2-5 characters.

---

## Trigger Detection

### When to Capture

Capture a queue entry when the user says something that implies a deferred action. Look for these signals:

**English triggers:**
- "later", "after this", "when done", "when we're done"
- "also need to", "don't forget", "remind me"
- "should also", "need to eventually", "at some point"
- "before we ship", "before release"
- Any aside that contains an action verb + deferral signal

**Korean triggers:**
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

2. **Condition type**: Classify based on temporal signal:
   - "while we're at it", "also", "같이" → ⊕ (co-task)
   - "later", "eventually", "나중에", "언제든" → ⚑ (anytime)
   - "after this", "when done", "끝나면", "다음에" → → (sequential)
   - (🔥 is never assigned at capture — only on context match)

3. **Context tag**: What current work triggered this capture.
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

Only shown when user explicitly asks `kip?`.

Format:
```
🐾 ── N pending ──────────────────
⊕ context시  → label
⚑ anytime    → label
→ context후  → label
─────────────────────────────────
```

Example:
```
🐾 ── 3 pending ──────────────────
⊕ auth시   → test
⚑ anytime  → docs
→ deploy후 → notify
─────────────────────────────────
```

Rules:
- Max ~30 tokens for the entire briefing
- Group by condition type
- Show context + label for each item

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
- Queue lives in conversation context (ephemeral)
- New conversation = empty queue
- No persistent storage required

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
| Briefing (kip?) | ~30 tokens | Truncate descriptions |
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
- NOT persistent across conversations
- NOT a replacement for issue trackers
- KIP is a **conversation-scoped scratchpad for deferred intentions**
