import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storeReducer, initialState } from './storeReducer';
import { createSetter } from './storeActions';
import { INITIAL_STORE_SCHEMA } from '../utils/constants';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  // Initialize state, checking localStorage for saved storeSchema
  const [state, dispatch] = useReducer(storeReducer, initialState, (initial) => {
    let savedSchema = null;
    let savedStores = [];
    try {
      const saved = localStorage.getItem("sera_hackathon_store_schema");
      if (saved) savedSchema = JSON.parse(saved);
      const savedMsgs = localStorage.getItem("sera_hackathon_buyer_msgs");
      if (savedMsgs) {
        try {
          const parsed = JSON.parse(savedMsgs);
          if (parsed && parsed.length > 0) initial.buyerAiMessages = parsed;
        } catch (e) { }
      }
      const stores = localStorage.getItem("sera_hackathon_user_stores");
      if (stores) {
        savedStores = JSON.parse(stores);
      }
    } catch (e) {
      // ignore
    }

    return {
      ...initial,
      storeSchema: savedSchema || INITIAL_STORE_SCHEMA,
      userStores: savedStores
    };
  });

  // Persist storeSchema changes
  useEffect(() => {
    try {
      if (state.storeSchema) {
        localStorage.setItem("sera_hackathon_store_schema", JSON.stringify(state.storeSchema));
      }
    } catch (e) {
      // ignore
    }
  }, [state.storeSchema]);

  // Runtime Auto-Recovery: if userStores is empty but we have a storeSchema (even if unpublished), restore it immediately
  useEffect(() => {
    if (state.storeSchema && Array.isArray(state.userStores)) {
      const sid = state.storeSchema.id || "recovered-store-local";
      const exists = state.userStores.some(s => String(s.id) === String(sid));
      
      if (!exists && state.userStores.length === 0) { // Only recover if they have 0 stores
        const recoveredStore = {
          id: sid,
          name: state.storeSchema.name || state.storeSchema.layout?.find(s => s.type === 'hero')?.props?.title || "My Brand",
          category: state.storeSchema.category || "General",
          desc: state.storeSchema.layout?.find(s => s.type === 'hero')?.props?.subtitle || "Autonomous Commerce Store",
          cover: state.storeSchema.layout?.find(s => s.type === 'hero')?.props?.heroImage || "",
          trustScore: "99.9%",
          followers: "1.2K",
          isUserStore: true,
          customSchema: state.storeSchema,
          storeData: state.storeSchema.layout?.find(s => s.type === 'hero')?.props || {}
        };
        dispatch({ type: 'SET_STATE', key: 'userStores', payload: [recoveredStore] });
      }
    }
  }, [state.storeSchema, state.userStores, dispatch]);

  // Persist buyerAiMessages changes
  useEffect(() => {
    try {
      if (state.buyerAiMessages) {
        localStorage.setItem("sera_hackathon_buyer_msgs", JSON.stringify(state.buyerAiMessages));
      }
    } catch (e) {
      // ignore
    }
  }, [state.buyerAiMessages]);

  // Persist userStores changes
  useEffect(() => {
    try {
      if (state.userStores) {
        localStorage.setItem("sera_hackathon_user_stores", JSON.stringify(state.userStores));
      }
    } catch (e) {
      // ignore
    }
  }, [state.userStores]);

  // Expose traditional setState-like functions for easier migration
  const setters = React.useMemo(() => ({
    setAppMode: createSetter(dispatch, 'appMode'),
    setStoreSchema: createSetter(dispatch, 'storeSchema'),
    setDraftSchema: createSetter(dispatch, 'draftSchema'),
    setPublishedSchema: createSetter(dispatch, 'publishedSchema'),
    setUserStores: createSetter(dispatch, 'userStores'),
    setActiveAnalyticsStoreId: createSetter(dispatch, 'activeAnalyticsStoreId'),
    setAnalyticsData: createSetter(dispatch, 'analyticsData'),
    setIsLoadingAnalytics: createSetter(dispatch, 'isLoadingAnalytics'),
    setBuyerSearchQuery: createSetter(dispatch, 'buyerSearchQuery'),
    setBuyerAiQuery: createSetter(dispatch, 'buyerAiQuery'),
    setBuyerAiMessages: createSetter(dispatch, 'buyerAiMessages'),
    setBuyerAiStatus: createSetter(dispatch, 'buyerAiStatus'),
    setSelectedCategoryFilter: createSetter(dispatch, 'selectedCategoryFilter'),
    setFollowedStores: createSetter(dispatch, 'followedStores'),
    setCart: createSetter(dispatch, 'cart'),
    setIsCartOpen: createSetter(dispatch, 'isCartOpen'),
    setSelectedProductDetail: createSetter(dispatch, 'selectedProductDetail'),
    setSelectedStorefront: createSetter(dispatch, 'selectedStorefront'),
    setModalQty: createSetter(dispatch, 'modalQty'),
    setSelectedPhilosophy: createSetter(dispatch, 'selectedPhilosophy'),
    setToastMessage: createSetter(dispatch, 'toastMessage'),
  }), [dispatch]);

  const value = React.useMemo(() => ({
    state,
    dispatch,
    ...setters
  }), [state, dispatch, setters]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
