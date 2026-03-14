# Changelog

All notable changes to KIP will be documented in this file.

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
