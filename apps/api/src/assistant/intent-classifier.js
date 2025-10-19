const INTENT_PATTERNS = {
    violation: [
        /(?:^|\s)(fuck|shit|damn|bitch|asshole|stupid|idiot|hate|kill|die|suck|terrible|awful|horrible)(?:\s|$)/i,
        /(go to hell|fuck off|piss off)/i
      ],
    policy_question: [
      /\b(return|refund|exchange|replace|warranty|guarantee)\b/i,
      /\b(shipping|delivery time|policy|terms|conditions|privacy|cookie)\b/i,
      /\b(cancel|modify|change order)\b/i,
      /\b(size guide|measurements|fit)\b/i
    ],
    complaint: [
      /\b(problem|issue|broken|defective|damaged|wrong|incorrect|mistake|error)\b/i,
      /\b(not working|doesn't work|failed|failure)\b/i,
      /\b(delay|delayed|late|slow|waiting too long)\b/i,
      /\b(disappointed|frustrated|angry|upset|mad|annoyed|irritated)\b/i,
      /\b(bad quality|poor quality|cheap quality|terrible|awful|horrible)\b/i,
      /\b(customer service|support|help me|complaint|complain)\b/i
    ],
    order_status: [
      /\b(order|track|tracking|status|where is|when will|order number|order id|confirmation)\b/i,
      /\b(shipped|delivered|out for delivery|in transit|estimated delivery|arrival|package)\b/i,
      /\b(ups|fedex|usps|dhl|carrier)\b/i
    ],
    product_search: [
      /\b(find|search|looking for|need|want)\b/i,
      /\b(price|cost|how much|expensive|cheap)\b/i,
      /\b(available|in stock|out of stock|backorder)\b/i,
      /\b(color|size|material|brand|model)\b/i,
      /\b(recommend|suggest|best|top rated|compare|vs|difference between)\b/i,
      /\b(smartwatch|headphones?|laptops?|phones?|tablets?|keyboard|mouse|monitor|speaker|camera|bag)\b/i
    ],
    chitchat: [
      /\b(hello|hi|hey|good morning|good afternoon|good evening)\b/i,
      /\b(how are you|how's it going|what's up)\b/i,
      /\b(thank you|thanks|appreciate)\b/i,
      /\b(bye|goodbye|see you|take care)\b/i,
      /\b(weekend|vacation|holiday|travel|nice day|beautiful|lovely)\b/i
    ],
    off_topic: [
      /\b(politics|election|vote|government)\b/i,
      /\b(sports|football|basketball|soccer|game|player|team|tournament)\b/i,
      /\b(movie|film|cinema|netflix|series|tv|streaming)\b/i,
      /\b(recipe|cooking|food|restaurant|meal|kitchen)\b/i,
      /\b(health|medical|doctor|hospital|medicine)\b/i,
      /\b(education|school|university|college|exam|teacher)\b/i,
      /\b(relationship|dating|marriage|family|friend)\b/i,
      /\b(weather|temperature|rain|sunny|cold|hot)\b/i,
      /\b(who is|what is|where is|why is|how to)\b/i
    ]
  };
  
  // Priority order if scores tie
  const PRIORITY = [
    "violation",
    "policy_question",
    "complaint",
    "order_status",
    "product_search",
    "chitchat",
    "off_topic"
  ];
  
  // --- Weighted scoring classifier ---
  export function classifyIntent(message) {
    if (!message || typeof message !== "string") return "off_topic";
  
    const text = message.toLowerCase().trim();
    const scores = {};
  
    // Assign weighted scores
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      let score = 0;
      for (const regex of patterns) {
        const matches = text.match(regex);
        if (matches) score += matches.length * 2; // weight per match
      }
      scores[intent] = score;
    }
  
    // Determine highest score
    const maxScore = Math.max(...Object.values(scores));
    const topIntents = Object.keys(scores).filter((i) => scores[i] === maxScore);
  
    // Use priority order only if at least one score > 0
    if (maxScore > 0) {
        for (const p of PRIORITY) {
        if (topIntents.includes(p)) return p;
        }
    }
    
    // Default fallback when all scores are 0
    return "off_topic";
  }