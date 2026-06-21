import re

with open("src/engine/SectionRegistry.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Modify SectionRegistry.jsx to add Load More state in featured_products -> grid
find_grid = """      grid: (props) => {
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;"""

replace_grid = """      grid: (props) => {
        const t = props.isDarkMode ? storeThemeDark : storeThemeLight;
        const [visibleCount, setVisibleCount] = React.useState(12);
        
        const allProducts = (props.products && props.products.length > 0) ? props.products : (props.isBuilding ? Array(4).fill({ name: "Generating Product...", price: "...", desc: "Curating product details and imagery..." }) : []);
        const displayProducts = allProducts.slice(0, visibleCount);
"""

content = content.replace(find_grid, replace_grid)

find_map = """              {((props.products && props.products.length > 0) ? props.products : (props.isBuilding ? Array(4).fill({ name: "Generating Product...", price: "...", desc: "Curating product details and imagery..." }) : [])).map((p, i) => ("""

replace_map = """              {displayProducts.map((p, i) => ("""

content = content.replace(find_map, replace_map)

# Add the Load More button at the bottom of the grid
find_button_insert = """            </div>
          </div>
        );
      },"""

replace_button_insert = """            </div>
            {visibleCount < allProducts.length && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${props.isDarkMode ? "#c8b89a" : "#8b7355"}`,
                    color: props.isDarkMode ? "#c8b89a" : "#8b7355",
                    padding: "10px 24px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = props.isDarkMode ? "#c8b89a" : "#8b7355"; e.currentTarget.style.color = props.isDarkMode ? "#000" : "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = props.isDarkMode ? "#c8b89a" : "#8b7355"; }}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        );
      },"""

# Note: there might be multiple occurrences of `</div>\n          </div>\n        );\n      },`, so we only replace it within the grid variant.
# It's better to use regex to specifically target the end of the grid variant.

grid_regex = re.compile(r"""(              \{displayProducts\.map\(\(p, i\) => \(.*?</p>.*?</div>.*?</div>.*?</div>\s*\)\)\}\s*</div>)(.*?</div>\s*\);\s*},\s*"editorial-grid":)""", re.DOTALL)

def replacer(match):
    return match.group(1) + """
            {visibleCount < allProducts.length && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${props.isDarkMode ? "#c8b89a" : "#8b7355"}`,
                    color: props.isDarkMode ? "#c8b89a" : "#8b7355",
                    padding: "10px 24px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = props.isDarkMode ? "#c8b89a" : "#8b7355"; e.currentTarget.style.color = props.isDarkMode ? "#000" : "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = props.isDarkMode ? "#c8b89a" : "#8b7355"; }}
                >
                  Load More
                </button>
              </div>
            )}""" + match.group(2)

content = grid_regex.sub(replacer, content)

with open("src/engine/SectionRegistry.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("SectionRegistry updated")
