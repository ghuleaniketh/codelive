let currentIdToken: string | null = null;

export const setCurrentIdToken = (token: string | null) => {
  currentIdToken = token;
};

export const getCurrentIdToken = (): string | null => currentIdToken;