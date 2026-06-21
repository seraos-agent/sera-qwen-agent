import re

with open("src/features/buyer/BuyerApp.jsx", "r", encoding="utf-8") as f:
    app_content = f.read()

# 1. Add import statement
import_buyer_cart = "import { BuyerCart } from './components/BuyerCart';"
import_buyer_profile = "import { BuyerProfile } from './components/BuyerProfile';"

if "import { BuyerProfile }" not in app_content:
    app_content = app_content.replace(import_buyer_cart, import_buyer_cart + "\n" + import_buyer_profile)

# 2. Replace the old profile div with <BuyerProfile />
old_profile_div = """          <div style={{ display: buyerActiveNav === 'profile' ? 'block' : 'none', padding: '60px 48px', color: t.text }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Buyer Profile</h2>
            <p style={{ color: t.subtext }}>Manage your shipping addresses and payment methods here.</p>
          </div>"""

new_profile_div = """          <div style={{ display: buyerActiveNav === 'profile' ? 'block' : 'none' }}>
            <BuyerProfile />
          </div>"""

app_content = app_content.replace(old_profile_div, new_profile_div)

with open("src/features/buyer/BuyerApp.jsx", "w", encoding="utf-8") as f:
    f.write(app_content)

print("BuyerApp updated with BuyerProfile")
