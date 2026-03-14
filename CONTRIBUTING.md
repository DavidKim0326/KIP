# Contributing to KIP

Thank you for your interest in contributing to KIP! This guide will help you get started.

## How to Contribute

### Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include your Claude Code version and OS
- For capture accuracy issues, include the conversation context that was (or wasn't) captured

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-improvement`
3. Make your changes
4. Run evals: ensure all test cases pass
5. Submit a Pull Request

### Pull Request Requirements

- [ ] All existing evals pass
- [ ] New features include eval test cases
- [ ] English-first in user-facing content
- [ ] No external dependencies (pure prompt skill)
- [ ] Code follows existing style conventions

## Development Setup

```bash
# Clone
git clone https://github.com/DavidKim0326/KIP.git
cd KIP

# Install as Claude Code plugin (for testing)
# Option 1: Plugin marketplace
/plugin marketplace add DavidKim0326/KIP
/plugin install kip

# Option 2: Manual
cp -r . ~/.claude/skills/kip
```

## Adding Eval Test Cases

Add new test cases to `evals/evals.json`:

```json
{
  "id": 9,
  "mode": "CAPTURE",
  "prompt": "Your test prompt here",
  "expected_output": "Expected behavior description",
  "expectations": [
    "Specific expectation 1",
    "Specific expectation 2"
  ]
}
```

Each expectation should be independently verifiable.

## Key Areas for Contribution

### Trigger Detection
- New natural language patterns for deferred task detection
- Additional language support beyond English/Korean
- False positive reduction

### Display Format
- Token budget optimization
- Accessibility improvements
- Alternative display formats

### Context Matching
- Better 🔥 detection algorithms
- Reduced false positive rate
- New signal types

## Code Style

- **Markdown**: ATX headings, fenced code blocks with language tags
- **JSON**: 2-space indentation
- **JavaScript** (hooks): ES6+, JSDoc for exported functions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
