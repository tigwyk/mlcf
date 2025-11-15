/**
 * Skill Export Parser for Q-Up
 * 
 * This parser attempts to decode Q-Up skill export strings.
 * Since the format is undocumented and the game is closed-source,
 * this will need to be reverse-engineered from real examples.
 * 
 * TODO: Update this parser as we learn more about the export format
 */

export interface ParsedSkills {
  raw: string;
  skills: Skill[];
  isValid: boolean;
  error?: string;
}

export interface Skill {
  id: number;
  name?: string;
  level?: number;
  position?: number;
}

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
    // Basic validation - check if it looks like it could be a valid export
    // We'll need to update this as we learn the actual format
    
    // For now, we'll do basic parsing attempts:
    // 1. Check if it's base64
    // 2. Check if it's JSON
    // 3. Check if it's a custom delimiter format
    
    // Attempt base64 decode
    try {
      const decoded = Buffer.from(exportString, 'base64').toString('utf-8');
      // Try to parse as JSON
      const jsonData = JSON.parse(decoded);
      if (Array.isArray(jsonData)) {
        return {
          raw: exportString,
          skills: jsonData.map((skill, idx) => ({
            id: skill.id || idx,
            name: skill.name,
            level: skill.level,
            position: skill.position || idx,
          })),
          isValid: true,
        };
      }
    } catch {
      // Not base64 or not JSON, continue
    }

    // Attempt direct JSON parse
    try {
      const jsonData = JSON.parse(exportString);
      if (Array.isArray(jsonData)) {
        return {
          raw: exportString,
          skills: jsonData.map((skill, idx) => ({
            id: skill.id || idx,
            name: skill.name,
            level: skill.level,
            position: skill.position || idx,
          })),
          isValid: true,
        };
      }
    } catch {
      // Not JSON, continue
    }

    // If we can't parse it, store it as-is for later analysis
    // This allows users to submit builds even if we haven't cracked the format yet
    return {
      raw: exportString,
      skills: [],
      isValid: true, // Mark as valid so it can be stored
      error: 'Export format not yet decoded - stored for analysis',
    };
  } catch (error) {
    return {
      raw: exportString,
      skills: [],
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
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
  
  // For now, accept any non-empty string
  // We'll refine this as we learn more about the format
  return exportString.length > 0 && exportString.length < 10000;
}
