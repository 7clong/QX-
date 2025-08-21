/**
 * shuqi_ad_clean.js
 * Quantumult X - script-response-body
 * 目标：通用清理书旗小说接口中的广告字段，尽量不碰正文；非 JSON 响应直接放行
 */

function scrub(obj) {
  if (!obj || typeof obj !== "object") return obj;

  // 广告容器常用键（归纳多版本字段）
  const adKeys = new Set([
    "ad", "ads", "ad_list", "adList", "adInfo", "ad_info", "adItems",
    "advert", "advertise", "advertisement", "advertisement_info",
    "banner", "bannerList", "banner_ad",
    "splash", "openScreenAd", "startupAd", "bootAd",
    "pop", "popup", "popupAd", "dialogAd",
    "recommend_ad", "feed_ad", "feedAd",
    "promotion", "promotions", "activity_ad", "marketing",
    "adslot", "ad_slot", "adpositions", "ad_position",
    "videoAd", "rewardAd", "incentiveAd"
  ]);

  // 列表项中的广告提示字段
  const adItemHints = new Set([
    "is_ad", "isAd", "adType", "ad_id", "adId", "adMark", "ad_label", "adTag",
    "adTrace", "trace_id", "adTraceId", "click_url", "clickUrl", "landing_url"
  ]);

  const seen = new Set();
  const stack = [obj];

  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
    seen.add(cur);

    for (const k of Object.keys(cur)) {
      const v = cur[k];

      // 1) 命中广告容器键：清空
      if (adKeys.has(k)) {
        if (Array.isArray(v)) cur[k] = [];
        else if (v && typeof v === "object") cur[k] = {};
        else cur[k] = null;
        continue;
      }

      // 2) 对数组，过滤掉带广告特征的元素
      if (Array.isArray(v)) {
        cur[k] = v.filter(it => {
          try {
            if (it && typeof it === "object") {
              for (const hint of adItemHints) {
                if (Object.prototype.hasOwnProperty.call(it, hint)) return false;
              }
              for (const kk of Object.keys(it)) {
                if (adKeys.has(kk)) return false;
              }
            }
          } catch (_) {}
          return true;
        });
        // 深入剩余元素
        for (const it of cur[k]) if (it && typeof it === "object") stack.push(it);
        continue;
      }

      // 3) 常见服务端“位置/样式”命名里含 ad 的键，谨慎置空（避免误杀正文字段）
      if (typeof k === "string" && /(^|[_-])ad([_-]|$)/i.test(k) && typeof v === "object") {
        // 仅当对象里有明显广告子键时才清理
        const keys = Object.keys(v || {});
        if (keys.some(x => adKeys.has(x) || /(^|[_-])ad([_-]|$)/i.test(x))) {
          cur[k] = Array.isArray(v) ? [] : {};
          continue;
        }
      }

      // 4) 普通对象，继续深挖
      if (v && typeof v === "object") {
        stack.push(v);
      }
    }
  }
  return obj;
}

try {
  if (!$response || !$response.body) { $done({}); }
  else {
    const headers = $response.headers || {};
    const ct = headers["Content-Type"] || headers["content-type"] || "";
    if (ct && !/json/i.test(ct)) { $done({}); return; }

    let data = JSON.parse($response.body);
    data = scrub(data);
    $done({ body: JSON.stringify(data) });
  }
} catch (e) {
  // 出错不拦截，避免影响正常功能
  $done({});
}
