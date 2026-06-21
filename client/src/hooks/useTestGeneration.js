import { useState, useRef } from 'react';

export function useTestGeneration() {
  const [steps, setSteps] = useState([]);
  const [testOutput, setTestOutput] = useState('');
  const [coverage, setCoverage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const fullTextRef = useRef('');

  const parseSteps = (text) => {
    const results = [];
    const stepRegex = /##\s+Step\s+(\d+):\s+(.+?)(?=\n##\s+Step\s+\d+:|\n```|$)/gs;
    let match;
    while ((match = stepRegex.exec(text)) !== null) {
      const lines = match[2].trim().split('\n');
      results.push({
        step: parseInt(match[1], 10),
        title: lines[0].trim(),
        content: lines.slice(1).join('\n').trim(),
      });
    }

    const codeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (codeMatch) setTestOutput(codeMatch[1].trim());

    const coverageMatch = text.match(/Coverage:\s*(\d+(?:\.\d+)?)%/i);
    if (coverageMatch) setCoverage(parseFloat(coverageMatch[1]));

    setSteps(results);
    if (results.length > 0) setActiveStep(results[results.length - 1].step);
  };

  const generate = async ({ code, language, style, context }) => {
    setIsLoading(true);
    setSteps([]);
    setTestOutput('');
    setCoverage(null);
    setActiveStep(1);
    fullTextRef.current = '';

    try {
      const res = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, style, context }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') { done = true; break; }
          try {
            const obj = JSON.parse(data);
            if (obj.text) { fullTextRef.current += obj.text; parseSteps(fullTextRef.current); }
          } catch (e) { console.error('SSE parse error:', e); }
        }
      }

      // flush remaining buffer
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim();
        if (data && data !== '[DONE]') {
          try {
            const obj = JSON.parse(data);
            if (obj.text) { fullTextRef.current += obj.text; parseSteps(fullTextRef.current); }
          } catch (e) { console.error('Final chunk parse error:', e); }
        }
      }
    } catch (err) {
      console.error('Generation failed:', err);
      throw err; // re-throw so App.js catch block can set error status
    } finally {
      setIsLoading(false);
    }
  };

  return { steps, testOutput, coverage, isLoading, activeStep, generate };
}