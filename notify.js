// notify.js — የማሳወቂያ ደወል። Call initBell(sb, me) after login. Needs ethcal.js and an element with id="who".
function initBell(sb, me) {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const css = document.createElement("style");
  css.textContent =
    ".bell{position:relative;background:none;border:1px solid #6f87ad;color:#fff;border-radius:4px;padding:.25rem .6rem;cursor:pointer;font:inherit}" +
    ".bell b{position:absolute;top:-8px;right:-8px;background:#d9480f;color:#fff;border-radius:99px;font-size:.7rem;min-width:18px;padding:0 4px;line-height:18px;text-align:center}" +
    "#nbox{position:fixed;top:56px;right:1rem;width:min(380px,calc(100% - 2rem));max-height:70vh;overflow:auto;background:#fff;color:#14233b;border:1px solid #c5d0e0;box-shadow:0 8px 24px rgba(18,41,74,.2);z-index:20}" +
    "#nbox a{display:block;padding:.7rem .9rem;border-bottom:1px solid #d5deea;color:inherit;text-decoration:none;font-size:.9rem}" +
    "#nbox a.un{background:#eaf0f8;font-weight:600}#nbox small{color:#5b6b84;font-weight:400}#nbox p{margin:0;padding:.9rem;color:#5b6b84}";
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.className = "bell"; btn.setAttribute("aria-label", "ማሳወቂያዎች"); btn.innerHTML = '🔔<b hidden>0</b>';
  const box = document.createElement("div"); box.id = "nbox"; box.hidden = true;
  document.body.appendChild(box);
  const who = document.getElementById("who");
  who.parentNode.insertBefore(btn, who);
  const badge = btn.querySelector("b");
  let items = [];

  const paint = () => {
    const n = items.filter((i) => !i.read_at).length;
    badge.textContent = n; badge.hidden = !n;
    box.innerHTML = items.length
      ? items.map((i) => `<a href="index.html?task=${i.task_id}" data-id="${i.id}" class="${i.read_at ? "" : "un"}">${esc(i.message)}<br><small>${EC.fmtTs(i.created_at)}</small></a>`).join("")
      : "<p>ማሳወቂያ የለም።</p>";
  };
  sb.from("notifications").select("*").eq("member_id", me.id).order("id", { ascending: false }).limit(30)
    .then(({ data }) => { items = data || []; paint(); });

  btn.onclick = () => { box.hidden = !box.hidden; };
  box.onclick = async (e) => {
    const a = e.target.closest("a"); if (!a) return;
    e.preventDefault();
    await sb.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", Number(a.dataset.id));
    location.href = a.href;
  };

  // ወዲያው መድረስ: new feedback appears without reloading the page.
  sb.channel("notif-" + me.id)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: "member_id=eq." + me.id },
      (p) => { items.unshift(p.new); paint(); if (typeof toast === "function") toast(p.new.message); })
    .subscribe();
}
