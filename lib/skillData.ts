/**
 * Q-Up Skill Database
 * 
 * Contains all skills with their properties:
 * - guid: Unique identifier from game
 * - name: Display name
 * - type: 'hex' (fixed unlock) or 'round' (placeable)
 * - charges: Number of activations per flip
 * - trigger: When the skill activates
 * - description: What the skill does
 * - levelRequirement: Character level needed to unlock
 */

export type TriggerType = 'ON_FLIP' | 'ON_WIN' | 'ON_LOSS' | 'ON_TRIGGER';
export type SkillType = 'hex' | 'round';

export interface SkillDefinition {
  guid: string;
  name: string;
  type: SkillType;
  charges: number;
  trigger: TriggerType;
  description: string;
  levelRequirement?: number;
  fixedPosition?: { x: number; y: number; z: number };
}

// Hex unlock skills (fixed positions)
export const HEX_SKILLS: SkillDefinition[] = [
  {
    guid: 'hex-level-10',
    name: 'Level 10',
    type: 'hex',
    charges: 1,
    trigger: 'ON_FLIP',
    description: 'Unlocks at level 10',
    levelRequirement: 10,
    fixedPosition: { x: 1, y: -1, z: 0 },
  },
  {
    guid: 'hex-level-20',
    name: 'Level 20',
    type: 'hex',
    charges: 1,
    trigger: 'ON_FLIP',
    description: 'Unlocks at level 20',
    levelRequirement: 20,
    fixedPosition: { x: 2, y: -1, z: -1 },
  },
  {
    guid: 'hex-level-30',
    name: 'Level 30',
    type: 'hex',
    charges: 1,
    trigger: 'ON_FLIP',
    description: 'Unlocks at level 30',
    levelRequirement: 30,
    fixedPosition: { x: 1, y: 0, z: -1 },
  },
  {
    guid: 'hex-level-40',
    name: 'Level 40',
    type: 'hex',
    charges: 1,
    trigger: 'ON_FLIP',
    description: 'Unlocks at level 40',
    levelRequirement: 40,
    fixedPosition: { x: 2, y: 0, z: -2 },
  },
  {
    guid: 'hex-level-50',
    name: 'Level 50',
    type: 'hex',
    charges: 1,
    trigger: 'ON_FLIP',
    description: 'Unlocks at level 50 (max)',
    levelRequirement: 50,
    fixedPosition: { x: 3, y: -1, z: -2 },
  },
];

