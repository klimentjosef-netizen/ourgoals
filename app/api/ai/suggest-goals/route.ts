import { NextResponse } from "next/server";
import { GOAL_TEMPLATES } from "@/lib/data/goal-templates";

interface SuggestGoalsRequest {
  freeText: string;
  selectedModules: string[];
}

interface SuggestedGoal {
  title: string;
  type: "measurable" | "habit" | "challenge" | "oneoff";
  timeHorizon: "short_term" | "long_term";
  description: string;
  suggestedHabits: string[];
}

// Keyword-based goal suggestion (works without AI API)
function suggestFromTemplates(text: string, modules: string[]): SuggestedGoal[] {
  const lower = text.toLowerCase();
  const suggestions: SuggestedGoal[] = [];

  // Filter templates by modules
  const relevant = GOAL_TEMPLATES.filter((t) =>
    t.modules.some((m) => modules.includes(m))
  );

  // Score each template by keyword match
  const scored = relevant.map((template) => {
    let score = 0;
    const titleLower = template.title.toLowerCase();
    const descLower = template.description.toLowerCase();

    // Title keyword matches
    for (const word of titleLower.split(/\s+/)) {
      if (word.length > 2 && lower.includes(word)) score += 3;
    }

    // Description keyword matches
    for (const word of descLower.split(/\s+/)) {
      if (word.length > 3 && lower.includes(word)) score += 1;
    }

    // Specific keyword boosts
    if (lower.includes("zhub") && titleLower.includes("zhub")) score += 5;
    if (lower.includes("síl") && titleLower.includes("síl")) score += 5;
    if (lower.includes("běh") && (titleLower.includes("běh") || titleLower.includes("cvič"))) score += 4;
    if (lower.includes("stres") && titleLower.includes("stres")) score += 5;
    if (lower.includes("spá") && titleLower.includes("spá")) score += 5;
    if (lower.includes("medit") && titleLower.includes("medit")) score += 5;
    if (lower.includes("jíst") && titleLower.includes("jíst")) score += 5;
    if (lower.includes("makr") && titleLower.includes("makr")) score += 5;
    if (lower.includes("deep") && titleLower.includes("deep")) score += 5;
    if (lower.includes("knih") && titleLower.includes("knih")) score += 5;
    if (lower.includes("jazyk") && titleLower.includes("jazyk")) score += 5;
    if (lower.includes("partner") && titleLower.includes("komun")) score += 4;
    if (lower.includes("projekt") && titleLower.includes("projekt")) score += 5;

    return { template, score };
  });

  // Sort by score and take top matches
  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  for (const { template } of matches) {
    suggestions.push({
      title: template.title,
      type: template.type,
      timeHorizon: template.timeHorizon,
      description: template.description,
      suggestedHabits: template.suggestedHabits.map((h) => h.title),
    });
  }

  // If no matches, suggest top 3 relevant templates
  if (suggestions.length === 0) {
    for (const template of relevant.slice(0, 3)) {
      suggestions.push({
        title: template.title,
        type: template.type,
        timeHorizon: template.timeHorizon,
        description: template.description,
        suggestedHabits: template.suggestedHabits.map((h) => h.title),
      });
    }
  }

  return suggestions;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SuggestGoalsRequest;
    const { freeText, selectedModules } = body;

    if (!freeText || freeText.trim().length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    // Try Claude API if key is available
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (anthropicKey) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: `Jsi fitness a life coach. Uživatel ti popíše co chce dosáhnout. Vrať JSON pole s max 5 cíly.
Každý cíl má: title (český), type (measurable/habit/challenge/oneoff), timeHorizon (short_term/long_term), description (český, 1 věta), suggestedHabits (pole českých názvů návyků).
Odpověz POUZE validním JSON polem, žádný jiný text.`,
            messages: [
              {
                role: "user",
                content: `Vybrané moduly: ${selectedModules.join(", ")}\n\nCo chce uživatel: ${freeText}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.content?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
              return NextResponse.json({ suggestions: parsed, source: "ai" });
            }
          }
        }
      } catch {
        // AI failed, fall through to template-based
      }
    }

    // Fallback: template-based suggestions
    const suggestions = suggestFromTemplates(freeText, selectedModules);
    return NextResponse.json({ suggestions, source: "templates" });
  } catch {
    return NextResponse.json({ suggestions: [], error: "Chyba" }, { status: 500 });
  }
}
