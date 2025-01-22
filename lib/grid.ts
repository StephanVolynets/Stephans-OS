import { debounce } from "@/lib/utils";

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridItem {
  id: string;
  position: GridPosition;
}

export interface GridDimensions {
  cellWidth: number;
  cellHeight: number;
  gap: number;
  columns: number;
  rows: number;
}

export function calculateGridDimensions(containerWidth: number, containerHeight: number): GridDimensions {
  const cellWidth = 100;
  const cellHeight = 100;
  const gap = 16;
  
  const columns = Math.floor((containerWidth + gap) / (cellWidth + gap));
  const rows = Math.floor((containerHeight + gap) / (cellHeight + gap));
  
  return { cellWidth, cellHeight, gap, columns, rows };
}

export function calculateGridPosition(
  mouseX: number,
  mouseY: number,
  gridDimensions: GridDimensions,
  containerRect: DOMRect
): GridPosition {
  const { cellWidth, cellHeight, gap } = gridDimensions;
  
  const relativeX = mouseX - containerRect.left;
  const relativeY = mouseY - containerRect.top;
  
  const gridX = Math.floor(relativeX / (cellWidth + gap));
  const gridY = Math.floor(relativeY / (cellHeight + gap));
  
  return { x: gridX, y: gridY };
}

export function findNearestEmptyPosition(
  position: GridPosition,
  occupiedPositions: Set<string>,
  gridDimensions: GridDimensions
): GridPosition {
  const { columns, rows } = gridDimensions;
  const visited = new Set<string>();
  const queue: Array<[GridPosition, number]> = [[position, 0]];
  
  while (queue.length > 0) {
    const [current, distance] = queue.shift()!;
    const posKey = `${current.x},${current.y}`;
    
    if (
      current.x >= 0 &&
      current.x < columns &&
      current.y >= 0 &&
      current.y < rows &&
      !occupiedPositions.has(posKey) &&
      !visited.has(posKey)
    ) {
      return current;
    }
    
    visited.add(posKey);
    
    // Check adjacent positions in a spiral pattern
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0],
      [1, 1], [-1, -1], [1, -1], [-1, 1]
    ];
    
    for (const [dx, dy] of directions) {
      const newX = current.x + dx;
      const newY = current.y + dy;
      const newPosKey = `${newX},${newY}`;
      
      if (!visited.has(newPosKey)) {
        queue.push([{ x: newX, y: newY }, distance + 1]);
      }
    }
  }
  
  // Fallback to original position if no empty spot found
  return position;
}

export function getOccupiedPositions(items: GridItem[]): Set<string> {
  const occupied = new Set<string>();
  items.forEach(item => {
    occupied.add(`${item.position.x},${item.position.y}`);
  });
  return occupied;
}

export const updateDragImage = debounce((
  dragImage: HTMLElement,
  items: GridItem[],
  gridDimensions: GridDimensions
) => {
  const { cellWidth, cellHeight, gap } = gridDimensions;
  const itemCount = items.length;
  
  dragImage.style.width = `${cellWidth}px`;
  dragImage.style.height = `${cellHeight}px`;
  
  if (itemCount > 1) {
    dragImage.style.boxShadow = `4px 4px 0 rgba(0,0,0,0.2)`;
    dragImage.setAttribute('data-count', String(itemCount));
  }
}, 16);