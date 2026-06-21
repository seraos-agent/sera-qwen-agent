import React from 'react';
import SeraAgentMessage from '../../../SeraAgentMessage';
import { useBuyerContext } from '../BuyerContext';

export const BuyerChatPanel = () => {
  const {
    t, isDarkMode, appMode,
    chatOpen, setChatOpen,
    chatWidth, startResizing, isResizing,
    buyerAiMessages, setBuyerAiMessages,
    buyerAiStatus, streamingMessage,
    chatEndRef,
    buyerAiQuery, setBuyerAiQuery,
    handleBuyerAiSubmit, handleAbort
  } = useBuyerContext();

  if (!chatOpen || appMode !== 'buyer') return null;

  return (
    <div className="buyer-chat-panel" style={{
      width: chatWidth,
      position: 'relative',
      height: '100vh',
      background: t.panel,
      borderLeft: `1px solid ${t.border}`,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      boxShadow: isDarkMode ? 'none' : '-2px 0 12px rgba(0,0,0,0.03)'
    }}>
      {/* Resizer Handle */}
      <div
        onMouseDown={startResizing}
        style={{
          position: 'absolute', top: 0, left: -4,
          width: 8, height: '100%',
          cursor: 'col-resize', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <div style={{
          width: 1, height: '100%',
          background: isResizing ? '#c8b89a' : 'rgba(255, 255, 255, 0.05)',
          transition: 'background 0.2s'
        }} />
      </div>

      {/* Header */}
      <div style={{ padding: '20px', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDarkMode ? '#111113' : '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: isDarkMode ? '#c8b89a' : '#8b7355' }}>SERA</p>
            <p style={{ fontSize: 10, color: isDarkMode ? '#6b6b75' : '#9ca3af' }}>Discovery AI Concierge</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setBuyerAiMessages([])}
            title="Clear Chat"
            style={{ background: 'transparent', border: 'none', color: isDarkMode ? '#6b6b75' : '#9ca3af', padding: '4px', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
          <button
            onClick={() => setChatOpen(false)}
            style={{
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
              border: `1px solid ${isDarkMode ? '#2a2a2e' : '#e5e7eb'}`,
              cursor: 'pointer', color: isDarkMode ? '#6b6b75' : '#9ca3af',
              padding: '4px 8px', borderRadius: 4, transition: 'all 0.2s', fontSize: 11, fontWeight: 500
            }}
          >
            Hide
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {buyerAiMessages.map((m) => (
          m.role === 'user' ? (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                maxWidth: '80%', padding: '10px 16px',
                borderRadius: '16px 16px 4px 16px',
                background: '#c8b89a', color: '#0f0f10',
                fontSize: 13, lineHeight: 1.5,
                fontFamily: "'DM Sans', sans-serif"
              }}>
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} style={{ width: '100%', paddingLeft: 4 }}>
              <SeraAgentMessage
                message={{
                  state: 'complete',
                  isStreaming: false,
                  milestones: [], events: [], runtime: [], cognition: [],
                  content: m.text || '',
                  summary: null, tools: [], actions: [], planData: null, chat: null
                }}
              />
            </div>
          )
        ))}

        {/* Loading: spinner always on + tool badge that changes */}
        {buyerAiStatus && (() => {
          const isObj = typeof buyerAiStatus === 'object';
          const toolName = isObj ? (buyerAiStatus.tool || '') : '';
          const message = isObj ? (buyerAiStatus.message || '') : (typeof buyerAiStatus === 'string' ? buyerAiStatus : '');
          const badgeText = message || (toolName ? toolName.replace(/_/g, ' ') : '');

          return (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8, paddingLeft: 4, alignItems: 'center', gap: 8 }}>
              {/* Spinner — always visible */}
              <div className="img-spinner" style={{
                width: 13, height: 13, flexShrink: 0,
                borderWidth: 2,
                borderColor: isDarkMode ? 'rgba(200, 184, 154, 0.2)' : 'rgba(139, 115, 85, 0.2)',
                borderTopColor: isDarkMode ? '#c8b89a' : '#8b7355',
              }} />
              {/* Tool badge — changes as tools are called, hidden if no label */}
              {badgeText && (
                <span key={badgeText} style={{
                  display: 'inline-block',
                  padding: '2px 9px',
                  borderRadius: 5,
                  background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: isDarkMode ? '#707080' : '#888',
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  letterSpacing: '0.1px',
                  animation: 'badgeFadeIn 0.25s ease',
                  userSelect: 'none',
                }}>
                  {badgeText}
                </span>
              )}
            </div>
          );
        })()}

        {/* Live streaming bubble */}
        {streamingMessage && (
          <div style={{ width: '100%', paddingLeft: 4 }}>
            <SeraAgentMessage
              message={{
                state: 'executing',
                isStreaming: true,
                milestones: [], events: [], runtime: [], cognition: [],
                content: streamingMessage.text || streamingMessage || '',
                summary: null, tools: [], actions: [], planData: null, chat: null
              }}
            />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px 20px', borderTop: 'none', background: isDarkMode ? '#111113' : '#fff' }}>
        <form onSubmit={handleBuyerAiSubmit} style={{ display: 'flex', gap: 10, background: isDarkMode ? '#161618' : '#f9fafb', border: `1px solid ${t.border}`, borderRadius: 14, padding: '6px 6px 6px 16px', alignItems: 'center' }}>
          <textarea
            id="buyer-ai-query"
            name="buyer-ai-query"
            value={buyerAiQuery}
            onChange={(e) => {
              setBuyerAiQuery(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (buyerAiQuery.trim() && !buyerAiStatus) {
                  handleBuyerAiSubmit(e);
                  e.target.style.height = 'auto';
                }
              }
            }}
            placeholder="Search products, stores, or brands..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: t.text, fontSize: 13, flex: 1, resize: 'none', height: 20, maxHeight: 120, fontFamily: 'inherit', overflowY: 'auto', padding: 0 }}
            rows={1}
            disabled={!!buyerAiStatus}
          />
          <button
            type={buyerAiStatus ? 'button' : 'submit'}
            onClick={buyerAiStatus ? handleAbort : undefined}
            style={{
              background: buyerAiStatus ? (isDarkMode ? '#3f3f46' : '#e5e7eb') : '#c8b89a',
              border: 'none', borderRadius: 10, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: buyerAiStatus ? (isDarkMode ? '#a1a1aa' : '#9ca3af') : '#0f0f10',
              cursor: 'pointer', flexShrink: 0, fontWeight: 700
            }}
          >
            {buyerAiStatus ? (
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            )}
          </button>
        </form>
      </div>
      <style>{`
        .dots span {
          width: 3.5px;
          height: 3.5px;
          margin: 0 1.5px;
          background-color: currentColor;
          border-radius: 50%;
          display: inline-block;
          animation: dots-blink 1.4s infinite both;
          opacity: 0.35;
        }
        .dots span:nth-child(2) {
          animation-delay: .2s;
        }
        .dots span:nth-child(3) {
          animation-delay: .4s;
        }
        @keyframes dots-blink {
          0% { opacity: .35; }
          20% { opacity: 1; }
          100% { opacity: .35; }
        }
        @keyframes badgePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes badgeFadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
