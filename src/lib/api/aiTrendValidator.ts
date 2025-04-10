import axios from 'axios';
import { openAILimiter } from './rateLimiter';
import { analysisCache } from './cache';

export interface ValidationResult {
  isValid: boolean;
  relevanceScore: number;
  reason: string;
  confidence: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Keywords for trend validation
const TREND_KEYWORDS = [
  'new', 'emerging', 'growing', 'popular', 'trending', 'viral',
  'innovative', 'revolutionary', 'breakthrough', 'disruptive',
  'game-changing', 'next-gen', 'cutting-edge'
];

const VALIDATION_PATTERNS = [
  'increasing demand', 'growing interest', 'rising popularity',
  'more people are', 'becoming popular', 'gaining traction',
  'getting attention', 'buzz around', 'hype about'
];

export async function validateTrend(
  keyword: string,
  context: { title: string; text: string }[]
): Promise<ValidationResult> {
  try {
    // Проверяем кэш
    const cacheKey = `validation:${keyword}:${context.map(c => c.title).join(',')}`;
    const cachedResult = analysisCache.get<ValidationResult>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Если нет ключа API, используем локальный анализ
    if (!OPENAI_API_KEY) {
      console.log('No OpenAI API key found, using local analysis');
      return validateLocally(keyword, context);
    }

    // Ждем доступности rate limiter
    await openAILimiter.waitForAvailability();

    const prompt = `Validate if "${keyword}" represents a genuine trend based on the following context:

Context:
${context.map(c => `Title: ${c.title}\nText: ${c.text}`).join('\n\n')}

Analyze:
1. Is this a genuine trend or just a temporary topic?
2. What is the relevance score (0-1) of this trend?
3. Provide a detailed reason for your assessment.

Response format:
{
  "isValid": boolean,
  "relevanceScore": number between 0 and 1,
  "reason": "detailed explanation",
  "confidence": number between 0 and 1
}`;

    const response = await axios.post<OpenAIResponse>(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI trained to validate trends and assess their relevance. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const validation = JSON.parse(response.data.choices[0].message.content);
    
    const result = {
      isValid: Boolean(validation.isValid),
      relevanceScore: Number(validation.relevanceScore) || 0,
      reason: String(validation.reason),
      confidence: Number(validation.confidence) || 0.7
    };

    // Сохраняем результат в кэш
    analysisCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error validating trend:', error);
    console.log('Falling back to local analysis');
    return validateLocally(keyword, context);
  }
}

function validateLocally(keyword: string, context: { title: string; text: string }[]): ValidationResult {
  const allText = context.map(c => `${c.title} ${c.text}`).join(' ').toLowerCase();
  const keywordLower = keyword.toLowerCase();

  // Проверяем наличие ключевых слов тренда
  const hasTrendKeywords = TREND_KEYWORDS.some(kw => allText.includes(kw));
  
  // Проверяем паттерны валидации
  const hasValidationPatterns = VALIDATION_PATTERNS.some(pattern => allText.includes(pattern));
  
  // Считаем частоту упоминания ключевого слова
  const keywordFrequency = (allText.match(new RegExp(`\\b${keywordLower}\\b`, 'g')) || []).length;
  
  // Проверяем появление в заголовках
  const titleAppearances = context.filter(c => 
    c.title.toLowerCase().includes(keywordLower)
  ).length;

  // Рассчитываем релевантность
  let relevanceScore = 0;
  relevanceScore += hasTrendKeywords ? 0.3 : 0;
  relevanceScore += hasValidationPatterns ? 0.3 : 0;
  relevanceScore += Math.min((keywordFrequency / context.length) * 0.2, 0.2);
  relevanceScore += Math.min((titleAppearances / context.length) * 0.2, 0.2);

  // Формируем причину
  const reasons = [];
  if (hasTrendKeywords) reasons.push("contains trend-related keywords");
  if (hasValidationPatterns) reasons.push("shows validation patterns");
  if (keywordFrequency > 3) reasons.push("frequently mentioned in discussions");
  if (titleAppearances > 0) reasons.push(`appears in ${titleAppearances} post titles`);

  const reason = reasons.length > 0
    ? `Trend "${keyword}" ${reasons.join(", and ")}`
    : `Trend "${keyword}" shows low validation indicators`;

  return {
    isValid: relevanceScore > 0.5,
    relevanceScore,
    reason,
    confidence: 0.6
  };
} 