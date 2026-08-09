---
type: concept
title: Skills Directory
description: Skills directory containing mermaid-diagrams and write-connector skill definitions for AI/LLM integration.
tags: [skills, ai, llm]
timestamp: 2026-04-15
---

# Skills Directory

The `skills/` directory contains skill definitions for AI/LLM integration.

## Skills Overview

| Skill            | File                                            | Purpose                    |
| ---------------- | ----------------------------------------------- | -------------------------- |
| mermaid-diagrams | `skills/mermaid-diagrams/SKILL.md` (3810 bytes) | Mermaid diagram generation |
| write-connector  | `skills/write-connector/SKILL.md` (2372 bytes)  | Content writing connector  |

## mermaid-diagrams Skill

`skills/mermaid-diagrams/SKILL.md` (3810 bytes)

### Purpose

Provides instructions for generating Mermaid diagrams in documentation.

### Supported Diagram Types

- sequenceDiagram
- stateDiagram-v2
- erDiagram
- flowchart

### Usage

Used by AI assistants to generate diagrams for documentation pages.

## write-connector Skill

`skills/write-connector/SKILL.md` (2372 bytes)

### Purpose

Provides instructions for writing content using a connector pattern.

### Usage

Used by AI assistants to generate documentation content.

## Skill Structure

Skills follow a progressive disclosure pattern:

1. **Recognize**: Check if the task matches a skill's domain
2. **Read**: Load the SKILL.md file for full instructions
3. **Execute**: Follow the skill's workflow

## Related Pages

- [Content Collections](../content/collections.md)
- [Development Tooling](../configuration/tooling.md)
