import React, { useState, useRef, useEffect } from 'react';
import './Livestream.css';

const Livestream: React.FC = () => {
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "> LIVESTREAM MODULE INITIALIZED",
    "> AWAITING MEDIA INPUT..."
  ]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add terminal-style logging
  const addTerminalLine = (line: string) => {
    setTerminalLines(prev => [...prev, `> ${line}`]);
  };
  
  // Handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      addTerminalLine(`ERROR: INVALID FILE TYPE - ${file.type}`);
      setUploadStatus('error');
      return;
    }
    
    setIsLoading(true);
    addTerminalLine(`PROCESSING: ${file.name}`);
    
    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file);
    setVideoSource(objectUrl);
    addTerminalLine(`MEDIA LOADED: ${file.name}`);
    addTerminalLine(`SIZE: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    addTerminalLine(`TYPE: ${file.type}`);
    setUploadStatus('success');
    setIsLoading(false);
    
    // Clean up the object URL when component unmounts
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  };
  
  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        addTerminalLine("PLAYBACK PAUSED");
      } else {
        videoRef.current.play();
        addTerminalLine("PLAYBACK STARTED");
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      addTerminalLine(isMuted ? "AUDIO ENABLED" : "AUDIO MUTED");
    }
  };
  
  // Handle video end
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleVideoEnd = () => {
      setIsPlaying(false);
      addTerminalLine("PLAYBACK COMPLETE");
    };
    
    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnd);
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('ended', handleVideoEnd);
      }
    };
  }, []);
  
  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="livestream-container">
      <div className="livestream-header">
        <div className="header-title">LIVESTREAM</div>
        <div className="header-controls">
          <button 
            className="control-button upload-button"
            onClick={triggerFileUpload}
          >
            UPLOAD
          </button>
        </div>
      </div>
      
      <div 
        className="video-area" 
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {videoSource ? (
          <>
            <video 
              ref={videoRef} 
              src={videoSource}
              className="video-player"
              onClick={togglePlay}
            />
            {showControls && (
              <div className="video-controls">
                <button onClick={togglePlay}>
                  {isPlaying ? "■" : "▶"}
                </button>
                <button onClick={toggleMute}>
                  {isMuted ? "🔇" : "🔊"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="video-placeholder">
            {isLoading ? (
              <div className="loading-indicator">PROCESSING...</div>
            ) : (
              <div className="upload-prompt" onClick={triggerFileUpload}>
                <div className="placeholder-icon">▶</div>
                <div className="placeholder-text">CLICK TO UPLOAD VIDEO FILE</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="terminal-log">
        {terminalLines.map((line, index) => (
          <div key={index} className="terminal-line">
            {line}
          </div>
        ))}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="video/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Livestream; 