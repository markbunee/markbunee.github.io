(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const siteNav = document.querySelector("#site-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteHeader = document.querySelector(".site-header");

  const normalizeFile = (input) => {
    if (!input) return "";
    const raw = input.split("#")[0].split("?")[0];
    const cleaned = raw.replace(/\\/g, "/");
    const file = cleaned.split("/").filter(Boolean).pop() || "";
    return file.toLowerCase();
  };

  const currentPage = (() => {
    const file = normalizeFile(window.location.pathname);
    return file && file.length > 0 ? file : "index.html";
  })();

  document.querySelectorAll(".site-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const cleanHref = normalizeFile(href);
    if (cleanHref === currentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      siteNav.classList.toggle("open");
    });

    siteNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        siteNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const progress = document.querySelector(".scroll-progress");
  const updateProgress = () => {
    if (!progress) return;
    const scrollTop = window.scrollY;
    const full = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = full > 0 ? Math.min(scrollTop / full, 1) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };

  const updateHeaderState = () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle("is-compact", window.scrollY > 36);
  };

  updateProgress();
  updateHeaderState();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  const pageSections = [...document.querySelectorAll("main > section")];
  if (pageSections.length > 0) {
    if (!prefersReducedMotion) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("section-active", entry.isIntersecting);
          });
        },
        { threshold: 0.33, rootMargin: "-8% 0px -8% 0px" }
      );

      pageSections.forEach((section) => sectionObserver.observe(section));
    } else {
      pageSections.forEach((section) => section.classList.add("section-active"));
    }
  }

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (!prefersReducedMotion && revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -5% 0px" }
    );

    revealItems.forEach((item, idx) => {
      item.style.transitionDelay = `${Math.min(idx * 35, 220)}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("revealed"));
  }

  const counters = [...document.querySelectorAll("[data-count-to]")];
  if (counters.length > 0) {
    const runCounter = (el) => {
      if (el.dataset.animated === "true") return;
      el.dataset.animated = "true";

      const to = Number(el.dataset.countTo || 0);
      const duration = Number(el.dataset.countDuration || 1200);
      const decimals = Number(el.dataset.countDecimals || 0);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const start = performance.now();

      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = to * eased;
        el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.45 }
    );

    counters.forEach((c) => countObserver.observe(c));
  }

  const tiltCards = [...document.querySelectorAll(".tilt-card")];
  if (!prefersReducedMotion) {
    tiltCards.forEach((card) => {
      const max = 6;
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
        card.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  if (!prefersReducedMotion) {
    window.addEventListener(
      "pointermove",
      (event) => {
        document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
      },
      { passive: true }
    );
  }

  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
  if (!prefersReducedMotion && parallaxItems.length > 0) {
    const updateParallax = () => {
      const viewport = window.innerHeight;
      parallaxItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const delta = (center - viewport / 2) * -0.04;
        item.style.setProperty("--parallax", `${delta.toFixed(2)}px`);
      });
    };
    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
  }

  const internalLinks = [...document.querySelectorAll("a[href$='.html']")];
  internalLinks.forEach((link) => {
    if (link.hasAttribute("download")) return;
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = link.getAttribute("href");
      const targetFile = normalizeFile(target);
      if (!target || targetFile === currentPage) return;
      event.preventDefault();
      document.body.classList.add("is-leaving");
      window.setTimeout(() => {
        window.location.href = target;
      }, 230);
    });
  });

  const copyButtons = [...document.querySelectorAll("[data-copy-text]")];
  if (copyButtons.length > 0) {
    const fallbackCopy = (text) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    };

    const copyText = async (text) => {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return fallbackCopy(text);
    };

    copyButtons.forEach((button) => {
      const defaultLabel = (button.dataset.copyLabel || button.textContent || "").trim();
      button.addEventListener("click", async () => {
        const text = button.dataset.copyText || "";
        if (!text) return;

        let success = false;
        try {
          success = await copyText(text);
        } catch {
          success = false;
        }

        button.classList.remove("is-copied", "is-error");
        button.classList.add(success ? "is-copied" : "is-error");
        button.textContent = success ? "已复制" : "复制失败";

        window.setTimeout(() => {
          button.classList.remove("is-copied", "is-error");
          button.textContent = defaultLabel;
        }, 1400);
      });
    });
  }

  const certDecks = [...document.querySelectorAll("[data-cert-deck]")];
  if (certDecks.length > 0) {
    certDecks.forEach((deck) => {
      const cards = [...deck.querySelectorAll(".cert-deck-card")];
      if (cards.length === 0) return;
      const deckWrap = deck.closest(".cert-stack-wrap");
      const indexEl = deckWrap ? deckWrap.querySelector("[data-cert-index]") : null;
      const totalEl = deckWrap ? deckWrap.querySelector("[data-cert-total]") : null;

      let topIndex = 0;
      if (totalEl) totalEl.textContent = String(cards.length);

      const applyDeckState = () => {
        cards.forEach((card, i) => {
          const relative = (i - topIndex + cards.length) % cards.length;
          card.classList.remove("is-top", "is-peek-1", "is-peek-2", "is-peek-3", "is-hidden");
          if (relative === 0) card.classList.add("is-top");
          else if (relative === 1) card.classList.add("is-peek-1");
          else if (relative === 2) card.classList.add("is-peek-2");
          else if (relative === 3) card.classList.add("is-peek-3");
          else card.classList.add("is-hidden");
        });
        if (indexEl) indexEl.textContent = String(topIndex + 1);
      };

      const nextCard = () => {
        topIndex = (topIndex + 1) % cards.length;
        applyDeckState();
      };

      cards.forEach((card) => {
        card.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          nextCard();
        });
      });

      applyDeckState();
    });
  }
})();
