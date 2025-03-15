import React, { ReactNode, useState } from 'react';
import CurrentMission from '../CurrentMission';
import TaskManager from '../TaskManager';
import NewsWidget from '../NewsWidget';
import ClassifiedResources from '../ClassifiedResources';
import MarqueeStockTicker from '../MarqueeStockTicker';
import './ThreeColumnLayout.css';

interface ThreeColumnLayoutProps {
  children: ReactNode;
}

const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({ children }) => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [showNews, setShowNews] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  return (
    <div className="three-column-layout">
      <div className="content-wrapper">
        {/* Left sidebar with News Widget and Classified Resources */}
        <div className={`sidebar left-sidebar ${leftCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h3>FINANCIAL NEWS</h3>
            <button 
              className="collapse-button"
              onClick={() => setLeftCollapsed(!leftCollapsed)}
            >
              {leftCollapsed ? '»' : '«'}
            </button>
          </div>
          {!leftCollapsed && (
            <div className="sidebar-content">
              {/* Classified Resources Section */}
              <div className="sidebar-section-divider">
                <div className="section-label">CLASSIFIED</div>
                <button 
                  className="toggle-section-button"
                  onClick={() => setShowResources(!showResources)}
                >
                  {showResources ? '−' : '+'}
                </button>
              </div>
              
              {showResources && (
                <div className="sidebar-section resources-section">
                  <ClassifiedResources />
                </div>
              )}
              
              <div className="sidebar-section-divider">
                <div className="section-label">MARKET NEWS</div>
                <button 
                  className="toggle-section-button"
                  onClick={() => setShowNews(!showNews)}
                >
                  {showNews ? '−' : '+'}
                </button>
              </div>
              
              {showNews && (
                <div className="sidebar-section news-section">
                  <NewsWidget />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main content area */}
        <main className="main-content">
          {children}
        </main>

        {/* Right sidebar with Current Mission and Tasks */}
        <div className={`sidebar right-sidebar ${rightCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <button 
              className="collapse-button"
              onClick={() => setRightCollapsed(!rightCollapsed)}
            >
              {rightCollapsed ? '«' : '»'}
            </button>
            <h3>MISSION CONTROL</h3>
          </div>
          {!rightCollapsed && (
            <div className="sidebar-content">
              <div className="sidebar-section">
                <CurrentMission />
              </div>
              
              <div className="sidebar-section-divider">
                <div className="section-label">TASK MANAGER</div>
                <button 
                  className="toggle-section-button"
                  onClick={() => setShowTasks(!showTasks)}
                >
                  {showTasks ? '−' : '+'}
                </button>
              </div>
              
              {showTasks && (
                <div className="sidebar-section tasks-section">
                  <TaskManager />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer with Stock Ticker */}
      <footer className="app-footer">
        <MarqueeStockTicker />
      </footer>
    </div>
  );
};

export default ThreeColumnLayout; 