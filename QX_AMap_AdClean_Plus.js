/*
 * QX · AMap AdClean Plus
 * 功能：把高德“爱校验结构”的接口改成合法空数据，避免白屏/红字
 * 仅供学习研究
 */

function parse(body) {
  try { return body ? JSON.parse(body) : {}; } catch (e) { console.log("JSON parse error: " + e); return {}; }
}

function normalize(path, obj) {
  if (typeof obj !== "object" || obj === null) obj = {};

  // 常规状态字段兜底
  if (obj.code === undefined) obj.code = 1;
  if (obj.status === undefined) obj.status = 1;
  if (obj.message === undefined && obj.msg === undefined) obj.message = "OK";

  // 列表置空
  ["data","list","cards","modules","ads","banners","items","result","resultList","tips","hotwords","sections","cells","recommend"]
    .forEach(k => { if (!Array.isArray(obj[k])) obj[k] = []; });

  // 对象置空
  ["config","map","extra","ext","payload","content","profile"]
    .forEach(k => { if (typeof obj[k] !== "object" || obj[k] === null) obj[k] = {}; });

  // 细项按接口补齐
  if (/faas\/amap-navigation\/card-service-plan/.test(path)) { obj.cards = []; obj.modules = []; obj.data = []; }
  if (/shield\/search\/new_hotword/.test(path)) { obj.hotwords = []; obj.data = []; }
  if (/shield\/search\/common\/coupon/.test(path)) { obj.coupons = []; obj.data = []; }
  if (/shield\/dsp\/profile/.test(path)) { obj.ads = []; obj.list = []; obj.profile = {}; }
  if (/mps\/mps\/project\/(home|cards|recommend)/.test(path)) { obj.cards = []; obj.recommend = []; obj.sections = []; }

  return obj;
}

(function () {
  const url = $request.url || "";
  const path = url.replace(/^https?:\/\/[^/]+/i, "");
  const raw = $response.body || "";
  const obj = parse(raw);
  const clean = normalize(path, obj);
  $done({ body: JSON.stringify(clean) });
})();
