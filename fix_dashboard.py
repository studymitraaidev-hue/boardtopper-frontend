#!/usr/bin/env python3
import re

FILE = 'src/pages/Dashboard.tsx'

with open(FILE, 'r') as f:
    content = f.read()

# 1. Add import after the last import line
import_line = "import WhatsAppShare from '../components/WhatsAppShare';"
if import_line not in content:
    lines = content.split('\n')
    last_import_idx = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import_idx = i
    lines.insert(last_import_idx + 1, import_line)
    content = '\n'.join(lines)
    print("Added WhatsAppShare import")
else:
    print("Import already exists")

# 2. Find Recommended Actions and insert before it
marker = '{/* Recommended Actions */}'
if marker in content:
    insert_code = '{/* WhatsApp Share Progress */}\n          <div className="mt-4">\n            <WhatsAppShare\n              userName={firstName}\n              streakCount={progress.streakCount || 0}\n              totalCompleted={progress.totalCompleted || 0}\n              mockScoreAvg={progress.mockScoreAvg}\n              weakTopics={dashboard.weakTopics || []}\n              targetPercent={user?.targetPercent || 90}\n              isPro={isPro}\n            />\n          </div>\n\n          {/* Recommended Actions */}'
    content = content.replace(marker, insert_code)
    print("Added WhatsAppShare before Recommended Actions")
else:
    print("ERROR: Could not find Recommended Actions section")

with open(FILE, 'w') as f:
    f.write(content)

print("Done!")
