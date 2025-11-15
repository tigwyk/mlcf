/**
 * Utility functions for working with Q-Up skills
 */

import { Skill } from './skillParser';

/**
 * Get a human-readable summary of a skill loadout
 */
export function getSkillSummary(skills: Skill[]): string {
  if (skills.length === 0) {
    return 'No skills selected';
  }

  const skillNames = skills.map(s => s.name).join(', ');
  return `${skills.length} skills: ${skillNames}`;
}

/**
 * Extract unique skill names from a list of skills
 */
export function getUniqueSkillNames(skills: Skill[]): string[] {
  return [...new Set(skills.map(s => s.name))];
}

/**
 * Count how many times each skill appears (for duplicate skills)
 */
export function getSkillCounts(skills: Skill[]): Record<string, number> {
  return skills.reduce((acc, skill) => {
    acc[skill.name] = (acc[skill.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Validate hex grid position (x + y + z must equal 0)
 */
export function isValidHexPosition(x: number, y: number, z: number): boolean {
  return x + y + z === 0;
}

/**
 * Calculate distance between two hex grid positions
 * Uses cube distance formula for hex grids
 */
export function hexDistance(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  return Math.max(
    Math.abs(pos1.x - pos2.x),
    Math.abs(pos1.y - pos2.y),
    Math.abs(pos1.z - pos2.z)
  );
}

/**
 * Get skills sorted by their distance from center (0,0,0)
 */
export function sortSkillsByDistanceFromCenter(skills: Skill[]): Skill[] {
  const center = { x: 0, y: 0, z: 0 };
  return [...skills].sort((a, b) => {
    const distA = hexDistance(a.gridPosition, center);
    const distB = hexDistance(b.gridPosition, center);
    return distA - distB;
  });
}
