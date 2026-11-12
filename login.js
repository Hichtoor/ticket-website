/* login.js — front-end validation only.
   Backend hook: define window.handleLogin(credentials) -> Promise to call your API. */
(function () {
  "use strict";
  var form = document.getElementById("loginForm");
  var msg = document.getElementById("formMsg");

  var rules = {
    identifier: function (v) {
      v = v.trim();
      return /^09\d{9}$/.test(v) || /^\S+@\S+\.\S+$/.test(v) ? "" : "شماره موبایل (۰۹…) یا ایمیل معتبر وارد کنید.";
    },
    password: function (v) { return v.length >= 6 ? "" : "رمز عبور باید حداقل ۶ کاراکتر باشد."; }
  };

  function check(input) {
    var m = rules[input.name](input.value);
    input.setAttribute("aria-invalid", m ? "true" : "false");
    document.getElementById("err-" + input.name).textContent = m;
    return !m;
  }

  form.addEventListener("blur", function (e) { if (rules[e.target.name]) check(e.target); }, true);

  document.getElementById("pwToggle").addEventListener("click", function () {
    var pw = document.getElementById("l-pw"), show = pw.type === "password";
    pw.type = show ? "text" : "password";
    this.textContent = show ? "پنهان" : "نمایش";
    this.setAttribute("aria-pressed", show);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.hidden = true;
    var fields = [form.identifier, form.password];
    var ok = fields.map(check).every(Boolean);
    if (!ok) { fields.find(function (f) { return f.getAttribute("aria-invalid") === "true"; }).focus(); return; }

    var creds = { identifier: form.identifier.value.trim(), password: form.password.value, remember: form.remember.checked };
    var done = function (text) { msg.textContent = text; msg.hidden = false; };
    if (typeof window.handleLogin === "function") {
      window.handleLogin(creds).then(function () { window.location.href = "index.html"; })
        .catch(function () { done("ورود ناموفق بود. اطلاعات را بررسی کنید."); });
    } else {
      done("اطلاعات معتبر است. برای ورود واقعی، سرویس احراز هویت را به window.handleLogin متصل کنید.");
    }
  });
})();
const section1=document.getElementById("section1");
const section2=document.getElementById("section2");
const linker1=document.getElementById("linker1");
const linker2=document.getElementById("linker2");
function transition(){
  linker1.addEventListener("click",function(){
    section1.style.zIndex=1;
    section1.style.opacity=0;
    section2.style.zIndex=2;
    section2.style.opacity=1;
  });
};
function retransition(){
  linker2.addEventListener("click",function(){
    section1.style.zIndex=2;
    section1.style.opacity=1;
    section2.style.zIndex=1;
    section2.style.opacity=0;

  })
}
transition();
retransition();