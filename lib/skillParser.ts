/**
 * Skill Export Parser for Q-Up
 * 
 * Format: QUP-LOADOUT-v1:{base64-encoded-json}
 * 
 * The JSON contains:
 * - character: number (character ID, e.g., 1 = Leila the Medic)
 * - nodes: array of skill nodes with:
 *   - name: string (empty for unlocked hex nodes/placeholders)
 *   - guid: string (unique identifier for skill type)
 *   - level: number (skill level)
 *   - gridPosition: {x, y, z} (cubic hex coordinates where x+y+z=0)
 *   - isInventory: boolean (false for placed skills)
 */

export interface ParsedSkills {
  raw: string;
  character?: number;
  characterName?: string;
  skills: Skill[];
  isValid: boolean;
  error?: string;
}

export interface Skill {
  name: string;
  guid: string;
  level: number;
  gridPosition: {
    x: number;
    y: number;
    z: number;
  };
  isInventory: boolean;
}

interface QUpLoadout {
  character: number;
  nodes: Skill[];
}

const CHARACTER_NAMES: Record<number, string> = {
  0: 'The Gambler',
  1: 'Leila the Medic',
  // Add other characters as discovered
};

/**
 * Parses a Q-Up skill export string
 * @param exportString - The encoded skill export string from Q-Up
 * @returns Parsed skill data or error information
 */
export function parseSkillExport(exportString: string): ParsedSkills {
  if (!exportString || exportString.trim() === '') {
    return {
      raw: exportString,
      skills: [],
      isValid: false,
      error: 'Export string is empty',
    };
  }

  try {
    // Check for QUP-LOADOUT-v1 prefix
    if (!exportString.startsWith('QUP-LOADOUT-v1:')) {
      return {
        raw: exportString,
        skills: [],
        isValid: false,
        error: 'Invalid format: expected QUP-LOADOUT-v1 prefix',
      };
    }

    // Extract base64 payload
    const base64Payload = exportString.substring('QUP-LOADOUT-v1:'.length);
    
    // Decode base64
    const decoded = Buffer.from(base64Payload, 'base64').toString('utf-8');
    
    // Parse JSON
    const loadout: QUpLoadout = JSON.parse(decoded);
    
    if (!loadout.character || !Array.isArray(loadout.nodes)) {
      return {
        raw: exportString,
        skills: [],
        isValid: false,
        error: 'Invalid loadout structure: missing character or nodes',
      };
    }

    // Filter out empty nodes (unlocked hexes/placeholders)
    const namedSkills = loadout.nodes.filter(node => node.name && node.name.trim() !== '');

    return {
      raw: exportString,
      character: loadout.character,
      characterName: CHARACTER_NAMES[loadout.character] || `Character ${loadout.character}`,
      skills: namedSkills,
      isValid: true,
    };
  } catch (error) {
    return {
      raw: exportString,
      skills: [],
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to parse export string',
    };
  }
}

/**
 * Validates a skill export string without full parsing
 * @param exportString - The encoded skill export string
 * @returns Whether the string appears to be a valid export
 */
export function validateSkillExport(exportString: string): boolean {
  if (!exportString || exportString.trim() === '') {
    return false;
  }
  
  // Check for correct prefix and reasonable length
  return exportString.startsWith('QUP-LOADOUT-v1:') && 
         exportString.length > 20 && 
         exportString.length < 50000;
}
