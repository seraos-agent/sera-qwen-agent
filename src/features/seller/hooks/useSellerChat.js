import { useState, useRef, useEffect } from 'react';
import { sendChat, rememberAction, BACKEND_URL } from '../../../lib/agentApi';
import { useAgentActions } from './useAgentActions';
import { canonicalizeAgentAction, normalizeAgentParams, isStoreMutationAction } from '../../../utils/constants';

const INIT_MESSAGES = [
  { role: "agent", text: "What would you like to build today?" }
];

export const useSellerChat = ({
  appMode,
  filteredStores,
  selectedStorefront,
  storeSchema,
  activeAnalyticsStoreId,
  activeNav,
  products,
  themeColor,
  heroBg,
  storeData,
  setStoreSchema,
  setStoreData,
  setProducts,
  setDraftSchema,
  setActiveNav,
  setUserStores,
  setVideoFormat,
  setActivePromoTab
}) => {
  const [chatWidth, setChatWidth] = useState(380);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setChatWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "auto";
    };
  }, [isResizing]);

  const [executionLifecycle, setExecutionLifecycle] = useState('idle');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("sera_hackathon_messages");
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return INIT_MESSAGES;
  });

  const [input, setInput] = useState("");
  useEffect(() => {
    try {
      const replacer = (key, value) => {
        if (typeof value === 'string' && value.startsWith('data:image') && value.length > 10000) {
          return value.substring(0, 50) + "... [Base64 image omitted from history storage]";
        }
        return value;
      };
      localStorage.setItem("sera_hackathon_messages", JSON.stringify(messages, replacer));
    } catch (e) { }
  }, [messages]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isTyping, setIsTyping] = useState(false);
  const [steps, setSteps] = useState([]);
  const [executionState, setExecutionState] = useState(null);
  const executionStateRef = useRef(null);
  const [pendingImages, setPendingImages] = useState([]);
  const lastUploadedImages = useRef([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [uploadingForProduct, setUploadingForProduct] = useState(null);
  const productImageInputRef = useRef(null);
  const [chatMode, setChatMode] = useState('agent'); // 'plan' or 'agent'
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [agentActivity, setAgentActivity] = useState([]); // {message, status, done}
  const agentActivityRef = useRef([]);
  const lastUserMsgRef = useRef("");
  const abortControllerRef = useRef(null);
  const [ephemeralThought, setEphemeralThought] = useState(null);
  const [openingLine, setOpeningLine] = useState("");
  const openingCaptured = useRef(false);
  const actionAppliedRef = useRef(false);
  const [buildingStage, setBuildingStage] = useState(0);
  const [visibilityMode, setVisibilityMode] = useState('agent');

  const stopAgentWork = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsTyping(false);
    setAgentActivity(prev => prev.map(a => ({ ...a, done: true })));
    setMessages(prev => prev.map(m => m.id === "pending_agent_msg" ? {
      ...m,
      id: undefined,
      status: "done",
      text: "Operational Status: Progress stopped by user."
    } : m));
  };
  const chatScrollRef = useRef(null);
  const isUserScrolledUp = useRef(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // Disable autoscroll lock only when not typing, and use a larger threshold (150px) to prevent accidental locks.
    if (!isTyping) {
      isUserScrolledUp.current = distanceFromBottom > 150;
    }
  };

  const handleUserInteraction = () => {
    // Keep as backup, but handleScroll does the heavy lifting
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, steps, agentActivity, ephemeralThought, chatOpen]);

  const addStep = (label, isAsync = false) => {
    const id = Math.random().toString(36).substr(2, 9);
    setSteps(prev => [...prev, { id, label, done: false, active: true, isAsync }]);
    if (!isAsync) {
      setTimeout(() => {
        completeStep(id);
      }, 1500);
    }
    return id;
  };

  const completeStep = (id) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, done: true, active: false } : s));
  };

  const setPhilosophy = (fn) => setStoreSchema(prev => {
    const existingSection = prev.layout.find(s => s.type === "philosophy");
    const currentItems = existingSection?.props?.items || [];
    const nextItems = typeof fn === "function" ? fn(currentItems) : fn;
    if (existingSection) {
      return {
        ...prev,
        layout: prev.layout.map(s => s.type === "philosophy" ? { ...s, props: { ...s.props, items: nextItems } } : s)
      };
    } else {
      return {
        ...prev,
        layout: [...prev.layout, { id: "auto-philosophy", type: "philosophy", variant: "scroller", props: { items: nextItems } }]
      };
    }
  });

  const preloadImage = (url, stepId, retryCount = 0, onComplete) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      console.warn("Image timeout (waited 8s):", url);
      if (stepId) {
        completeStep(stepId);
        setProducts(prev => prev.map(p => p.stepId === stepId ? { ...p, stepId: null } : p));
        setPhilosophy(prev => prev.map(ph => ph.stepId === stepId ? { ...ph, stepId: null } : ph));
      }
      if (onComplete) onComplete(false);
    }, 8000);
    img.onload = () => {
      clearTimeout(timeout);
      if (stepId) {
        completeStep(stepId);
        setProducts(prev => prev.map(p => p.stepId === stepId ? { ...p, stepId: null } : p));
        setPhilosophy(prev => prev.map(ph => ph.stepId === stepId ? { ...ph, stepId: null } : ph));
      }
      if (onComplete) onComplete(true);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      setTimeout(() => {
        if (stepId) {
          completeStep(stepId);
          setProducts(prev => prev.map(p => p.stepId === stepId ? { ...p, stepId: null } : p));
          setPhilosophy(prev => prev.map(ph => ph.stepId === stepId ? { ...ph, stepId: null } : ph));
        }
        if (onComplete) onComplete(false);
      }, 500);
    };
    img.src = url;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const handleProductImageUpdate = (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingForProduct) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProducts(prev => prev.map(p =>
        p.name === uploadingForProduct ? { ...p, imageUrl: event.target.result } : p
      ));
      addStep(`Updated photo for: ${uploadingForProduct}`);
      setUploadingForProduct(null);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const { applyAction } = useAgentActions({
    storeSchema,
    setStoreSchema,
    setStoreData,
    setProducts,
    setPhilosophy,
    setMessages,
    addStep,
    preloadImage,
    lastUploadedImages,
    setBuildingStage,
    setActiveNav,
    setUserStores,
    setVideoFormat,
    setActivePromoTab
  });

  const setThemeColor = (color) => setStoreSchema(prev => ({ ...prev, theme: { ...prev.theme, themeColor: color } }));
  const setHeroBg = (bg) => setStoreSchema(prev => ({ ...prev, theme: { ...prev.theme, heroBg: bg } }));

  const sendMessage = async (overrideInput, overrideMode) => {
    const userMsg = overrideInput || input;
    const currentImages = [...pendingImages];
    if (!userMsg.trim() && currentImages.length === 0) return;

    let finalMode = overrideMode || chatMode;

    if (finalMode === 'plan' && !overrideMode && messages.some(m => m.action === 'show_plan' && !m.planConfirmed)) {
      if (/\b(oke|ok|lanjut|lanjutkan|kerjakan|buat|bikin|gas|sip|setuju|yes|ya|y|go|terapkan)\b/i.test(userMsg)) {
        finalMode = 'agent';
        setChatMode('agent');
      }
    }
    setMessages(prev => {
      const next = [...prev];
      if (finalMode === 'agent' && chatMode === 'plan') {
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].action === 'show_plan') {
            next[i].planConfirmed = true;
            break;
          }
        }
      }
      next.push({ role: "user", text: userMsg || (currentImages.length > 0 ? "Mengirim gambar..." : ""), images: currentImages });
      return next;
    });
    if (!overrideInput) setInput("");
    setPendingImages([]);
    lastUploadedImages.current = currentImages;
    lastUserMsgRef.current = userMsg;
    setIsTyping(true);
    setAgentActivity([]);
    agentActivityRef.current = [];
    setBuildingStage(0);
    setExecutionState(null);
    executionStateRef.current = null;
    setOpeningLine("");
    openingCaptured.current = false;
    actionAppliedRef.current = false;

    const prevSnapBeforeRun = {
      storeData,
      products: [...products],
      themeColor,
      heroBg,
      storeSchema: JSON.parse(JSON.stringify(storeSchema))
    };

    try {
      let storeContextToSend = {};
      if (appMode === "buyer") {
        storeContextToSend = {
          session_id: "buyer_session",
          chatMode: "buyer",
          activeStores: filteredStores.map(s => ({ id: s.id, name: s.name, category: s.category, desc: s.desc })),
          ...(selectedStorefront ? { storeId: selectedStorefront.id, storeName: selectedStorefront.name } : {})
        };
      } else {
        storeContextToSend = {
          ...storeSchema,
          storeId: storeSchema.id || activeAnalyticsStoreId,
          activeTab: activeNav,
          products,
          themeColor,
          heroBg
        };
      }
      abortControllerRef.current = new AbortController();
      const response = await sendChat(
        { input: userMsg, history: messages, storeContext: storeContextToSend, images: currentImages, chatMode: appMode === 'buyer' ? 'buyer' : finalMode },
        abortControllerRef.current.signal
      );
      if (!response.body) {
        throw new Error("ReadableStream not supported or empty body.");
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setIsTyping(false);
        const action = canonicalizeAgentAction(data.action || "idle");
        const params = normalizeAgentParams(action, data.params || {});
        const ui = isStoreMutationAction(action);
        setMessages(prev => [...prev, {
          role: "agent",
          text: data.text || "Respons diterima.",
          action,
          params,
          hasAction: ui,
          status: ui ? "generating" : "done",
          actionState: ui ? "pending" : null,
          prevState: ui ? prevSnapBeforeRun : null,
        }]);
        if (ui) applyAction(action, params);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          buffer += chunk;
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.type === "schema_preview") {
                if (data.action === 'batch_create') {
                  setBuildingStage(2);
                }
                setMessages(prev => {
                  const existingPending = prev.find(m => m.id === "pending_agent_msg");
                  const noPending = prev.filter(m => m.id !== "pending_agent_msg");
                  return [...noPending, {
                    id: "pending_agent_msg",
                    role: "agent",
                    text: existingPending ? existingPending.text : "",
                    action: data.action,
                    params: data.params,
                    hasAction: isStoreMutationAction(data.action, data.params),
                    status: "generating",
                    actionState: "pending",
                    prevState: prevSnapBeforeRun
                  }];
                });

                if (data.action === "show_plan") {
                  applyAction("update_schema", data.params);
                } else if (isStoreMutationAction(data.action, data.params) || data.action !== 'idle') {
                  applyAction(data.action, data.params);
                }
                actionAppliedRef.current = true;
              } else if (data.type === "agent_message_start" || data.type === "text_chunk") {
                setEphemeralThought(null);

                if (!openingCaptured.current) {
                  const currentText = data.text !== undefined ? data.text : (openingLine + (data.chunk || ""));

                  // Bersihkan teks dari code block, JSON bracket, dan line break
                  let cleanText = currentText.split('\n')[0].split('```')[0].split('{')[0].trim();

                  // Ambil hanya kalimat pertama jika ada titik
                  if (cleanText.includes('.')) {
                    cleanText = cleanText.split('.')[0] + '.';
                  }

                  // Batasi panjang maksimal 100 karakter
                  if (cleanText.length > 100) {
                    cleanText = cleanText.substring(0, 97) + '...';
                  }

                  setOpeningLine(cleanText);

                  // Set flag captured jika teks sudah mencapai titik batas atau ada tanda kode
                  if (currentText.includes('\n') || currentText.includes('{') || currentText.includes('```') || currentText.length > 60) {
                    openingCaptured.current = true;
                  }
                }

                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.id === "pending_agent_msg") {
                    const newText = data.text !== undefined ? data.text : (last.text || "") + (data.chunk || "");
                    return [...prev.slice(0, -1), { ...last, text: newText }];
                  } else if (last && last.role === "agent") {
                    const newText = data.text !== undefined ? data.text : (last.text || "") + (data.chunk || "");
                    return [...prev.slice(0, -1), { ...last, text: newText }];
                  } else {
                    const newText = data.text !== undefined ? data.text : (data.chunk || "");
                    return [...prev, { id: "pending_agent_msg", role: "agent", text: newText, status: "done" }];
                  }
                });
              } else if (data.type === "lifecycle") {
                setExecutionLifecycle(data.state);
              } else if (data.type === "thought") {
                setEphemeralThought(data.thought);
              } else if (data.type === "execution_state") {
                setExecutionState(data.state);
                executionStateRef.current = data.state;
                setAgentActivity(prev => {
                  const next = [...prev];
                  const existingIndex = next.findIndex(a => a.message === data.state.message);
                  if (existingIndex >= 0) {
                    next[existingIndex] = { ...next[existingIndex], ...data.state };
                  } else {
                    next.push({ ...data.state, type: "execution", timestamp: Date.now() / 1000 });
                  }
                  agentActivityRef.current = next;
                  return next;
                });
              } else if (data.type === "cognition_log") {
                setAgentActivity(prev => {
                  const next = [...prev];
                  const existingIndex = next.findIndex(a => a.message === data.log.message);
                  if (existingIndex >= 0) {
                    next[existingIndex] = { ...next[existingIndex], ...data.log };
                  } else {
                    next.push({ ...data.log, type: "cognition", timestamp: Date.now() / 1000 });
                  }
                  agentActivityRef.current = next;
                  return next;
                });
              } else if (data.type === "cognition") {
                setAgentActivity(prev => {
                  const next = [...prev];
                  const existingIndex = next.findIndex(a => a.message === data.message);
                  if (existingIndex >= 0) {
                    next[existingIndex] = { ...next[existingIndex], ...data, timestamp: Date.now() / 1000 };
                  } else {
                    next.push({
                      title: data.title,
                      message: data.message,
                      phase: data.phase,
                      agent: data.agent,
                      tool: data.tool || null,
                      type: "cognition",
                      done: data.done || false,
                      timestamp: Date.now() / 1000
                    });
                  }
                  agentActivityRef.current = next;
                  return next;
                });
              } else if (data.type === "thinking") {
                setEphemeralThought(data.text);
                setAgentActivity(prev => {
                  const next = [...prev, {
                    message: data.text,
                    phase: data.phase,
                    agent: data.agent,
                    step: data.step,
                    type: "thinking",
                    timestamp: Date.now() / 1000
                  }];
                  agentActivityRef.current = next;
                  return next;
                });
              } else if (data.type === "final") {
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.id === "pending_agent_msg") {
                    return [...prev.slice(0, -1), {
                      ...last,
                      text: data.text || last.text,
                      chat: data.chat,
                      action: data.action,
                      params: data.params
                    }];
                  } else if (last && last.role === "agent") {
                    return [...prev.slice(0, -1), {
                      ...last,
                      text: data.text || last.text,
                      chat: data.chat,
                      action: data.action,
                      params: data.params
                    }];
                  } else {
                    return [...prev, {
                      id: "pending_agent_msg",
                      role: "agent",
                      text: data.text,
                      chat: data.chat,
                      action: data.action,
                      params: data.params,
                      status: "done"
                    }];
                  }
                });
              } else if (data.type === "error") {
                setMessages(prev => {
                  const noPending = prev.filter(m => m.id !== "pending_agent_msg");
                  return [...noPending, { role: "agent", text: `Error: ${data.message}`, status: "done", actionState: "rejected" }];
                });
              }
            } catch (err) { }
          }
        }
        if (done) break;
      }
      setMessages(prev => prev.map(m => {
        if (m.id === "pending_agent_msg") {
          const action = canonicalizeAgentAction(m.action);
          const params = normalizeAgentParams(action, m.params);
          if (m.hasAction && m.actionState !== "approved" && m.actionState !== "rejected") {
            // Actions are now applied instantly during 'schema_preview' for live streaming effect.
            // We do not re-apply here to avoid duplicate side-effects (like double auto-registration).
          }
          return { ...m, id: undefined, status: "done", action, params };
        }
        return m;
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setMessages(prev => [...prev.filter(m => m.id !== "pending_agent_msg"), { role: "agent", text: "A connection error occurred or the server is down.", status: "done" }]);
      }
    } finally {
      setIsTyping(false);
      setAgentActivity(prev => prev.map(a => ({ ...a, done: true })));
      setEphemeralThought(null);
    }
  };

  const handleAction = async (index, decision) => {
    const msg = messages[index];
    const decisionState = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "undone";
    setMessages(prev => {
      const newMsg = [...prev];
      const m = newMsg[index];
      m.actionState = decisionState;
      if (decision === "reject" || decision === "undo") {
        if (m.prevState) {
          setStoreData(m.prevState.storeData);
          setProducts(m.prevState.products);
          setThemeColor(m.prevState.themeColor);
          setHeroBg(m.prevState.heroBg);
          if (m.prevState.storeSchema) {
            setStoreSchema(m.prevState.storeSchema);
          }
        }
      }
      return newMsg;
    });
    if (decision === "approve") {
      if (msg.action === "show_plan" || msg.action === "batch_create" || msg.action === "update_schema") {
        const prevSnap = msg.prevState || { storeData, products, themeColor, heroBg, storeSchema };
        if (msg.action === "show_plan") {
          if (msg.params?.schema) {
            applyAction("update_schema", msg.params);
          } else {
            applyAction("batch_create", msg.params);
          }
          setMessages(prev => {
            const updated = [...prev];
            const m = updated[index];
            m.prevState = prevSnap;
            return updated;
          });
          setDraftSchema(null);
        }
      }
    } else if (decision === "reject" || decision === "undo") {
      setDraftSchema(null);
    }
    try {
      await rememberAction(msg.action, decisionState, msg.params);
    } catch (err) {
      console.error("Failed to commit to memory:", err);
    }
    setSteps([]);
  };

  const handleRetryAssets = async (msgIndex, pendingRetries, retrySchema) => {
    if (!retrySchema || !pendingRetries?.length) return;
    const failedIds = pendingRetries.map(r => r.itemId);
    setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, retryStatus: 'retrying' } : m));
    setIsTyping(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/agent/retry-assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: retrySchema, failed_item_ids: failedIds })
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'execution_state' && data.state?.results) {
              setStoreSchema(prev => {
                const updatedLayout = prev.layout.map(section => {
                  if (section.type === 'hero') {
                    const match = data.state.results.find(r => r.itemId === 'hero_bg' && r.status === 'success');
                    if (match) return { ...section, props: { ...section.props, heroImage: match.proxy_url || match.url } };
                  }
                  if (section.type === 'featured_products' && section.props?.products) {
                    let changed = false;
                    const nextProds = section.props.products.map((p, idx) => {
                      const match = data.state.results.find(r => r.itemId === `prod_${idx}` && r.status === 'success');
                      if (match && !p.verifiedUrl) { changed = true; const u = match.proxy_url || match.url; return { ...p, verifiedUrl: u, imageUrl: u, pendingUrl: u, stepId: null }; }
                      return p;
                    });
                    return changed ? { ...section, props: { ...section.props, products: nextProds } } : section;
                  }
                  if (section.type === 'philosophy' && section.props?.items) {
                    let changed = false;
                    const nextItems = section.props.items.map((item, idx) => {
                      const match = data.state.results.find(r => r.itemId === `philo_${idx}` && r.status === 'success');
                      if (match && !item.verifiedUrl) { changed = true; const u = match.proxy_url || match.url; return { ...item, verifiedUrl: u, imageUrl: u, pendingUrl: u, stepId: null }; }
                      return item;
                    });
                    return changed ? { ...section, props: { ...section.props, items: nextItems } } : section;
                  }
                  return section;
                });
                return { ...prev, layout: updatedLayout };
              });
            } else if (data.type === 'retry_complete') {
              const remaining = data.remaining_failures || 0;
              setMessages(prev => prev.map((m, i) => {
                if (i !== msgIndex) return m;
                const stillFailed = (m.params?.pending_retries || []).filter(r => (data.failed_ids || []).includes(r.itemId));
                return { ...m, retryStatus: remaining === 0 ? 'success' : 'partial', params: { ...m.params, pending_retries: stillFailed } };
              }));
            }
          } catch (e) { }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, retryStatus: 'error' } : m));
    } finally {
      setIsTyping(false);
    }
  };

  return {
    chatOpen, setChatOpen,
    chatWidth, startResizing, isResizing,
    messages, setMessages,
    messagesEndRef, chatScrollRef, handleScroll, handleUserInteraction,
    isModeMenuOpen, setIsModeMenuOpen,
    chatMode, setChatMode,
    applyAction, handleAction, handleRetryAssets,
    agentActivity, executionState, isTyping, ephemeralThought, openingLine,
    executionLifecycle, setExecutionLifecycle,
    stopAgentWork,
    input, setInput, sendMessage,
    isAttachMenuOpen, setIsAttachMenuOpen,
    fileInputRef, handleImageUpload, pendingImages, setPendingImages,
    setSteps, selectedProducts, setSelectedProducts,
    buildingStage, visibilityMode, setVisibilityMode,
    openActionMenuId, setOpenActionMenuId,
    productImageInputRef, handleProductImageUpdate, setUploadingForProduct,
    lastUserMsgRef, steps
  };
};
