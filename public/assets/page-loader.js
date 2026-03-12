(function () {
  function hideLoader() {
    var loader = document.querySelector("[data-page-loader]");
    if (!loader) return;
    loader.classList.add("is-hidden");
    window.setTimeout(function () {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 320);
  }

  window.addEventListener("load", hideLoader);
  window.addEventListener("pageshow", hideLoader);
})();
