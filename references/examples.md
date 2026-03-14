# KIP — Usage Examples & Patterns

## Example 1: Basic Capture (English)

**User:**
> Fix the login validation bug. Also, I need to update the API rate limit docs when we're done.

**KIP behavior:**
- Detects "when we're done" + "update" = deferred action
- Extracts: label=`docs`, condition=`→`, context=`login`
- Confirmation: `🐾 +docs→`
- Status line at end: `🐾 [login→]docs`

---

## Example 2: Basic Capture (Korean)

**User:**
> 이 컴포넌트 스타일링 수정해줘. 근데 나중에 반응형도 확인해야 하는데.

**KIP behavior:**
- Detects "나중에" + "확인해야" = deferred action
- Extracts: label=`반응형`, condition=`⚑`, context=`style`
- Confirmation: `🐾 +반응형⚑`
- Status line at end: `🐾 [style⚑]반응형`

---

## Example 3: Co-task Capture

**User:**
> Let's refactor the auth module. While we're at it, we should also add input sanitization.

**KIP behavior:**
- Detects "while we're at it" + "also" = co-task
- Extracts: label=`sanitize`, condition=`⊕`, context=`auth`
- Confirmation: `🐾 +sanitize⊕`
- Status line at end: `🐾 [auth⊕]sanitize`

---

## Example 4: Context Match (🔥)

**Queue state:** `[auth⊕]sanitize`

**User:**
> Now let's work on the auth middleware input handling.

**KIP behavior:**
- Detects: user working on "auth" + "input" → matches queue item `[auth⊕]sanitize`
- Signals: topic overlap (auth) + keyword overlap (input/sanitize) = 2 signals
- Elevation: `🔥 kip·auth [now!] sanitize — handle together?`

---

## Example 5: Queue Overflow

**Queue state (5 items):**
```
[api⊕]cache
[auth→]RLS
[deploy→]env
[docs⚑]readme
[test⚑]e2e
```

**User:**
> Remind me to check the CI pipeline later.

**KIP behavior:**
- Queue full (5 items)
- Evicts oldest ⚑: `[docs⚑]readme` removed
- Adds: `[ci⚑]pipeline`
- Confirmation: `🐾 +ci⚑`

---

## Example 6: Multiple Captures in One Message

**User:**
> Fix the form validation. After that, update the error messages. And remind me about the accessibility audit too.

**KIP behavior:**
- Capture 1: "after that" + "update error messages" → `[form→]errmsg`
- Capture 2: "remind me" + "accessibility audit" → `[⚑]a11y`
- Confirmations: `🐾 +errmsg→ +a11y⚑`
- Status line: `🐾 [form→]errmsg  [⚑]a11y`

---

## Example 7: False Positive Avoidance

**User:**
> I fixed the auth bug yesterday. The tests were passing after that.

**KIP behavior:**
- "yesterday" = past tense, already done
- "after that" refers to past event, not deferred action
- **No capture** — KIP stays silent

---

## Anti-patterns

### DON'T: Interrupt the flow

```
❌ "I detected a deferred task! Let me add it to your queue..."
✅ 🐾 +docs⚑    (inline, 3 tokens, done)
```

### DON'T: Over-capture

```
❌ User: "The database schema looks good by the way"
   KIP: 🐾 +schema⚑     ← No action verb, no deferral signal

✅ (no capture — this is an observation, not a deferred task)
```

### DON'T: Exceed token budget

```
❌ 🐾 [authentication-module⊕]add-input-sanitization  [documentation⚑]update-readme
✅ 🐾 [auth⊕]sanitize  [docs⚑]readme
```
