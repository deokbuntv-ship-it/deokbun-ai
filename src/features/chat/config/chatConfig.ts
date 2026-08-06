export const chatConfig = {
	defaultModel: 'gpt-mini-placeholder',
	maxRecentMessages: 8,
	summaryThreshold: 20,
	maxInputTokens: 6000,
	maxOutputTokens: 800,
	retryCount: 1,
	requestTimeoutMs: 30000,
	temperature: 0.4,
} as const;
