'use client';

import { useState } from 'react';
import { SkillDefinition, TriggerType } from '@/lib/skillData';

interface GridPosition {
  x: number;
  y: number;
  z: number;
}

interface PlacedSkill {
  skill: SkillDefinition;
  position: GridPosition;
}

interface SkillGridProps {
  placedSkills: PlacedSkill[];
  onPlaceSkill: (skill: SkillDefinition, position: GridPosition) => void;
  onRemoveSkill: (position: GridPosition) => void;
  selectedSkill: SkillDefinition | null;
  characterLevel: number;
}

// Convert cubic coordinates to pixel coordinates for rendering
function cubicToPixel(x: number, y: number, z: number, size: number): { x: number; y: number } {
  const pixelX = size * (3/2 * x);
  const pixelY = size * (Math.sqrt(3)/2 * x + Math.sqrt(3) * z);
  return { x: pixelX, y: pixelY };
}

// Generate hex grid positions (rings around center)
function generateHexGrid(rings: number): GridPosition[] {
  const positions: GridPosition[] = [{ x: 0, y: 0, z: 0 }]; // Center
  
  for (let ring = 1; ring <= rings; ring++) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < ring; j++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.round(ring * Math.cos(angle) + j * Math.cos(angle + Math.PI * 2/3));
        const z = Math.round(ring * Math.sin(angle) + j * Math.sin(angle + Math.PI * 2/3));
        const y = -x - z;
        
        if (!positions.some(p => p.x === x && p.y === y && p.z === z)) {
          positions.push({ x, y, z });
        }
      }
    }
  }
  
  return positions;
}

const TRIGGER_COLORS: Record<TriggerType, string> = {
  ON_FLIP: 'bg-blue-500',
  ON_WIN: 'bg-green-500',
  ON_LOSS: 'bg-red-500',
  ON_TRIGGER: 'bg-purple-500',
};

const TRIGGER_BORDER: Record<TriggerType, string> = {
  ON_FLIP: 'border-blue-400',
  ON_WIN: 'border-green-400',
  ON_LOSS: 'border-red-400',
  ON_TRIGGER: 'border-purple-400',
};

export default function SkillGrid({
  placedSkills,
  onPlaceSkill,
  onRemoveSkill,
  selectedSkill,
  characterLevel,
}: SkillGridProps) {
  const [hoveredPosition, setHoveredPosition] = useState<GridPosition | null>(null);
  
  const hexSize = 40;
  const gridPositions = generateHexGrid(4);
  
  const getSkillAtPosition = (pos: GridPosition): PlacedSkill | undefined => {
    return placedSkills.find(
      ps => ps.position.x === pos.x && ps.position.y === pos.y && ps.position.z === pos.z
    );
  };
  
  const handleHexClick = (pos: GridPosition) => {
    const existingSkill = getSkillAtPosition(pos);
    
    if (existingSkill) {
      onRemoveSkill(pos);
    } else if (selectedSkill) {
      // Check if it's a hex skill with fixed position
      if (selectedSkill.fixedPosition) {
        const fixedPos = selectedSkill.fixedPosition;
        if (pos.x === fixedPos.x && pos.y === fixedPos.y && pos.z === fixedPos.z) {
          onPlaceSkill(selectedSkill, pos);
        }
      } else {
        onPlaceSkill(selectedSkill, pos);
      }
    }
  };
  
  // Calculate viewBox to center the grid
  const minX = Math.min(...gridPositions.map(p => cubicToPixel(p.x, p.y, p.z, hexSize).x));
  const maxX = Math.max(...gridPositions.map(p => cubicToPixel(p.x, p.y, p.z, hexSize).x));
  const minY = Math.min(...gridPositions.map(p => cubicToPixel(p.x, p.y, p.z, hexSize).y));
  const maxY = Math.max(...gridPositions.map(p => cubicToPixel(p.x, p.y, p.z, hexSize).y));
  
  const padding = hexSize * 1.5;
  const viewBoxWidth = maxX - minX + padding * 2;
  const viewBoxHeight = maxY - minY + padding * 2;
  const offsetX = -minX + padding;
  const offsetY = -minY + padding;
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">Skill Grid</h3>
        <p className="text-sm text-gray-400">
          {selectedSkill ? `Click to place: ${selectedSkill.name}` : 'Select a skill to place it on the grid'}
        </p>
      </div>
      
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full max-w-3xl"
          style={{ maxHeight: '600px' }}
        >
          {gridPositions.map((pos, idx) => {
            const { x: px, y: py } = cubicToPixel(pos.x, pos.y, pos.z, hexSize);
            const adjustedX = px + offsetX;
            const adjustedY = py + offsetY;
            const placedSkill = getSkillAtPosition(pos);
            const isHovered = hoveredPosition?.x === pos.x && hoveredPosition?.y === pos.y && hoveredPosition?.z === pos.z;
            
            // Hexagon points
            const points = [];
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i - Math.PI / 6;
              const hx = adjustedX + (hexSize * 0.85) * Math.cos(angle);
              const hy = adjustedY + (hexSize * 0.85) * Math.sin(angle);
              points.push(`${hx},${hy}`);
            }
            
            let fillColor = '#1f2937'; // gray-800
            let strokeColor = '#374151'; // gray-700
            let strokeWidth = 1;
            
            if (placedSkill) {
              const triggerColor = TRIGGER_COLORS[placedSkill.skill.trigger];
              fillColor = triggerColor.replace('bg-', '#');
              const colorMap: Record<string, string> = {
                '#3b82f6': '#3b82f6', // blue
                '#22c55e': '#22c55e', // green
                '#ef4444': '#ef4444', // red
                '#a855f7': '#a855f7', // purple
              };
              fillColor = colorMap[fillColor] || fillColor;
              strokeColor = '#ffffff';
              strokeWidth = 2;
            } else if (isHovered && selectedSkill) {
              fillColor = '#4b5563'; // gray-600
              strokeColor = '#60a5fa'; // blue-400
              strokeWidth = 2;
            }
            
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPosition(pos)}
                onMouseLeave={() => setHoveredPosition(null)}
                onClick={() => handleHexClick(pos)}
                className="cursor-pointer"
              >
                <polygon
                  points={points.join(' ')}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-all"
                />
                
                {placedSkill && (
                  <>
                    <text
                      x={adjustedX}
                      y={adjustedY - 8}
                      textAnchor="middle"
                      className="fill-white text-xs font-bold pointer-events-none"
                      style={{ fontSize: '10px' }}
                    >
                      {placedSkill.skill.name.substring(0, 8)}
                    </text>
                    <text
                      x={adjustedX}
                      y={adjustedY + 8}
                      textAnchor="middle"
                      className="fill-white text-xs pointer-events-none"
                      style={{ fontSize: '8px' }}
                    >
                      ⚡{placedSkill.skill.charges}
                    </text>
                  </>
                )}
                
                {!placedSkill && (
                  <text
                    x={adjustedX}
                    y={adjustedY + 4}
                    textAnchor="middle"
                    className="fill-gray-500 text-xs pointer-events-none"
                    style={{ fontSize: '8px' }}
                  >
                    {pos.x},{pos.z}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>ON FLIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>ON WIN</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>ON LOSS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>ON TRIGGER</span>
        </div>
      </div>
    </div>
  );
}
