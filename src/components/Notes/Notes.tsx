import React, { useState, useEffect } from 'react';
import './Notes.css';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
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
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  useEffect(() => {
    if (notes.length && !selectedNote) {
      setSelectedNote(notes[0]);
    }
  }, [notes, selectedNote]);
  
  return (
    <div className="notes-container">
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
        
        <div className="notes-list">
          {notes
            .filter(note => 
              note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
              note.content.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(note => (
              <div 
                key={note.id} 
                className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="note-title">{note.title}</div>
                <div className="note-preview">{note.content.substring(0, 30)}...</div>
                <div className="note-tags">
                  {note.tags.map(tag => (
                    <span key={tag} className={`note-tag ${tag}`}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
        </div>
        
        <button className="new-note-button">+ NEW NOTE</button>
      </div>
      
      <div className="note-content">
        {selectedNote ? (
          <>
            <div className="note-header">
              <input 
                type="text" 
                className="note-title-input" 
                value={selectedNote.title}
                onChange={(e) => {
                  if (selectedNote) {
                    setSelectedNote({...selectedNote, title: e.target.value});
                  }
                }}
              />
              <div className="note-date">
                Last updated: {selectedNote.updatedAt.toLocaleDateString()}
              </div>
            </div>
            <textarea 
              className="note-editor" 
              value={selectedNote.content}
              onChange={(e) => {
                if (selectedNote) {
                  setSelectedNote({...selectedNote, content: e.target.value});
                }
              }}
            />
          </>
        ) : (
          <div className="no-note-selected">Select a note to view or edit</div>
        )}
      </div>
    </div>
  );
};

export default Notes; 