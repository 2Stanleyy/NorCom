import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Notes.css';

// Add this import for markdown rendering
import ReactMarkdown from 'react-markdown';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const defaultNotes: Note[] = [
  {
    id: '1',
    title: 'Mission Briefing',
    content: 'Complete the main dashboard layout by end of week.',
    tags: ['work', 'urgent'],
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10')
  },
  {
    id: '2',
    title: 'UI Design Ideas',
    content: 'Consider adding dark mode toggle and customizable themes.',
    tags: ['design', 'idea'],
    createdAt: new Date('2023-03-08'),
    updatedAt: new Date('2023-03-09')
  }
];

// Helper function to parse dates from localStorage
const parseDates = (notes: any[]): Note[] => {
  return notes.map(note => ({
    ...note,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt)
  }));
};

type SortOption = 'date-newest' | 'date-oldest' | 'title-asc' | 'title-desc';

const Notes: React.FC = () => {
  // Load notes from localStorage or use defaults
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        return parseDates(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Error parsing saved notes:', error);
        return defaultNotes;
      }
    }
    return defaultNotes;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editedNote, setEditedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Add state for markdown preview toggle
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  // Add state for sort option
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');
  // Add state for auto-save status
  const [autoSaveStatus, setAutoSaveStatus] = useState<string | null>(null);
  
  // Add auto-save timer reference
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add ref for file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);
  
  useEffect(() => {
    if (notes.length && !selectedNote) {
      setSelectedNote(notes[0]);
      setEditedNote(notes[0]);
    }
  }, [notes, selectedNote]);

  // Initialize editedNote when a note is selected
  useEffect(() => {
    if (selectedNote) {
      setEditedNote(selectedNote);
    }
  }, [selectedNote]);
  
  // Auto-save functionality
  useEffect(() => {
    if (isEditing && editedNote) {
      // Clear previous timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set new timer to save after 2 seconds of inactivity
      autoSaveTimerRef.current = setTimeout(() => {
        handleSaveNote(true);
        setAutoSaveStatus('Changes auto-saved');
        
        // Clear the status message after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus(null);
        }, 2000);
      }, 2000);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editedNote, isEditing]);
  
  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditedNote(newNote);
    setIsEditing(true);
  };

  const handleSaveNote = (isAutoSave = false) => {
    if (!editedNote) return;
    
    const updatedNote = {
      ...editedNote,
      updatedAt: new Date()
    };
    
    setNotes(notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ));
    
    setSelectedNote(updatedNote);
    
    // Only set isEditing to false for manual saves
    if (!isAutoSave) {
      setIsEditing(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
      setEditedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    }
  };

  const handleCancelEdit = () => {
    setEditedNote(selectedNote);
    setIsEditing(false);
  };
  
  const handleAddTag = () => {
    if (!editedNote) return;
    
    // Prompt the user for a tag name
    const tagName = prompt('Enter a tag name (e.g., work, idea, urgent):');
    if (!tagName || tagName.trim() === '') return;
    
    const normalizedTag = tagName.toLowerCase().trim();
    
    // Don't add duplicate tags
    if (editedNote.tags.includes(normalizedTag)) return;
    
    const updatedNote = {
      ...editedNote,
      tags: [...editedNote.tags, normalizedTag]
    };
    
    setEditedNote(updatedNote);
    setIsEditing(true);
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    if (!editedNote) return;
    
    const updatedNote = {
      ...editedNote,
      tags: editedNote.tags.filter(tag => tag !== tagToRemove)
    };
    
    setEditedNote(updatedNote);
    setIsEditing(true);
  };

  // Function to sort notes based on the selected option
  const getSortedNotes = () => {
    return [...notes].sort((a, b) => {
      switch (sortOption) {
        case 'date-newest':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'date-oldest':
          return a.updatedAt.getTime() - b.updatedAt.getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle shortcuts when the notes component is focused
    if (!document.querySelector('.notes-container:focus-within')) return;
    
    // Prevent handling shortcuts when user is typing in text inputs or textarea
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      // Allow Ctrl+S for save even in input fields
      if (!(e.ctrlKey && e.key === 's')) {
        return;
      }
    }
    
    // Save: Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (isEditing && editedNote) {
        handleSaveNote(false);
      }
    }
    
    // New note: Ctrl+N
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      handleCreateNewNote();
    }
    
    // Delete note: Ctrl+D
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      if (selectedNote && window.confirm("Are you sure you want to delete this note?")) {
        handleDeleteNote(selectedNote.id);
      }
    }
    
    // Edit note: Ctrl+E
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      if (selectedNote && !isEditing) {
        setIsEditing(true);
      }
    }
    
    // Cancel edit: Escape
    if (e.key === 'Escape' && isEditing) {
      e.preventDefault();
      if (window.confirm("Discard changes?")) {
        handleCancelEdit();
      }
    }
  }, [selectedNote, isEditing, editedNote]);
  
  // Add keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Function to export notes to a JSON file
  const handleExportNotes = () => {
    try {
      const notesData = JSON.stringify(notes, null, 2);
      const blob = new Blob([notesData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendaaar-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting notes:', error);
      alert('Failed to export notes. Please try again.');
    }
  };
  
  // Function to trigger file input click
  const handleImportButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Function to import notes from a JSON file
  const handleImportNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedNotes = JSON.parse(event.target?.result as string);
        
        if (!Array.isArray(importedNotes)) {
          throw new Error('Invalid file format');
        }
        
        // Confirm before overwriting existing notes
        if (notes.length > 0) {
          if (window.confirm('This will replace all your current notes. Continue?')) {
            const parsedNotes = parseDates(importedNotes);
            setNotes(parsedNotes);
          }
        } else {
          const parsedNotes = parseDates(importedNotes);
          setNotes(parsedNotes);
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        console.error('Error importing notes:', error);
        alert('Failed to import notes. The file might be corrupted or in an invalid format.');
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="notes-container" tabIndex={0}>
      <div className="notes-sidebar">
        <div className="notes-search">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search notes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="notes-toolbar">
          <select 
            className="sort-select" 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value="date-newest">Newest First</option>
            <option value="date-oldest">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>
        
        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="no-notes-message">No notes yet. Create one!</div>
          ) : (
            getSortedNotes()
              .filter(note => 
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.tags.some(tag => tag.includes(searchTerm.toLowerCase()))
              )
              .map(note => (
                <div 
                  key={note.id} 
                  className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                >
                  <div 
                    className="note-content-wrapper"
                    onClick={() => {
                      if (isEditing) {
                        if (window.confirm("You have unsaved changes. Continue without saving?")) {
                          setSelectedNote(note);
                          setIsEditing(false);
                        }
                      } else {
                        setSelectedNote(note);
                      }
                    }}
                  >
                    <div className="note-title">{note.title}</div>
                    <div className="note-preview">
                      {note.content.substring(0, 30)}{note.content.length > 30 ? '...' : ''}
                    </div>
                    <div className="note-tags">
                      {note.tags.map(tag => (
                        <span key={tag} className={`note-tag ${tag}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="delete-note-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Are you sure you want to delete this note?")) {
                        handleDeleteNote(note.id);
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
          )}
        </div>
        
        <div className="notes-actions">
          <button className="new-note-button" onClick={handleCreateNewNote}>+ NEW NOTE</button>
          <div className="import-export-buttons">
            <button className="export-notes-button" onClick={handleExportNotes}>EXPORT</button>
            <button className="import-notes-button" onClick={handleImportButtonClick}>IMPORT</button>
            <input 
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleImportNotes}
            />
          </div>
        </div>
      </div>
      
      <div className="note-content">
        {selectedNote ? (
          <>
            <div className="note-header">
              <input 
                type="text" 
                className="note-title-input" 
                value={editedNote?.title || ''}
                onChange={(e) => {
                  if (editedNote) {
                    setEditedNote({...editedNote, title: e.target.value});
                    setIsEditing(true);
                  }
                }}
              />
              <div className="note-meta">
                <div className="note-date">
                  Last updated: {selectedNote.updatedAt.toLocaleDateString()} {selectedNote.updatedAt.toLocaleTimeString()}
                </div>
                {autoSaveStatus && (
                  <div className="auto-save-status">{autoSaveStatus}</div>
                )}
              </div>
            </div>
            
            {/* Toggle between edit and preview modes */}
            {isEditing || !showMarkdownPreview ? (
              <textarea 
                className="note-editor" 
                value={editedNote?.content || ''}
                onChange={(e) => {
                  if (editedNote) {
                    setEditedNote({...editedNote, content: e.target.value});
                    setIsEditing(true);
                  }
                }}
                placeholder="Write your note here... Markdown formatting is supported."
              />
            ) : (
              <div className="markdown-preview">
                <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
              </div>
            )}
            
            {/* Toggle button for markdown preview */}
            {!isEditing && (
              <button 
                className="toggle-preview-button"
                onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
              >
                {showMarkdownPreview ? 'SHOW RAW' : 'PREVIEW MARKDOWN'}
              </button>
            )}
            
            {editedNote && (
              <div className="note-tags-editor">
                <div className="tags-header">Tags:</div>
                <div className="tags-list">
                  {editedNote.tags.map(tag => (
                    <div key={tag} className="tag-item">
                      <span className={`note-tag ${tag}`}>{tag}</span>
                      {isEditing && (
                        <button 
                          className="remove-tag-button" 
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button className="add-tag-button" onClick={handleAddTag}>
                      + Add Tag
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <div className="note-actions">
              {isEditing ? (
                <>
                  <button className="save-note-button" onClick={() => handleSaveNote(false)}>SAVE</button>
                  <button className="cancel-edit-button" onClick={handleCancelEdit}>CANCEL</button>
                </>
              ) : (
                <button className="edit-note-button" onClick={() => setIsEditing(true)}>EDIT</button>
              )}
              <button 
                className="delete-current-note-button" 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this note?")) {
                    handleDeleteNote(selectedNote.id);
                  }
                }}
              >
                DELETE
              </button>
            </div>
          </>
        ) : (
          <div className="no-note-selected">Select a note to view or edit</div>
        )}
      </div>
    </div>
  );
};

export default Notes; 