export function meta(requestId, extra = {}) {
  return { requestId, timestamp: new Date().toISOString(), ...extra };
}

export function sendSuccess(res, status, data, extraMeta = {}) {
  return res.status(status).json({ data, meta: meta(res.locals.requestId, extraMeta) });
}

export function sendError(res, status, code, message, details) {
  const error = { code, message };
  if (details?.length) error.details = details;
  return res.status(status).json({ error, meta: meta(res.locals.requestId) });
}
