/* =========================================================
   Neftoo · site interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- scroll progress + header state ---------- */
  const progress = $(".scroll-progress");
  const header = $(".site-header");

  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    if (progress) progress.style.width = (ratio * 100).toFixed(2) + "%";
    if (header) header.classList.toggle("is-scrolled", doc.scrollTop > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- mobile nav ---------- */
  const toggle = $(".menu-toggle");
  const nav = $("#site-nav");

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "关闭" : "菜单";
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => {
      if (e.target instanceof Element && e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- current page highlight ---------- */
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$(".site-nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (href && href === here) a.setAttribute("aria-current", "page");
  });

  /* ---------- reveal on scroll ---------- */
  const revealItems = $$("[data-reveal]");
  if (revealItems.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.delay || 0);
          setTimeout(() => el.classList.add("is-in"), delay);
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- copy to clipboard ---------- */
  const copy = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      /* fall through */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (err) {
      return false;
    }
  };

  $$("[data-copy-text]").forEach((btn) => {
    const label = btn.dataset.copyLabel || "复制";
    const original = btn.textContent.trim();
    btn.addEventListener("click", async () => {
      const ok = await copy(btn.dataset.copyText || "");
      btn.textContent = ok ? "已复制" : "复制失败";
      btn.classList.toggle("is-done", ok);
      setTimeout(() => {
        btn.textContent = original || label;
        btn.classList.remove("is-done");
      }, 1800);
    });
  });

  /* ---------- product matrix filter ---------- */
  const filterBar = $("[data-filters]");
  if (filterBar) {
    const cards = $$("[data-cat]");
    filterBar.addEventListener("click", (event) => {
      const btn = event.target instanceof Element ? event.target.closest("button[data-filter]") : null;
      if (!btn) return;
      const value = btn.dataset.filter;
      $$("button[data-filter]", filterBar).forEach((b) =>
        b.setAttribute("aria-pressed", String(b === btn))
      );
      cards.forEach((card) => {
        const match = value === "all" || card.dataset.cat === value;
        card.classList.toggle("is-hidden", !match);
      });
    });
  }

  /* =========================================================
     Markdown
     ========================================================= */
  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const inline = (value) => {
    let text = escapeHtml(value);
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
    text = text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
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

    const flushCode = () => {
      const code = escapeHtml(codeBuf.join("\n"));
      const lang = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : "";
      html += `<pre><code${lang}>${code}</code></pre>`;
      inCode = false;
      codeLang = "";
      codeBuf = [];
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
          flushCode();
        }
        return;
      }

      if (inCode) {
        codeBuf.push(line);
        return;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        closeList();
        const level = Math.min(heading[1].length, 4);
        html += `<h${level}>${inline(heading[2])}</h${level}>`;
        return;
      }

      if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
        closeList();
        html += "<hr />";
        return;
      }

      const quote = line.match(/^>\s?(.*)$/);
      if (quote) {
        closeList();
        html += `<blockquote><p>${inline(quote[1])}</p></blockquote>`;
        return;
      }

      const ul = line.match(/^\s*[-*+]\s+(.+)$/);
      if (ul) {
        if (listMode !== "ul") {
          closeList();
          listMode = "ul";
          html += "<ul>";
        }
        html += `<li>${inline(ul[1])}</li>`;
        return;
      }

      const ol = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (ol) {
        if (listMode !== "ol") {
          closeList();
          listMode = "ol";
          html += "<ol>";
        }
        html += `<li>${inline(ol[1])}</li>`;
        return;
      }

      if (line.trim().length === 0) {
        closeList();
        return;
      }

      closeList();
      html += `<p>${inline(line)}</p>`;
    });

    closeList();
    if (inCode) flushCode();
    return html;
  };

  /* =========================================================
     Blog loading
     ========================================================= */
  const normalizePath = (v) => String(v || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const joinPath = (base, file) => `${String(base || "").replace(/\/+$/, "")}/${normalizePath(file)}`;

  const readHash = () => {
    const hash = (location.hash || "").replace(/^#/, "");
    const m = hash.match(/(?:^|&)p=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  };

  const writeHash = (file) => {
    const next = `#p=${encodeURIComponent(file)}`;
    if (location.hash !== next) history.replaceState(null, "", next);
  };

  const estimate = (text) => Math.max(1, Math.round(String(text || "").replace(/\s/g, "").length / 400));

  const loadIndex = async (url) => {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const posts = Array.isArray(data) ? data : data.posts || [];
    return posts
      .filter((p) => p && p.file)
      .map((p) => ({
        title: p.title || p.file,
        file: normalizePath(p.file),
        date: p.date || "",
        tags: Array.isArray(p.tags) ? p.tags : [],
        summary: p.summary || "",
      }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  };

  /* --- full reader (blog.html) --- */
  const shell = $("[data-blog]");
  if (shell) {
    const indexUrl = shell.dataset.blogIndex || "./blog_file/index.json";
    const root = shell.dataset.blogRoot || "./blog_file";
    const listEl = $("[data-post-list]", shell);
    const titleEl = $("[data-post-title]", shell);
    const metaEl = $("[data-post-meta]", shell);
    const contentEl = $("[data-post-content]", shell);

    let posts = [];

    const renderList = (active) => {
      if (!listEl) return;
      listEl.innerHTML = "";
      posts.forEach((post) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.file = post.file;
        btn.setAttribute("aria-current", String(post.file === active));
        btn.innerHTML =
          `<span class="t">${escapeHtml(post.title)}</span>` +
          `<span class="m">${escapeHtml(post.date || "—")}${
            post.tags.length ? " · " + escapeHtml(post.tags.join(" / ")) : ""
          }</span>`;
        btn.addEventListener("click", () => open(post));
        li.appendChild(btn);
        listEl.appendChild(li);
      });
    };

    const markActive = (file) => {
      if (!listEl) return;
      $$("button[data-file]", listEl).forEach((b) =>
        b.setAttribute("aria-current", String(b.dataset.file === file))
      );
    };

    const open = async (post) => {
      markActive(post.file);
      if (titleEl) titleEl.textContent = post.title;
      if (metaEl) metaEl.textContent = post.date || "";
      if (contentEl) contentEl.innerHTML = '<p class="muted">载入中…</p>';
      window.scrollTo({ top: 0, behavior: "auto" });

      try {
        const res = await fetch(joinPath(root, post.file), { cache: "no-cache" });
        if (!res.ok) throw new Error(String(res.status));
        const md = await res.text();
        if (contentEl) contentEl.innerHTML = markdownToHtml(md);
        if (metaEl) {
          metaEl.textContent = [post.date, `${estimate(md)} min read`]
            .concat(post.tags.length ? [post.tags.join(" / ")] : [])
            .join(" · ");
        }
        writeHash(post.file);
      } catch (err) {
        if (contentEl) {
          contentEl.innerHTML =
            '<p class="muted">文章加载失败。请通过 HTTP 服务访问本站（不要直接双击打开 file://），并确认 blog_file/index.json 中的文件名与实际一致。</p>';
        }
      }
    };

    loadIndex(indexUrl)
      .then((list) => {
        posts = list;
        if (!posts.length) throw new Error("empty");
        const wanted = readHash();
        const first = posts.find((p) => p.file === wanted) || posts[0];
        renderList(first.file);
        open(first);
      })
      .catch(() => {
        if (listEl) listEl.innerHTML = '<li class="muted" style="padding:16px 0">文章索引加载失败</li>';
        if (contentEl) {
          contentEl.innerHTML = '<p class="muted">无法读取 blog_file/index.json，请确认文件存在并通过 HTTP 服务访问。</p>';
        }
      });
  }

  /* --- latest posts (home) --- */
  const latest = $("[data-latest]");
  if (latest) {
    const indexUrl = latest.dataset.blogIndex || "./blog_file/index.json";
    const limit = Number(latest.dataset.limit || 3);
    loadIndex(indexUrl)
      .then((posts) => {
        const picked = posts.slice(0, limit);
        latest.innerHTML = picked
          .map(
            (p) =>
              `<a href="./blog.html#p=${encodeURIComponent(p.file)}">` +
              `<span class="d">${escapeHtml(p.date || "")}</span>` +
              `<span class="t">${escapeHtml(p.title)}</span>` +
              `<span class="x">${escapeHtml(p.summary || "阅读全文")}</span>` +
              `</a>`
          )
          .join("");
      })
      .catch(() => {
        latest.innerHTML = '<a href="./blog.html"><span class="t">前往博客</span></a>';
      });
  }

  /* ---------- footer year ---------- */
  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
