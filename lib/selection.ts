export function createSelectionStyles(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number
) {
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  return {
    left,
    top,
    width,
    height,
  };
}

export function isIconInSelection(
  iconRect: DOMRect,
  selectionRect: { left: number; top: number; width: number; height: number },
  containerRect: DOMRect
) {
  const selectionBounds = {
    left: selectionRect.left,
    right: selectionRect.left + selectionRect.width,
    top: selectionRect.top,
    bottom: selectionRect.top + selectionRect.height,
  };

  const iconBounds = {
    left: iconRect.left - containerRect.left,
    right: iconRect.right - containerRect.left,
    top: iconRect.top - containerRect.top,
    bottom: iconRect.bottom - containerRect.top,
  };

  return !(
    iconBounds.left > selectionBounds.right ||
    iconBounds.right < selectionBounds.left ||
    iconBounds.top > selectionBounds.bottom ||
    iconBounds.bottom < selectionBounds.top
  );
}