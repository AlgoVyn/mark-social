// Generate unique ID using crypto.randomUUID (supported in all modern browsers)
export const generateId = (): string => crypto.randomUUID();
