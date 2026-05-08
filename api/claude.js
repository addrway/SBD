const SYSTEM_PROMPT = "You are the SBD AI Agent — a built-in intelligent assistant inside SBD (Simple Business Dashboard), a $29.99/month subscription platform. SBD has 6 modules: Finance, Projects, Logistics, Inventory, Customers, Reports. Users enter data manually or via AI Auto-Formulate. Be sharp, concise, and data-driven. Under 120 words unless asked for more.";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });
  try {
    const body = req.body || {};
    const payload = body.mode === "extract" ? extractionPayload(body.text) : chatPayload(body.messages, body.snapshot);
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": process.env.ANTHROPIC_API_KEY },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Claude request failed" });
    const text = data.content?.map((part) => part.text).join("\n").trim() || "";
    if (body.mode === "extract") return res.status(200).json({ records: parseRecords(text) });
    return res.status(200).json({ reply: text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

function extractionPayload(text) {
  return {
    model: "claude-3-5-sonnet-latest",
    max_tokens: 1200,
    system: "Extract finance records for SBD Pro. Return only valid JSON array items with type, description, amount, category, and date. Type must be revenue or expense.",
    messages: [{ role: "user", content: `Today is ${new Date().toISOString().slice(0, 10)}. Extract finance records from this text:\n\n${text || ""}` }]
  };
}

function chatPayload(messages = [], snapshot = {}) {
  return {
    model: "claude-3-5-sonnet-latest",
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Business snapshot: ${JSON.stringify(snapshot)}` }, ...messages.filter((message) => message.role === "user" || message.role === "assistant").map((message) => ({ role: message.role, content: message.content }))]
  };
}

function parseRecords(text) {
  const jsonStart = text.indexOf("[");
  const jsonEnd = text.lastIndexOf("]");
  if (jsonStart === -1 || jsonEnd === -1) return [];
  return JSON.parse(text.slice(jsonStart, jsonEnd + 1)).map((record) => ({
    type: record.type === "expense" ? "expense" : "revenue",
    description: String(record.description || "Imported record").slice(0, 200),
    amount: Number(record.amount || 0),
    category: String(record.category || "General").slice(0, 80),
    date: record.date || new Date().toISOString().slice(0, 10)
  }));
}
