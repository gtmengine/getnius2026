"use client";

import React, { useEffect, useRef, useState } from 'react';
import { List, CheckSquare, Trash2, MoreVertical } from 'lucide-react';

export interface ColumnHeaderPopoverProps {
  open: boolean;
  onClose: () => void;
  field: string;
  headerName: string;
  rect: DOMRect | null;
  isCustomColumn?: boolean;
  autoEditMode?: boolean;
  onRename?: (newName: string) => void;
  onDelete?: () => void;
  onSort?: (direction: 'asc' | 'desc') => void;
}

export function ColumnHeaderPopover({
  open,
  onClose,
  field,
  headerName,
  rect,
  isCustomColumn = false,
  autoEditMode = false,
  onRename,
  onDelete,
  onSort,
}: ColumnHeaderPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState(headerName);

  // Reset state when popover opens
  useEffect(() => {
    if (open) {
      setNewName(headerName);
    }
  }, [open, headerName]);

  // Focus and select input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure the popover is rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [open]);

  // Close on escape key
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // Save changes before closing if name changed
        if (newName.trim() && newName !== headerName && onRename) {
          onRename(newName.trim());
        }
        onClose();
      }
    };
    
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose, newName, headerName, onRename]);

  if (!open || !rect) return null;

  // Calculate position
  const popoverWidth = Math.max(rect.width, 220);
  const viewportWidth = window.innerWidth;
  let left = rect.left;
  
  if (left + popoverWidth > viewportWidth - 16) {
    left = viewportWidth - popoverWidth - 16;
  }
  if (left < 16) {
    left = 16;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (newName.trim() && newName !== headerName && onRename) {
        onRename(newName.trim());
      }
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-[100] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
      style={{
        top: rect.bottom + 4,
        left,
        width: popoverWidth,
        minWidth: rect.width,
      }}
    >
      {/* Header row with icons */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
        <List className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-700 flex-1 truncate">
          {newName || headerName}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Toggle checkbox"
          >
            <CheckSquare className="w-4 h-4 text-gray-400" />
          </button>
          {isCustomColumn && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Delete column"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Column name input */}
      <div className="p-3">
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          placeholder="Column name"
        />
      </div>
    </div>
  );
}
