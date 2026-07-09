with open('src/pages/DoubtSolver.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

insert_after = None
for i, line in enumerate(lines):
    if '}, [query]);' in line:
        insert_after = i
        break

if insert_after is not None:
    new_effect = [
        '',
        '  // Fetch chat history on mount',
        '  useEffect(() => {',
        '    const fetchHistory = async () => {',
        '      const { data, error } = await supabase',
        '        .rpc(\'get_recent_chat_history\', { limit_count: 10 });',
        '      if (!error && data) {',
        '        setChatHistory(data.map((h: any) => ({',
        '          question: h.question,',
        '          answer: h.answer,',
        '          subject: h.subject,',
        '        })));',
        '      }',
        '    };',
        '    fetchHistory();',
        '  }, []);',
        '',
    ]
    for j, new_line in enumerate(new_effect):
        lines.insert(insert_after + 1 + j, new_line + '\n')

    with open('src/pages/DoubtSolver.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f'Added history useEffect after line {insert_after + 1}')
else:
    print('Could not find insertion point')
