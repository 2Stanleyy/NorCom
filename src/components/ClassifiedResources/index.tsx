import React, { useState, useEffect } from 'react';
import './ClassifiedResources.css';

// Interface for resource items
interface ResourceItem {
  id: string;
  title: string;
  url: string;
  addedAt: number; // timestamp
  category: 'work' | 'personal' | 'research' | 'intel'; // for classification styling
  accessLevel: 0 | 1 | 2 | 3 | 4 | 5; // SCP clearance levels
}

const ClassifiedResources: React.FC = () => {
  // State for resources
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'research' | 'intel'>('work');
  const [newAccessLevel, setNewAccessLevel] = useState<0 | 1 | 2 | 3 | 4 | 5>(1);
  const [expandedSection, setExpandedSection] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  // Access level names mapping
  const clearanceLevels = {
    0: "UNRESTRICTED",
    1: "CONFIDENTIAL",
    2: "RESTRICTED", 
    3: "SECRET",
    4: "TOP SECRET",
    5: "THAUMIEL"
  };
  
  // Load resources from localStorage on component mount
  useEffect(() => {
    try {
      const savedResources = localStorage.getItem('classifiedResources');
      if (savedResources) {
        setResources(JSON.parse(savedResources));
      } else {
        // Default resources if none exist
        const defaultResources: ResourceItem[] = [
          {
            id: 'res-' + Date.now() + '-1',
            title: 'SCP Foundation Database',
            url: 'https://scp-wiki.wikidot.com/',
            addedAt: Date.now() - 86400000, // 1 day ago
            category: 'research',
            accessLevel: 2
          },
          {
            id: 'res-' + Date.now() + '-2',
            title: 'Anomaly Containment Protocols',
            url: '#protocols',
            addedAt: Date.now() - 43200000, // 12 hours ago
            category: 'work',
            accessLevel: 3
          },
          {
            id: 'res-' + Date.now() + '-3',
            title: 'Personnel Directory',
            url: '#personnel',
            addedAt: Date.now() - 3600000, // 1 hour ago
            category: 'intel',
            accessLevel: 1
          }
        ];
        setResources(defaultResources);
        localStorage.setItem('classifiedResources', JSON.stringify(defaultResources));
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  }, []);
  
  // Save resources to localStorage
  const saveResources = (updatedResources: ResourceItem[]) => {
    try {
      localStorage.setItem('classifiedResources', JSON.stringify(updatedResources));
    } catch (error) {
      console.error('Error saving resources:', error);
    }
  };
  
  // Add a new resource
  const addResource = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTitle.trim() || !newUrl.trim()) {
      return; // Don't add empty resources
    }
    
    // Ensure URL has protocol
    let formattedUrl = newUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('#')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    const newResource: ResourceItem = {
      id: 'res-' + Date.now(),
      title: newTitle.trim(),
      url: formattedUrl,
      addedAt: Date.now(),
      category: newCategory,
      accessLevel: newAccessLevel
    };
    
    const updatedResources = [newResource, ...resources];
    setResources(updatedResources);
    saveResources(updatedResources);
    
    // Clear form
    setNewTitle('');
    setNewUrl('');
    setShowEditor(false);
  };
  
  // Remove a resource
  const removeResource = (id: string) => {
    const updatedResources = resources.filter(resource => resource.id !== id);
    setResources(updatedResources);
    saveResources(updatedResources);
  };
  
  // Format date relative to now
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Minutes
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Days
    if (diff < 2592000000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    // Default: formatted date
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };
  
  // Filter resources based on search
  const filteredResources = resources.filter(resource => 
    resource.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchFilter.toLowerCase())
  );
  
  return (
    <div className="classified-resources">
      <div className="resources-header">
        <div className="resources-title-bar">
          <div className="resources-title">
            <span className="terminal-prompt">&gt;</span> CLASSIFIED RESOURCES
          </div>
          <button 
            className="toggle-section-button"
            onClick={() => setExpandedSection(!expandedSection)}
            title={expandedSection ? "Collapse" : "Expand"}
          >
            {expandedSection ? '−' : '+'}
          </button>
        </div>
        
        {expandedSection && (
          <div className="resources-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="SEARCH DOCUMENTS..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="resource-search-input"
              />
            </div>
            <button 
              className="add-resource-button"
              onClick={() => setShowEditor(!showEditor)}
              title={showEditor ? "Cancel" : "Add New Resource"}
            >
              {showEditor ? '×' : '+'}
            </button>
          </div>
        )}
      </div>
      
      {expandedSection && showEditor && (
        <div className="resource-editor">
          <form onSubmit={addResource}>
            <div className="resource-form-row">
              <input
                type="text"
                placeholder="Resource Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="resource-input"
                required
              />
            </div>
            <div className="resource-form-row">
              <input
                type="text"
                placeholder="URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="resource-input"
                required
              />
            </div>
            <div className="resource-form-row split">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="resource-select"
              >
                <option value="work">WORK</option>
                <option value="personal">PERSONAL</option>
                <option value="research">RESEARCH</option>
                <option value="intel">INTELLIGENCE</option>
              </select>
              
              <select
                value={newAccessLevel}
                onChange={(e) => setNewAccessLevel(Number(e.target.value) as any)}
                className="resource-select"
              >
                <option value={0}>LEVEL 0</option>
                <option value={1}>LEVEL 1</option>
                <option value={2}>LEVEL 2</option>
                <option value={3}>LEVEL 3</option>
                <option value={4}>LEVEL 4</option>
                <option value={5}>LEVEL 5</option>
              </select>
            </div>
            <div className="resource-form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowEditor(false)}
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="save-button"
              >
                CLASSIFY
              </button>
            </div>
          </form>
        </div>
      )}
      
      {expandedSection && (
        <div className="resources-list">
          {filteredResources.length === 0 ? (
            <div className="no-resources">
              <div className="terminal-text">
                <span className="terminal-prompt">&gt;</span> No classified documents found
              </div>
              <div className="scanner-line"></div>
            </div>
          ) : (
            <>
              {filteredResources.map(resource => (
                <div 
                  key={resource.id} 
                  className={`resource-item clearance-${resource.accessLevel} ${resource.category}`}
                >
                  <div className="resource-content">
                    <div className="resource-header">
                      <div className="resource-title-section">
                        <span className="resource-title">{resource.title}</span>
                        <span className={`resource-category cat-${resource.category}`}>
                          {resource.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="resource-actions">
                        <a 
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resource-link-button"
                          title="Open Resource"
                        >
                          ↗
                        </a>
                        <button
                          className="resource-delete-button"
                          onClick={() => removeResource(resource.id)}
                          title="Delete Resource"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="resource-footer">
                      <div className="resource-timestamp">
                        {formatRelativeTime(resource.addedAt)}
                      </div>
                      <div className={`resource-clearance level-${resource.accessLevel}`}>
                        {clearanceLevels[resource.accessLevel]}
                      </div>
                    </div>
                  </div>
                  <div className="resource-redacted-overlay"></div>
                  <div className="resource-scan-line"></div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
      
      <div className="resources-footer">
        <div className="document-counter">
          {resources.length} DOCUMENT{resources.length !== 1 ? 'S' : ''}
        </div>
      </div>
    </div>
  );
};

export default ClassifiedResources; 