export type GatewayResult =
  | {
      type: 'LOCAL_RESPONSE';
      text: string;
    }
  | {
      type: 'NEED_LLM';
    }
  | {
      type: 'INVALID_INPUT';
    };

type LocalRule = {
  phrases: string[];
  response: string;
};

const LOCAL_RULES: LocalRule[] = [
  {
    phrases: ['안녕', '안녕하세요', '하이', 'hello', 'hi'],
    response: '안녕하세요 😊',
  },
  {
    phrases: ['고마워', '고마워요', '감사합니다', '감사해요', 'thanks', 'thank you'],
    response: '도움이 되어 기쁩니다 😊',
  },
  {
    phrases: [
      '잘가',
      '잘가요',
      '안녕히 계세요',
      '안녕히 가세요',
      'bye',
      '다음에',
      '다음에 봐요',
      '수고',
      '수고하세요',
    ],
    response: '다음에 또 편하게 이야기해요 😊',
  },
  {
    phrases: ['응', '네', '예', '그래', '알겠어', '알겠습니다', '오케이', 'ㅇㅋ', 'ok', 'okay'],
    response: '네, 알겠습니다 😊',
  },
];

function normalizeMessage(message: string): string {
  return message
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!?~]+$/, '');
}

export function evaluateMessage(message: string): GatewayResult {
  const normalized = normalizeMessage(message);

  if (normalized.length === 0) {
    return { type: 'INVALID_INPUT' };
  }

  for (const rule of LOCAL_RULES) {
    if (rule.phrases.includes(normalized)) {
      return { type: 'LOCAL_RESPONSE', text: rule.response };
    }
  }

  return { type: 'NEED_LLM' };
}
