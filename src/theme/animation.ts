
export const animation = {
	fast: 150,
	normal: 250,
	slow: 400,
} as const;

export type AnimationToken = keyof typeof animation;
