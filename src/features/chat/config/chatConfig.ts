export const chatConfig = {
	// The server (modelRouter) authoritatively selects the model and IGNORES any client-sent id; this value is
	// only a benign, honest label on the outgoing request (never a real/placeholder model name).
	defaultModel: 'server-routed',
	maxRecentMessages: 8,
	summaryThreshold: 20,
	maxInputTokens: 6000,
	maxOutputTokens: 800,
	retryCount: 1,
	requestTimeoutMs: 30000,
	temperature: 0.4,
} as const;
