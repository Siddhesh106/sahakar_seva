/**
 * SahakarSeva AI Request Classification Service
 * 
 * IMPORTANT ARCHITECTURAL RULE:
 * AI does NOT control worker assignment.
 * Its sole responsibility is converting unstructured natural-language
 * customer requests into structured service requirements:
 * {
 *   category: "electrical",
 *   service_type: "fan_repair",
 *   urgency: "high",
 *   summary: "Bedroom ceiling fan repair"
 * }
 * 
 * The structured output feeds into the deterministic, explainable Fair-Match Engine.
 */

// Category keywords and patterns
const CATEGORY_RULES = [
  {
    category: 'electrical',
    keywords: ['fan', 'light', 'switch', 'wiring', 'socket', 'fuse', 'electric', 'short circuit', 'ac', 'voltage', 'bulb', 'inverter'],
    types: {
      fan: 'fan_repair',
      wiring: 'wiring_repair',
      switch: 'switchboard_fitting',
      light: 'lighting_installation',
      fuse: 'circuit_repair'
    }
  },
  {
    category: 'plumbing',
    keywords: ['tap', 'pipe', 'leak', 'drain', 'flush', 'water', 'basin', 'sink', 'toilet', 'faucet', 'clog', 'shower'],
    types: {
      leak: 'pipe_leakage_repair',
      tap: 'tap_replacement',
      clog: 'drain_unclogging',
      sink: 'sink_installation',
      flush: 'toilet_repair'
    }
  },
  {
    category: 'cleaning',
    keywords: ['clean', 'dust', 'mop', 'sweep', 'wash', 'deep clean', 'kitchen clean', 'bathroom clean', 'dirt', 'stain'],
    types: {
      'deep clean': 'deep_home_cleaning',
      kitchen: 'kitchen_deep_cleaning',
      bathroom: 'bathroom_sanitization',
      dust: 'standard_cleaning'
    }
  },
  {
    category: 'cooking',
    keywords: ['cook', 'meal', 'food', 'roti', 'sabzi', 'lunch', 'dinner', 'breakfast', 'chef'],
    types: {
      dinner: 'dinner_preparation',
      lunch: 'lunch_preparation',
      party: 'party_cooking',
      daily: 'daily_meal_cook'
    }
  },
  {
    category: 'elder_care',
    keywords: ['elder', 'senior', 'grandparent', 'medicine', 'wheelchair', 'patient', 'nursing', 'caregiver', 'assist'],
    types: {
      medicine: 'medication_assistance',
      mobility: 'mobility_support',
      general: 'daily_companion_care'
    }
  },
  {
    category: 'tutoring',
    keywords: ['tutor', 'teach', 'math', 'science', 'homework', 'exam', 'class', 'study', 'english', 'student'],
    types: {
      math: 'math_tutoring',
      science: 'science_tutoring',
      exam: 'exam_prep_coaching',
      primary: 'primary_school_tutor'
    }
  },
  {
    category: 'gardening',
    keywords: ['garden', 'plant', 'lawn', 'prun', 'trim', 'pot', 'grass', 'fertilizer', 'watering', 'soil'],
    types: {
      lawn: 'lawn_mowing',
      prun: 'plant_pruning',
      pot: 'potting_maintenance',
      general: 'general_gardening'
    }
  },
  {
    category: 'event_help',
    keywords: ['event', 'party', 'wedding', 'cater', 'guest', 'decoration', 'setup', 'helper', 'gathering', 'festival'],
    types: {
      party: 'party_assistance',
      cater: 'catering_support',
      setup: 'venue_setup_cleanup'
    }
  }
];

const URGENCY_KEYWORDS = {
  high: ['immediately', 'emergency', 'urgent', 'asap', 'today', 'now', 'stopped working', 'leaking', 'spark', 'broken', 'fast'],
  medium: ['tomorrow', 'soon', 'this week', 'check', 'inspect'],
  low: ['next week', 'whenever', 'convenient', 'routine', 'maintenance']
};

/**
 * Classify a service request text to find category
 */
function classifyService(text) {
  if (!text) return 'electrical';
  const lower = text.toLowerCase();

  let matchedCategory = 'electrical';
  let highestMatches = 0;

  for (const rule of CATEGORY_RULES) {
    let count = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) count++;
    }
    if (count > highestMatches) {
      highestMatches = count;
      matchedCategory = rule.category;
    }
  }

  return matchedCategory;
}

/**
 * Extract urgency level from request text
 */
function extractUrgency(text) {
  if (!text) return 'medium';
  const lower = text.toLowerCase();

  for (const [level, kws] of Object.entries(URGENCY_KEYWORDS)) {
    for (const kw of kws) {
      if (lower.includes(kw)) return level;
    }
  }

  return 'medium';
}

/**
 * Detect specific sub-service type based on category and text
 */
function detectServiceType(category, text) {
  const lower = (text || '').toLowerCase();
  const rule = CATEGORY_RULES.find(r => r.category === category);
  if (!rule || !rule.types) return `${category}_general`;

  for (const [key, typeName] of Object.entries(rule.types)) {
    if (lower.includes(key)) return typeName;
  }

  return `${category}_general_repair`;
}

/**
 * Full natural-language parser
 */
async function parseServiceRequest(text) {
  // If OpenAI / Gemini API key is configured, invoke LLM here.
  // In demo mode or fallback, use deterministic, resilient rule-based NLP:
  const category = classifyService(text);
  const urgency = extractUrgency(text);
  const service_type = detectServiceType(category, text);

  return {
    category,
    service_type,
    urgency,
    raw_text: text,
    summary: `${service_type.replace(/_/g, ' ')} (${urgency} urgency)`
  };
}

module.exports = {
  parseServiceRequest,
  classifyService,
  extractUrgency,
  detectServiceType,
};
