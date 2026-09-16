export const chatConfig = {
	// The server (modelRouter) authoritatively selects the model and IGNORES any client-sent id; this value is
	// only a benign, honest label on the outgoing request (never a real/placeholder model name).
	defaultModel: 'server-routed',
	maxRecentMessages: 8,
	summaryThreshold: 20,
	maxInputTokens: 6000,
	maxOutputTokens: 800,
	retryCount: 1,
	// ⚠ 2026-09-15 production: 30초로는 서버가 답을 만들기(약 45~46초) 전에 끊겨 "지금 답변을 가져오지 못했어요" 가 떴다.
	//   서버 `chat` 의 AI 단계 상한은 요청을 받은 시각부터 90초(LLM_DEADLINE_MS)이고 그 뒤 저장·원장 처리가 이어진다.
	//   그 상한 + 여유 30초. 이 값은 상담 호출(supabaseEdgeConsultationAdapter) 한 곳에서만 쓴다.
	requestTimeoutMs: 120000,
	temperature: 0.4,
} as const;
