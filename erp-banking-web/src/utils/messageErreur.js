const MESSAGES_TECHNIQUES = [
  /^Network Error$/i,
  /^Failed to fetch$/i,
  /^Load failed$/i,
  /^Request failed with status code \d+$/i,
  /^timeout of \d+ms exceeded$/i,
];

export const extraireMessageErreur = (
  error,
  messageParDefaut = 'Une erreur est survenue.'
) => {
  const messageBackend = error?.response?.data?.message;
  if (messageBackend) return messageBackend;

  const message = typeof error?.message === 'string' ? error.message : '';
  if (message && !MESSAGES_TECHNIQUES.some((regex) => regex.test(message))) {
    return message;
  }

  return messageParDefaut;
};
