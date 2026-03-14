# 🐾 KIP — Lightweight Task Queue Skill for Claude Code

**Keep your flow. KIP remembers the rest.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-Plugin-blueviolet)](https://claude.ai/claude-code)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](CHANGELOG.md)
[![Eval TCs](https://img.shields.io/badge/Eval%20TCs-8%20cases-brightgreen)](evals/evals.json)

---

## Quick Start

### Installation (Plugin Marketplace)

**Two commands — that's it.**

**1.**
```bash
/plugin marketplace add DavidKim0326/KIP
```

**2.**
```bash
/plugin install kip
```

### Alternative: Manual Installation

```bash
git clone https://github.com/DavidKim0326/KIP.git
cp -r KIP ~/.claude/skills/kip
```

### Verify

Start a new Claude Code session and say something like:

```
"Fix the login bug. Oh, and I also need to update the docs later."
```

You should see `🐾 +docs⚑` appear naturally in the response.

---

## Why KIP

When working with AI, this happens constantly:

> "I should fix that auth bug after this... let's move on for now."

And then you forget.

Stopping to take notes breaks your flow. Ignoring it means lost tasks.
KIP solves this.

**It never interrupts your conversation. It silently captures deferred tasks and surfaces them at exactly the right moment.**

> Just remember one thing: **"insert kip"**.

---

## What KIP Does

| Feature | Description |
|---------|-------------|
| **CAPTURE** | Detects side-tasks from natural conversation → queues them silently |
| **DISPLAY** | Shows current queue as a single last line of every response |
| **SUGGEST** | When current work intersects a queued item → auto-suggests |
| **RECALL** | `kip?` expands the full briefing on demand |
| **CLEAR** | Complete items instantly with `kip done {x}` |

---

## How It Looks

### Normal — one quiet line at the end of every response

```
🐾 [auth⊕]test  [docs⚑]update  [deploy→]env
```

### Capture — 3 tokens, zero interruption

```
(your normal response continues...)
Embedding function complete. Filtering with match_threshold 0.78...

🐾 +groq⊕
```

### Context match — auto-suggestion when work intersects

```
🔥 kip·auth [now!] add RLS policy — handle together?
```

### `kip?` — full briefing, only when you ask

```
🐾 ── 3 pending ──────────────────
⊕ auth시   → test
⚑ anytime  → docs
→ deploy후 → env
─────────────────────────────────
```

---

## Condition Types

| Symbol | Meaning | When it surfaces |
|--------|---------|-----------------|
| `⊕` | Do together with current work | When context matches |
| `→` | After this task completes | When current task is done |
| `⚑` | Anytime, low priority | Always visible, never elevated |
| `🔥` | Context match detected | Immediately, with prompt |

---

## Commands

```
kip?          Full briefing (expand all pending items)
kip done {x}  Mark item complete → ✓
kip! {x}      Elevate to 🔥, handle now
kip clear     Wipe entire queue
```

---

## Token Budget

KIP is engineered for minimal token overhead.

| Situation | Target tokens |
|-----------|--------------|
| Normal KIP line | ~10 |
| Capture confirmation | ~3 |
| Full briefing (`kip?`) | ~30 |

---

## Auto-Setup (CLAUDE.md Integration)

On first use in a project, KIP asks once:

```
🐾 KIP is active for this conversation. Want me to add KIP to this project's
   CLAUDE.md so it loads automatically every session? (y/n)
```

If you say **yes**, KIP adds itself to your `CLAUDE.md` — from then on, every new Claude Code session in that project has KIP running by default. No manual activation needed.

If you say **no**, KIP works for the current conversation only.

---

## How KIP Captures Tasks

KIP listens for natural language signals that imply deferred action.

### Explicit Triggers — tell KIP directly

| Command | Example |
|---------|---------|
| `insert kip {task}` | "insert kip check rate limits" |
| `kip insert {task}` | "kip insert update env vars" |
| `add to kip {task}` | "add to kip review PR" |
| `킵에 넣어 {task}` | "킵에 넣어 RLS 확인" |
| `킵 추가 {task}` | "킵 추가 테스트 작성" |

Explicit triggers always capture. Default condition: `⚑` (anytime).

### Implicit English Triggers

| Signal | Example |
|--------|---------|
| "later" | "I'll handle the tests later" |
| "after this" | "After this, update the migration" |
| "also need to" | "Also need to check the rate limits" |
| "remind me" | "Remind me to review the PR" |
| "don't forget" | "Don't forget the env variables" |
| "before we ship" | "Before we ship, run the audit" |

### Implicit Korean Triggers

| Signal | Example |
|--------|---------|
| "나중에" | "나중에 테스트 추가해야 하는데" |
| "참고로" | "참고로 RLS도 확인해야 해" |
| "근데" | "근데 인증도 손봐야 하는데" |
| "끝나면" | "이거 끝나면 배포 환경변수 확인" |
| "일단 넘어가고" | "일단 넘어가고 나중에 리팩토링" |

### What KIP does NOT capture

- Questions about the current task
- Past-tense completed items
- Context/explanations without action verbs
- Items already being worked on

---

## Context Matching (🔥)

KIP watches for overlap between your current work and queued items. When 2+ signals align:

```
Queue has: [auth⊕]test
You start: "Let's add the auth middleware..."

🔥 kip·auth [now!] test — handle together?
```

**Requires 2+ signal overlap** to avoid false positives. Signals include:
- File being edited matches queue context
- Discussion topic matches queue label
- Keywords in user message match queue entry

---

## Queue Management

| Rule | Detail |
|------|--------|
| Max items | 5 active entries |
| Overflow | Evict oldest `⚑` first, then oldest `→` |
| Scope | Conversation-only (no persistent storage) |
| Display order | `⊕` first → `→` → `⚑` |

---

## Project Structure

```
KIP/
├── skills/
│   └── kip/
│       └── SKILL.md          ← Main skill definition (Claude Code reads this)
├── hooks/
│   └── hooks.json            ← Plugin hook registration (auto-loaded)
├── evals/
│   └── evals.json            ← 8 skill validation test cases
├── references/
│   └── examples.md           ← Usage examples & patterns
├── README.md
├── LICENSE                   ← MIT
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── CHANGELOG.md
```

---

## Design Philosophy

| Principle | Rule |
|-----------|------|
| **Flow first** | The moment KIP interrupts, it has failed |
| **Minimal presence** | Visible but never annoying |
| **Maximum density** | Everything in one line |
| **Rule-based** | Minimize LLM inference, maximize pattern matching |
| **Zero config** | Works immediately, no setup required |

---

## Requirements

- **Claude Code** v2.1.0+ (Plugin / Skills 2.0 support)
- No scripts, no dependencies — pure prompt skill

## Update

```bash
/plugin update kip@kip-marketplace
```

## Uninstall

```bash
/plugin uninstall kip
```

---

## FAQ

### Does KIP persist across conversations?

No. KIP is conversation-scoped by design. Each new conversation starts with an empty queue. This keeps it lightweight and avoids stale tasks accumulating.

### What if KIP captures something I didn't intend?

Just ignore it — KIP never acts on queue items without your explicit command. Use `kip done {x}` to clear false captures, or `kip clear` to wipe everything.

### Can KIP handle more than 5 items?

The 5-item limit is intentional. KIP is a scratchpad, not a project manager. If you consistently have 5+ deferred items, consider addressing some before adding more.

### Does KIP work with other skills?

Yes. KIP's status line always appears as the absolute last line of any response, after all other skill output. It never conflicts.

### Why Korean and English triggers?

KIP was designed for bilingual workflows. Many developers think and code-switch between languages naturally. KIP captures deferred intent regardless of language.

---

## What KIP is NOT

- **NOT** a project management tool
- **NOT** a persistent todo list
- **NOT** a replacement for issue trackers
- **NOT** a priority system with deadlines

KIP is a **conversation-scoped scratchpad for deferred intentions**. Nothing more, nothing less.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

[MIT License](LICENSE)

---

## Credits

Created by [David Kim](https://github.com/DavidKim0326)

> *A quiet assistant who never interrupts, only notes.* 🐾
