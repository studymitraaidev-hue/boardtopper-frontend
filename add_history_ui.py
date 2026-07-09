with open('src/pages/DoubtSolver.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

insert_after = None
for i, line in enumerate(lines):
    if 'showWelcome && messages.length === 0' in line:
        insert_after = i - 1
        break

if insert_after is not None:
    history_ui = [
        '',
        '      {/* Recent Questions History */}',
        '      {chatHistory.length > 0 && (',
        '        <div className="mb-4 animate-fade-in">',
        '          <details className="group">',
        '            <summary className="flex items-center justify-between p-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm cursor-pointer list-none">',
        '              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">',
        '                <History className="w-4 h-4 text-indigo-500" />',
        '                Recent Questions ({chatHistory.length})',
        '              </span>',
        '              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90" />',
        '            </summary>',
        '            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">',
        '              {chatHistory.map((h, i) => (',
        '                <button',
        '                  key={i}',
        '                  onClick={() => { setQuery(h.question); setSelectedSubject(h.subject || \'general\'); }}',
        '                  className="w-full text-left p-3 rounded-lg bg-white/60 hover:bg-indigo-50 border border-slate-100 transition-colors"',
        '                >',
        '                  <p className="text-xs font-medium text-indigo-600 mb-1">{h.subject || \'General\'}</p>',
        '                  <p className="text-sm text-slate-700 line-clamp-2">{h.question}</p>',
        '                </button>',
        '              ))}',
        '            </div>',
        '          </details>',
        '        </div>',
        '      )}',
        '',
    ]
    for j, new_line in enumerate(history_ui):
        lines.insert(insert_after + 1 + j, new_line + '\n')

    with open('src/pages/DoubtSolver.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f'Added history UI before line {insert_after + 1}')
else:
    print('Could not find insertion point')
