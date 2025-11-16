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
// GUIDs are from actual Q-Up game exports
export const ROUND_SKILLS: SkillDefinition[] = [
  {
    guid: '87991029142bd42739b141a284a68b12',
    name: 'Battle Medic',
    type: 'round',
    charges: 3,
    trigger: 'ON_WIN',
    description: 'Heal yourself when you win a flip. Triggers adjacent skills.',
    levelRequirement: 1,
  },
  {
    guid: '3bd89761db7ec422da708839f34048ba',
    name: 'Angel',
    type: 'round',
    charges: 2,
    trigger: 'ON_TRIGGER',
    description: 'When triggered, gain temporary invulnerability. Activates connected skills.',
    levelRequirement: 5,
  },
  {
    guid: 'f685bad6490cd4ae9a1403282ad36e16',
    name: 'EMT',
    type: 'round',
    charges: 2,
    trigger: 'ON_WIN',
    description: 'Emergency medical technician - heal allies.',
    levelRequirement: 3,
  },
  {
    guid: '98e601e1275864dfaab6b5b0a2deb0d2',
    name: 'Stop the Bleeding',
    type: 'round',
    charges: 1,
    trigger: 'ON_LOSS',
    description: 'Prevent damage from loss.',
    levelRequirement: 5,
  },
  {
    guid: '59b7d7b722fa048a69c6cdcfbc517887',
    name: 'Self Diagnosis',
    type: 'round',
    charges: 2,
    trigger: 'ON_FLIP',
    description: 'Analyze your condition.',
    levelRequirement: 4,
  },
  {
    guid: '270de55c24a5f44c98656dcabd728c97',
    name: 'Panic',
    type: 'round',
    charges: 3,
    trigger: 'ON_LOSS',
    description: 'React in panic when losing.',
    levelRequirement: 2,
  },
  {
    guid: '1a2b77984213c45da81476ee91af8373',
    name: 'Precision Cut',
    type: 'round',
    charges: 2,
    trigger: 'ON_WIN',
    description: 'Make precise surgical strikes.',
    levelRequirement: 8,
  },
  {
    guid: 'd4e5de763e92244d29dc2f6f20f5ff52',
    name: 'Triage',
    type: 'round',
    charges: 2,
    trigger: 'ON_FLIP',
    description: 'Prioritize healing targets.',
    levelRequirement: 10,
  },
  {
    guid: 'cac308e32054449ac9fbb553956f9ed1',
    name: 'Big Sister',
    type: 'round',
    charges: 3,
    trigger: 'ON_TRIGGER',
    description: 'Protective support ability.',
    levelRequirement: 12,
  },
  {
    guid: '0ca0cb8ae08b11f4d9105f4829f945ec',
    name: 'Exhiliration',
    type: 'round',
    charges: 2,
    trigger: 'ON_WIN',
    description: 'Feel energized from victory.',
    levelRequirement: 6,
  },
  {
    guid: '350c9803c46614d2692cac4e6b9a8197',
    name: 'Surgeon',
    type: 'round',
    charges: 1,
    trigger: 'ON_FLIP',
    description: 'Expert medical skill.',
    levelRequirement: 15,
  },
  {
    guid: '7e965edf71e8645abac5133d5d785357',
    name: 'Adrenaline',
    type: 'round',
    charges: 3,
    trigger: 'ON_TRIGGER',
    description: 'Boost performance with adrenaline.',
    levelRequirement: 7,
  },
  {
    guid: 'f4b670b10ca374d6282b55f552d5aa21',
    name: 'Focus',
    type: 'round',
    charges: 2,
    trigger: 'ON_FLIP',
    description: 'Concentrate for better results.',
    levelRequirement: 5,
  },
  {
    guid: '1cdafdf81e14645858695922c81ccb2b',
    name: 'Stimulant',
    type: 'round',
    charges: 2,
    trigger: 'ON_FLIP',
    description: 'Use stimulants for enhancement.',
    levelRequirement: 10,
  },
  {
    guid: '76b5c93328a57408ebfdaec5f7591f60',
    name: 'Heroine',
    type: 'round',
    charges: 1,
    trigger: 'ON_WIN',
    description: 'Become the hero.',
    levelRequirement: 20,
  },
  {
    guid: 'f64a16beb5af1476898cb41b4a2c68a2',
    name: 'Funeral Rites',
    type: 'round',
    charges: 1,
    trigger: 'ON_LOSS',
    description: 'Honor the fallen.',
    levelRequirement: 25,
  },
  {
    guid: '21a86fcf6074f4e4dbd0b62f0f7b37fc',
    name: 'Extra Dose',
    type: 'round',
    charges: 3,
    trigger: 'ON_TRIGGER',
    description: 'Administer additional treatment.',
    levelRequirement: 14,
  },
  {
    guid: '9041601e7a1234e19928cf25deec644e',
    name: 'Angel of Death',
    type: 'round',
    charges: 1,
    trigger: 'ON_LOSS',
    description: 'Deadly when desperate.',
    levelRequirement: 30,
  },
  {
    guid: '90e1391d38c9041acaa19ca4bbc42597',
    name: 'Low Point',
    type: 'round',
    charges: 2,
    trigger: 'ON_LOSS',
    description: 'Benefit from being at low health.',
    levelRequirement: 12,
  },
  {
    guid: '98936d1a861664444a7470b16e849100',
    name: 'Deployment',
    type: 'round',
    charges: 2,
    trigger: 'ON_FLIP',
    description: 'Deploy medical support.',
    levelRequirement: 18,
  },
  {
    guid: '2a6888039408f4c15a75fa4c73d12e17',
    name: 'Insurance Scam',
    type: 'round',
    charges: 1,
    trigger: 'ON_TRIGGER',
    description: 'Exploit the system.',
    levelRequirement: 22,
  },
  {
    guid: '6ec66fff3b818448eaa7b1aac9719152',
    name: 'Escalation',
    type: 'round',
    charges: 3,
    trigger: 'ON_WIN',
    description: 'Increase intensity with each win.',
    levelRequirement: 16,
  },
  {
    guid: 'f011287f20e654d359fa1d5e1f8530ae',
    name: 'Battle Hardened',
    type: 'round',
    charges: 2,
    trigger: 'ON_LOSS',
    description: 'Toughen up from combat experience.',
    levelRequirement: 24,
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
