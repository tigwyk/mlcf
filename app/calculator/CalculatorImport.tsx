'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseSkillExport } from '@/lib/skillParser';
import { getSkillByGuid, SkillDefinition } from '@/lib/skillData';

interface GridPosition {
  x: number;
  y: number;
  z: number;
}

interface PlacedSkill {
  skill: SkillDefinition;
  position: GridPosition;
}

interface CalculatorImportProps {
  onImport: (skills: PlacedSkill[], buildName: string, characterId?: number) => void;
}

export default function CalculatorImport({ onImport }: CalculatorImportProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const importParam = searchParams?.get('import');
    if (importParam) {
      const parsed = parseSkillExport(importParam);
      if (parsed.isValid) {
        const imported: PlacedSkill[] = [];
        for (const skill of parsed.skills) {
          const skillDef = getSkillByGuid(skill.guid);
          if (skillDef) {
            imported.push({
              skill: skillDef,
              position: skill.gridPosition,
            });
          }
        }
        onImport(imported, 'Imported Build', parsed.character);
      }
    }
  }, [searchParams, onImport]);

  return null;
}
