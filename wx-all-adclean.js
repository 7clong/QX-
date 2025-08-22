// wx-all-adclean.js
// 合并清理：公众号 getappmsgext & 朋友圈 adsmp.* 返回体的广告字段。
// 仅删除典型 ad/ads/advert/promotion 字段，不触碰支付/聊天/用户等关键业务键。

(function () {
  if (!$response || !$response.body) return $done({});

  const protect = /(pay|order|receipt|vip|ticket|license|purchase|subscribe|favor|favorite|like|comment|read|reward|share|author|copyright|user|profile|friend|chat|message)/i;
  const suspectArrayNames = new Set(["ad_list", "adList", "ads", "banners", "promotion", "waterfall", "adSlots"]);
  const killKeyRegex = /(^|_)(ad|ads|advert|adinfo|adslot|promotion|promo|commercial|sponsor)(s|_list|_config|info|slot|data|material|materials)?$/i;

  let body = $response.body;
  try {
    const json = JSON.parse(body);
    let removed = 0;

    function prune(node, path = "") {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        for (let i = node.length - 1; i >= 0; i--) {
          const v = node[i];
          prune(v, path + "[" + i + "]");
          if (isEmptyObject(v) && suspectArrayNames.has(getTail(path))) {
            node.splice(i, 1);
          }
        }
      } else {
        for (const k of Object.keys(node)) {
          const lower = k.toLowerCase();
          if (protect.test(lower)) continue;
          if (killKeyRegex.test(lower)) {
            delete node[k];
            removed++;
            continue;
          }
          const v = node[k];
          if (v && typeof v === "object") prune(v, path ? path + "." + k : k);
        }
      }
    }

    function isEmptyObject(o) {
      return o && typeof o === "object" && !Array.isArray(o) && Object.keys(o).length === 0;
    }
    function getTail(p) {
      if (!p) return "";
      const parts = p.split(".");
      return parts[parts.length - 1];
    }

    prune(json);

    if (removed > 0) console.log("[wx-all-adclean] removed=" + removed);
    body = JSON.stringify(json);
  } catch (e) {
    // 非 JSON 响应，直接返回
  }

  $done({ body });
})();
