/*
 * Videoleap Pro 解锁脚本
 * 仅供学习与研究，请勿商用
 */

const obj = JSON.parse($response.body || "{}");

// 构造伪造的 Pro 订阅信息
obj.subscription = {
  "isActive": true,
  "isTrial": false,
  "isGracePeriod": false,
  "isRenewable": true,
  "isEligibleForIntroOffer": false,
  "expirationDate": "2099-12-31T23:59:59Z",
  "originalPurchaseDate": "2020-01-01T00:00:00Z",
  "productId": "com.lightricks.Videoleap.pro.yearly",
  "autoRenewStatus": true
};

obj.accountType = "Pro";
obj.features = ["pro", "premium", "unlimited"];

$done({ body: JSON.stringify(obj) });