// Round skills (placeable anywhere)
export const ROUND_SKILLS: SkillDefinition[] = [
  {
    guid: 'battle-medic-001',
    name: 'Battle Medic',
    type: 'round',
    charges: 3,
    trigger: 'ON_WIN',
    description: 'Heal yourself when you win a flip. Triggers adjacent skills.',
    levelRequirement: 1,
  },
  {
    guid: 'angel-001',
    name: 'Angel',
    type: 'round',
    charges: 2,
    trigger: 'ON_TRIGGER',
    description: 'When triggered, gain temporary invulnerability. Activates connected skills.',
    levelRequirement: 5,
  },
  {
    guid: 'lucky-charm-001',
    name: 'Lucky Charm',
    type: 'round',
    charges: 1,
    trigger: 'ON_FLIP',
    description: 'Increase win chance for this flip. Single use per coinflip.',
    levelRequirement: 3,
  },
  {
    guid: 'comeback-kid-001',
    name: 'Comeback Kid',
    type: 'round',
    charges: 2,
    trigger: 'ON_LOSS',
    description: 'When you lose, gain bonus points for next flip.',
    levelRequirement: 7,
  },
  {
    guid: 'chain-reaction-001',
    name: 'Chain Reaction',
    type: 'round',
    charges: 4,
    trigger: 'ON_TRIGGER',
    description: 'Triggers all adjacent skills when activated. Can create powerful combos.',
    levelRequirement: 10,
  },
  {
    guid: 'momentum-001',
    name: 'Momentum',
    type: 'round',
    charges: 3,
    trigger: 'ON_WIN',
    description: 'Stack bonuses with consecutive wins.',
    levelRequirement: 8,
  },
  {
    guid: 'insurance-001',
    name: 'Insurance',
    type: 'round',
    charges: 1,
    trigger: 'ON_LOSS',
    description: 'Prevent point loss on first loss.',
    levelRequirement: 12,
  },
  {
    guid: 'double-down-001',
    name: 'Double Down',
    type: 'round',
    charges: 2,
    trigger: 'ON_FLIP',
    description: 'Risk double points - win big or lose big.',
    levelRequirement: 15,
  },
  {
    guid: 'sage-wisdom-001',
    name: 'Sage Wisdom',
    type: 'round',
    charges: 2,
    trigger: 'ON_FLIP',
    description: 'See opponent\'s last flip result before choosing.',
    levelRequirement: 18,
  },
  {
    guid: 'phoenix-down-001',
    name: 'Phoenix Down',
    type: 'round',
    charges: 1,
    trigger: 'ON_LOSS',
    description: 'Resurrect from elimination once per game.',
    levelRequirement: 25,
  },
  {
    guid: 'mirror-shield-001',
    name: 'Mirror Shield',
    type: 'round',
    charges: 2,
    trigger: 'ON_TRIGGER',
    description: 'Reflect opponent\'s skill effects back at them.',
    levelRequirement: 20,
  },
  {
    guid: 'time-warp-001',
    name: 'Time Warp',
    type: 'round',
    charges: 1,
    trigger: 'ON_FLIP',
    description: 'Rewind to before your last flip.',
    levelRequirement: 30,
  },
  {
    guid: 'gambler-001',
    name: 'Gambler',
    type: 'round',
    charges: 3,
    trigger: 'ON_FLIP',
    description: 'Random effect - could be amazing or terrible.',
    levelRequirement: 22,
  },
  {
    guid: 'perfectionist-001',
    name: 'Perfectionist',
    type: 'round',
    charges: 1,
    trigger: 'ON_WIN',
    description: 'Massive bonus if you win without any losses.',
    levelRequirement: 35,
  },
  {
    guid: 'underdog-001',
    name: 'Underdog',
    type: 'round',
    charges: 3,
    trigger: 'ON_LOSS',
    description: 'Stronger when behind in points.',
    levelRequirement: 16,
  },
  {
    guid: 'tactician-001',
    name: 'Tactician',
    type: 'round',
    charges: 2,
    trigger: 'ON_FLIP',
    description: 'Plan ahead - set up triggers for future flips.',
    levelRequirement: 28,
  },
  {
    guid: 'berserk-001',
    name: 'Berserk',
    type: 'round',
    charges: 4,
    trigger: 'ON_WIN',
    description: 'Gain attack power but lose defense with each win.',
    levelRequirement: 24,
  },
  {
    guid: 'meditation-001',
    name: 'Meditation',
    type: 'round',
    charges: 1,
    trigger: 'ON_FLIP',
    description: 'Skip this flip to recharge all skill charges.',
    levelRequirement: 32,
  },
  {
    guid: 'copycat-001',
    name: 'Copycat',
    type: 'round',
    charges: 2,
    trigger: 'ON_TRIGGER',
    description: 'Copy the last skill your opponent used.',
    levelRequirement: 27,
  },
  {
    guid: 'last-stand-001',
    name: 'Last Stand',
    type: 'round',
    charges: 1,
    trigger: 'ON_LOSS',
    description: 'Guaranteed win on your next flip when health is critical.',
    levelRequirement: 40,
  },
];

export const ALL_SKILLS: SkillDefinition[] = [...HEX_SKILLS, ...ROUND_SKILLS];

export function getSkillByGuid(guid: string): SkillDefinition | undefined {
  return ALL_SKILLS.find(skill => skill.guid === guid);
}

export function getSkillsByLevel(level: number): SkillDefinition[] {
  return ALL_SKILLS.filter(skill => (skill.levelRequirement ?? 0) <= level);
}

export function getRoundSkills(): SkillDefinition[] {
  return ROUND_SKILLS;
}

export function getHexSkills(): SkillDefinition[] {
  return HEX_SKILLS;
}
