# Q-Up Export Format Documentation

This document describes the skill export format used by Q-Up, reverse-engineered from actual game exports.

## Format Overview

**Format**: `QUP-LOADOUT-v1:{base64-encoded-json}`

The export string consists of:
1. A version prefix: `QUP-LOADOUT-v1:`
2. A Base64-encoded JSON payload

## JSON Structure

```typescript
{
  character: number,  // Character ID (1 = Leila the Medic)
  nodes: Array<{
    name: string,          // Skill name (empty string for unlocked hex nodes/placeholders)
    guid: string,          // Unique skill identifier (MD5-like hash)
    level: number,         // Skill level
    gridPosition: {        // Cubic hex coordinates
      x: number,
      y: number,
      z: number            // Note: x + y + z = 0 (hex grid constraint)
    },
    isInventory: boolean   // false for placed skills, true for inventory
  }>
}
```

## Key Findings

### Character IDs
- `1` = Leila the Medic
- Other character IDs are currently unknown

### Nodes Array
The `nodes` array contains **both**:
- **Named skills**: Nodes with a `name` value (e.g., "Battle Medic", "Angel")
- **Empty nodes**: Nodes with `name: ""` representing unlocked hex positions or placeholder connections

A typical export has ~40-45 total nodes, with ~20-25 being named skills.

### Hex Grid System
Skills are placed on a hexagonal grid using **cubic coordinates**:
- Each position is `{x, y, z}` where `x + y + z = 0`
- This is a standard representation for hex grids
- The grid is numbered 1-181+ for activation order (not included in export)

### What's NOT in the Export
The following game mechanics are **not** encoded in the export:
- **Trigger conditions**: ON FLIP, ON WIN, ON LOSS, ON TRIGGER
- **Charge counts**: How many times a skill can activate per coinflip
- **Skill connections**: Which skills trigger which other skills
- **Grid numbering**: The sequential activation order numbers (1-181+)

These must be hardcoded/looked up by skill GUID in game data.

## Example

```
QUP-LOADOUT-v1:eyJjaGFyYWN0ZXIiOjEsIm5vZGVzIjpbeyJuYW1lIjoiQmF0dGxlIE1lZGljIiwiZ3VpZCI6Ijg3OTkxMDI5MTQyYmQ0MjczOWIxNDFhMjg0YTY4YjEyIiwibGV2ZWwiOjEsImdyaWRQb3NpdGlvbiI6eyJ4IjoxLCJ5IjowLCJ6IjotMX0sImlzSW52ZW50b3J5IjpmYWxzZX1dfQ==
```

Decodes to:
```json
{
  "character": 1,
  "nodes": [
    {
      "name": "Battle Medic",
      "guid": "87991029142bd42739b141a284a68b12",
      "level": 1,
      "gridPosition": {
        "x": 1,
        "y": 0,
        "z": -1
      },
      "isInventory": false
    }
  ]
}
```

## Parser Implementation

See `lib/skillParser.ts` for the TypeScript implementation that:
1. Validates the `QUP-LOADOUT-v1:` prefix
2. Decodes the Base64 payload
3. Parses the JSON structure
4. Filters out empty nodes to extract named skills
5. Returns parsed skill data with character information

## Usage

```typescript
import { parseSkillExport } from '@/lib/skillParser';

const result = parseSkillExport(exportString);

if (result.isValid) {
  console.log(`Character: ${result.characterName}`);
  console.log(`Skills: ${result.skills.length}`);
  result.skills.forEach(skill => {
    console.log(`- ${skill.name} at (${skill.gridPosition.x}, ${skill.gridPosition.y}, ${skill.gridPosition.z})`);
  });
} else {
  console.error(`Error: ${result.error}`);
}
```

## Utility Functions

See `lib/skillUtils.ts` for helper functions:
- `getSkillSummary()` - Human-readable skill list
- `hexDistance()` - Calculate distance between hex grid positions
- `isValidHexPosition()` - Validate hex coordinates
- `sortSkillsByDistanceFromCenter()` - Sort skills by distance from origin

## Future Work

To fully decode Q-Up builds, we would need:
1. A database of skill GUIDs → skill metadata (triggers, charges, effects)
2. Character skill trees (which skills are available per character)
3. Hex skill unlock positions (which grid positions are fixed hex unlocks)
4. Grid numbering algorithm (how x,y,z maps to activation order 1-181+)
