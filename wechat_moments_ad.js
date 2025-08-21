/**
 * Quantumult X - script-response-body
 * 目标：只清广告，不碰正文；非 JSON 原样放行
 * 适用：mp.weixin.qq.com/mp/ 下返回的 JSON（朋友圈/公众号常见接口）
 */

function scrub(obj) {
  if (!obj || typeof obj !== "object") return obj;

  // 常见广告容器键（多版本接口归纳）
  const adKeys = new Set([
    "advertisement_info", "advertisement", "ad_info", "adList", "ad_list",
    "ads", "ad", "adData", "adslot", "ad_slot", "ad_banner",
    "promotion", "promotions", "promote", "promoted",
    "card_ad", "banner_ad", "insert_ad", "ext_ad", "native_ad",
    // 有些接口把广告塞在 ext/appmsg_ext 里
    "ext_ad", "appmsg_ad", "appmsg_ad_info"
  ]);

  // 常见广告位字段名（列表元素中出现的键）
  const adItemHints = new Set(["adid", "ad_id", "trace_id", "ad_trace", "ad_pos"]);

  // 深度清理
  const stack = [obj];
  while (stack.length) {
    const cur = stack.pop();
    for (const k of Object.keys(cur)) {
      const v = cur[k];

      // 1) 命中广告容器键：清空
      if (adKeys.has(k)) {
        if (Array.isArray(v)) cur[k] = [];
        else if (v && typeof v === "object") cur[k] = {};
        else cur[k] = null;
        continue;
      }

      // 2) 列表里出现广告特征：滤掉可疑项
      if (Array.isArray(v)) {
        cur[k] = v.filter(it => {
          try {
            if (it && typeof it === "object") {
              for (const hint of adItemHints) {
                if (Object.prototype.hasOwnProperty.call(it, hint)) return false;
              }
              // 常见把广告伪装成普通卡片，但嵌着广告容器
              for (const kk of Object.keys(it)) {
                if (adKeys.has(kk)) return false;
              }
            }
          } catch (_) {}
          return true;
        });
        // 深挖剩余元素
        for (const it of cur[k]) if (it && typeof it === "object") stack.push(it);
        continue;
      }

      // 3) 正常对象，继续深挖
      if (v && typeof v === "object") {
        stack.push(v);
        continue;
      }
    }
  }
  return obj;
}

try {
  if (!$response || !$response.body) { $done({}); }
  else {
    const ct = ($response.headers && ($response.headers["Content-Type"] || $response.headers["content-type"])) || "";
    // 非 JSON 不处理，避免误伤
    if (ct && !/json/i.test(ct)) { $done({}); return; }

    let data = JSON.parse($response.body);
    data = scrub(data);

    // 额外兜底：某些接口把广告嵌在 ext/appmsg_ext
    if (data && data.ext) data.ext = scrub(data.ext);
    if (data && data.appmsg_ext) data.appmsg_ext = scrub(data.appmsg_ext);

    $done({ body: JSON.stringify(data) });
  }
} catch (e) {
  // 出错也不阻断
  $done({});
}
