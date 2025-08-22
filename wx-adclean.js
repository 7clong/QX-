// wx-adclean.js
// 公众号文章扩展信息去广告：删除广告/营销相关键，不触碰正文、阅读量、点赞、收藏等业务字段。

(function () {
  if (!$response || !$response.body) return $done();

  let body = $response.body;
  try {
    const json = JSON.parse(body);

    const killList = new Set([
      "advertisement_info", "advertisement_num", "ad_info", "ad_list",
      "ad_banner", "ad", "ads", "ad_content", "ad_data",
      "promote", "promotion", "commercial", "biz_ad"
    ]);

    const protect = /(pay|order|receipt|vip|favorite|like|comment|read|reward|share|author|copyright)/i;

    let removed = 0;

    function prune(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        for (let i = node.length - 1; i--) {
          const v = node[i];
          if (typeof v === "object") prune(v);
          if (isEmpty(v)) node.splice(i, 1);
        }
      } else {
        for (const k of Object.keys(node)) {
          const lower = k.toLowerCase();
          if (protect.test(lower)) continue;
          if (killList.has(k) || /(^|_)(ad|ads|advert|promotion|promo|commercial)(_|$)/i.test(lower)) {
            delete node[k];
            removed++;
            continue;
          }
          const v = node[k];
          if (v && typeof v === "object") prune(v);
        }
      }
    }

    function isEmpty(o) {
      return o && typeof o === "object" && !Array.isArray(o) && Object.keys(o).length === 0;
    }

    prune(json);

    if (removed > 0) console.log(`[WeChat AdClean] removed=${removed}`);
    body = JSON.stringify(json);
  } catch (e) {}

  $done({ body });
})();
