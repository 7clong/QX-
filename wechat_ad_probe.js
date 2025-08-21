/**
 * wechat_ad_probe.js
 * Quantumult X - script-response-body
 * 作用：仅做通知记录，不修改响应。用于定位朋友圈/公众号广告接口。
 */
(function () {
  try {
    const url = ($request && $request.url) || "";
    const headers = ($response && $response.headers) || {};
    const ct = headers["Content-Type"] || headers["content-type"] || "";
    let keys = [];
    const isJSON = /json/i.test(ct || "");
    if (isJSON && $response && $response.body) {
      try {
        const obj = JSON.parse($response.body);
        const adKeys = new Set([
          "advertisement_info","advertisement","ad_info","adList","ad_list",
          "ads","ad","adData","adslot","ad_slot","promotion","promotions",
          "appmsg_ad","appmsg_ad_info","ext_ad","banner_ad","insert_ad","native_ad"
        ]);
        const seen = new Set();
        const stack = [obj];
        while (stack.length) {
          const cur = stack.pop();
          if (!cur || typeof cur !== "object") continue;
          for (const k of Object.keys(cur)) {
            if (adKeys.has(k)) keys.push(k);
            const v = cur[k];
            if (v && typeof v === "object" && !seen.has(v)) { seen.add(v); stack.push(v); }
          }
        }
      } catch (_) {}
    }
    const title = "WeChat Ad Probe 命中";
    const sub = url.replace(/^https?:\/\//,"");
    const body = `Content-Type: ${ct || "N/A"}\n广告字段: ${keys.length ? keys.join(", ") : "未见典型键"}\n说明: 仅调试通知，不修改内容`;
    try {$notify(title, sub, body);} catch (e) {}
  } catch (e) {
  } finally {
    $done({});
  }
})();