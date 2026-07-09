with open('src/pages/DoubtSolver.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_state = "const [chatHistory, setChatHistory] = useState<Array<{question: string; answer: string; subject: string}>>([]);"
new_state = """const [chatHistory, setChatHistory] = useState<Array<{question: string; answer: string; subject: string}>>([]);
  const [saveStatus, setSaveStatus] = useState<string>('');"""

content = content.replace(old_state, new_state)

old_save = """        // Save to chat history
        const { error: saveError } = await supabase.from('ai_chat_history').insert({
          question: questionText,
          answer: result.text,
          subject: subject,
        });
        if (saveError) console.error('Save history error:', saveError);"""

new_save = """        // Save to chat history
        try {
          const { error: saveError } = await supabase.from('ai_chat_history').insert({
            question: questionText,
            answer: result.text,
            subject: subject,
          });
          if (saveError) {
            setSaveStatus('Save failed: ' + saveError.message);
          } else {
            setSaveStatus('Saved!');
            setChatHistory(prev => [{question: questionText, answer: result.text, subject: subject || 'general'}, ...prev].slice(0, 10));
          }
        } catch (e) {
          setSaveStatus('Save error');
        }"""

content = content.replace(old_save, new_save)

with open('src/pages/DoubtSolver.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added mobile-visible save status')
