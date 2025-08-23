/*
 * BaiduNetdisk VIP 解锁
 * QuantumultX 脚本 · baidu-vip.js
 * 更新时间: 2025-08-23
 */

const vip = {
  "errno": 0,
  "errmsg": "success",
  "data": {
    "is_vip": 1,
    "vip_type": "svip",
    "vip_level": 7,
    "expire_time": "2099-12-31 23:59:59"
  }
};

$done({ body: JSON.stringify(vip) });
