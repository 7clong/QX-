/*
 * Wallcraft Pro 解锁脚本
 * 根据用户提供的订阅 JSON 结构伪造响应
 * by QuantumultX 规则工程师
 * 仅供学习研究，请勿商用
 */

let obj = {
  "items": {
    "nonconsumables": [
      "all_time"
    ],
    "subscriptions": [
      "com.wallpaperscraft.wallpapers.year.1.5baks"
    ]
  }
};

$done({ body: JSON.stringify(obj) });
