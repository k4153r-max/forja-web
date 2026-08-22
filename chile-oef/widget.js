(() => {
  "use strict";

  if (document.querySelector('script[data-chile-oef-widget="v3"]')) return;
  const script = document.createElement("script");
  script.src = "/chile-oef/widget-v3.js?v=20260822-3";
  script.defer = true;
  script.dataset.chileOefWidget = "v3";
  document.head.appendChild(script);
})();
