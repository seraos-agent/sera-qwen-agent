import React, { useState, useRef, useEffect } from 'react';

export const VideoPlayer = ({ src, style = {}, hideControls = false, mutePosition = { top: 10, right: 10 }, ...props }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      // Strictly enforce muted state directly on the DOM node
      // React's `muted={isMuted}` prop sometimes fails to apply consistently across browsers
      videoRef.current.muted = isMuted;
      videoRef.current.defaultMuted = isMuted;
      
      if (src) {
        videoRef.current.play().catch(e => console.warn("Autoplay prevented by browser:", e));
      }
    }
  }, [src, isMuted]);

  if (!src) return null;

  // Wrapper takes layout styles
  const wrapperStyle = {
    position: style.position || 'relative',
    width: style.width || '100%',
    height: style.height || '100%',
    gridArea: style.gridArea,
    inset: style.inset,
    top: style.top,
    left: style.left,
    right: style.right,
    bottom: style.bottom,
    margin: style.margin,
    aspectRatio: style.aspectRatio,
    borderRadius: style.borderRadius,
    opacity: style.opacity,
    display: style.display,
    flex: style.flex,
    overflow: 'hidden',
  };

  // Video takes everything else (like objectFit, transform) plus full stretch
  const videoStyle = {
    ...style,
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    margin: 0,
  };

  return (
    <div style={wrapperStyle}>
      <video 
        ref={videoRef}
        src={src} 
        autoPlay 
        loop 
        muted={isMuted} 
        playsInline 
        preload="metadata"
        style={videoStyle} 
        {...props} 
      />
      {!hideControls && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          style={{
            position: 'absolute',
            ...mutePosition,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: '#fff',
            padding: 0,
          }}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};
