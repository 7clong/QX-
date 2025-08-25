/********************************************
 * 文件: subs-sniffer.js
 * 作用: 只记录订阅相关请求/响应信息到 QX 日志，不修改数据
 * 适配: script-request-body / script-response-body
 * 用途: 学习研究
 ********************************************/

(function () {
  const isReq = typeof $request !== "undefined" && typeof $response === "undefined";
  const isResp = typeof $response !== "undefined";
  const now = () => new Date().toISOString();

  // 通用安全 JSON 解析
  const safeJSON = (txt) => {
    try {
      return JSON.parse(txt);
    } catch {
      return null;
    }
  };

  // 简化头信息，避免刷屏
  const pickHeaders = (h = {}) => {
    const keys = ["host", "authorization", "x-auth-token", "x-api-key", "user-agent", "content-type", "accept", "accept-language"];
    const out = {};
    for (const k of keys) {
      const v = Object.keys(h).find((x) => x.toLowerCase() === k.toLowerCase());
      if (v) out[k] = h[v];
    }
    return out;
  };

  // 截断大体积 body，保护日志
  const trimBody = (s, limit = 4096) => {
    if (!s) return "";
    if (s.length <= limit) return s;
    return s.slice(0, limit) + `\n/* [sniffer] body truncated, total=${s.length} */`;
  };

  const url = (isReq ? $request?.url : $response?.url) || $request?.url || "";
  const method = $request?.method || "GET";

  try {
    if (isReq) {
      const bodyText = typeof $request.body === "string" ? $request.body : ($request.body ? JSON.stringify($request.body) : "");
      const j = safeJSON(bodyText);
      const pretty = j ? JSON.stringify(j, null, 2) : trimBody(bodyText);

      console.log(
        `\n[Sniffer][REQ] ${now()}\n` +
        `URL: ${url}\n` +
        `Method: ${method}\n` +
        `Headers: ${JSON.stringify(pickHeaders($request.headers || {}))}\n` +
        `Body:\n${pretty}\n`
      );

      // 不改动请求，直接放行
      $done({});
      return;
    }

    if (isResp) {
      const status = $response.status || 200;
      const headers = $response.headers || {};
      const bodyText = typeof $response.body === "string" ? $response.body : ($response.body ? JSON.stringify($response.body) : "");
      const j = safeJSON(bodyText);
      const pretty = j ? JSON.stringify(j, null, 2) : trimBody(bodyText);

      console.log(
        `\n[Sniffer][RESP] ${now()}\n` +
        `URL: ${url}\n` +
        `Status: ${status}\n` +
        `Headers: ${JSON.stringify(pickHeaders(headers))}\n` +
        `Body:\n${pretty}\n`
      );

      // 原样返回响应
      $done({ status, headers, body: bodyText });
      return;
    }

    // 理论不会触达
    $done({});
  } catch (e) {
    console.log(`[Sniffer][ERROR] ${now()} ${e.stack || e}`);
    // 出错也不阻断流量
    if (isResp) {
      $done({ status: $response?.status || 200, headers: $response?.headers || {}, body: $response?.body || "" });
    } else {
      $done({});
    }
  }
})();
