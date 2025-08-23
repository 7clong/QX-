/*
 * QX · Wallcraft Pro 解锁脚本
 * 作者: QuantumultX 规则工程师
 * 更新时间: 2025-08-24
 */

let body = {
  "subscription": {
    "status": "active",
    "plan": "premium",
    "product_id": "wallcraft.pro.lifetime",
    "purchase_date": "2023-01-01T00:00:00Z",
    "expiry_date": "2099-12-31T23:59:59Z",
    "auto_renew": true
  },
  "features": {
    "no_ads": true,
    "all_wallpapers": true,
    "hd_download": true,
    "exclusive": true
  }
};

$done({ body: JSON.stringify(body) });
