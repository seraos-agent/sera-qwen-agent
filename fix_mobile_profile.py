import re

with open("src/features/buyer/components/BuyerProfile.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add style block right after <div style={{ padding: '60px 48px', color: t.text, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
# Wait, padding might be too big for mobile too. 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 48px)' is better.

padding_find = "    <div style={{ padding: '60px 48px', color: t.text, maxWidth: 1200, margin: '0 auto', width: '100%' }}>"
padding_replace = """    <div style={{ padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 48px)', color: t.text, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }
        .bento-item-4 {
          grid-column: span 4;
        }
        .bento-item-8 {
          grid-column: span 8;
        }
        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .header-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 16px;
        }
        .bento-card-padding {
          padding: 32px;
        }
        @media (max-width: 900px) {
          .bento-item-4, .bento-item-8 {
            grid-column: span 12 !important;
          }
          .address-grid {
            grid-template-columns: 1fr;
          }
          .header-wrap {
            flex-direction: column;
            align-items: flex-start;
          }
          .bento-card-padding {
            padding: 20px;
          }
        }
      `}</style>"""
content = content.replace(padding_find, padding_replace)

# Replace the grid definitions with classes
content = content.replace("      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>", "      <div className=\"header-wrap\">")

content = content.replace("      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>", "      <div className=\"bento-grid\">")

# Fix cards inline styles. Need to extract gridColumn and add classes.
card1_find = "        <div style={{ ...cardStyle, gridColumn: 'span 4', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>"
card1_replace = "        <div className=\"bento-item-4 bento-card-padding\" style={{ ...cardStyle, padding: undefined, alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>"
content = content.replace(card1_find, card1_replace)

card2_find = "        <div style={{ ...cardStyle, gridColumn: 'span 8', justifyContent: 'space-between' }}>"
card2_replace = "        <div className=\"bento-item-8 bento-card-padding\" style={{ ...cardStyle, padding: undefined, justifyContent: 'space-between' }}>"
content = content.replace(card2_find, card2_replace)

address_grid_find = "            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>"
address_grid_replace = "            <div className=\"address-grid\">"
content = content.replace(address_grid_find, address_grid_replace)

card3_find = "        <div style={{ ...cardStyle, gridColumn: 'span 8' }}>"
card3_replace = "        <div className=\"bento-item-8 bento-card-padding\" style={{ ...cardStyle, padding: undefined }}>"
content = content.replace(card3_find, card3_replace)

card4_find = "        <div style={{ ...cardStyle, gridColumn: 'span 4' }}>"
card4_replace = "        <div className=\"bento-item-4 bento-card-padding\" style={{ ...cardStyle, padding: undefined }}>"
content = content.replace(card4_find, card4_replace)


with open("src/features/buyer/components/BuyerProfile.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("BuyerProfile UI fixed for mobile")
