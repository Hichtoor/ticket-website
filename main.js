/* main.js — client-side behavior only. Backend hook: window.submitOrder(order) */
(function () {
  "use strict";
  var MAX_PER_ORDER = 6;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var events = window.EVENTS || [];
  var cart = {}; // id -> qty
  var filter = { cat: "all", q: "" };

  /* ---------- formatters (Western digits, Jalali dates) ---------- */
  var fmtDay = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", { day: "numeric" });
  var fmtMonth = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", { month: "long" });
  var fmtWeek = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", { weekday: "long" });
  var money = function (n) { return n ? n.toLocaleString("en-US") + " تومان" : "رایگان"; };
  var byId = function (id) { return events.find(function (e) { return e.id === id; }); };
  var timeOf = function (e) { return new Date(e.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };

  /* ---------- ticket card markup ---------- */
  function ticketHTML(e) {
    var d = new Date(e.date);
    var stock = e.left === 0 ? '<span class="ticket__left is-out">ظرفیت تکمیل شد</span>'
      : e.left <= 20 ? '<span class="ticket__left is-low">فقط ' + e.left + ' بلیت باقی مانده</span>'
      : '<span class="ticket__left">' + e.left + ' بلیت موجود</span>';
    return '<article class="ticket" data-id="' + e.id + '">' +
      '<div class="ticket__main"><div class="ticket__date" aria-hidden="true"><b>' + fmtDay.format(d) + '</b><span>' + fmtMonth.format(d) + '</span></div>' +
      '<div class="ticket__body"><span class="tag">' + e.category + '</span><h3>' + e.title + '</h3>' +
      '<p class="ticket__meta">' + fmtWeek.format(d) + '، ساعت <bdi>' + timeOf(e) + '</bdi><br>' + e.venue + '</p>' + stock + '</div></div>' +
      '<div class="ticket__stub"><div class="price' + (e.price ? '' : ' is-free') + '">' + (e.price ? e.price.toLocaleString("en-US") + ' <small>تومان</small>' : 'رایگان') + '</div>' +
      '<div data-action></div></div></article>';
  }

  function actionHTML(e) {
    var q = cart[e.id] || 0;
    if (e.left === 0) return '<button class="btn" disabled>ناموجود</button>';
    if (!q) return '<button class="btn" data-add="' + e.id + '">افزودن بلیت</button>';
    var max = Math.min(MAX_PER_ORDER, e.left);
    return '<div class="stepper" role="group" aria-label="تعداد بلیت">' +
      '<button data-inc="' + e.id + '" aria-label="افزایش تعداد"' + (q >= max ? " disabled" : "") + '>+</button>' +
      '<output aria-live="polite">' + q + '</output>' +
      '<button data-dec="' + e.id + '" aria-label="کاهش تعداد">−</button></div>';
  }

  function refreshActions() {
    document.querySelectorAll(".ticket").forEach(function (card) {
      var e = byId(card.dataset.id), slot = $("[data-action]", card);
      if (e && slot) slot.innerHTML = actionHTML(e);
    });
  }

  /* ---------- hero (featured event + countdown) ---------- */
  var featured = events.find(function (e) { return e.featured; }) || events[0];
  function renderHero() {
    if (!featured) return;
    $("#featuredTicket").innerHTML = ticketHTML(featured);
    refreshActions();
  }
  function tick() {
    if (!featured) return;
    var diff = Math.max(0, new Date(featured.date) - Date.now()), s = Math.floor(diff / 1000);
    var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    Object.keys(v).forEach(function (k) { var el = $("[data-cd='" + k + "']"); if (el) el.textContent = String(v[k]).padStart(2, "0"); });
  }

  /* ---------- events grid, chips, search ---------- */
  function renderChips() {
    var cats = ["all"].concat(events.map(function (e) { return e.category; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
    $("#chips").innerHTML = cats.map(function (c) {
      return '<button class="chip" data-cat="' + c + '" aria-pressed="' + (c === filter.cat) + '">' + (c === "all" ? "همه رویدادها" : c) + '</button>';
    }).join("");
  }
  function renderGrid() {
    var list = events.filter(function (e) {
      return (filter.cat === "all" || e.category === filter.cat) && (e.title + e.venue + e.category).indexOf(filter.q) !== -1;
    });
    $("#eventGrid").innerHTML = list.map(ticketHTML).join("");
    $("#emptyState").hidden = list.length > 0;
    refreshActions();
  }

  /* ---------- cart ---------- */
  function total() {
    return Object.keys(cart).reduce(function (t, id) { return t + byId(id).price * cart[id]; }, 0);
  }
  function count() { return Object.keys(cart).reduce(function (n, id) { return n + cart[id]; }, 0); }
  function setQty(id, q) {
    var e = byId(id), max = Math.min(MAX_PER_ORDER, e.left);
    q = Math.max(0, Math.min(q, max));
    if (q) cart[id] = q; else delete cart[id];
    refreshActions(); renderCart();
    var badge = $("#cartCount"); badge.textContent = count();
    badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
  }
  function renderCart() {
    var ids = Object.keys(cart), empty = !ids.length;
    $("#cartEmpty").hidden = !empty;
    $("#cartFilled").hidden = empty;
    $("#cartLines").innerHTML = ids.map(function (id) {
      var e = byId(id);
      return '<div class="line"><div><b>' + e.title + '</b><small>' + cart[id] + ' × ' + money(e.price) + '</small></div>' +
        '<button type="button" data-remove="' + id + '">حذف</button></div>';
    }).join("");
    $("#cartTotal").textContent = money(total());
  }

  /* ---------- drawer ---------- */
  var drawer = $("#cartDrawer"), overlay = $("#overlay"), lastFocus;
  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open"); overlay.classList.add("is-open");
    $("#cartBtn").setAttribute("aria-expanded", "true");
    $("#drawerClose").focus();
  }
  function closeDrawer() {
    drawer.classList.remove("is-open"); overlay.classList.remove("is-open");
    $("#cartBtn").setAttribute("aria-expanded", "false");
    if (lastFocus) lastFocus.focus();
  }
  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("is-show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("is-show"); }, 2200);
  }

  /* ---------- checkout form (front-end validation only) ---------- */
  var rules = {
    name: function (v) { return v.trim().length >= 3 ? "" : "نام و نام خانوادگی را کامل وارد کنید."; },
    phone: function (v) { return /^09\d{9}$/.test(v.trim()) ? "" : "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد."; },
    email: function (v) { return !v.trim() || /^\S+@\S+\.\S+$/.test(v.trim()) ? "" : "ایمیل واردشده معتبر نیست."; }
  };
  function validateField(input) {
    var msg = rules[input.name](input.value);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    $("#err-" + input.name).textContent = msg;
    return !msg;
  }
  function submitOrder(order) {
    // Backend plug-in point: replace with fetch() to your payment gateway.
    if (typeof window.submitOrder === "function") window.submitOrder(order);
    return "TH-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  /* ---------- events wiring ---------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("button"); if (!t) return;
    var d = t.dataset;
    if (d.add) { setQty(d.add, 1); toast("بلیت به سبد اضافه شد"); }
    else if (d.inc) setQty(d.inc, (cart[d.inc] || 0) + 1);
    else if (d.dec) setQty(d.dec, (cart[d.dec] || 0) - 1);
    else if (d.remove) setQty(d.remove, 0);
    else if (d.cat) { filter.cat = d.cat; renderChips(); renderGrid(); }
    else if (t.id === "cartBtn") openDrawer();
    else if (t.id === "drawerClose" || t.id === "successClose") closeDrawer();
    if (d.add || d.inc || d.dec) {
      var again = $("[data-" + (d.add ? "inc" : d.inc ? "inc" : "dec") + "='" + (d.add || d.inc || d.dec) + "']");
      if (again && !again.disabled) again.focus();
    }
  });
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  $("#search").addEventListener("input", function (e) { filter.q = e.target.value.trim(); renderGrid(); });
  window.addEventListener("scroll", function () { $("#siteHeader").classList.toggle("is-scrolled", window.scrollY > 8); }, { passive: true });

  $("#checkoutForm").addEventListener("blur", function (e) { if (e.target.name) validateField(e.target); }, true);
  $("#checkoutForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var inputs = Array.prototype.slice.call(this.querySelectorAll("input"));
    var ok = inputs.map(validateField).every(Boolean);
    if (!ok) { inputs.find(function (i) { return i.getAttribute("aria-invalid") === "true"; }).focus(); return; }
    var code = submitOrder({
      customer: { name: this.name.value.trim(), phone: this.phone.value.trim(), email: this.email.value.trim() },
      items: Object.keys(cart).map(function (id) { return { id: id, qty: cart[id] }; }),
      total: total()
    });
    $("#orderCode").textContent = code;
    $("#cartFilled").hidden = true; $("#orderSuccess").hidden = false;
    cart = {}; $("#cartCount").textContent = 0; refreshActions(); this.reset();
  });
  $("#successClose").addEventListener("click", function () { $("#orderSuccess").hidden = true; renderCart(); });

  /* ---------- init ---------- */
  renderHero(); renderChips(); renderGrid(); renderCart(); tick();
  setInterval(tick, 1000);
})();
const myselect=document.getElementById("myselect_header_option");
myselect.addEventListener("change",function(){
  if(this.value){
    document.getElementById(this.value).scrollIntoView({
      behavior:"smooth"
    });
  }
});