const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are a fake job posting detector. Analyse the job posting provided and return a JSON object with your analysis.

You MUST return ONLY valid JSON matching this exact schema — no markdown, no code fences, no extra text:

{
  "label": "fake" or "real",
  "fake_probability": number between 0 and 1,
  "confidence": "High", "Medium", or "Low",
  "confidence_reasoning": "short explanation of confidence level",
  "missing_fields": ["list of missing fields like company, salary, location, apply_url"],
  "signals": {
    "fraud_signals": [
      {"feature": "signal name", "impact": number 0-1, "explanation": "why this is suspicious"}
    ],
    "legit_signals": [
      {"feature": "signal name", "impact": number 0-1, "explanation": "why this suggests legitimacy"}
    ]
  },
  "categorised_patterns": [
    {
      "name": "category name (e.g. Urgency & Pressure Language)",
      "icon": "emoji",
      "direction": "fraud" or "legit",
      "matched_tokens": ["words", "that", "matched"],
      "explanation": "why this pattern matters"
    }
  ],
  "structural_checks": [
    {"label": "check description", "pass": true/false, "why": "explanation"}
  ],
  "plain_english_summary": "2-3 sentence plain English explanation of the verdict for a non-technical user"
}

Analysis guidelines:
- Check for urgency/pressure language (urgent, immediately, limited spots, ASAP)
- Check for vague/inflated salary promises (earn daily, guaranteed income, unlimited)
- Check for minimal requirements (no experience needed, anyone can apply)
- Check for suspicious contact methods (Telegram, WhatsApp, personal email like Gmail/Yahoo)
- Check for requests for personal info (bank details, ID, SSN)
- Check for missing company name, location, or application URL
- Check for professional language, specific role details, named company, structured process
- fake_probability should be well-calibrated: >0.8 for obvious scams, 0.4-0.6 for ambiguous, <0.2 for clearly legitimate
- Provide 3-6 fraud signals and 3-6 legitimacy signals, sorted by impact
- Provide 6 structural checks covering: company name, salary, application URL, personal email domain, job title specificity, description length
- Be thorough but concise in explanations`;

export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    if (!title?.trim() || !description?.trim()) {
      return Response.json(
        { error: "Please provide both a job title and description." },
        { status: 400 }
      );
    }

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyse this job posting:\n\nTitle: ${title}\n\nDescription: ${description}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error("Groq API error:", res.status, err);
      return Response.json(
        { error: "Analysis failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    const analysis = JSON.parse(text);

    return Response.json(analysis);
  } catch (err) {
    console.error("Detector API error:", err);
    return Response.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
