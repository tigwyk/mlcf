'use client';

import { useState, useCallback, Suspense } from 'react';
import Navigation from '@/app/components/Navigation';
import SkillGrid from '@/app/components/SkillGrid';
import SkillSelector from '@/app/components/SkillSelector';
import BuildBrowser from '@/app/components/BuildBrowser';
import CalculatorImport from './CalculatorImport';
import { SkillDefinition, getSkillByGuid } from '@/lib/skillData';
import { parseSkillExport } from '@/lib/skillParser';

interface GridPosition {
  x: number;
  y: number;
  z: number;
}

interface PlacedSkill {
  skill: SkillDefinition;
  position: GridPosition;
}

const CHARACTERS = [
  { id: 0, name: 'The Gambler' },
  { id: 1, name: 'Leila the Medic' },
  // Add more characters as they are discovered
];

export default function Calculator() {
  const [character, setCharacter] = useState(0);
  const [characterLevel, setCharacterLevel] = useState(50);
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);
  const [placedSkills, setPlacedSkills] = useState<PlacedSkill[]>([]);
  const [importString, setImportString] = useState('');
  const [exportString, setExportString] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  const [showBuildBrowser, setShowBuildBrowser] = useState(false);
  const [importedBuildName, setImportedBuildName] = useState<string | null>(null);

  // Handle URL import parameter
  const handleUrlImport = useCallback((skills: PlacedSkill[], buildName: string, characterId?: number) => {
    setPlacedSkills(skills);
    setImportedBuildName(buildName);
    if (characterId) {
      setCharacter(characterId);
    }
    setShowImportExport(true);
  }, []);
  
  const handlePlaceSkill = (skill: SkillDefinition, position: GridPosition) => {
    setPlacedSkills([...placedSkills, { skill, position }]);
    setSelectedSkill(null); // Clear selection after placing
  };
  
  const handleRemoveSkill = (position: GridPosition) => {
    setPlacedSkills(placedSkills.filter(
      ps => !(ps.position.x === position.x && ps.position.y === position.y && ps.position.z === position.z)
    ));
  };
  
  const handleExport = () => {
    // Create loadout object
    const loadout = {
      character: character,
      nodes: placedSkills.map(ps => ({
        name: ps.skill.name,
        guid: ps.skill.guid,
        level: characterLevel,
        gridPosition: ps.position,
        isInventory: false,
      })),
    };
    
    // Encode to base64
    const json = JSON.stringify(loadout);
    const base64 = Buffer.from(json).toString('base64');
    const exportStr = `QUP-LOADOUT-v1:${base64}`;
    
    setExportString(exportStr);
    setShowImportExport(true);
  };
  
  const handleImport = (buildName?: string) => {
    const parsed = parseSkillExport(importString);
    
    if (!parsed.isValid) {
      alert(`Import failed: ${parsed.error}`);
      return;
    }
    
    // Convert parsed skills to placed skills
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
    
    setPlacedSkills(imported);
    setImportedBuildName(buildName || null);
    if (parsed.character) {
      setCharacter(parsed.character);
    }
    setImportString('');
    setShowImportExport(false);
    alert(`Successfully imported ${imported.length} skills!`);
  };

  const handleBuildSelect = (exportStr: string, buildName: string) => {
    setImportString(exportStr);
    setShowBuildBrowser(false);
    setShowImportExport(true);
    // Auto-import
    const parsed = parseSkillExport(exportStr);
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
      setPlacedSkills(imported);
      setImportedBuildName(buildName);
      if (parsed.character) {
        setCharacter(parsed.character);
      }
      alert(`Successfully imported "${buildName}" with ${imported.length} skills!`);
    }
  };
  
  const handleClearAll = () => {
    if (confirm('Clear all placed skills?')) {
      setPlacedSkills([]);
      setImportedBuildName(null);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportString);
      alert('Export string copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Suspense fallback={null}>
        <CalculatorImport onImport={handleUrlImport} />
      </Suspense>
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Skill Calculator
            </span>
          </h1>
          <p className="text-gray-400">
            Build your perfect Q-Up loadout. Place skills on the hexagonal grid and export to share your build.
          </p>
        </div>
        
        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">Character:</label>
              <select
                value={character}
                onChange={(e) => setCharacter(parseInt(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1"
              >
                {CHARACTERS.map(char => (
                  <option key={char.id} value={char.id}>{char.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">Character Level:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={characterLevel}
                onChange={(e) => setCharacterLevel(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 w-20 text-center"
              />
              <input
                type="range"
                min="1"
                max="50"
                value={characterLevel}
                onChange={(e) => setCharacterLevel(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowBuildBrowser(true)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
              >
                Browse Builds
              </button>
              <button
                onClick={() => setShowImportExport(!showImportExport)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
              >
                Import/Export
              </button>
              <button
                onClick={handleClearAll}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>Skills placed: {placedSkills.length}</p>
            {importedBuildName && (
              <p className="text-blue-400 mt-1">📦 Viewing: {importedBuildName}</p>
            )}
          </div>
        </div>
        
        {/* Import/Export Panel */}
        {showImportExport && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
            <h3 className="text-lg font-bold mb-4">Import/Export Build</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Import */}
              <div>
                <h4 className="font-semibold mb-2">Import Build</h4>
                <textarea
                  value={importString}
                  onChange={(e) => setImportString(e.target.value)}
                  placeholder="Paste QUP-LOADOUT-v1:... string here"
                  className="w-full h-24 bg-gray-700 border border-gray-600 rounded p-2 text-sm font-mono"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleImport()}
                    disabled={!importString}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-semibold transition-colors"
                  >
                    Import
                  </button>
                  <button
                    onClick={() => setShowBuildBrowser(true)}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
                  >
                    Browse Builds
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Don't have a build string? Click "Browse Builds" to import from the community!
                </p>
              </div>
              
              {/* Export */}
              <div>
                <h4 className="font-semibold mb-2">Export Build</h4>
                {exportString ? (
                  <>
                    <textarea
                      value={exportString}
                      readOnly
                      className="w-full h-24 bg-gray-700 border border-gray-600 rounded p-2 text-sm font-mono"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                      Copy to Clipboard
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm mb-2">
                      Place skills on the grid, then click Export to generate a shareable string.
                    </p>
                    <button
                      onClick={handleExport}
                      disabled={placedSkills.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                      Generate Export String
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Skill Grid - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SkillGrid
              placedSkills={placedSkills}
              onPlaceSkill={handlePlaceSkill}
              onRemoveSkill={handleRemoveSkill}
              selectedSkill={selectedSkill}
              characterLevel={characterLevel}
            />
          </div>
          
          {/* Skill Selector - Takes 1 column */}
          <div>
            <SkillSelector
              characterLevel={characterLevel}
              selectedSkill={selectedSkill}
              onSelectSkill={setSelectedSkill}
            />
          </div>
        </div>
        
        {/* Tips */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-3">Tips</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• <strong>Hex Skills</strong> are permanently placed on the grid - they unlock (light up) as you level up</li>
            <li>• <strong>Round Skills</strong> can be freely placed anywhere on the grid to create combos</li>
            <li>• Click a placed round skill to remove it from the grid</li>
            <li>• Skills execute in sequential order (1, 2, 3...) during coinflips</li>
            <li>• Chain reactions occur when skills trigger adjacent skills on the grid</li>
            <li>• Use Import/Export to share builds or save them to submit to the Builds section</li>
          </ul>
        </div>
      </div>

      {/* Build Browser Modal */}
      {showBuildBrowser && (
        <BuildBrowser
          onSelectBuild={handleBuildSelect}
          onClose={() => setShowBuildBrowser(false)}
        />
      )}
    </div>
  );
}
