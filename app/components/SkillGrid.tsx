'use client';

import { useState, useRef, useEffect } from 'react';
import { SkillDefinition, TriggerType, getHexSkills } from '@/lib/skillData';

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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const hexSize = 40;
  const gridPositions = generateHexGrid(4);
  const hexSkills = getHexSkills();
  
  // Prevent browser zoom when interacting with the grid
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const preventDefaultZoom = (e: WheelEvent | TouchEvent) => {
      if (e.ctrlKey || e.metaKey || (e as TouchEvent).touches?.length > 1) {
        e.preventDefault();
      }
    };
    
    // Prevent pinch zoom and ctrl+wheel zoom
    container.addEventListener('wheel', preventDefaultZoom, { passive: false });
    container.addEventListener('touchstart', preventDefaultZoom, { passive: false });
    container.addEventListener('touchmove', preventDefaultZoom, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', preventDefaultZoom);
      container.removeEventListener('touchstart', preventDefaultZoom);
      container.removeEventListener('touchmove', preventDefaultZoom);
    };
  }, []);
  
  // Get skill at position - check both placed skills and hex unlocks
  const getSkillAtPosition = (pos: GridPosition): PlacedSkill | undefined => {
    // First check manually placed skills
    const placedSkill = placedSkills.find(
      ps => ps.position.x === pos.x && ps.position.y === pos.y && ps.position.z === pos.z
    );
    if (placedSkill) return placedSkill;
    
    // Then check hex unlock skills (always present, just locked/unlocked)
    const hexSkill = hexSkills.find(
      hs => hs.fixedPosition && 
           hs.fixedPosition.x === pos.x && 
           hs.fixedPosition.y === pos.y && 
           hs.fixedPosition.z === pos.z
    );
    if (hexSkill) {
      return { skill: hexSkill, position: pos };
    }
    
    return undefined;
  };
  
  const handleHexClick = (pos: GridPosition) => {
    // Don't trigger click if we were dragging
    if (isDragging) return;
    
    const existingSkill = getSkillAtPosition(pos);
    
    // Don't allow interaction with hex unlock positions
    if (existingSkill?.skill.type === 'hex') {
      return; // Hex skills are fixed and can't be removed
    }
    
    if (existingSkill) {
      // Remove placed round skill
      onRemoveSkill(pos);
    } else if (selectedSkill) {
      // Only round skills can be placed by user
      if (selectedSkill.type === 'round') {
        onPlaceSkill(selectedSkill, pos);
      }
    }
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };
  
  const handleMouseUp = () => {
    // Small delay to prevent click event from firing after drag
    setTimeout(() => setIsDragging(false), 10);
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.2));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, prev - 0.2));
  };
  
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      const newDistance = getTouchDistance(e.touches);
      const delta = (newDistance - lastTouchDistance) * 0.01;
      setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
      setLastTouchDistance(newDistance);
    }
  };
  
  const handleTouchEnd = () => {
    setLastTouchDistance(null);
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
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold mb-2">Skill Grid</h3>
          <p className="text-sm text-gray-400">
            {selectedSkill ? `Click to place: ${selectedSkill.name}` : 'Select a skill to place it on the grid'}
          </p>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleZoomOut}
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={handleResetView}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs transition-colors"
            title="Reset View"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded border border-gray-700" 
        style={{ 
          height: '600px',
          touchAction: 'none', // Disable browser touch gestures
        }}
      >
        <div
          className="absolute inset-0"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
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
            let isLocked = false;
            
            if (placedSkill) {
              const isHexSkill = placedSkill.skill.type === 'hex';
              const levelReq = placedSkill.skill.levelRequirement ?? 0;
              isLocked = isHexSkill && characterLevel < levelReq;
              
              if (isLocked) {
                // Greyed out - locked hex skill
                fillColor = '#374151'; // gray-700
                strokeColor = '#4b5563'; // gray-600
                strokeWidth = 1;
              } else {
                // Unlocked - show trigger color
                const triggerColor = TRIGGER_COLORS[placedSkill.skill.trigger];
                fillColor = triggerColor.replace('bg-', '#');
                const colorMap: Record<string, string> = {
                  '#3b82f6': '#3b82f6', // blue
                  '#22c55e': '#22c55e', // green
                  '#ef4444': '#ef4444', // red
                  '#a855f7': '#a855f7', // purple
                };
                fillColor = colorMap[fillColor] || fillColor;
                strokeColor = isHexSkill ? '#9ca3af' : '#ffffff'; // gray-400 for hex, white for round
                strokeWidth = 2;
              }
            } else if (isHovered && selectedSkill && selectedSkill.type === 'round') {
              fillColor = '#4b5563'; // gray-600
              strokeColor = '#60a5fa'; // blue-400
              strokeWidth = 2;
            }
            
            return (
              <g key={idx}>
                <polygon
                  points={points.join(' ')}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredPosition(pos)}
                  onMouseLeave={() => setHoveredPosition(null)}
                  onClick={() => handleHexClick(pos)}
                  style={{ pointerEvents: 'all' }}
                />
                
                {placedSkill && (
                  <>
                    <text
                      x={adjustedX}
                      y={adjustedY - 8}
                      textAnchor="middle"
                      className={`text-xs font-bold pointer-events-none ${
                        isLocked ? 'fill-gray-500' : 'fill-white'
                      }`}
                      style={{ fontSize: '10px' }}
                    >
                      {placedSkill.skill.name.substring(0, 8)}
                    </text>
                    <text
                      x={adjustedX}
                      y={adjustedY + 8}
                      textAnchor="middle"
                      className={`text-xs pointer-events-none ${
                        isLocked ? 'fill-gray-500' : 'fill-white'
                      }`}
                      style={{ fontSize: '8px' }}
                    >
                      {isLocked ? '🔒' : `⚡${placedSkill.skill.charges}`}
                    </text>
                  </>
                )}
                
                {!placedSkill && (
                  <text
                    x={adjustedX}
                    y={adjustedY + 4}
                    textAnchor="middle"
                    className="fill-gray-500 text-xs pointer-events-none"
                    style={{ fontSize: '10px' }}
                  >
                    {idx + 1}
                  </text>
                )}
              </g>
            );
          })}
          </svg>
        </div>
        
        {/* Help Text */}
        <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-90 px-3 py-2 rounded text-xs text-gray-400">
          <p>🖱️ Drag to pan • 🔍 Scroll to zoom</p>
        </div>
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
