with open('src/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The broken character bytes: c3 a2 e2 80 9c (mojibake for ✓)
# In the file it shows as: 20c3 a2c5 93c2 (with surrounding spaces)
# Let's replace the exact broken sequence with ✓
content = content.replace('âœ"', '✓')

# Fix all other mojibake patterns in comments
content = content.replace('â€™', "'")
content = content.replace('â€œ', '"')
content = content.replace('â€', '"')

with open('src/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed broken characters')
