/**
 * QX_Subscription_Tap.js
 * 只做“抓取与还原”，不修改任何请求/响应。
 * 同一个脚本兼容 script-request-body 和 script-response-body。
 * 结果写入控制台日志，并持久化保存最近 N 条（默认20）。
 */

(function () {
  const isReq = typeof $request !== "undefined" && typeof $response === "undefined";
  const isResp = typeof $response !== "undefined";
  const now = new Date();
  const ts = now.toISOString();

  // 用户可选项
  const notifyOn = ($prefs?.valueForKey("QX_SubTap_Notify") || "0") === "1";
  const maxKeep = parseInt($prefs?.valueForKey("QX_SubTap_LogMax") || "20", 10) || 20;
  const storeKey = "QX_SubTap_Log";

  // 工具：安全 JSON 解析与截断
  const safeParse = (s) => {
    if (!s || typeof s !== "string") return null;
    try { return JSON.parse(s); } catch { return null; }
  };
  const trunc = (s, n) => {
    if (typeof s !== "string") return s;
    return s.length > n ? s.slice(0, n) + `…(trunc ${s.length - n})` : s;
  };

  // 收集信息
  let record = {
    time: ts,
    phase: isReq ? "request" : "response",
    method: $request?.method || "",
    url: $request?.url || "",
    status: isResp ? ($response.status || 0) : undefined,
    headers: isReq ? ($request.headers || {}) : ($response.headers || {}),
  };

  // 只在三类接口范围内工作（双保险，避免误命中）
  const pathMatch = (u) => {
    try {
      const p = u.replace(/^https?:\/\/[^/]+/i, ""); // 去掉域名，仅看路径
      return /^\/v1\/subscribers\/[^/?]+(?:\?.*)?$/.test(p)
          || /^\/v1\/receipts(?:\?.*)?$/.test(p)
          || /^\/v1\/offerings(?:\?.*)?$/.test(p);
    } catch { return false; }
  };

  if (!record.url || !pathMatch(record.url)) {
    // 未命中目标，什么都不做，确保“只盯这三类接口”
    return $done(isResp ? { body: $response.body, headers: $response.headers, status: $response.status } : {});
  }

  // 处理 Body（请求与响应各自取）
  if (isReq) {
    const reqBody = $request?.body;
    record.body_text = reqBody ? trunc(reqBody, 4096) : "";
    const json = safeParse(reqBody);
    if (json) {
      // 尽量不把大字段塞爆日志
      record.body_json = json;
    }
  } else if (isResp) {
    const respBody = $response?.body;
    record.body_text = respBody ? trunc(respBody, 8192) : "";
    const json = safeParse(respBody);
    if (json) {
      record.body_json = json;
    }
  }

  // 控制台日志（便于实时看走向）
  try {
    console.log(`QX_SubTap | ${record.phase.toUpperCase()} | ${record.method || "-"} | ${record.status || "-"} | ${record.url}`);
    // 少啰嗦，按需展开
    // console.log(JSON.stringify(record, null, 2));
  } catch {}

  // 可选系统通知（关闭默认安静）
  if (notifyOn) {
    try {
      const sub = isReq ? "REQ" : `RESP · ${record.status || "-"}`;
      $notify("Subscription Tap", sub, trunc(record.url, 200));
    } catch {}
  }

  // 持久化最近 N 条
  try {
    const raw = $prefs?.valueForKey(storeKey);
    let arr = [];
    if (raw) {
      try { arr = JSON.parse(raw); } catch { arr = []; }
    }
    arr.push(record);
    if (arr.length > maxKeep) arr = arr.slice(arr.length - maxKeep);
    $prefs?.setValueForKey(JSON.stringify(arr), storeKey);
  } catch {}

  // 不改包，原样放行
  if (isResp) {
    $done({ status: $response.status, headers: $response.headers, body: $response.body });
  } else {
    $done({});
  }
})();
