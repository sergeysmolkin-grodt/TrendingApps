import axios from 'axios';
import { openAILimiter } from './rateLimiter';
import { analysisCache } from './cache';

interface WordAnalysis {
  isStopWord: boolean;
  isTrending: boolean;
  trendScore: number;
  trendReason: string;
  reason: string;
  confidence: number;
  category?: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Common English stop words
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
  'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
  'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
]);

// Technical/trending terms that are likely to be significant
const TECH_TERMS = new Set([
  'ai', 'api', 'app', 'blockchain', 'cloud', 'code', 'crypto', 'data', 'dev', 'git', 'ml', 'nft', 'node', 'python',
  'react', 'sdk', 'tech', 'web3', 'api', 'startup', 'fund', 'launch', 'product', 'market', 'scale', 'growth',
  'automation', 'bot', 'platform', 'saas', 'tool', 'analytics', 'integration', 'service', 'solution'
]);

// Trending indicators
const TREND_INDICATORS = [
  'growing', 'trending', 'popular', 'viral', 'emerging', 'innovative', 'revolutionary',
  'breakthrough', 'disruptive', 'game-changing', 'next-gen', 'cutting-edge'
];

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function analyzeWord(
  word: string, 
  context: { title: string; text: string }[]
): Promise<WordAnalysis> {
  try {
    // Проверяем кэш
    const cacheKey = `word:${word}:${context.map(c => c.title).join(',')}`;
    const cachedResult = analysisCache.get<WordAnalysis>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Если нет ключа API, используем локальный анализ
    if (!OPENAI_API_KEY) {
      console.log('No OpenAI API key found, using local analysis');
      return analyzeLocally(word, context);
    }

    // Ждем доступности rate limiter
    await openAILimiter.waitForAvailability();

    const prompt = `Analyze the word "${word}" in the following context:

Context:
${context.map(c => `Title: ${c.title}\nText: ${c.text}`).join('\n\n')}

Analyze this word for two aspects:
1. Stop Word Analysis:
   - Is it a common grammatical word (preposition, article, pronoun, etc.)?
   - Is it part of technical terminology?
   - Is it a meaningful concept in the context?

2. Trend Potential Analysis:
   - Is this word representing a new or emerging concept/technology/topic?
   - Is it used in an innovative or noteworthy context?
   - Does it appear to be gaining traction or significance?
   - Is it related to current events or developments in technology/business?

Response format:
{
  "isStopWord": boolean,
  "isTrending": boolean,
  "trendScore": number between 0 and 1,
  "trendReason": "detailed explanation why this word might or might not be trending",
  "reason": "detailed explanation about stop word analysis",
  "confidence": number between 0 and 1,
  "category": "Technical|Concept|Grammar|Trend|null"
}`;

    const response = await axios.post<OpenAIResponse>(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI trained to analyze words in context and determine if they are stop words or significant terms. Respond only with valid JSON."
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

    const analysis = JSON.parse(response.data.choices[0].message.content);
    
    const result = {
      isStopWord: Boolean(analysis.isStopWord),
      isTrending: Boolean(analysis.isTrending),
      trendScore: Number(analysis.trendScore) || 0,
      trendReason: String(analysis.trendReason),
      reason: String(analysis.reason),
      confidence: Number(analysis.confidence),
      category: analysis.category || undefined
    };

    // Сохраняем результат в кэш
    analysisCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error analyzing word:', error);
    console.log('Falling back to local analysis');
    return analyzeLocally(word, context);
  }
}

function analyzeLocally(word: string, context: { title: string; text: string }[]): WordAnalysis {
  const lowercaseWord = word.toLowerCase();
  
  // Проверяем стоп-слова
  const isStopWord = STOP_WORDS.has(lowercaseWord);
  
  // Проверяем технические термины
  const isTechTerm = TECH_TERMS.has(lowercaseWord);
  
  // Анализируем контекст
  const contextText = context.map(c => `${c.title} ${c.text}`).join(' ').toLowerCase();
  
  // Считаем частоту слова в контексте
  const wordFrequency = (contextText.match(new RegExp(`\\b${lowercaseWord}\\b`, 'g')) || []).length;
  
  // Проверяем индикаторы трендов рядом со словом
  const hasTrendIndicators = TREND_INDICATORS.some(indicator => 
    contextText.includes(`${lowercaseWord} ${indicator}`) || 
    contextText.includes(`${indicator} ${lowercaseWord}`)
  );

  // Проверяем появление в заголовках (более значимо)
  const appearanceInTitles = context.filter(c => 
    c.title.toLowerCase().includes(lowercaseWord)
  ).length;

  // Рассчитываем трендовый скор
  let trendScore = 0;
  trendScore += isTechTerm ? 0.4 : 0;
  trendScore += hasTrendIndicators ? 0.3 : 0;
  trendScore += Math.min((appearanceInTitles / context.length) * 0.3, 0.3);
  trendScore = Math.min(trendScore, 1);

  // Определяем категорию
  let category: string | undefined;
  if (isTechTerm) category = 'Technical';
  else if (isStopWord) category = 'Grammar';
  else if (trendScore > 0.5) category = 'Trend';
  else category = 'Concept';

  return {
    isStopWord,
    isTrending: trendScore > 0.5,
    trendScore,
    trendReason: generateTrendReason(word, isTechTerm, hasTrendIndicators, appearanceInTitles, wordFrequency),
    reason: generateAnalysisReason(word, isStopWord, isTechTerm, wordFrequency),
    confidence: 0.7,
    category
  };
}

function generateTrendReason(
  word: string,
  isTechTerm: boolean,
  hasTrendIndicators: boolean,
  titleAppearances: number,
  frequency: number
): string {
  const reasons = [];
  if (isTechTerm) reasons.push("is a recognized technical/trending term");
  if (hasTrendIndicators) reasons.push("appears with trend indicators");
  if (titleAppearances > 0) reasons.push(`appears in ${titleAppearances} post titles`);
  if (frequency > 3) reasons.push("frequently mentioned in discussions");
  
  return reasons.length > 0 
    ? `Word "${word}" ${reasons.join(", and ")}`
    : `Word "${word}" shows low trend potential based on context analysis`;
}

function generateAnalysisReason(
  word: string,
  isStopWord: boolean,
  isTechTerm: boolean,
  frequency: number
): string {
  if (isStopWord) return `"${word}" is a common grammatical word`;
  if (isTechTerm) return `"${word}" is a recognized technical term`;
  if (frequency > 3) return `"${word}" appears frequently in context and may be significant`;
  return `"${word}" is not a common stop word but requires more context for definitive analysis`;
} 