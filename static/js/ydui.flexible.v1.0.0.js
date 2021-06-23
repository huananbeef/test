!function (e) { var t = e.document, n = t.documentElement, i = "orientationchange" in e ? "orientationchange" : "resize", a = function e() { var t = n.getBoundingClientRect().width; return n.style.fontSize = 5 * Math.max(Math.min(t / 750 * 20, 14.4), 8.55) + "px", e }(); n.setAttribute("data-dpr", e.navigator.appVersion.match(/iphone/gi) ? e.devicePixelRatio : 1), /iP(hone|od|ad)/.test(e.navigator.userAgent) && (t.documentElement.classList.add("ios"), parseInt(e.navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/)[1], 10) >= 8 && t.documentElement.classList.add("hairline")), t.addEventListener && (e.addEventListener(i, a, !1), t.addEventListener("DOMContentLoaded", a, !1)) }(window);
// 默认为320-420范围，改成了320-540，与其他平台保持一致。

(function () {
  // 备案链接隐藏按钮
  if(/^\/mprod/.test(location.pathname)) {
    var style = document.createElement("style");
    var textNode = document.createTextNode('body footer button {display: none !important}');
    style.appendChild(textNode);
    document.head.appendChild(style)
  }
})();


