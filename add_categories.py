import re

with open("src/features/seller/components/panels/ProductsTab.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state and handlers
hook_injection = """  const [activeCategory, setActiveCategory] = React.useState("All");
  
  const categories = React.useMemo(() => {
    const defaultCats = ["All"];
    const schemaCats = storeSchema?.categories || [];
    const prodCats = products.map(p => p.category).filter(Boolean);
    return [...new Set([...defaultCats, ...schemaCats, ...prodCats])];
  }, [storeSchema, products]);

  const handleAddCategory = () => {
    const newCat = window.prompt("Enter new category name:");
    if (newCat && newCat.trim()) {
      const name = newCat.trim();
      setStoreSchema(prev => ({ ...prev, categories: [...(prev.categories || []), name] }));
      setActiveCategory(name);
    }
  };

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);
"""

content = content.replace(
    "  const {\n", 
    hook_injection + "\n  const {\n"
)

# 2. Add Category Navigation Tabs above table-container
tabs_injection = """
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                border: activeCategory === cat ? `1px solid ${isDarkMode ? "#c8b89a" : "#8b7355"}` : `1px solid ${t.border}`,
                background: activeCategory === cat ? (isDarkMode ? "rgba(200, 184, 154, 0.1)" : "#fdfbf7") : "transparent",
                color: activeCategory === cat ? (isDarkMode ? "#c8b89a" : "#8b7355") : t.subtext,
                transition: "all 0.2s"
              }}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={handleAddCategory}
            style={{
              padding: "8px 16px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              border: `1px dashed ${t.border}`,
              background: "transparent",
              color: t.subtext,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.color = t.text}
            onMouseLeave={e => e.currentTarget.style.color = t.subtext}
          >
            + Add Category
          </button>
        </div>
"""

content = content.replace(
    """        <div className="table-container\"""", 
    tabs_injection + """        <div className="table-container\""""
)

# 3. Change `products.map` to `filteredProducts.map`
# First replace the length check
content = content.replace("products.length === 0 ?", "filteredProducts.length === 0 ?")
content = content.replace("products.map((p, i)", "filteredProducts.map((p, i)")

# 4. Add Category Badge and Dropdown
# Inside the product card, under the description or next to the status.
# The user wants a dropdown to select the category.
# I'll put it in the inv-status area or inv-meta.
dropdown_injection = """
                      <div className="inv-category" style={{ flex: "1 1 0" }}>
                        <select
                          value={p.category || "All"}
                          onChange={(e) => {
                            const newCat = e.target.value === "All" ? "" : e.target.value;
                            setProducts(prev => prev.map(prod => prod.name === p.name ? { ...prod, category: newCat } : prod));
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: `1px solid ${t.border}`,
                            background: isDarkMode ? "#1e1e22" : "#f9fafb",
                            color: t.text,
                            fontSize: 11,
                            outline: "none",
                            cursor: "pointer",
                            width: "100%",
                            maxWidth: 120
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
"""
# Replace Status div with Category + Status
status_find = """                      <div className="inv-status" style={{ flex: "1 1 0" }}>
                        <span style={{ padding: "6px 12px", background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)", color: "#4ade80", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Active</span>
                      </div>"""

status_replace = dropdown_injection + """                      <div className="inv-status" style={{ flex: "1 1 0" }}>
                        <span style={{ padding: "6px 12px", background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)", color: "#4ade80", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Active</span>
                      </div>"""

content = content.replace(status_find, status_replace)

# Also update the Header Row to have Category column
header_find = """              <div style={{ flex: "1 1 0" }}>Stock</div>
              <div style={{ flex: "1 1 0" }}>Status</div>"""

header_replace = """              <div style={{ flex: "1 1 0" }}>Stock</div>
              <div style={{ flex: "1 1 0" }}>Category</div>
              <div style={{ flex: "1 1 0" }}>Status</div>"""

content = content.replace(header_find, header_replace)


with open("src/features/seller/components/panels/ProductsTab.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Refactoring complete.")
