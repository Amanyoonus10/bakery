import re

with open("apsara_styles.css") as f:
    css = f.read()

# Selectors we need from apsara_styles.css
selectors = [
    ".top-left-loader",
    ".loader-wrapper",
    "@keyframes loader-transform-animation",
    "@keyframes loader-opacity-animation",
    "@keyframes loader-letter-anim",
    ".hero-logo-wrap",
    ".hero-logo-img",
    ".hero-product-wrap",
    ".hero-product-img",
    ".hero-click-me-callout",
    ".uiverse-btn-container",
    ".uiverse-label",
    ".hero-scroll-btn-wrap",
    ".hero-welcome-btn",
    ".hero-pulse-dot",
    ".svgIcon-wrap",
    ".svgIcon",
    ".svgBestSymbol",
    "@keyframes heroFloatPulse",
    ".category-switcher-bar",
    ".category-tab-btn",
    ".gallery-container",
    ".gallery",
    ".cards",
    ".gallery .actions",
    ".drag-proxy",
    ".tap-hint",
    "@keyframes tap-pulse",
    ".product-modal-overlay",
    ".product-modal",
    ".social-circular-widget",
    ".main",
    ".up",
    ".down",
    ".card1",
    ".card2",
    ".card3",
    ".card4",
    ".instagram",
    ".facebook",
    ".whatsapp",
    ".youtube"
]

print("Checking selectors...")
for s in selectors:
    if s not in css:
        print("Missing:", s)

print("Writing clean src/apsara-coverflow.css")
