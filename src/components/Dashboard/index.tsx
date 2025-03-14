import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Calendar from '../Calendar';
import Notes from '../Notes/index';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { resetProgress } = useAppContext();
  
  return (
    <div className="dashboard">
      <main className="dashboard-content">
        {/* Main Content Box with 2 Sections */}
        <div className="main-content-box">
          <div className="content-section-header">
            MISSION CONTROL CENTER
            <button 
              className="reset-button"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                  resetProgress();
                }
              }}
            >
              Reset Progress
            </button>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 