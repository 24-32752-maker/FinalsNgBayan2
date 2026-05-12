(function () {
  const navToggle = document.querySelector(".js-nav-toggle");
  const nav = document.querySelector(".js-site-nav");
  const cartOpen = document.querySelectorAll(".js-cart-open");
  const cartClose = document.querySelector(".js-cart-close");
  const drawer = document.querySelector(".js-cart-drawer");

  const TRANSITION_OUT_MS = 480;
  const TRANSITION_IN_MS = 560;

  function closeNav() {
    nav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }

  navToggle?.addEventListener("click", () => {
    nav?.classList.toggle("is-open");
    const open = nav?.classList.contains("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!nav || !navToggle) return;
    if (window.matchMedia("(min-width: 601px)").matches) return;
    const t = e.target;
    if (t instanceof Node && !nav.contains(t) && !navToggle.contains(t)) {
      closeNav();
    }
  });

  function setCart(open) {
    drawer?.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  cartOpen.forEach((btn) => btn.addEventListener("click", () => setCart(true)));
  cartClose?.addEventListener("click", () => setCart(false));
  drawer?.querySelector(".cart-drawer__backdrop")?.addEventListener("click", () => setCart(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setCart(false);
      closeNav();
    }
  });

  /* —— Page transition overlay (internal .html navigations) —— */
  function ensureOverlay() {
    let el = document.getElementById("page-transition");
    if (!el) {
      el = document.createElement("div");
      el.id = "page-transition";
      el.className = "page-transition";
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
    }
    return el;
  }

  function shouldUsePageTransition(anchor) {
    if (!(anchor instanceof HTMLAnchorElement)) return false;
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
    let url;
    try {
      url = new URL(anchor.href);
    } catch {
      return false;
    }
    if (url.origin !== window.location.origin) return false;
    if (!url.pathname.endsWith(".html")) return false;
    return true;
  }

  function navigateWithOverlay(href) {
    const el = ensureOverlay();
    el.classList.remove("is-in", "is-in-done");
    el.classList.add("is-out");
    window.setTimeout(() => {
      window.location.href = href;
    }, TRANSITION_OUT_MS);
  }

  function runEnterTransition() {
    const el = ensureOverlay();
    el.classList.remove("is-out", "is-in", "is-in-done");
    void el.offsetWidth;
    el.classList.add("is-in");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        el.classList.add("is-in-done");
      });
    });
    const done = () => {
      el.classList.remove("is-in", "is-in-done");
      el.removeEventListener("transitionend", done);
    };
    el.addEventListener("transitionend", done, { once: true });
    window.setTimeout(done, TRANSITION_IN_MS + 120);
  }

  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (!a || !shouldUsePageTransition(a)) return;
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const url = new URL(a.href);
    if (url.href === window.location.href) return;
    e.preventDefault();
    navigateWithOverlay(a.href);
  });

  function bootEnterTransition() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runEnterTransition, { once: true });
    } else {
      runEnterTransition();
    }
  }

  bootEnterTransition();

  window.addEventListener("pageshow", (ev) => {
    if (ev.persisted) {
      runEnterTransition();
    }
  });
})();
