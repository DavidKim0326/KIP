# Changelog

All notable changes to KIP will be documented in this file.

## [1.2.1] - 2026-03-14

### Added
- **kip-hook.js** — UserPromptSubmit hook for reliable persistence
  - Reads `.kip.json` on every prompt and injects queue state into context
  - Detects deferred intent signals (EN/KR) and flags them for capture
  - Eliminates the "auto-creation not firing" problem from prompt-only approach
- Core Rule #6: "After EVERY queue mutation, immediately write .kip.json"

### Fixed
- README inconsistencies: Queue Management scope, "What KIP is NOT" wording
- Project Structure now shows kip-hook.js

## [1.2.0] - 2026-03-14

### Added
- **Session persistence** — Queue now persists across sessions via `.kip.json`
  - On session start, KIP loads existing queue from `.kip.json` in project root
  - Every queue mutation (capture, done, clear, eviction) auto-saves silently
  - Malformed files are auto-recovered (start fresh)
  - `.kip.json` should be added to `.gitignore` (personal workspace state)

### Changed
- Queue state is no longer ephemeral — tasks survive across conversations
- Description updated to reflect persistence capability

## [1.1.0] - 2026-03-14

### Added
- **Original sentence recall** — KIP now remembers the user's exact words when a task is captured, not just the compressed label
  - Normal status line stays compressed (no change to `🐾 [auth⊕]test`)
  - `kip?` briefing now shows the original sentence alongside each item
  - Example: `⊕ auth시 → test  "auth 끝나면 테스트도 추가해야 하는데"`
  - Helps users recall context when reviewing queued tasks

### Changed
- Briefing token budget increased from ~30 to ~60 to accommodate original sentences
- Extraction algorithm now stores 4 fields: label, original sentence, condition type, context tag

## [1.0.0] - 2026-03-14

### Added
- Initial public release
- Pure prompt skill — zero dependencies, zero config
- 4 condition types: ⊕ (co-task), ⚑ (anytime), → (sequential), 🔥 (context match)
- Natural language capture from English and Korean triggers
- Token budget enforcement (10/3/30 targets)
- 4 display formats: status line, capture confirmation, context match, full briefing
- 4 commands: `kip?`, `kip done`, `kip!`, `kip clear`
- Context matching algorithm with 2+ signal requirement
- Queue management: 5-item cap with smart eviction
- 8 eval test cases
- Plugin marketplace compatible packaging
- MIT license
