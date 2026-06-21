function detectLanguage(code) {
  if (!code || typeof code !== "string") {
    return "text";
  }

  const patterns = [
    {
      language: "python",
      regex: /(def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import|print\s*\()/,
    },
    {
      language: "javascript",
      regex: /(const\s+|let\s+|var\s+|function\s+\w+\s*\(|=>)/,
    },
    {
      language: "typescript",
      regex: /(interface\s+\w+|type\s+\w+\s*=|:\s*string|:\s*number)/,
    },
    {
      language: "java",
      regex: /(public\s+class|public\s+static\s+void\s+main|System\.out)/,
    },
    {
      language: "go",
      regex: /(package\s+main|func\s+\w+\s*\(|fmt\.)/,
    },
    {
      language: "rust",
      regex: /(fn\s+\w+\s*\(|println!|let\s+mut)/,
    },
    {
      language: "csharp",
      regex: /(using\s+System|namespace\s+\w+|Console\.WriteLine)/,
    },
    {
      language: "cpp",
      regex: /(#include\s*<|std::|cout\s*<<|int\s+main)/,
    },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(code)) {
      return pattern.language;
    }
  }

  return "javascript";
}

module.exports = { detectLanguage };