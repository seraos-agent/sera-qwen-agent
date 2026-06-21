import re

with open("src/features/buyer/components/BuyerGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

hook_injection = """  const {
    t, isDarkMode,
    userStores, buyerSearchQuery, selectedCategoryFilter, setSelectedCategoryFilter,
    followedStores, filteredStores, toggleFollowStore,
    setSelectedStorefront, setSelectedProductDetail, setModalQty,
    getDisplayBrandName
  } = useBuyerContext();

  const [visibleCount, setVisibleCount] = React.useState(12);
  const loaderRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 12);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, []);
"""

content = content.replace(
    """  const {
    t, isDarkMode,
    userStores, buyerSearchQuery, selectedCategoryFilter, setSelectedCategoryFilter,
    followedStores, filteredStores, toggleFollowStore,
    setSelectedStorefront, setSelectedProductDetail, setModalQty,
    getDisplayBrandName
  } = useBuyerContext();""", hook_injection)

# Now find the mapping for Trending Products
find_map_start = """          {Array.from(new Map([...CURATED_STORES, ...(userStores || [])].map(s => [s.id || s._id || s.store_id, s])).values())"""

replace_map_start = """          {(() => {
            const allProducts = Array.from(new Map([...CURATED_STORES, ...(userStores || [])].map(s => [s.id || s._id || s.store_id, s])).values())
              .flatMap(s =>
                (s.storeData?.products || s.products || (s.customSchema || s.schema)?.layout?.find(l => l.type === 'featured_products')?.props?.products || [])
                  .filter(p => p.name && p.price && !p.name.toLowerCase().includes('generating') && !p.name.includes('...'))
                  .map(p => ({
                    id: p.name || p.id,
                    name: p.name, price: p.price,
                    desc: p.description || p.desc,
                    image: p.imageUrl || p.image,
                    verticalVideoUrl: p.verticalVideoUrl,
                    landscapeVideoUrl: p.landscapeVideoUrl,
                    storeId: s.id || s.store_id || s._id,
                    store: (s.customSchema || s.schema)?.metadata?.brand_identity || s.storeData?.title || s.name || 'AI Store',
                    aiTag: p.promo || 'Trending',
                    rating: 4.8,
                    sales: 340 + (((p.id || p.name || 'A').charCodeAt(0) * 43) % 500)
                  }))
              )
              .filter(p => selectedCategoryFilter === 'all' || [...CURATED_STORES, ...(userStores || [])].find(s => s.id === p.storeId)?.category === selectedCategoryFilter)
              .filter(p => !buyerSearchQuery || p.name.toLowerCase().includes(buyerSearchQuery.toLowerCase()) || p.store.toLowerCase().includes(buyerSearchQuery.toLowerCase()) || p.aiTag.toLowerCase().includes(buyerSearchQuery.toLowerCase()));
            
            return (
              <>
                {allProducts.slice(0, visibleCount).map(prod => ("""

# Replace the beginning of the chain
# Wait, this is safer using regex or precise substring matching
# Let's read the exact block from the file
regex_map = re.compile(r"(\{Array\.from\(new Map\(\[\.\.\.CURATED_STORES.*?\.map\(prod => \()", re.DOTALL)

# Let's just use exact replace since we know the structure.
# But `Array.from` is a long chain.
# Let's extract the whole chain.

chain_find = """          {Array.from(new Map([...CURATED_STORES, ...(userStores || [])].map(s => [s.id || s._id || s.store_id, s])).values())
            .flatMap(s =>
              (s.storeData?.products || s.products || (s.customSchema || s.schema)?.layout?.find(l => l.type === 'featured_products')?.props?.products || [])
                .filter(p => p.name && p.price && !p.name.toLowerCase().includes('generating') && !p.name.includes('...'))
                .map(p => ({
                  id: p.name || p.id,
                  name: p.name, price: p.price,
                  desc: p.description || p.desc,
                  image: p.imageUrl || p.image,
                  verticalVideoUrl: p.verticalVideoUrl,
                  landscapeVideoUrl: p.landscapeVideoUrl,
                  storeId: s.id || s.store_id || s._id,
                  store: (s.customSchema || s.schema)?.metadata?.brand_identity || s.storeData?.title || s.name || 'AI Store',
                  aiTag: p.promo || 'Trending',
                  rating: 4.8,
                  sales: 340 + (((p.id || p.name || 'A').charCodeAt(0) * 43) % 500)
                }))
            )
            .filter(p => selectedCategoryFilter === 'all' || [...CURATED_STORES, ...(userStores || [])].find(s => s.id === p.storeId)?.category === selectedCategoryFilter)
            .filter(p => !buyerSearchQuery || p.name.toLowerCase().includes(buyerSearchQuery.toLowerCase()) || p.store.toLowerCase().includes(buyerSearchQuery.toLowerCase()) || p.aiTag.toLowerCase().includes(buyerSearchQuery.toLowerCase()))
            .map(prod => ("""

chain_replace = """          {(() => {
            const allProducts = Array.from(new Map([...CURATED_STORES, ...(userStores || [])].map(s => [s.id || s._id || s.store_id, s])).values())
              .flatMap(s =>
                (s.storeData?.products || s.products || (s.customSchema || s.schema)?.layout?.find(l => l.type === 'featured_products')?.props?.products || [])
                  .filter(p => p.name && p.price && !p.name.toLowerCase().includes('generating') && !p.name.includes('...'))
                  .map(p => ({
                    id: p.name || p.id,
                    name: p.name, price: p.price,
                    desc: p.description || p.desc,
                    image: p.imageUrl || p.image,
                    verticalVideoUrl: p.verticalVideoUrl,
                    landscapeVideoUrl: p.landscapeVideoUrl,
                    storeId: s.id || s.store_id || s._id,
                    store: (s.customSchema || s.schema)?.metadata?.brand_identity || s.storeData?.title || s.name || 'AI Store',
                    aiTag: p.promo || 'Trending',
                    rating: 4.8,
                    sales: 340 + (((p.id || p.name || 'A').charCodeAt(0) * 43) % 500)
                  }))
              )
              .filter(p => selectedCategoryFilter === 'all' || [...CURATED_STORES, ...(userStores || [])].find(s => s.id === p.storeId)?.category === selectedCategoryFilter)
              .filter(p => !buyerSearchQuery || p.name.toLowerCase().includes(buyerSearchQuery.toLowerCase()) || p.store.toLowerCase().includes(buyerSearchQuery.toLowerCase()) || p.aiTag.toLowerCase().includes(buyerSearchQuery.toLowerCase()));
              
            return (
              <>
                {allProducts.slice(0, visibleCount).map(prod => ("""

content = content.replace(chain_find, chain_replace)

# Now close the IIFE and add the IntersectionObserver trigger at the bottom
end_find = """              </div>
            ))}
        </div>
      </div>
    </div>"""

end_replace = """              </div>
            ))}
                <div ref={loaderRef} style={{ width: '100%', height: 20, padding: 10, display: "flex", justifyContent: "center" }}>
                  {visibleCount < allProducts.length && <span style={{ color: t.subtext, fontSize: 12 }}>Loading more items...</span>}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>"""

content = content.replace(end_find, end_replace)

with open("src/features/buyer/components/BuyerGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("BuyerGrid updated")
