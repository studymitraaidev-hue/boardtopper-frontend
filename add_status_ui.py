with open('src/pages/DoubtSolver.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the input/ask button area to add status before it
insert_after = None
for i, line in enumerate(lines):
    if 'Ask' in line and 'button' in line.lower() and 'disabled' in line:
        insert_after = i
        break

if insert_after is not None:
    status_ui = [
        '',
        '          {saveStatus && (',
        '            <div className="text-xs text-center py-1 ' + 
        '              ' + ('text-green-600' if 'Saved' in '{saveStatus}' else 'text-red-500') + '">',
        '              {saveStatus}',
        '            </div>',
        '          )}',
    ]
    # Actually let's just add a simple div that shows the status
    status_code = [
        '',
        '      {saveStatus && (',
        '        <div className={`text-xs text-center py-1 ${saveStatus === "Saved!" ? "text-green-600" : "text-red-500"}`}>',
        '          {saveStatus}',
        '        </div>',
        '      )}',
        '',
    ]
    for j, new_line in enumerate(status_code):
        lines.insert(insert_after + 1 + j, new_line + '\n')

    with open('src/pages/DoubtSolver.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f'Added saveStatus UI after line {insert_after + 1}')
else:
    print('Could not find insertion point')
