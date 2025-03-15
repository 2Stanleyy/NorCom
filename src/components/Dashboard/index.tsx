import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Calendar from '../Calendar';
import Notes from '../Notes/index';
import Livestream from '../Livestream';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { profile } = useAppContext();
  const [displayedClearance, setDisplayedClearance] = useState(profile.clearanceLevel);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  // Calculate XP percentage for progress bar
  const xpPercentage = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));
  
  // Check if user has Level 5+ for special privileges
  const numericLevel = Number(profile.level);
  const isHighLevel = numericLevel >= 5;
  
  // Proper SCP Foundation clearance classifications
  const clearanceLevels = {
    "0": "UNRESTRICTED",
    "1": "CONFIDENTIAL",
    "2": "RESTRICTED", 
    "3": "SECRET",
    "4": "TOP SECRET",
    "5": "THAUMIEL"
  };
  
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    if (isHighLevel) {
      setDropdownVisible(!dropdownVisible);
    }
  };
  
  // Select a clearance level
  const selectClearance = (level: string) => {
    setDisplayedClearance(level);
    setDropdownVisible(false);
  };
  
  // Get clearance name for the current level
  const getCurrentClearanceName = () => {
    return clearanceLevels[displayedClearance as keyof typeof clearanceLevels] || "UNRESTRICTED";
  };
  
  return (
    <div className="dashboard">
      <main className="dashboard-content">
        {/* Main Content Box with 3 Sections */}
        <div className="main-content-box">
          <div className="content-section-header">
            <span>UNEMPLOYED</span>
            <div className="agent-profile">
              <div className="agent-info">
                <span className="agent-codename" data-text={profile.codename}>{profile.codename}</span>
                <span className="agent-id">{profile.agentId}</span>
              </div>
              <div className="agent-level-container">
                <div className="agent-level-badge">LVL {profile.level}</div>
                <div className="agent-xp-bar">
                  <div className="agent-xp-fill" style={{ width: `${xpPercentage}%` }}></div>
                  <span className="agent-xp-text">{profile.xp}/{profile.xpToNextLevel} XP</span>
                </div>
                
                {/* Clearance badge with NO SCP text */}
                <div className="scp-clearance-container">
                  <button 
                    className={`scp-badge ${isHighLevel ? 'high-level' : ''}`} 
                    data-level={displayedClearance}
                    onClick={toggleDropdown}
                  >
                    <div className="clearance-display">
                      <span className="clearance-name-only">{getCurrentClearanceName()}</span>
                      {isHighLevel && <span className="dropdown-indicator">▼</span>}
                    </div>
                  </button>
                  
                  {/* Dropdown with clearance options */}
                  {dropdownVisible && (
                    <div className="scp-dropdown">
                      <div className="dropdown-title">SELECT CLEARANCE LEVEL</div>
                      {Object.entries(clearanceLevels).map(([level, name]) => (
                        <button
                          key={level}
                          className={`dropdown-option ${level === displayedClearance ? 'selected' : ''}`}
                          data-level={level}
                          onClick={() => selectClearance(level)}
                        >
                          {name}
                        </button>
                      ))}
                      <div className="dropdown-footer">
                        <span className="footer-text">ACTUAL CLEARANCE: THAUMIEL</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="content-sections-container">
            {/* Section 1: Notes (moved to left) */}
            <div className="content-section section-notes">
              <div className="section-header">NOTES</div>
              <div className="notes-container">
                <Notes />
              </div>
            </div>
            
            {/* Section 2: Calendar */}
            <div className="content-section section-calendar">
              <div className="section-header">CALENDAR</div>
              <Calendar />
            </div>
            
            {/* Section 3: Livestream */}
            <div className="content-section section-livestream">
              <div className="section-header">SECURE FEED</div>
              <Livestream />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 