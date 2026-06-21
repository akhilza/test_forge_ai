import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTestGeneration } from './hooks/useTestGeneration';
import './App.css';
import testLogo from './assets/test_forge_logo.png';

const STEP_LABELS = ['Analyze', 'Plan', 'Generate', 'Explain'];

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [style, setStyle] = useState('unit');
  const [context, setContext] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const { steps, testOutput, coverage, isLoading, activeStep, generate } = useTestGeneration();

  const handleGenerate = async () => {
    if (!code.trim()) return;
    setStatus('loading');
    setErrorMessage('');
    try {
      await generate({ code, language, style, context });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err?.message || 'Generation failed. Check server connection.');
    }
  };

  const copyOutput = async () => {
    if (!testOutput) return;
    try {
      await navigator.clipboard.writeText(testOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadOutput = () => {
    if (!testOutput) return;
    const extMap = { python: 'py', typescript: 'ts', java: 'java', go: 'go', rust: 'rs' };
    const ext = extMap[language] ?? 'js';
    const blob = new Blob([testOutput], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tests.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="app">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="brand">
          <div className="logo"> <img src={testLogo} style={{height:"130px"}} alt="Logo" /></div>
          <span className="title"><b>TEST.FORGE</b> AI</span>
          <span className="badge"></span>
        </div>
        <span className="powered"></span>
      </nav>

      {/* ── Two-column main ── */}
      <div className="main">
        {/* Left: code input */}
        <div className="left">
          <div className="panel-header" style={{marginTop: "5px"}}><span>CODE INPUT</span></div>
          <div className="controls">
            <select value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="auto">Auto-detect</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
            <select value={style} onChange={e => setStyle(e.target.value)}>
              <option value="unit">Unit tests</option>
              <option value="integration">Integration</option>
              <option value="e2e">End-to-end</option>
            </select>
            <input
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Context e.g. auth module, edge cases"
              className="context-input"
            />
            <button onClick={handleGenerate} disabled={isLoading} className="gen-btn">
              {isLoading ? '⏳ Generating…' : '✨ Generate tests'}
            </button>
          </div>
          <div className="editor-wrap">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language === 'auto' ? 'javascript' : language}
              theme="vs-dark"
              value={code}
              onChange={val => setCode(val || '')}
              options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on' }}
            />
          </div>
        </div>
        <div className="right">
            <div className="output-panel">
        <div className="output-header">
          <span>Generated tests</span>
          <div className="output-actions">
            <button
              onClick={copyOutput}
              disabled={!testOutput}
              className={`icon-btn ${copied ? 'copied' : ''}`}
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            <button onClick={downloadOutput} disabled={!testOutput} className="icon-btn-download">
              ↓ Download
            </button>
          </div>
        </div>

        {/* Status banner */}
        {status === 'success' && !isLoading && (
          <div className="status-banner success">
            ✅ Tests generated successfully! Review the output below.
          </div>
        )}
        {status === 'error' && !isLoading && (
          <div className="status-banner error">
            ❌ {errorMessage}
          </div>
        )}

        {/* Output editor */}
        {testOutput ? (
          <Editor
            height="650px"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={testOutput}
            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, lineNumbers: 'on' }}
          />
        ) : (
          <div className="output-placeholder">
            {isLoading ? '⏳ Generating test code, please wait…' : 'Generated test code will appear here…'}
          </div>
        )}

        {/* Coverage bar */}
        {coverage && (
          <div className="coverage">
            <span>Estimated coverage</span>
            <div className="track"><div className="fill" style={{ width: coverage + '%' }} /></div>
            <span className="pct">{Math.round(coverage)}%</span>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* ── Output panel ── */}
     
    </div>
  );
}

export default App;