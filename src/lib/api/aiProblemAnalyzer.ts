import axios from 'axios';
import { openAILimiter } from './rateLimiter';
import { analysisCache } from './cache';

interface ProblemAnalysis {
  problemDescription: string;
  targetAudience: string[];
  monetizationIdeas: string[];
  confidence: number;
  pattern: {
    hasFrustration: boolean;
    hasRequest: boolean;
    hasIdea: boolean;
    stage: 'frustration' | 'request' | 'idea' | 'mixed';
  };
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

// Patterns for problem analysis
const FRUSTRATION_PATTERNS = [
  'frustrated', 'annoyed', 'hate', 'difficult', 'hard', 'complicated',
  'struggle', 'pain', 'problem', 'issue', 'challenge', 'tired of',
  'sick of', 'fed up', 'waste of time', 'inefficient'
];

const REQUEST_PATTERNS = [
  'need', 'want', 'looking for', 'searching for', 'wish', 'would like',
  'should have', 'must have', 'would be great', 'would be nice',
  'would be helpful', 'would be useful'
];

const IDEA_PATTERNS = [
  'built', 'created', 'made', 'developed', 'solution', 'tool',
  'app', 'service', 'product', 'platform', 'system', 'method',
  'approach', 'technique', 'strategy'
];

export async function analyzeProblem(
  posts: { title: string; text: string; subreddit: string }[]
): Promise<ProblemAnalysis> {
  try {
    // Проверяем кэш
    const cacheKey = `problem:${posts.map(p => p.title).join(',')}`;
    const cachedResult = analysisCache.get<ProblemAnalysis>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Если нет ключа API, используем локальный анализ
    if (!OPENAI_API_KEY) {
      console.log('No OpenAI API key found, using local analysis');
      return analyzeLocally(posts);
    }

    // Ждем доступности rate limiter
    await openAILimiter.waitForAvailability();

    const prompt = `Analyze the following Reddit posts to identify:
1. The core problem being discussed
2. The target audience affected by this problem
3. Potential monetization opportunities
4. The stage of problem-solution development (frustration, request, or idea)

Posts:
${posts.map(p => `Title: ${p.title}\nText: ${p.text}\nSubreddit: ${p.subreddit}`).join('\n\n')}

Response format:
{
  "problemDescription": "detailed description of the problem",
  "targetAudience": ["list", "of", "target", "audiences"],
  "monetizationIdeas": ["list", "of", "monetization", "ideas"],
  "confidence": number between 0 and 1,
  "pattern": {
    "hasFrustration": boolean,
    "hasRequest": boolean,
    "hasIdea": boolean,
    "stage": "frustration|request|idea|mixed"
  }
}`;

    const response = await axios.post<OpenAIResponse>(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI trained to analyze problems and identify business opportunities from Reddit discussions. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
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
      problemDescription: String(analysis.problemDescription),
      targetAudience: Array.isArray(analysis.targetAudience) ? analysis.targetAudience : [],
      monetizationIdeas: Array.isArray(analysis.monetizationIdeas) ? analysis.monetizationIdeas : [],
      confidence: Number(analysis.confidence) || 0.7,
      pattern: {
        hasFrustration: Boolean(analysis.pattern?.hasFrustration),
        hasRequest: Boolean(analysis.pattern?.hasRequest),
        hasIdea: Boolean(analysis.pattern?.hasIdea),
        stage: analysis.pattern?.stage || 'mixed'
      }
    };

    // Сохраняем результат в кэш
    analysisCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error analyzing problem:', error);
    console.log('Falling back to local analysis');
    return analyzeLocally(posts);
  }
}

function analyzeLocally(posts: { title: string; text: string; subreddit: string }[]): ProblemAnalysis {
  const allText = posts.map(p => `${p.title} ${p.text}`).join(' ').toLowerCase();
  
  // Анализируем паттерны
  const hasFrustration = FRUSTRATION_PATTERNS.some(pattern => allText.includes(pattern));
  const hasRequest = REQUEST_PATTERNS.some(pattern => allText.includes(pattern));
  const hasIdea = IDEA_PATTERNS.some(pattern => allText.includes(pattern));

  // Определяем стадию
  let stage: 'frustration' | 'request' | 'idea' | 'mixed' = 'mixed';
  if (hasFrustration && !hasRequest && !hasIdea) stage = 'frustration';
  else if (hasRequest && !hasIdea) stage = 'request';
  else if (hasIdea) stage = 'idea';

  // Извлекаем ключевые слова для описания проблемы
  const problemKeywords = FRUSTRATION_PATTERNS.filter(pattern => allText.includes(pattern));
  const problemDescription = problemKeywords.length > 0
    ? `Users are experiencing issues with ${problemKeywords.join(', ')}`
    : 'Problem description requires more context';

  // Определяем целевую аудиторию на основе сабреддита
  const targetAudience = posts.map(p => p.subreddit)
    .filter((value, index, self) => self.indexOf(value) === index)
    .map(sub => `r/${sub} users`);

  // Генерируем идеи монетизации на основе паттернов
  const monetizationIdeas = [];
  if (hasFrustration) monetizationIdeas.push('Problem-solving service');
  if (hasRequest) monetizationIdeas.push('On-demand solution');
  if (hasIdea) monetizationIdeas.push('Product or tool development');

  return {
    problemDescription,
    targetAudience,
    monetizationIdeas,
    confidence: 0.6,
    pattern: {
      hasFrustration,
      hasRequest,
      hasIdea,
      stage
    }
  };
} 