// wx-cap.js
// 调试脚本：仅记录并回传原响应，不做修改。
// 输出含 ad/ads/adList/promotion 等关键字段的片段，便于你贴给我做精准规则。

(function () {
  if (!$response || typeof $response.body !== "string") return $done();
  const url = ($request && $request.url) || "";
  const raw = $response.body;
  try {
    const isJSON = /^\s*[{\[]/.test(raw);
    if (isJSON) {
      const data = JSON.parse(raw);
      const pick = {};
      function scan(obj, depth = 0) {
        if (!obj || typeof obj !== "object" || depth > 5) return;
        if (Array.isArray(obj)) {
          for (const it of obj) scan(it, depth + 1);
          return;
        }
        for (const k of Object.keys(obj)) {
          const lk = k.toLowerCase();
          if (/ad|ads|adlist|advert|promotion|promo/.test(lk)) {
            pick[k] = obj[k];
          } else if (typeof obj[k] === "object") {
            scan(obj[k], depth + 1);
          }
        }
      }
      scan(data, 0);
      if (Object.keys(pick).length) {
        console.log("[wx-cap] url=" + url + " keys=" + Object.keys(pick).join(","));
      } else {
        console.log("[wx-cap] url=" + url + " no-ad-keys");
      }
    } else {
      console.log("[wx-cap] url=" + url + " non-json");
    }
  } catch (e) {
    console.log("[wx-cap] parse-error url=" + url);
  }
  $done({ body: raw });
})();
