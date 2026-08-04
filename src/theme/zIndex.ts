export const zIndex = {
	backdrop: 100,
	dropdown: 200,
	sticky: 300,
	modal: 400,
	toast: 500,
	tooltip: 600,
} as const;

export type ZIndexToken = keyof typeof zIndex;
