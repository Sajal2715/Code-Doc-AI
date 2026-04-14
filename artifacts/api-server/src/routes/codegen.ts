import { Router } from "express";
import { db } from "@workspace/db";
import { codegenHistoryTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

function buildPrompt(code: string, language: string, mode: string): string {
  const langLabel = language === "cpp" ? "C++" : language.charAt(0).toUpperCase() + language.slice(1);

  switch (mode) {
    case "comments":
      return `You are an expert ${langLabel} programmer. Add clear, concise inline comments to the following ${langLabel} code. Explain what each significant block or line does. Return ONLY the commented code, no other text.

\`\`\`${language}
${code}
\`\`\``;

    case "docstrings":
      return `You are an expert ${langLabel} programmer. Add proper docstrings to all functions, classes, and methods in the following ${langLabel} code. Use the appropriate docstring format for ${langLabel} (e.g., Google style or NumPy style for Python, Javadoc for Java, Doxygen for C++). Return ONLY the code with docstrings added, no other text.

\`\`\`${language}
${code}
\`\`\``;

    case "readme":
      return `You are an expert technical writer and ${langLabel} developer. Create a comprehensive README.md for the following ${langLabel} code snippet. Include:
- A brief description of what the code does
- Key features or functionality
- Prerequisites / dependencies (if inferrable)
- How to use it with example usage
- A description of key functions/classes/methods
- Any important notes or caveats

Return ONLY the README in Markdown format.

\`\`\`${language}
${code}
\`\`\``;

    case "bugs":
      return `You are an expert ${langLabel} code reviewer and security analyst. Analyze the following ${langLabel} code for:
- Bugs and logical errors
- Potential null pointer / undefined behavior issues
- Off-by-one errors
- Memory leaks or resource mismanagement
- Security vulnerabilities
- Performance issues
- Edge cases that aren't handled

For each issue found, clearly state:
1. The issue type and severity (Critical/High/Medium/Low)
2. The line or function where it occurs
3. A clear explanation of the problem
4. A suggested fix

If no issues are found, say so clearly. Format your response as a clear, structured report.

\`\`\`${language}
${code}
\`\`\``;

    default:
      return code;
  }
}

router.post("/codegen/generate", async (req, res) => {
  try {
    const { code, language, mode } = req.body as { code: string; language: string; mode: string };

    if (!code || !language || !mode) {
      res.status(400).json({ error: "Missing required fields: code, language, mode" });
      return;
    }

    const validLanguages = ["python", "java", "cpp"];
    const validModes = ["comments", "docstrings", "readme", "bugs"];

    if (!validLanguages.includes(language) || !validModes.includes(mode)) {
      res.status(400).json({ error: "Invalid language or mode" });
      return;
    }

    const prompt = buildPrompt(code, language, mode);

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const output = completion.choices[0]?.message?.content ?? "";

    const [inserted] = await db
      .insert(codegenHistoryTable)
      .values({ inputCode: code, language, mode, output })
      .returning();

    res.json({
      id: inserted.id,
      output: inserted.output,
      language: inserted.language,
      mode: inserted.mode,
      inputCode: inserted.inputCode,
      createdAt: inserted.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate documentation");
    res.status(500).json({ error: "Failed to generate documentation" });
  }
});

router.get("/codegen/history", async (req, res) => {
  try {
    const history = await db
      .select()
      .from(codegenHistoryTable)
      .orderBy(desc(codegenHistoryTable.createdAt))
      .limit(50);

    res.json(
      history.map((h) => ({
        id: h.id,
        output: h.output,
        language: h.language,
        mode: h.mode,
        inputCode: h.inputCode,
        createdAt: h.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to fetch history");
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.get("/codegen/history/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [item] = await db
      .select()
      .from(codegenHistoryTable)
      .where(eq(codegenHistoryTable.id, id));

    if (!item) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json({
      id: item.id,
      output: item.output,
      language: item.language,
      mode: item.mode,
      inputCode: item.inputCode,
      createdAt: item.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch history item");
    res.status(500).json({ error: "Failed to fetch history item" });
  }
});

router.delete("/codegen/history/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const deleted = await db
      .delete(codegenHistoryTable)
      .where(eq(codegenHistoryTable.id, id))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete history item");
    res.status(500).json({ error: "Failed to delete history item" });
  }
});

router.get("/codegen/stats", async (req, res) => {
  try {
    const allItems = await db
      .select()
      .from(codegenHistoryTable)
      .orderBy(desc(codegenHistoryTable.createdAt));

    const totalGenerations = allItems.length;

    const byLanguage = { python: 0, java: 0, cpp: 0 };
    const byMode = { comments: 0, docstrings: 0, readme: 0, bugs: 0 };

    for (const item of allItems) {
      if (item.language in byLanguage) {
        byLanguage[item.language as keyof typeof byLanguage]++;
      }
      if (item.mode in byMode) {
        byMode[item.mode as keyof typeof byMode]++;
      }
    }

    const recentActivity = allItems.slice(0, 10).map((h) => ({
      id: h.id,
      output: h.output,
      language: h.language,
      mode: h.mode,
      inputCode: h.inputCode,
      createdAt: h.createdAt.toISOString(),
    }));

    res.json({ totalGenerations, byLanguage, byMode, recentActivity });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
