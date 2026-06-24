import { useRef } from "react";
import { sanitizePrompt, normalizeAgentParams } from '../../../utils/constants';

export const useAgentActions = ({
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
}) => {

  // Helper: register/update the current store schema into userStores list
  const registerStoreInList = (schema, extraProps = {}) => {
    if (!setUserStores) return;
    try {
      const heroProps = schema?.layout?.find(s => s.type === 'hero')?.props || {};
      const storeName = schema?.metadata?.brand_identity || heroProps?.title || schema?.name || 'New AI Store';
      const storeId = schema?.id || `agent_store_${Math.random().toString(36).substr(2, 9)}`;
      const coverImg = heroProps?.heroImage || '';
      const desc = heroProps?.subtitle || schema?.metadata?.objective || 'AI-generated store';
      const category = schema?.category || schema?.metadata?.category || schema?.metadata?.industry || 'General';
      setUserStores(prev => {
        const existing = prev.findIndex(s => s.id === storeId);
        const storeObj = {
          id: storeId,
          name: storeName,
          category,
          logo: '',
          cover: coverImg,
          trustScore: '99.9%',
          followers: '1.2K',
          desc,
          isUserStore: true,
          customSchema: schema,
          createdAt: new Date().toISOString(),
          ...extraProps
        };
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = storeObj;
          return next;
        }
        return [...prev, storeObj];
      });
    } catch (e) {
      console.warn('registerStoreInList failed:', e);
    }
  };
  const setThemeColor = (color) => setStoreSchema(prev => ({ ...prev, theme: { ...(prev?.theme || {}), themeColor: color } }));
  const setHeroBg = (bg) => setStoreSchema(prev => ({ ...prev, theme: { ...(prev?.theme || {}), heroBg: bg } }));
  const setHeroImage = (img) => setStoreSchema(prev => ({ ...prev, layout: (prev?.layout || []).map(s => s.type === "hero" ? { ...s, props: { ...(s.props || {}), heroImage: img } } : s) }));
  const setHeroStyles = (styles) => setStoreSchema(prev => ({ ...prev, layout: (prev?.layout || []).map(s => s.type === "hero" ? { ...s, props: { ...(s.props || {}), heroStyles: { ...(s.props?.heroStyles || {}), ...styles } } } : s) }));
  const setFooterData = (data) => setStoreSchema(prev => ({ ...prev, layout: (prev?.layout || []).map(s => s.type === "footer" ? { ...s, props: { ...(s.props || {}), ...data } } : s) }));
  const setTestimonials = (data) => setStoreSchema(prev => ({ ...prev, layout: (prev?.layout || []).map(s => s.type === "testimonials" ? { ...s, props: { ...(s.props || {}), testimonials: data } } : s) }));
  const setFaq = (data) => setStoreSchema(prev => ({ ...prev, layout: (prev?.layout || []).map(s => s.type === "faq" ? { ...s, props: { ...(s.props || {}), faq: data } } : s) }));
  const setDraftSchema = (params) => { /* handled by schema update */ };
  const setSelectedStorefront = (fn) => { /* mock for backward compatibility */ };
  const setChannelsState = (fn) => { /* mock */ };
  const setLayoutOrder = (order) => setStoreSchema(prev => {
      if (!prev?.layout) return prev;
      const newLayout = [];
      const usedTypes = new Set();
      order.forEach(type => {
          const section = prev.layout.find(s => s.type === type);
          if (section) { newLayout.push(section); usedTypes.add(type); }
      });
      prev.layout.forEach(s => {
          if (!usedTypes.has(s.type)) newLayout.push(s);
      });
      return { ...prev, layout: newLayout };
  });

  const applyAction = (action, rawParams, prevSnap) => {
    const params = normalizeAgentParams(action, rawParams || {});
    if (action === 'update_schema') {
      const usedUrls = new Set();
      const layoutWithImages = (params.schema?.layout || []).map(section => {
        if (section.type === "featured_products" && section.props?.products && Array.isArray(section.props.products)) {
          return {
            ...section,
            props: {
              ...section.props,
              products: section.props.products.map((p, idx) => {
                const existingSec = storeSchema.layout?.find(s => s.type === "featured_products");
                const existingProduct = existingSec?.props?.products?.find((ep, eIdx) => {
                  if (p.productInstanceId && ep.productInstanceId) {
                    return ep.productInstanceId === p.productInstanceId;
                  }
                  return ep.name === p.name || eIdx === idx;
                });
                let finalImageUrl = p.verifiedUrl || existingProduct?.verifiedUrl || existingProduct?.imageUrl || "";
                if (p.imageIndex !== undefined && lastUploadedImages.current[p.imageIndex]) {
                  finalImageUrl = lastUploadedImages.current[p.imageIndex];
                }
                const stepId = (!p.verifiedUrl && !existingProduct?.verifiedUrl && !finalImageUrl.startsWith("data:"))
                  ? (existingProduct?.stepId || addStep(`Generating image for: ${p.name}`, true))
                  : null;
                return {
                  ...p,
                  productInstanceId: p.productInstanceId || existingProduct?.productInstanceId || `prod_inst_${Math.random().toString(36).substr(2, 9)}`,
                  imageUrl: p.verifiedUrl || finalImageUrl,
                  pendingUrl: finalImageUrl,
                  icon: p.icon || "📦",
                  stepId,
                  verificationError: p.verificationError || null
                };
              })
            }
          };
        }
        if (section.type === "philosophy" && section.props?.items && Array.isArray(section.props.items)) {
          return {
            ...section,
            props: {
              ...section.props,
              items: section.props.items.map((item, idx) => {
                const existingPhiloSec = storeSchema.layout?.find(s => s.type === "philosophy");
                const existingItem = existingPhiloSec?.props?.items?.find((ei, eIdx) => {
                  if (item.philoInstanceId && ei.philoInstanceId) {
                    return ei.philoInstanceId === item.philoInstanceId;
                  }
                  return ei.label === item.label || eIdx === idx;
                });
                let finalImageUrl = item.verifiedUrl || existingItem?.verifiedUrl || existingItem?.imageUrl || "";
                const stepId = (!item.verifiedUrl && !existingItem?.verifiedUrl)
                  ? (existingItem?.stepId || addStep(`Generating brand philosophy: ${item.label}`, true))
                  : null;
                return {
                  ...item,
                  philoInstanceId: item.philoInstanceId || existingItem?.philoInstanceId || `philo_inst_${Math.random().toString(36).substr(2, 9)}`,
                  imageUrl: item.verifiedUrl || finalImageUrl,
                  pendingUrl: finalImageUrl,
                  stepId
                };
              })
            }
          };
        }
        if (section.type === "hero" && section.props) {
          const heroSec = section.props;
          const heroPrompt = heroSec.heroImagePrompt || (heroSec.title ? `${heroSec.title} luxury lifestyle photography, cinematic lighting` : null);
          let finalHeroImg = heroSec.heroImage || "";
          if (!finalHeroImg && heroPrompt) {
            addStep("Generating cinematic hero photography");
          }
          return {
            ...section,
            props: {
              ...section.props,
              heroImage: finalHeroImg
            }
          };
        }
        return section;
      });
      // Ensure all required sections are always present in layout
      const finalLayout = [...layoutWithImages];
      if (!finalLayout.some(s => s.type === "header")) {
        finalLayout.push({ id: "auto-header", type: "header", variant: "default", props: {} });
      }
      if (!finalLayout.some(s => s.type === "hero")) {
        finalLayout.push({ id: "auto-hero", type: "hero", variant: "centered", props: { title: "Crafting...", subtitle: "Autonomous generation in progress" } });
      }
      if (!finalLayout.some(s => s.type === "trust_bar")) {
        finalLayout.push({ id: "auto-trust", type: "trust_bar", variant: "ticker", props: {} });
      }
      if (!finalLayout.some(s => s.type === "featured_products")) {
        finalLayout.push({ id: "auto-products", type: "featured_products", variant: "grid", props: { products: [] } });
      }
      if (!finalLayout.some(s => s.type === "philosophy")) {
        finalLayout.push({ id: "auto-philosophy", type: "philosophy", variant: "scroller", props: { items: [] } });
      }
      if (!finalLayout.some(s => s.type === "testimonials")) {
        finalLayout.push({ id: "auto-testimonials", type: "testimonials", variant: "cards", props: {} });
      }
      if (!finalLayout.some(s => s.type === "faq")) {
        finalLayout.push({ id: "auto-faq", type: "faq", variant: "accordion", props: {} });
      }
      if (!finalLayout.some(s => s.type === "footer")) {
        finalLayout.push({ id: "auto-footer", type: "footer", variant: "default", props: {} });
      }
      // Sort sections in canonical order
      const SECTION_ORDER = ["header", "hero", "trust_bar", "featured_products", "philosophy", "testimonials", "faq", "footer"];
      const sortedLayout = [...finalLayout].sort((a, b) => {
        const ai = SECTION_ORDER.indexOf(a.type);
        const bi = SECTION_ORDER.indexOf(b.type);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      setBuildingStage(0); // Clear skeleton — real layout is now rendered
      setStoreSchema(prev => {
        const nextSchema = {
          ...prev,
          ...params.schema,
          layout: sortedLayout,
          theme: { ...prev.theme },
          metadata: { ...prev.metadata, ...(params.schema?.metadata || {}) }
        };
        return nextSchema;
      });
      // Preload any pending images
      const allProducts = layoutWithImages.find(s => s.type === "featured_products")?.props?.products || [];
      const allPhilo = layoutWithImages.find(s => s.type === "philosophy")?.props?.items || [];
      const itemsToLoadProducts = allProducts.filter(p => p.stepId);
      const itemsToLoadPhilo = allPhilo.filter(ph => ph.stepId);
      const totalItemsToLoad = [...itemsToLoadProducts, ...itemsToLoadPhilo];
      if (totalItemsToLoad.length === 0) {
        setMessages(prev => {
          const last = [...prev];
          if (last[last.length - 1]?.role === 'agent') last[last.length - 1].status = 'done';
          return last;
        });
      } else {
        // Parallel Loading Implementation (Instant Live Visual Building)
        let failedAny = false;
        itemsToLoadProducts.forEach(p => {
          preloadImage(p.pendingUrl, p.stepId, 0, (success) => {
            if (!success) failedAny = true;
          });
        });
        itemsToLoadPhilo.forEach(ph => {
          preloadImage(ph.pendingUrl, ph.stepId, 0, (success) => {
            if (!success) failedAny = true;
          });
        });
        setMessages(prev => {
          const last = [...prev];
          const msg = last[last.length - 1];
          if (msg && msg.role === 'agent') {
            msg.status = 'done';
          }
          return last;
        });
      }
      addStep("Orchestrating structural layout changes");
      return;
    }

    switch (action) {
      case 'generate_video':
        const finalUrl = params.video_url || params.url;
        if (finalUrl) {
          if (params.brand_name) {
            setStoreData(p => {
              if (!p.title || p.title === "New AI Store" || p.title === "AI Store") {
                return { ...p, title: params.brand_name };
              }
              return p;
            });
            setStoreSchema(prev => {
              const currentBrand = prev.metadata?.brand_identity;
              if (!currentBrand || currentBrand === "New AI Store" || currentBrand === "AI Store") {
                const next = { ...prev, metadata: { ...(prev.metadata || {}), brand_identity: params.brand_name } };
                const nextLayout = [...(next.layout || [])];
                const heroIdx = nextLayout.findIndex(s => s.type === "hero");
                if (heroIdx >= 0) nextLayout[heroIdx] = { ...nextLayout[heroIdx], props: { ...nextLayout[heroIdx].props, title: params.brand_name } };
                next.layout = nextLayout;
                return next;
              }
              return prev;
            });
          }
          const ratioStr = String(params.aspect_ratio || params.ratio || params.type || "").toLowerCase();
          const isVertical = ratioStr.includes("9:16") || ratioStr.includes("9/16") || ratioStr.includes("vertical") || ratioStr.includes("portrait") || ratioStr.includes("promo");
          if (isVertical) {
            setStoreData(p => {
              const currentList = (Array.isArray(p.promoVideos) ? p.promoVideos : (p.promoVideo ? [p.promoVideo] : [])).filter(v => typeof v === 'string' && v.trim() !== "");
              const nextList = currentList.includes(finalUrl) ? currentList : [...currentList, finalUrl];
              return { ...p, promoVideo: finalUrl, promoVideos: nextList };
            });
            addStep("Generating vertical promo video");
            if (setVideoFormat) setVideoFormat("vertical");
          } else {
            setStoreData(p => {
              const currentList = (Array.isArray(p.storeVideos) ? p.storeVideos : (p.storeVideo ? [p.storeVideo] : [])).filter(v => typeof v === 'string' && v.trim() !== "");
              const nextList = currentList.includes(finalUrl) ? currentList : [...currentList, finalUrl];
              return { ...p, storeVideo: finalUrl, storeVideos: nextList };
            });
            addStep("Generating landscape store banner");
            if (setVideoFormat) setVideoFormat("landscape");
          }
          if (setActivePromoTab) setActivePromoTab("video");
          setActiveNav("promotions");
        }
        break;
      case 'change_title':
        const newTitle = params.store_name || params.title;
        if (newTitle) {
          setStoreData(p => ({ ...p, title: newTitle }));
          setStoreSchema(prev => {
            const next = { ...prev, metadata: { ...prev.metadata, brand_identity: newTitle } };
            const nextLayout = [...(next.layout || [])];
            const heroIdx = nextLayout.findIndex(s => s.type === "hero");
            if (heroIdx >= 0) nextLayout[heroIdx] = { ...nextLayout[heroIdx], props: { ...nextLayout[heroIdx].props, title: newTitle } };
            next.layout = nextLayout;
            return next;
          });
          addStep("Updating store title");
        }
        break;
      case 'change_subtitle':
        const newSubtitle = params.hero_description || params.hero_headline || params.subtitle;
        if (newSubtitle) {
          setStoreData(p => ({ ...p, subtitle: newSubtitle }));
          setStoreSchema(prev => {
            const next = { ...prev };
            const nextLayout = [...(next.layout || [])];
            const heroIdx = nextLayout.findIndex(s => s.type === "hero");
            if (heroIdx >= 0) nextLayout[heroIdx] = { ...nextLayout[heroIdx], props: { ...nextLayout[heroIdx].props, subtitle: newSubtitle } };
            next.layout = nextLayout;
            return next;
          });
          addStep("Updating subtitle");
        }
        break;

      case 'change_landscape_video':
        if (params.videoUrl || params.videoUrl_placeholder) {
          setStoreSchema(prev => {
            const next = { ...prev };
            const nextLayout = [...(next.layout || [])];
            const vlIdx = nextLayout.findIndex(s => s.type === "video_landscape");
            if (vlIdx >= 0) {
              nextLayout[vlIdx] = { ...nextLayout[vlIdx], props: { ...nextLayout[vlIdx].props, videoUrl: params.videoUrl || params.videoUrl_placeholder } };
            }
            next.layout = nextLayout;
            return next;
          });
          addStep("Updating landscape video");
        }
        break;
      case 'change_vertical_video':
        if (params.videoUrl || params.videoUrl_placeholder) {
          setStoreSchema(prev => {
            const next = { ...prev };
            const nextLayout = [...(next.layout || [])];
            const vvIdx = nextLayout.findIndex(s => s.type === "video_vertical");
            if (vvIdx >= 0) {
              nextLayout[vvIdx] = { ...nextLayout[vvIdx], props: { ...nextLayout[vvIdx].props, videoUrl: params.videoUrl || params.videoUrl_placeholder } };
            }
            next.layout = nextLayout;
            return next;
          });
          addStep("Updating vertical video");
        }
        break;
      case 'change_collection':
        if (params.collection) { setStoreData(p => ({ ...p, collection: params.collection })); addStep("Updating collection label"); }
        break;
      case 'change_button':
        const newButtonText = params.cta_primary || params.buttonText;
        if (newButtonText) { setStoreData(p => ({ ...p, buttonText: newButtonText })); addStep("Updating CTA button"); }
        break;
      case 'add_promo_banner':
        if (params.bannerText) { setStoreData(p => ({ ...p, promoBanner: params.bannerText })); addStep("Adding promo banner"); }
        break;
      case 'remove_promo_banner':
        setStoreData(p => ({ ...p, promoBanner: "" })); addStep("Removing promo banner");
        break;
      case 'add_product':
        if (params.name) {
          const stepId = addStep(params.imageIndex !== undefined ? `Processing uploaded image: ${params.name}` : `Generating image for: ${params.name}`, true);
          const uniqueSalt = Math.floor(Math.random() * 1000000);
          const promptStr = sanitizePrompt(params.imagePrompt || params.name);
          // Setup default/fallback URL handling
          let finalImageUrl = "";
          if (params.imageIndex !== undefined && lastUploadedImages.current[params.imageIndex]) {
            finalImageUrl = lastUploadedImages.current[params.imageIndex];
          }
          preloadImage(finalImageUrl, stepId, 0, (success) => {
            setMessages(prev => {
              const last = [...prev];
              const msg = last[last.length - 1];
              if (msg && msg.role === 'agent') {
                msg.status = success ? 'done' : 'failed';
              }
              return last;
            });
          });
          setProducts(prev => [{
            ...params,
            name: params.name,
            desc: params.desc || "New product",
            price: params.price || "$0.00",
            imageUrl: finalImageUrl,
            icon: params.icon || "📦",
            stepId
          }, ...prev]);
        }
        break;
      case 'change_price':
        if (params.productName && params.newPrice) {
          setProducts(p => p.map(prod =>
            prod.name.toLowerCase().includes(params.productName.toLowerCase()) ? { ...prod, price: params.newPrice } : prod
          ));
          addStep(`Updating price: ${params.productName}`);
        }
        break;
      case 'batch_update_prices':
        if (Array.isArray(params.updates)) {
          setProducts(prev => prev.map(prod => {
            const prodName = String(prod.name || "").toLowerCase();
            const update = params.updates.find(u => prodName.includes(String(u.productName || "").toLowerCase()));
            return update ? { ...prod, price: update.newPrice } : prod;
          }));
          addStep(`Batch updating product prices`);
        }
        break;
      case 'change_product_promo':
        if (params.productName) {
          setProducts(p => p.map(prod =>
            prod.name.toLowerCase().includes(params.productName.toLowerCase()) ? { ...prod, promo: params.promo || "" } : prod
          ));
          addStep(params.promo ? `Adding promo to: ${params.productName}` : `Removing promo from: ${params.productName}`);
        }
        break;
      case 'change_product_desc':
        // Debug removed
        const descText = params.desc || params.description || params.newDesc || params.newDescription || params.new_desc || params.text;
        const targetProdName = params.productName || params.name || params.product || params.target;
        if (targetProdName && descText) {
          setProducts(p => p.map(prod =>
            prod.name.toLowerCase().includes(targetProdName.toLowerCase()) || targetProdName.toLowerCase().includes(prod.name.toLowerCase()) ? { ...prod, desc: descText, description: descText } : prod
          ));
          addStep(`Updating description: ${targetProdName}`);
        } else {
          console.warn("change_product_desc missing productName or descText", params);
        }
        break;
      case 'change_product_name':
        if (params.productName && params.newName) {
          setProducts(p => p.map(prod =>
            prod.name.toLowerCase().includes(params.productName.toLowerCase()) ? { ...prod, name: params.newName } : prod
          ));
          addStep(`Renaming: ${params.productName} â†’ ${params.newName}`);
        }
        break;
      case 'change_product_image':
        if (params.productName) {
          const stepId = addStep(params.imageIndex !== undefined ? `Updating with uploaded image: ${params.productName}` : `Regenerating image: ${params.productName}`, true);
          const uniqueSalt = Math.floor(Math.random() * 1000000);
          const promptStr = sanitizePrompt(params.imagePrompt || params.productName);
          // Setup fallback URL handling
          let finalImageUrl = params.imageUrl || "";
          if (params.imageIndex !== undefined && lastUploadedImages.current[params.imageIndex]) {
            finalImageUrl = lastUploadedImages.current[params.imageIndex];
          }
          preloadImage(finalImageUrl, stepId, 0, (success) => {
            setMessages(prev => {
              const last = [...prev];
              const msg = last[last.length - 1];
              if (msg && msg.role === 'agent') {
                msg.status = success ? 'done' : 'failed';
              }
              return last;
            });
          });
          setProducts(prev => {
            const targetName = String(params.productName).trim().toLowerCase();
            return prev.map(p => {
              const currentName = String(p.name).trim().toLowerCase();
              if (currentName === targetName || currentName.includes(targetName) || targetName.includes(currentName)) {
                return { ...p, imageUrl: finalImageUrl, stepId };
              }
              return p;
            });
          });
        }
        break;
      case 'remove_product':
        if (params.productName) {
          setProducts(p => p.filter(prod => !prod.name.toLowerCase().includes(params.productName.toLowerCase())));
          addStep(`Removing product: ${params.productName}`);
        }
        break;
      case 'change_theme_color':
        if (params.color) { setThemeColor(params.color); addStep("Changing theme color"); }
        break;
      case 'change_store_cover':
        if (params.imagePrompt || params.imageUrl) {
          const stepId = addStep("Updating store cover image", true);
          const uniqueSalt = Math.floor(Math.random() * 1000000);
          const promptStr = sanitizePrompt(params.imagePrompt || "store cover banner");
          const finalUrl = params.imageUrl || "";
          setSelectedStorefront(prev => prev ? { ...prev, cover: finalUrl } : prev);
          setHeroImage(finalUrl);
          setStoreSchema(prev => {
            if (!prev.layout) return prev;
            return {
              ...prev,
              layout: prev.layout.map(s => s.type === "hero" ? { ...s, props: { ...s.props, heroImage: finalUrl } } : s)
            };
          });
          preloadImage(finalUrl, stepId, 0, (success) => {
            setMessages(prev => {
              const last = [...prev];
              const msg = last[last.length - 1];
              if (msg && msg.role === 'agent') msg.status = success ? 'done' : 'failed';
              return last;
            });
            if (success) {
              addStep("Successfully updated store cover banner");
            }
          });
        }
        break;
      case 'change_hero_bg':
        if (params.gradient) { setHeroBg(params.gradient); setHeroImage(null); addStep("Updating hero background"); }
        if (params.heroImagePrompt || params.imageUrl) {
          const uniqueSalt = Math.floor(Math.random() * 1000000);
          const finalUrl = params.imageUrl || "";
          setHeroImage(finalUrl);
          addStep("Generating cinematic hero photography");
        }
        break;
      case 'navigate':
        if (params.page) { setActiveNav(params.page); }
        break;
      case 'change_philosophy_image':
        if (params.philosophyTitle) {
          const stepId = addStep(`Regenerating image for philosophy: ${params.philosophyTitle}`, true);
          const uniqueSalt = Math.floor(Math.random() * 1000000);
          const promptStr = sanitizePrompt(params.imagePrompt || params.philosophyTitle);
          let finalImageUrl = params.imageUrl || "";
          preloadImage(finalImageUrl, stepId, 0, (success) => {
            setMessages(prev => {
              const last = [...prev];
              const msg = last[last.length - 1];
              if (msg && msg.role === 'agent') msg.status = success ? 'done' : 'failed';
              return last;
            });
            if (success) {
              setStoreSchema(prev => {
                if (!prev.layout) return prev;
                return {
                  ...prev,
                  layout: prev.layout.map(s => {
                    if (s.type === "philosophy") {
                      return {
                        ...s,
                        props: {
                          ...s.props,
                          items: (s.props?.items || []).map(ph => {
                            const currentTitle = String(ph.label || ph.title || "").trim().toLowerCase();
                            const targetTitle = String(params.philosophyTitle).trim().toLowerCase();
                            
                            // Check exact/substring match
                            let isMatch = currentTitle === targetTitle || currentTitle.includes(targetTitle) || targetTitle.includes(currentTitle);
                            
                            // Fuzzy fallback: if words overlap
                            if (!isMatch) {
                              const currWords = currentTitle.split(/\s+/);
                              const targetWords = targetTitle.split(/\s+/);
                              const overlap = currWords.filter(w => targetWords.includes(w) && w.length > 3);
                              if (overlap.length > 0) isMatch = true;
                            }
                            
                            // Second fallback: If title has "safety" and target has "safety", match it
                            if (!isMatch && currentTitle.includes("safety") && targetTitle.includes("safety")) {
                                isMatch = true;
                            }

                            if (isMatch) {
                              return { ...ph, imageUrl: finalImageUrl, verifiedUrl: finalImageUrl, stepId: null };
                            }
                            return ph;
                          })
                        }
                      };
                    }
                    return s;
                  })
                };
              });
              addStep(`Successfully updated philosophy image`);
            }
          });
        }
        break;
      case 'update_philosophy':
        if (params.items && Array.isArray(params.items)) {
          setStoreSchema(prev => {
            if (!prev.layout) return prev;
            return {
              ...prev,
              layout: prev.layout.map(s => {
                if (s.type === "philosophy") {
                  return {
                    ...s,
                    props: {
                      ...s.props,
                      items: params.items.map((item, idx) => ({
                        ...item,
                        imgPrompt: item.imagePrompt || item.imgPrompt || item.label
                      }))
                    }
                  };
                }
                return s;
              })
            };
          });
          addStep("Updating brand philosophy banner");
        }
        break;
      case 'show_plan':
        addStep("Proposed plan ready for review");
        setDraftSchema(params);
        break;
      case 'batch_create':
        const productsList = params.products || params.inventory || params.items || params.data?.products;
        const storeBrandName = params.store_name || params.title;
        if (storeBrandName) {
          setStoreData({
            title: params.hero_headline || params.title || storeBrandName,
            subtitle: params.hero_description || params.subtitle || "Quality products for you.",
            collection: params.collection || "New Collection",
            buttonText: params.cta_primary || params.buttonText || "Shop Now",
            promoBanner: params.promoBanner || "",
            heroVariant: params.heroVariant || "centered",
            storeVideo: "",
            storeVideos: [],
            promoVideo: "",
            promoVideos: []
          });
          setStoreSchema(prev => ({ ...prev, metadata: { ...prev.metadata, brand_identity: storeBrandName } }));
        }
        if (params.themeColor) setThemeColor(params.themeColor);
        if (params.heroBg) setHeroBg(params.heroBg);
        const usedUrls = new Set();
        const heroPrompt = params.heroImagePrompt || (params.title ? `${params.title} luxury lifestyle photography, cinematic lighting` : null);
        if (heroPrompt) {
          addStep("Generating cinematic hero photography");
          // setHeroImage(""); // Do not wipe out the generated image if called at the end of creation
        }
        else if (params.heroImage) {
          setHeroImage(params.heroImage);
        } // else {
        // setHeroImage(null); // Preserve existing image
        // }
        if (params.layout && Array.isArray(params.layout)) {
          setLayoutOrder(params.layout.filter(s => ["header", "hero", "featured_products", "philosophy", "testimonials", "faq", "newsletter", "promo_ticker", "footer"].includes(s)));
          addStep("Planning store layout architecture");
        }
        if (params.heroStyles) setHeroStyles(prev => ({ ...prev, ...params.heroStyles }));
        if (params.footer) setFooterData(prev => ({ ...prev, ...params.footer }));
        if (params.testimonials) setTestimonials(params.testimonials);
        if (params.faq) setFaq(params.faq);
        let itemsToLoadProducts = [];
        if (productsList && Array.isArray(productsList)) {
          const newProductsWithSteps = productsList.map((p, idx) => {
            const existingSec = storeSchema.layout?.find(s => s.type === "featured_products");
            const existingProduct = existingSec?.props?.products?.find((ep, eIdx) => {
              if (p.productInstanceId && ep.productInstanceId) {
                return ep.productInstanceId === p.productInstanceId;
              }
              return ep.name === p.name || eIdx === idx;
            });
            let finalImageUrl = p.verifiedUrl || existingProduct?.verifiedUrl || existingProduct?.imageUrl || "";
            if (p.imageIndex !== undefined && lastUploadedImages.current[p.imageIndex]) {
              finalImageUrl = lastUploadedImages.current[p.imageIndex];
            }
            const stepId = (!p.verifiedUrl && !existingProduct?.verifiedUrl && !finalImageUrl.startsWith("data:"))
              ? (existingProduct?.stepId || addStep(`Generating image for: ${p.name}`, true))
              : null;
            return {
              ...p,
              productInstanceId: p.productInstanceId || existingProduct?.productInstanceId || `prod_inst_${Math.random().toString(36).substr(2, 9)}`,
              imageUrl: p.verifiedUrl || finalImageUrl,
              pendingUrl: finalImageUrl,
              icon: p.icon || "📦",
              stepId
            };
          });
          setProducts(newProductsWithSteps);
          itemsToLoadProducts = newProductsWithSteps.filter(p => p.stepId);
        }
        let itemsToLoadPhilo = [];
        if (params.philosophy && Array.isArray(params.philosophy)) {
          const newPhiloWithSteps = params.philosophy.map((item, idx) => {
            const existingPhiloSec = storeSchema.layout?.find(s => s.type === "philosophy");
            const existingItem = existingPhiloSec?.props?.items?.find((ei, eIdx) => {
              if (item.philoInstanceId && ei.philoInstanceId) {
                return ei.philoInstanceId === item.philoInstanceId;
              }
              return ei.label === item.label || eIdx === idx;
            });
            let finalImageUrl = item.verifiedUrl || existingItem?.verifiedUrl || existingItem?.imageUrl || "";
            const stepId = (!item.verifiedUrl && !existingItem?.verifiedUrl)
              ? (existingItem?.stepId || addStep(`Generating brand philosophy: ${item.label}`, true))
              : null;
            return {
              ...item,
              philoInstanceId: item.philoInstanceId || existingItem?.philoInstanceId || `philo_inst_${Math.random().toString(36).substr(2, 9)}`,
              imageUrl: item.verifiedUrl || finalImageUrl,
              pendingUrl: finalImageUrl,
              stepId
            };
          });
          setPhilosophy(newPhiloWithSteps);
          itemsToLoadPhilo = newPhiloWithSteps.filter(ph => ph.stepId);
        }
        const totalItemsToLoad = [...itemsToLoadProducts, ...itemsToLoadPhilo];
        if (totalItemsToLoad.length === 0) {
          setMessages(prev => {
            const last = [...prev];
            if (last[last.length - 1]?.role === 'agent') last[last.length - 1].status = 'done';
            return last;
          });
        } else {
          // Parallel Loading Implementation (Instant Live Visual Building)
          let failedAny = false;
          itemsToLoadProducts.forEach(p => {
            preloadImage(p.pendingUrl, p.stepId, 0, (success) => {
              if (!success) failedAny = true;
            });
          });
          itemsToLoadPhilo.forEach(ph => {
            preloadImage(ph.pendingUrl, ph.stepId, 0, (success) => {
              if (!success) failedAny = true;
            });
          });
          setMessages(prev => {
            const last = [...prev];
            const msg = last[last.length - 1];
            if (msg && msg.role === 'agent') {
              msg.status = 'done';
            }
            return last;
          });
        }
        addStep("Building complete store experience");
        // Auto-register into userStores immediately using batch_create params
        if (setUserStores && storeBrandName) {
          const storeId = `agent_store_${Math.random().toString(36).substr(2, 9)}`;
          const storeObj = {
            id: storeId,
            name: storeBrandName,
            category: params.category || params.metadata?.category || 'General',
            logo: '',
            cover: params.heroImage || '',
            trustScore: '99.9%',
            followers: '1.2K',
            desc: params.hero_description || params.subtitle || params.metadata?.objective || 'AI-generated store',
            isUserStore: true,
            customSchema: { ...storeSchema, metadata: { ...(storeSchema?.metadata || {}), brand_identity: storeBrandName }, id: storeId },
            createdAt: new Date().toISOString()
          };
          setUserStores(prev => {
            const existing = prev.findIndex(s => s.name === storeBrandName && s.isUserStore);
            if (existing >= 0) {
              const next = [...prev];
              next[existing] = { ...next[existing], ...storeObj, id: next[existing].id };
              return next;
            }
            return [...prev, storeObj];
          });
          // Also update storeSchema with this id so future syncs match
          setStoreSchema(prev => prev.id ? prev : { ...prev, id: storeId });
        }
        break;
      case 'proactive_suggestion':
        // Now handled via chat messages
        break;
      case 'sync_channels':
        if (params.channels) {
          setChannelsState(prev => prev.map(ch =>
            params.channels.includes(ch.id) ? { ...ch, status: params.status || "Syncing" } : ch
          ));
          addStep(`Syncing products to: ${params.channels.join(", ")}`);
          // Simulate sync completion
          setTimeout(() => {
            setChannelsState(prev => prev.map(ch =>
              params.channels.includes(ch.id) ? { ...ch, status: "Connected" } : ch
            ));
            addStep("Multi-channel sync complete");
          }, 4000);
        }
        break;
      default:
        break;
    }
  }

  return { applyAction };
};
