// wechat_moments_ad.js
// Quantumult X: 去除微信朋友圈广告
// 用法：script-response-body
// 目标：只清理广告，不破坏正文

function scrub(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const adKeys = new Set([
    "advertisement_info","ad_info","adList","ad_list","ads","ad","adData","adslot",
    "ad_slot","advertising","ad_banner","promotion","promotions"
  ]);
  for (const k of Object.keys(obj)) {
    if (adKeys.has(k)) {
      const v = obj[k];
      if (Array.isArray(v)) obj[k] = [];
      else if (typeof v === "object") obj[k] = {};
      else obj[k] = null;
    } else {
      obj[k] = scrub(obj[k]);
    }
  }
  return obj;
}

try {
  let body = $response.body;
  if (!body) $done({});
  let data = JSON.parse(body);
  data = scrub(data);
  if (data && data.ext) data.ext = scrub(data.ext);
  if (data && data.appmsg_ext) data.appmsg_ext = scrub(data.appmsg_ext);
  $done({ body: JSON.stringify(data) });
} catch (err) {
  $done({});
}
