import re

FILE = 'src/pages/Dashboard.tsx'

with open(FILE, 'r') as f:
    content = f.read()

# 1. Add import
import_line = "import WhatsAppShare from '../components/WhatsAppShare';"
if import_line not in content:
    lines = content.split('\n')
    last_import_idx = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import_idx = i
    lines.insert(last_import_idx + 1, import_line)
    content = '\n'.join(lines)
    print("Added import")
else:
    print("Import exists")

# 2. Find Main Grid and insert before it
idx = content.find('Main Grid')
if idx > 0:
    # Find start of that line
    line_start = content.rfind('\n', 0, idx)
    insert_code = '\n\n          {/* -- WhatsApp Share Progress -- */}\n          <div className="mt-2">\n            <WhatsAppShare\n              userName={firstName}\n              streakCount={progress.streakCount || 0}\n              totalCompleted={progress.totalCompleted || 0}\n              mockScoreAvg={progress.mockScoreAvg}\n              weakTopics={dashboard.weakTopics || []}\n              targetPercent={user?.targetPercent || 90}\n              isPro={isPro}\n            />\n          </div>'
    content = content[:line_start] + insert_code + content[line_start:]
    print("Added WhatsAppShare")
else:
    print("ERROR: Main Grid not found")

with open(FILE, 'w') as f:
    f.write(content)

print("Done!")
