import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/ContextMenu.module.css';

// Define all possible context menu props
export interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  
  // Type of context
  type?: 'desktop' | 'file' | 'folder' | 'app';
  targetId?: string;
  
  // File operations
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onOpen?: () => void;
  onEdit?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onAddToDesktop?: () => void;
  onRemoveFromDesktop?: () => void;
  
  // Desktop operations
  onSort?: (sortType: string) => void;
  onRefresh?: () => void;
  onChangeBackground?: () => void;
  onDisplaySettings?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x, y, onClose, type = 'desktop', targetId,
  onNewFile, onNewFolder, onOpen, onEdit, onRename, onDelete, onDuplicate,
  onCopy, onCut, onPaste, onAddToDesktop, onRemoveFromDesktop,
  onSort, onRefresh, onChangeBackground, onDisplaySettings
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmenuToggle = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  // Position the context menu, ensuring it stays within viewport
  const style = {
    top: `${y}px`,
    left: `${x}px`,
  };

  // Render different menu items based on context type
  const renderMenuItems = () => {
    // Items that appear in all menus
    const commonItems = [];
    
    // New submenu (only for desktop and folder contexts)
    if ((type === 'desktop' || type === 'folder') && (onNewFile || onNewFolder)) {
      commonItems.push(
        <div 
          key="new"
          className={styles.menuItem} 
          onClick={() => handleSubmenuToggle('new')}
        >
          <span><i className="icon-new"></i> New</span>
          <span className={styles.submenuArrow}>›</span>
          
          {activeSubmenu === 'new' && (
            <div className={styles.submenu}>
              {onNewFile && (
                <div className={styles.menuItem} onClick={onNewFile}>
                  <span><i className="icon-file"></i> New File</span>
                </div>
              )}
              {onNewFolder && (
                <div className={styles.menuItem} onClick={onNewFolder}>
                  <span><i className="icon-folder"></i> New Folder</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // File/Folder specific actions
    if (type === 'file' || type === 'folder') {
      if (onOpen) {
        commonItems.push(
          <div key="open" className={styles.menuItem} onClick={onOpen}>
            <span><i className="icon-open"></i> Open</span>
          </div>
        );
      }
      
      if (type === 'file' && onEdit) {
        commonItems.push(
          <div key="edit" className={styles.menuItem} onClick={onEdit}>
            <span><i className="icon-edit"></i> Edit</span>
          </div>
        );
      }
      
      if (onRename) {
        commonItems.push(
          <div key="rename" className={styles.menuItem} onClick={onRename}>
            <span><i className="icon-rename"></i> Rename</span>
          </div>
        );
      }
      
      if (onDelete) {
        commonItems.push(
          <div key="delete" className={styles.menuItem} onClick={onDelete}>
            <span><i className="icon-delete"></i> Delete</span>
          </div>
        );
      }
      
      if (onDuplicate) {
        commonItems.push(
          <div key="duplicate" className={styles.menuItem} onClick={onDuplicate}>
            <span><i className="icon-duplicate"></i> Duplicate</span>
          </div>
        );
      }
      
      // Add/Remove from desktop
      if (onAddToDesktop) {
        commonItems.push(
          <div key="addToDesktop" className={styles.menuItem} onClick={onAddToDesktop}>
            <span><i className="icon-desktop"></i> Add to Desktop</span>
          </div>
        );
      }
      
      if (onRemoveFromDesktop) {
        commonItems.push(
          <div key="removeFromDesktop" className={styles.menuItem} onClick={onRemoveFromDesktop}>
            <span><i className="icon-desktop-remove"></i> Remove from Desktop</span>
          </div>
        );
      }
    }
    
    // Sort options (desktop, folder views)
    if ((type === 'desktop' || type === 'folder') && onSort) {
      commonItems.push(
        <div 
          key="sort"
          className={styles.menuItem} 
          onClick={() => handleSubmenuToggle('sort')}
        >
          <span><i className="icon-sort"></i> Sort by</span>
          <span className={styles.submenuArrow}>›</span>
          
          {activeSubmenu === 'sort' && (
            <div className={styles.submenu}>
              <div className={styles.menuItem} onClick={() => onSort('name')}>
                <span><i className="icon-sort-az"></i> Name (A-Z)</span>
              </div>
              <div className={styles.menuItem} onClick={() => onSort('name-desc')}>
                <span><i className="icon-sort-za"></i> Name (Z-A)</span>
              </div>
              <div className={styles.menuItem} onClick={() => onSort('date')}>
                <span><i className="icon-calendar"></i> Date modified</span>
              </div>
              <div className={styles.menuItem} onClick={() => onSort('size')}>
                <span><i className="icon-size"></i> Size</span>
              </div>
              <div className={styles.menuItem} onClick={() => onSort('type')}>
                <span><i className="icon-type"></i> Type</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // View options
    if (type === 'desktop' || type === 'folder') {
      commonItems.push(
        <div key="view" className={styles.menuItem} onClick={() => handleSubmenuToggle('view')}>
          <span><i className="icon-view"></i> View</span>
          <span className={styles.submenuArrow}>›</span>
        </div>
      );
    }
    
    // Refresh (for all contexts)
    if (onRefresh) {
      commonItems.push(
        <div key="refresh" className={styles.menuItem} onClick={onRefresh}>
          <span><i className="icon-refresh"></i> Refresh</span>
        </div>
      );
    }
    
    // Add a divider
    if (commonItems.length > 0 && (onChangeBackground || onDisplaySettings)) {
      commonItems.push(<div key="divider1" className={styles.divider}></div>);
    }
    
    // Desktop settings
    if (type === 'desktop') {
      if (onChangeBackground) {
        commonItems.push(
          <div key="background" className={styles.menuItem} onClick={onChangeBackground}>
            <span><i className="icon-background"></i> Change Background</span>
          </div>
        );
      }
      
      if (onDisplaySettings) {
        commonItems.push(
          <div key="display" className={styles.menuItem} onClick={onDisplaySettings}>
            <span><i className="icon-settings"></i> Display Settings</span>
          </div>
        );
      }
    }
    
    return commonItems;
  };

  return (
    <div ref={menuRef} className={styles.contextMenu} style={style}>
      {renderMenuItems()}
    </div>
  );
};

export default ContextMenu; 