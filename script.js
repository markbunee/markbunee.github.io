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

  const blogShell = document.querySelector("[data-blog-index][data-blog-root]");
  if (blogShell) {
    const indexUrl = blogShell.dataset.blogIndex || "";
    const root = blogShell.dataset.blogRoot || "";
    const listEl = blogShell.querySelector("[data-blog-list]");
    const titleEl = blogShell.querySelector("[data-blog-title]");
    const metaEl = blogShell.querySelector("[data-blog-meta]");
    const contentEl = blogShell.querySelector("[data-blog-content]");

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const formatInline = (value) => {
      let text = escapeHtml(value);
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
      text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      return text;
    };

    const markdownToHtml = (md) => {
      const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
      let html = "";
      let inCode = false;
      let codeLang = "";
      let codeBuf = [];
      let listMode = "";

      const closeList = () => {
        if (!listMode) return;
        html += listMode === "ol" ? "</ol>" : "</ul>";
        listMode = "";
      };

      lines.forEach((raw) => {
        const line = raw || "";

        const fence = line.match(/^```\s*([^\s`]+)?\s*$/);
        if (fence) {
          if (!inCode) {
            closeList();
            inCode = true;
            codeLang = fence[1] || "";
            codeBuf = [];
          } else {
            const code = escapeHtml(codeBuf.join("\n"));
            const langClass = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : "";
            html += `<pre><code${langClass}>${code}</code></pre>`;
            inCode = false;
            codeLang = "";
            codeBuf = [];
          }
          return;
        }

        if (inCode) {
          codeBuf.push(line);
          return;
        }

        const heading = line.match(/^(#{1,3})\s+(.+)$/);
        if (heading) {
          closeList();
          const level = heading[1].length;
          html += `<h${level}>${formatInline(heading[2])}</h${level}>`;
          return;
        }

        const quote = line.match(/^>\s?(.+)$/);
        if (quote) {
          closeList();
          html += `<blockquote><p>${formatInline(quote[1])}</p></blockquote>`;
          return;
        }

        const ul = line.match(/^-\s+(.+)$/);
        if (ul) {
          if (listMode !== "ul") {
            closeList();
            listMode = "ul";
            html += "<ul>";
          }
          html += `<li>${formatInline(ul[1])}</li>`;
          return;
        }

        const ol = line.match(/^\d+\.\s+(.+)$/);
        if (ol) {
          if (listMode !== "ol") {
            closeList();
            listMode = "ol";
            html += "<ol>";
          }
          html += `<li>${formatInline(ol[1])}</li>`;
          return;
        }

        if (line.trim().length === 0) {
          closeList();
          return;
        }

        closeList();
        html += `<p>${formatInline(line)}</p>`;
      });

      closeList();
      if (inCode) {
        const code = escapeHtml(codeBuf.join("\n"));
        const langClass = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : "";
        html += `<pre><code${langClass}>${code}</code></pre>`;
      }

      return html;
    };

    const normalizePath = (value) => String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
    const joinPath = (base, file) => `${String(base || "").replace(/\/+$/, "")}/${normalizePath(file)}`;

    const getHashFile = () => {
      const hash = (window.location.hash || "").replace(/^#/, "");
      const match = hash.match(/(?:^|&)blog=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : "";
    };

    const setHashFile = (file) => {
      const next = `#blog=${encodeURIComponent(file)}`;
      if (window.location.hash !== next) window.history.replaceState(null, "", next);
    };

    const renderList = (posts, activeFile) => {
      if (!listEl) return;
      listEl.innerHTML = "";

      posts.forEach((post) => {
        const file = normalizePath(post.file || "");
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.blogFile = file;
        btn.setAttribute("aria-current", String(file === activeFile));

        const t = document.createElement("div");
        t.className = "blog-post-title";
        t.textContent = post.title || file || "Untitled";

        const m = document.createElement("div");
        m.className = "blog-post-meta";
        m.textContent = [post.date, post.summary].filter(Boolean).join(" · ");

        btn.appendChild(t);
        btn.appendChild(m);
        li.appendChild(btn);
        listEl.appendChild(li);
      });
    };

    const setActiveButton = (activeFile) => {
      if (!listEl) return;
      listEl.querySelectorAll("button[data-blog-file]").forEach((btn) => {
        btn.setAttribute("aria-current", String(btn.dataset.blogFile === activeFile));
      });
    };

    const loadPost = async (post) => {
      const file = normalizePath(post.file || "");
      if (!file || !contentEl || !titleEl || !metaEl) return;

      setActiveButton(file);
      titleEl.textContent = post.title || file;
      metaEl.textContent = [post.date, post.tags && post.tags.length ? post.tags.join(" / ") : ""].filter(Boolean).join(" · ");
      contentEl.textContent = "加载中…";

      try {
        const res = await fetch(joinPath(root, file), { cache: "no-cache" });
        if (!res.ok) throw new Error(String(res.status));
        const md = await res.text();
        contentEl.innerHTML = markdownToHtml(md);
        setHashFile(file);
      } catch {
        contentEl.textContent = "加载失败：请检查 blog_file/index.json 与对应 Markdown 文件是否存在，并确保在 HTTP 服务下访问页面。";
      }
    };

    const loadIndex = async () => {
      if (!indexUrl || !listEl || !contentEl || !titleEl || !metaEl) return;

      try {
        const res = await fetch(indexUrl, { cache: "no-cache" });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const posts = Array.isArray(data) ? data : Array.isArray(data.posts) ? data.posts : [];
        const normalized = posts
          .map((p) => ({
            title: p.title || "",
            file: normalizePath(p.file || ""),
            date: p.date || "",
            tags: Array.isArray(p.tags) ? p.tags : [],
            summary: p.summary || "",
          }))
          .filter((p) => p.file.length > 0);

        const hashFile = normalizePath(getHashFile());
        const initial = normalized.find((p) => p.file === hashFile) || normalized[0];

        renderList(normalized, initial ? initial.file : "");

        if (!initial) {
          titleEl.textContent = "暂无文章";
          metaEl.textContent = "";
          contentEl.textContent = "在 blog_file/index.json 里添加文章索引即可显示。";
          return;
        }

        await loadPost(initial);

        listEl.addEventListener("click", (event) => {
          const target = event.target instanceof Element ? event.target.closest("button[data-blog-file]") : null;
          if (!target) return;
          const file = normalizePath(target.dataset.blogFile || "");
          const selected = normalized.find((p) => p.file === file);
          if (selected) loadPost(selected);
        });

        window.addEventListener("hashchange", () => {
          const file = normalizePath(getHashFile());
          if (!file) return;
          const selected = normalized.find((p) => p.file === file);
          if (selected) loadPost(selected);
        });
      } catch {
        if (listEl) listEl.innerHTML = "";
        titleEl.textContent = "Blog 未配置";
        metaEl.textContent = "";
        contentEl.textContent = "未能读取 ./blog_file/index.json：请创建 blog_file 目录与 index.json，并确保通过 HTTP 服务访问（直接双击打开可能会被浏览器拦截 fetch）。";
      }
    };

    loadIndex();
  }
})();
