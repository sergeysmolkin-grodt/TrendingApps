export interface PatternAnalysis {
  hasFrustration: boolean;
  hasRequest: boolean;
  hasIdea: boolean;
  stage: 'frustration' | 'request' | 'idea' | 'mixed' | 'none';
}

const FRUSTRATION_PATTERNS = [
  'frustrated with', 'hate when', 'tired of',
  'annoying', 'difficult to', 'wish there was',
  'pain point', 'struggle with', 'problems with',
  'sick of', 'fed up with', 'cant stand'
];

const REQUEST_PATTERNS = [
  'looking for', 'need help', 'any suggestions',
  'recommend', 'how do you', 'what do you use',
  'is there a tool', 'alternative to', 'solution for',
  'best way to', 'how to handle', 'advice needed'
];

const IDEA_PATTERNS = [
  'i built', 'created a', 'launching',
  'working on', 'developed a', 'made a tool',
  'solution to', 'helps with', 'solves the problem',
  'new approach', 'innovative way', 'better way to'
];

export function analyzePattern(text: string): PatternAnalysis {
  const lowerText = text.toLowerCase();
  
  const hasFrustration = FRUSTRATION_PATTERNS.some(pattern => lowerText.includes(pattern));
  const hasRequest = REQUEST_PATTERNS.some(pattern => lowerText.includes(pattern));
  const hasIdea = IDEA_PATTERNS.some(pattern => lowerText.includes(pattern));

  let stage: PatternAnalysis['stage'] = 'none';
  
  if (hasFrustration && hasRequest && hasIdea) {
    stage = 'mixed';
  } else if (hasIdea) {
    stage = 'idea';
  } else if (hasRequest) {
    stage = 'request';
  } else if (hasFrustration) {
    stage = 'frustration';
  }

  return {
    hasFrustration,
    hasRequest,
    hasIdea,
    stage
  };
} 