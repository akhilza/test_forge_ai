const express = require("express");
const router = express.Router();

const { buildPrompt } = require("../services/promptBuilder");
const { streamTests } = require("../services/aiService");

router.post("/generate", async (req, res) => {
  try {
    const { code, style, context } = req.body;

    const { systemPrompt, userPrompt } =
      buildPrompt(code, style, context);

    await streamTests({
      systemPrompt,
      userPrompt,
      res
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;