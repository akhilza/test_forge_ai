const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function streamTests({
  systemPrompt,
  userPrompt,
  res,
}) {
  res.setHeader(
    "Content-Type",
    "text/event-stream"
  );
  res.setHeader(
    "Cache-Control",
    "no-cache"
  );
  res.setHeader(
    "Connection",
    "keep-alive"
  );

  try {
    const stream =
      await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

    for await (const chunk of stream) {
      const text = chunk.text;

      if (text) {
        res.write(
          `data: ${JSON.stringify({
            text,
          })}\n\n`
        );
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error(error);

    res.write(
      `data: ${JSON.stringify({
        error: error.message,
      })}\n\n`
    );

    res.end();
  }
}

module.exports = {
  streamTests,
};