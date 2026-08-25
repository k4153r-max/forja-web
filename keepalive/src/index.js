const DEFAULT_URL = "https://chile-oef-api.fly.dev/v1/health";

async function ping(url) {
  const response = await fetch(url, { method: "GET", redirect: "follow" });
  const body = await response.text();
  return { url, status: response.status, ok: response.ok, bytes: body.length };
}

export default {
  async fetch(_request, env) {
    const result = await ping(env.KEEPALIVE_URL || DEFAULT_URL);
    return Response.json(result, { status: result.ok ? 200 : 502 });
  },

  async scheduled(_event, env) {
    const result = await ping(env.KEEPALIVE_URL || DEFAULT_URL);
    console.log("keepalive", result.url, result.status);
  },
};
