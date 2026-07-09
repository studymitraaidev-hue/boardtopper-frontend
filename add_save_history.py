with open('src/pages/DoubtSolver.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

insert_after = None
for i, line in enumerate(lines):
    if "setMessages((prev) => [...prev, { id: generateId(), role: 'ai', text: result.text" in line:
        insert_after = i
        break

if insert_after is not None:
    save_code = [
        '',
        '        // Save to chat history',
        '        await supabase.from(\'ai_chat_history\').insert({',
        '          question: questionText,',
        '          answer: result.text,',
        '          subject: subjectToSend,',
        '        });',
        '',
    ]
    for j, new_line in enumerate(save_code):
        lines.insert(insert_after + 1 + j, new_line + '\n')

    with open('src/pages/DoubtSolver.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f'Added save history after line {insert_after + 1}')
else:
    print('Could not find insertion point')
