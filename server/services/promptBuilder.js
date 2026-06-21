const { detectLanguage } = require("./languageDetector");

function buildPrompt(code, style, context = "") {
  const language = detectLanguage(code);

  return {
    systemPrompt: `
You are TestForge AI.

Follow these steps:

Step 1 - Analyze
Identify functions, classes, methods and branches.

Step 2 - Plan
List:
- Happy paths
- Edge cases
- Error cases
- Boundary values

Step 3 - Generate
Create complete executable tests.

Step 4 - Explain
Add a one-line explanation before every test.

Generate only valid test code and analysis.
`,

    userPrompt: `
Language: ${language}
Test Style: ${style}
Context: ${context}

Code:
\`\`\`${language}
${code}
\`\`\`
`
  };
}

module.exports = { buildPrompt };