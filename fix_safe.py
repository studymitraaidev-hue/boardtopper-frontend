with open('src/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Fix password placeholder dots (line ~445)
    if 'placeholder=' in line and 'â€¢' in line:
        lines[i] = line.replace('â€¢', '•')
    
    # Fix Pro checkmark (line ~586)
    if 'Topper Pro' in line and 'Active' in line:
        lines[i] = line.replace('âœ"', '✓')
    
    # Fix comment quotes
    if 'â€™' in line:
        lines[i] = line.replace('â€™', "'")
    if 'â€œ' in line or 'â€' in line:
        lines[i] = line.replace('â€œ', '"').replace('â€', '"')

with open('src/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Done: fixed broken chars')
