import fs from "fs";
import path from "path";

/**
 * ✅ Load knowledge base safely regardless of working directory
 */
export function loadKnowledgeBase() {
  try {
    const baseDir = process.cwd();
    const jsonPath = path.resolve(baseDir, "docs", "ground-truth.json");

    if (!fs.existsSync(jsonPath)) {
      console.warn(`[Grounding] ground-truth.json not found at ${jsonPath}`);
      return [];
    }

    const jsonContent = fs.readFileSync(jsonPath, "utf8");
    const parsed = JSON.parse(jsonContent);
    if (!Array.isArray(parsed)) {
      console.warn("[Grounding] Knowledge base is not an array, returning empty.");
      return [];
    }

    console.log(`[Grounding] Loaded ${parsed.length} KB entries`);
    return parsed;
  } catch (error) {
    console.error("[Grounding] Error loading KB:", error.message);
    return [];
  }
}

/**
 * ✅ Keyword-based retrieval of relevant policies by category
 */
export function findRelevantPolicies(userQuery, knowledgeBase) {
  const query = userQuery.toLowerCase();
  if (!Array.isArray(knowledgeBase)) return [];

  const categoryKeywords = {
    returns: ["return", "refund", "exchange", "money back"],
    shipping: ["shipping", "delivery", "ship", "transit", "carrier"],
    warranty: ["warranty", "guarantee", "defect", "broken", "repair"],
    privacy: ["privacy", "data", "personal", "information"],
    payment: ["payment", "charge", "billing", "credit card", "paypal"],
    cancellation: ["cancel", "cancellation", "stop", "terminate"],
    orders: ["order", "status", "track", "tracking"],
    support: ["support", "help", "contact", "email", "assistance"]
  };

  let matchedCategory = null;
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => query.includes(k))) {
      matchedCategory = cat;
      break;
    }
  }

  if (!matchedCategory) return [];

  return knowledgeBase.filter(p => p.category?.toLowerCase() === matchedCategory);
}

/**
 * ✅ Combines query analysis with retrieval
 */
export function groundQuery(userQuery, knowledgeBase = null) {
  const kb = knowledgeBase || loadKnowledgeBase();
  const matchedPolicies = findRelevantPolicies(userQuery, kb);
  return {
    query: userQuery,
    matchedPolicies,
    hasMatches: matchedPolicies.length > 0,
    categories: [...new Set(matchedPolicies.map(p => p.category))]
  };
}

/**
 * ✅ Format policies into readable, LLM-friendly text
 */
export function formatPoliciesForPrompt(groundingResult) {
  const policies = groundingResult?.matchedPolicies || [];
  if (!policies.length) return "No specific policies found for this query.";

  let formatted = "Relevant policies:\n";
  policies.forEach((p, i) => {
    formatted += `${i + 1}. [${p.id}] ${p.question}\n   ${p.answer}\n\n`;
  });
  return formatted.trim();
}

/**
 * ✅ Validate [PolicyID] citations only, ignore [category] labels
 */
export function validateCitations(text, knowledgeBase = null) {
  const kb = knowledgeBase || loadKnowledgeBase();
  if (!Array.isArray(kb)) return { isValid: true, validCitations: [], invalidCitations: [] };

  const citationPattern = /\[((Policy|Shipping|Warranty|Privacy|Security|Payment|Orders|Support)[0-9.]+)\]/g;
  const found = [...text.matchAll(citationPattern)].map(m => m[1]);
  const valid = found.filter(id => kb.some(p => p.id === id));
  const invalid = found.filter(id => !kb.some(p => p.id === id));

  return {
    isValid: invalid.length === 0,
    validCitations: valid,
    invalidCitations: invalid,
    totalCitations: found.length,
    summary: `${valid.length} valid, ${invalid.length} invalid`
  };
}
