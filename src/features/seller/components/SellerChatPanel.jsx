import React, { useRef, useEffect } from 'react';
import { useStore } from '../../../store/storeContext';
import { useSeller } from '../SellerContext';
import SeraAgentMessage from '../../../SeraAgentMessage';

export const SellerChatPanel = () => {
  const { state } = useStore();
  const { appMode } = state;
  const {
    chatOpen, setChatOpen, chatWidth, isDarkMode, t, startResizing, isResizing,
    messages, setMessages, messagesEndRef, chatScrollRef, handleScroll, handleUserInteraction, isModeMenuOpen, setIsModeMenuOpen,
    chatMode, setChatMode, applyAction, handleAction, handleRetryAssets,
    agentActivity, executionState, isTyping, ephemeralThought, stopAgentWork, openingLine,
    executionLifecycle,
    input, setInput, sendMessage, isAttachMenuOpen, setIsAttachMenuOpen,
    fileInputRef, handleImageUpload, pendingImages, setPendingImages, setSteps,
    selectedProductDetail, setSelectedProductDetail, lastUserMsgRef
  } = useSeller();

  const modeMenuRef = useRef(null);
  const attachMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target)) {
        setIsModeMenuOpen(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setIsAttachMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsModeMenuOpen, setIsAttachMenuOpen]);

  if (!chatOpen || appMode !== "seller") return null;

  return (
    <>
      <div className="seller-chat-panel" style={{
        width: chatWidth,
        position: "relative",
        height: "100vh",
        background: isDarkMode ? "#0f0f10" : "#ffffff",
        borderLeft: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        boxShadow: isDarkMode ? "none" : "-2px 0 10px rgba(0,0,0,0.02)"
      }}>
        {/* Resizer Handle */}
        <div
          onMouseDown={startResizing}
          style={{
            position: "absolute",
            top: 0,
            left: -4,
            width: 8,
            height: "100%",
            cursor: "col-resize",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{
            width: 1,
            height: "100%",
            background: isResizing ? "#c8b89a" : "rgba(255, 255, 255, 0.05)",
            transition: "background 0.2s",
          }} />
        </div>
        {/* Chat header */}
        <div style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: isDarkMode ? "#c8b89a" : "#8b7355" }}>SERA</p>
              <p style={{ fontSize: 10, color: isDarkMode ? "#6b6b75" : "#9ca3af" }}>AI Agent Commerce OS</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => {
                setMessages([{ role: "agent", text: "What would you like to build?", action: "idle", hasAction: false }]);
                setSteps([]);
                try {
                  localStorage.removeItem("sera_hackathon_messages");
                  localStorage.removeItem("sera_hackathon_store_schema");
                } catch (e) { }
              }}
              style={{
                background: "none", border: "none", cursor: "pointer", color: "#555",
                padding: 4, borderRadius: 4, display: "flex", alignItems: "center",
                transition: "color 0.2s"
              }}
              title="Clear Chat"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button onClick={() => setChatOpen(false)} style={{
              background: isDarkMode ? "rgba(255,255,255,0.05)" : "#f3f4f6", border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, cursor: "pointer", color: isDarkMode ? "#6b6b75" : "#9ca3af",
              padding: "4px 8px", borderRadius: 4, transition: "all 0.2s", fontSize: 11, fontWeight: 500
            }}>
              Hide
            </button>
          </div>
        </div>
        {/* Messages — scrollable */}
        <div className={isDarkMode ? "dark-mode" : "light-mode"}
          ref={chatScrollRef}
          onScroll={handleScroll}
          onWheel={handleUserInteraction}
          onTouchStart={handleUserInteraction}
          onMouseDown={handleUserInteraction}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflowAnchor: "none",
          }}>
          {messages.map((m, i) => {
            if (m.role === "agent") {
              const isPending = m.id === "pending_agent_msg";
              const currentMilestones = m.milestones || (isPending ? agentActivity.map(a => ({ text: a.message, status: a.done ? "done" : "active" })) : []);
              const currentTools = m.tools || (isPending && executionState ? executionState.results.map(r => ({ label: `Generate ${(r.action || "image").replace("generate_", "").replace("_image", "")}`, detail: r.itemId })) : []);
              let messageActions = [];
              if (m.action === "show_plan") {
                if (!m.planConfirmed) {
                  messageActions = [
                    { label: "Approve Plan", variant: "approve", key: "approve_plan" },
                    { label: "Edit Plan", variant: "undo", key: "edit_plan" }
                  ];
                }
              } else if (m.hasAction && m.actionState === "pending" && m.status !== "generating") {
                messageActions = [
                  { label: "Approve", variant: "approve", key: "approve" },
                  { label: "Reject", variant: "reject", key: "reject" }
                ];
              }
              let extractedPlan = null;
              if (m.params) {
                const schema = m.params.schema || m.params;
                if (schema && (schema.layout || m.params.products || m.params.philosophy)) {
                  if (schema.layout) {
                    const heroSec = schema.layout.find(s => s.type === "hero");
                    const prodSec = schema.layout.find(s => s.type === "featured_products");
                    const philoSec = schema.layout.find(s => s.type === "philosophy");
                    const theme = schema.theme || {};
                    extractedPlan = {
                      title: heroSec?.props?.title || "Strategic Proposal",
                      subtitle: heroSec?.props?.subtitle || heroSec?.props?.collection || "Curated Products & Brand Pillars",
                      products: prodSec?.props?.products || [],
                      philosophy: philoSec?.props?.items || philoSec?.props?.philosophy || [],
                      themeColor: theme.themeColor || "#c8b89a"
                    };
                  } else {
                    extractedPlan = {
                      title: m.params.title || "Strategic Proposal",
                      subtitle: m.params.subtitle || m.params.collection || "Curated Products & Brand Pillars",
                      products: m.params.products || [],
                      philosophy: m.params.philosophy || [],
                      themeColor: m.params.themeColor || "#c8b89a"
                    };
                  }
                }
              }
              const currentEvents = m.runtime || m.events || (isPending ? agentActivity : []);
              const messageProp = {
                state: (!isPending || m.status === "done") ? "complete" : (agentActivity.length > 0 ? (agentActivity[agentActivity.length - 1].status?.toLowerCase() || "planning") : "planning"),
                isStreaming: isPending,
                milestones: currentMilestones,
                events: currentEvents,
                runtime: m.runtime || currentEvents,
                cognition: m.cognition || [],
                summary: m.summary || null,
                timestamp: m.timestamp || null,
                tools: currentTools,
                chat: m.chat || null,
                content: m.text || m.content || "",
                planData: m.action === "show_plan" ? extractedPlan : null,
                actions: messageActions,
                ephemeralThought: m.ephemeralThought || (isPending ? ephemeralThought : null),
                executionLifecycle: isPending ? executionLifecycle : "completed"
              };

              return (
                <div key={i} style={{ width: "100%", marginBottom: 12 }}>
                  <SeraAgentMessage
                    message={messageProp}
                    onAction={(key, variant) => {
                      if (key === "approve_plan") {
                        setMessages(prev => prev.map((msg, idx) => idx === i ? { ...msg, planConfirmed: true } : msg));
                        setChatMode('agent');
                        sendMessage("Yes, proceed with building the store as planned!", 'agent');
                      } else if (key === "edit_plan") {
                        setMessages(prev => prev.map((msg, idx) => idx === i ? { ...msg, planConfirmed: true } : msg));
                        sendMessage("I want to change some details of the plan.");
                      } else {
                        handleAction(i, variant);
                      }
                    }}
                  />
                  {/* Retry Card: shown when agent reports failed image assets */}
                  {m.params?.pending_retries?.length > 0 && m.retryStatus !== "success" && (
                    <div style={{
                      marginTop: 8, padding: "14px 16px",
                      background: isDarkMode ? "rgba(200,90,60,0.08)" : "rgba(200,90,60,0.06)",
                      border: `1px solid ${isDarkMode ? "rgba(220,100,70,0.3)" : "rgba(200,90,60,0.25)"}`,
                      borderRadius: 12, fontSize: 13
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 16 }}>⚠️</span>
                        <span style={{ fontWeight: 700, color: isDarkMode ? "#f87171" : "#c0392b" }}>
                          {m.retryStatus === "retrying"
                            ? `Retrying generation for ${m.params.pending_retries.length} images using original prompts...`
                            : `${m.params.pending_retries.length} images failed to generate`}
                        </span>
                      </div>
                      {m.retryStatus !== "retrying" && (
                        <>
                          <div style={{ color: isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", marginBottom: 10, lineHeight: 1.5 }}>
                            I will retry generating them one by one using the original prompts:
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {m.params.pending_retries.map((asset, ai) => (
                              <div key={ai} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "8px 12px", borderRadius: 8,
                                background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                                border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                              }}>
                                <span style={{ color: isDarkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)", fontWeight: 500 }}>
                                  [Photo] {asset.label}
                                </span>
                                <button
                                  onClick={() => handleRetryAssets(i, [asset], m.params?.retry_schema)}
                                  style={{
                                    padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                                    background: "#c8b89a", color: "#0f0f10", fontSize: 11, fontWeight: 700
                                  }}
                                >
                                  Retry &rarr;
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => handleRetryAssets(i, m.params.pending_retries, m.params?.retry_schema)}
                            style={{
                              marginTop: 10, width: "100%", padding: "9px 0", borderRadius: 8, border: "none",
                              cursor: "pointer", background: "linear-gradient(135deg, #c8b89a, #a89070)",
                              color: "#0f0f10", fontWeight: 700, fontSize: 13
                            }}
                          >
                            &#8635; Retry All ({m.params.pending_retries.length})
                          </button>
                        </>
                      )}
                      {m.retryStatus === "retrying" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                          <div className="img-spinner" style={{ width: 14, height: 14 }} />
                          <span>Processing one by one...</span>
                        </div>
                      )}
                      {m.retryStatus === "partial" && m.params.pending_retries.length > 0 && (
                        <div style={{ color: isDarkMode ? "#fbbf24" : "#b45309", marginTop: 8, fontSize: 12 }}>
                          There are still {m.params.pending_retries.length} images that failed. Your generation quota might be temporarily exhausted — please try again in a few minutes.
                        </div>
                      )}
                    </div>
                  )}
                  {m.retryStatus === "success" && (
                    <div style={{ marginTop: 6, padding: "8px 14px", borderRadius: 8, background: isDarkMode ? "rgba(52,211,153,0.1)" : "rgba(16,185,129,0.08)", border: "1px solid rgba(52,211,153,0.3)", fontSize: 12, color: isDarkMode ? "#34d399" : "#059669" }}>
                      ✅ All images successfully regenerated!
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginBottom: 12 }}>
                <div style={{
                  maxWidth: "70%",
                  padding: "8px 13px",
                  borderRadius: "10px 10px 2px 10px",
                  background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  border: `0.5px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                  fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-line",
                  color: isDarkMode ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)",
                  position: "relative",
                  alignSelf: "flex-end"
                }}>
                  {m.text}
                  {m.images && m.images.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: m.images.length > 1 ? "1fr 1fr" : "1fr", gap: 6, marginTop: 8 }}>
                      {m.images.map((img, idx) => (
                        <img loading="lazy" key={idx} src={img} alt={`uploaded-${idx}`} style={{ width: "100%", borderRadius: 6, display: "block" }} />
                      ))}
                    </div>
                  )}
                  {m.image && !m.images && <img loading="lazy" src={m.image} alt="uploaded" style={{ marginTop: 8, maxWidth: "100%", borderRadius: 6, display: "block" }} />}
                </div>
              </div>
            );
          })}
          {/* Instant Active Runtime Container while typing or cognition is active before message start */}
          {(isTyping || (agentActivity.length > 0 && agentActivity.some(a => !a.done))) && !messages.some(m => m.id === "pending_agent_msg") && (() => {
            const isTask = lastUserMsgRef?.current ? /build|create|make|buat|design|generate|coffee|skincare|store|toko|ganti|ubah|tambah/i.test(lastUserMsgRef.current) : false;
            return (
              <div style={{ width: "100%", marginBottom: 12 }}>
                <SeraAgentMessage
                  message={{
                    state: agentActivity.length > 0 ? (agentActivity[agentActivity.length - 1].status?.toLowerCase() || "planning") : "planning",
                    isStreaming: true,
                    milestones: agentActivity.length > 0
                      ? agentActivity.map(a => ({ text: a.message, status: a.done ? "done" : "active" }))
                      : (isTask ? [{ text: `Analyzing request: "${lastUserMsgRef?.current?.substring(0, 50) || 'build'}"...`, status: "active" }] : []),
                    events: agentActivity,
                    runtime: agentActivity,
                    tools: executionState && executionState.results ? executionState.results.map(r => ({ label: `Generate ${(r.action || "image").replace("generate_", "").replace("_image", "")}`, detail: r.itemId })) : [],
                    content: openingLine || "",
                    actions: [],
                    ephemeralThought: ephemeralThought
                  }}
                />
                {/* Ephemeral thought — flashes briefly then fades away */}
                {ephemeralThought && (
                  <div style={{
                    marginTop: 4, marginLeft: 2,
                    fontSize: 11, color: t.subtext, fontStyle: "italic",
                    fontFamily: "'JetBrains Mono', monospace",
                    lineHeight: 1.5, maxWidth: "90%",
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    animation: "sera-fadein 0.25s ease",
                  }}>
                    {ephemeralThought}
                  </div>
                )}
              </div>
            );
          })()}
          <div ref={messagesEndRef} />
        </div>
        {/* Permanent Action Bar */}
        {(() => {
          let lastActionIndex = -1;
          let lastActionMsg = null;
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].hasAction && messages[i].status !== "generating") {
              lastActionIndex = i;
              lastActionMsg = messages[i];
              break;
            }
          }
          const stateAction = lastActionMsg ? lastActionMsg.actionState : "idle";
          const isPendingAction = stateAction === "pending";
          const canUndo = stateAction === "approved";
          const approvalDisabled = !isPendingAction || lastActionIndex < 0;
          const undoDisabled = !canUndo || lastActionIndex < 0;
          return (
            <div style={{ padding: "0 14px 8px 14px", background: isDarkMode ? "#0f0f10" : "#ffffff", zIndex: 10 }}>
              <div style={{ display: "flex", gap: 6, padding: "6px", background: isDarkMode ? "#121214" : "#e5e7eb", borderRadius: 8, border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`, alignItems: "center" }}>

                <button
                  type="button"
                  title={approvalDisabled ? "Waiting for store action from SERA" : "Approve store changes"}
                  disabled={approvalDisabled}
                  onClick={() => !approvalDisabled && handleAction(lastActionIndex, "approve")}
                  style={{
                    flex: 1,
                    background: isDarkMode ? "#161618" : "#ffffff",
                    border: "none",
                    color: isPendingAction ? (isDarkMode ? "#4ade80" : "#059669") : (isDarkMode ? "#e5e7eb" : "#374151"),
                    padding: "6px 0", fontSize: 11, fontWeight: 700,
                    cursor: approvalDisabled ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 0.2s",
                    boxShadow: "none",
                    opacity: approvalDisabled ? 0.45 : 1,
                  }}>
                  <svg width="14" height="14" fill="none" stroke={isPendingAction ? "#4ade80" : "currentColor"} strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  {lastActionMsg?.action === "show_plan" ? "Approve Plan" : "Approve"}
                </button>
                <button
                  type="button"
                  title={approvalDisabled ? "Waiting for store action from SERA" : "Reject and restore preview"}
                  disabled={approvalDisabled}
                  onClick={() => !approvalDisabled && handleAction(lastActionIndex, "reject")}
                  style={{
                    flex: 1,
                    background: isDarkMode ? "#161618" : "#ffffff",
                    border: "none",
                    color: isPendingAction ? (isDarkMode ? "#f87171" : "#dc2626") : (isDarkMode ? "#e5e7eb" : "#374151"),
                    padding: "6px 0", fontSize: 11, fontWeight: 700,
                    cursor: approvalDisabled ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 0.2s",
                    boxShadow: "none",
                    opacity: approvalDisabled ? 0.45 : 1,
                  }}>
                  <svg width="14" height="14" fill="none" stroke={isPendingAction ? "#f87171" : "currentColor"} strokeWidth="3" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  {lastActionMsg?.action === "show_plan" ? "Reject Plan" : "Reject"}
                </button>
                <div style={{ width: 1, background: t.border, margin: "4px 2px" }} />
                <button
                  type="button"
                  title={undoDisabled ? "Must approve first before you can undo" : "Undo the last approval"}
                  disabled={undoDisabled}
                  onClick={() => !undoDisabled && handleAction(lastActionIndex, "undo")}
                  style={{
                    flex: 1,
                    background: isDarkMode ? "#161618" : "#ffffff",
                    border: "none",
                    color: canUndo ? (isDarkMode ? "#38bdf8" : "#2563eb") : (isDarkMode ? "#e5e7eb" : "#374151"),
                    padding: "6px 0", fontSize: 11, fontWeight: 700,
                    cursor: undoDisabled ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 0.2s",
                    boxShadow: "none",
                    opacity: undoDisabled ? 0.45 : 1,
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={canUndo ? "#38bdf8" : "currentColor"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                  Undo
                </button>
              </div>
            </div>
          );
        })()}
        {/* Chat input — fixed at bottom */}
        <div style={{
          padding: "0 14px 14px 14px",
          borderTop: "none",
          flexShrink: 0,
        }}>
          <div style={{
            background: isDarkMode ? "#1e1e22" : "#ffffff",
            border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`,
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            boxShadow: isDarkMode ? "none" : "0 2px 10px rgba(0,0,0,0.05)"
          }}>
            <input
              id="chat-image-upload"
              name="chat-image-upload"
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingImages.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {pendingImages.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", width: 60, height: 60, borderRadius: 8, overflow: "hidden", border: "1px solid #333", background: "#111113" }}>
                      <img loading="lazy" src={img} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        onClick={() => setPendingImages(prev => prev.filter((_, i) => i !== idx))}
                        style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 16, height: 16, color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, position: "relative" }}>
                <button
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", padding: "4px", transition: "transform 0.2s", transform: isAttachMenuOpen ? "rotate(45deg)" : "none" }}
                  title="Upload or Attach File"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                {isAttachMenuOpen && (
                  <div ref={attachMenuRef} style={{
                    position: "absolute",
                    bottom: "100%",
                    left: 0,
                    marginBottom: 12,
                    background: isDarkMode ? "#1e1e22" : "#ffffff",
                    border: `1px solid ${isDarkMode ? "#2a2a2e" : "#e5e7eb"}`,
                    borderRadius: 12,
                    padding: "8px",
                    width: 200,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    zIndex: 100,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4
                  }}>
                    <div
                      onClick={() => {
                        setIsAttachMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: isDarkMode ? "#2a2a2e" : "#f3f4f6", color: isDarkMode ? "#e5e7eb" : "#111", fontSize: 12, fontWeight: 600, transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "#3f3f46" : "#e5e7eb"}
                      onMouseLeave={e => e.currentTarget.style.background = isDarkMode ? "#2a2a2e" : "#f3f4f6"}
                    >
                      <span style={{ fontSize: 16 }}>📷</span> Image
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "not-allowed", color: isDarkMode ? "#9ca3af" : "#6b7280", fontSize: 12, fontWeight: 500 }} title="Coming Soon">
                      <span style={{ fontSize: 16, fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif' }}>📄</span> PDF <span style={{ marginLeft: "auto", fontSize: 10, background: isDarkMode ? "#374151" : "#e5e7eb", padding: "2px 6px", borderRadius: 4, opacity: 0.7 }}>Soon</span>
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "not-allowed", color: isDarkMode ? "#9ca3af" : "#6b7280", fontSize: 12, fontWeight: 500 }} title="Coming Soon">
                      <span style={{ fontSize: 16, fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif' }}>📊</span> Spreadsheet <span style={{ marginLeft: "auto", fontSize: 10, background: isDarkMode ? "#374151" : "#e5e7eb", padding: "2px 6px", borderRadius: 4, opacity: 0.7 }}>Soon</span>
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "not-allowed", color: isDarkMode ? "#9ca3af" : "#6b7280", fontSize: 12, fontWeight: 500 }} title="Coming Soon">
                      <span style={{ fontSize: 16, fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif' }}>📝</span> Document <span style={{ marginLeft: "auto", fontSize: 10, background: isDarkMode ? "#374151" : "#e5e7eb", padding: "2px 6px", borderRadius: 4, opacity: 0.7 }}>Soon</span>
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "not-allowed", color: isDarkMode ? "#9ca3af" : "#6b7280", fontSize: 12, fontWeight: 500 }} title="Coming Soon">
                      <span style={{ fontSize: 16, fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif' }}>🗂️</span> Product Feed <span style={{ marginLeft: "auto", fontSize: 10, background: isDarkMode ? "#374151" : "#e5e7eb", padding: "2px 6px", borderRadius: 4, opacity: 0.7 }}>Soon</span>
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "not-allowed", color: isDarkMode ? "#9ca3af" : "#6b7280", fontSize: 12, fontWeight: 500 }} title="Coming Soon">
                      <span style={{ fontSize: 16, fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif' }}>🔗</span> URL <span style={{ marginLeft: "auto", fontSize: 10, background: isDarkMode ? "#374151" : "#e5e7eb", padding: "2px 6px", borderRadius: 4, opacity: 0.7 }}>Soon</span>
                    </div>
                  </div>
                )}
                <textarea
                  id="chat-textarea"
                  name="chat-textarea"
                  className="chat-input"
                  placeholder={isTyping ? "SERA is working..." : "Ask SERA to build anything..."}
                  value={input}
                  rows={1}
                  disabled={isTyping}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isTyping) sendMessage();
                      e.target.style.height = 'auto';
                    }
                  }}
                  style={{ lineHeight: 1.5, maxHeight: 120, resize: "none", opacity: isTyping ? 0.5 : 1 }}
                />
                <button
                  className="send-btn"
                  onClick={() => {
                    if (isTyping) {
                      stopAgentWork();
                    } else {
                      sendMessage();
                    }
                  }}
                  title={isTyping ? "Stop" : "Send message"}
                  style={{ opacity: isTyping ? 0.9 : 1, cursor: 'pointer', background: "#c8b89a", border: "none", borderRadius: "8px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {isTyping ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0f0f10" stroke="#0f0f10" strokeWidth="2">
                      <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
                    </svg>
                  ) : (
                    <svg width="14" height="14" fill="none" stroke="#0f0f10" strokeWidth="3" viewBox="0 0 24 24">
                      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
