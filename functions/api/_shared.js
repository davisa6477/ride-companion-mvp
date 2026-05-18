export function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload, null, 2), {
    status: init.status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": init.cacheControl || "no-store",
      ...(init.headers || {}),
    },
  });
}

export function errorResponse(message, status = 500, details = null) {
  return jsonResponse(
    {
      ok: false,
      error: message,
      details,
    },
    { status }
  );
}

export function requireMethod(request, allowedMethods = ["GET"]) {
  if (!allowedMethods.includes(request.method)) {
    return errorResponse(
      `Method ${request.method} not allowed.`,
      405,
      { allowedMethods }
    );
  }

  return null;
}
