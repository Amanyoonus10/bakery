with open('public/processed_cakes.html') as f:
    cakes = f.read().strip()

with open('src/data/cake-cards-html.js', 'w') as out:
    out.write('export const cakeHtmlCards = ' + repr(cakes) + ';\n')

print('Created src/data/cake-cards-html.js cleanly!')
