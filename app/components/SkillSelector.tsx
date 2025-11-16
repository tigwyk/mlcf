'use client';

import { useState } from 'react';
import { SkillDefinition, getSkillsByLevel, TriggerType } from '@/lib/skillData';

interface SkillSelectorProps {
  characterLevel: number;
  selectedSkill: SkillDefinition | null;
  onSelectSkill: (skill: SkillDefinition | null) => void;
}

const TRIGGER_COLORS: Record<TriggerType, string> = {
  ON_FLIP: 'bg-blue-500',
  ON_WIN: 'bg-green-500',
  ON_LOSS: 'bg-red-500',
  ON_TRIGGER: 'bg-purple-500',
};

const TRIGGER_TEXT: Record<TriggerType, string> = {
  ON_FLIP: 'On Flip',
  ON_WIN: 'On Win',
  ON_LOSS: 'On Loss',
  ON_TRIGGER: 'On Trigger',
};

export default function SkillSelector({
  characterLevel,
  selectedSkill,
  onSelectSkill,
}: SkillSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'hex' | 'round'>('all');
  const [triggerFilter, setTriggerFilter] = useState<TriggerType | 'all'>('all');
  
  const availableSkills = getSkillsByLevel(characterLevel);
  
  // Filter out hex skills (they're auto-placed on grid)
  const filteredSkills = availableSkills.filter(skill => {
    if (skill.type === 'hex') return false; // Hex skills are fixed on grid
    if (filter !== 'all' && skill.type !== filter) return false;
    if (triggerFilter !== 'all' && skill.trigger !== triggerFilter) return false;
    return true;
  });
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">Available Skills</h3>
        <p className="text-sm text-gray-400 mb-4">
          Level {characterLevel} - {availableSkills.filter(s => s.type === 'round').length} round skills unlocked
        </p>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('round')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'round' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Round Skills
          </button>
          <button
            onClick={() => setFilter('hex')}
            className={`px-3 py-1 rounded text-sm ${
              filter === 'hex' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Hex Unlocks
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTriggerFilter('all')}
            className={`px-3 py-1 rounded text-xs ${
              triggerFilter === 'all' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            All Triggers
          </button>
          {(['ON_FLIP', 'ON_WIN', 'ON_LOSS', 'ON_TRIGGER'] as TriggerType[]).map(trigger => (
            <button
              key={trigger}
              onClick={() => setTriggerFilter(trigger)}
              className={`px-3 py-1 rounded text-xs ${
                triggerFilter === trigger ? TRIGGER_COLORS[trigger] : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {TRIGGER_TEXT[trigger]}
            </button>
          ))}
        </div>
      </div>
      
      {/* Clear Selection */}
      {selectedSkill && (
        <div className="mb-4 p-3 bg-blue-900 border border-blue-600 rounded">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold">{selectedSkill.name}</p>
              <p className="text-xs text-gray-300">{selectedSkill.description}</p>
            </div>
            <button
              onClick={() => onSelectSkill(null)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      {/* Skills List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredSkills.map(skill => {
          const isSelected = selectedSkill?.guid === skill.guid;
          const triggerColor = TRIGGER_COLORS[skill.trigger];
          
          return (
            <button
              key={skill.guid}
              onClick={() => onSelectSkill(skill)}
              className={`w-full text-left p-3 rounded transition-colors ${
                isSelected
                  ? 'bg-blue-700 border-2 border-blue-400'
                  : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold truncate">{skill.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${triggerColor} text-white`}>
                      {TRIGGER_TEXT[skill.trigger]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">{skill.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>⚡ {skill.charges} charge{skill.charges !== 1 ? 's' : ''}</span>
                    <span>📊 Level {skill.levelRequirement}</span>
                    {skill.type === 'hex' && <span>🔒 Fixed Position</span>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        
        {filteredSkills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No skills match the current filters
          </div>
        )}
      </div>
    </div>
  );
}
