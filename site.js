"use strict";
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("site-nav");
function closeMenu() {nav.classList.remove("open");menuToggle.setAttribute("aria-expanded", "false");menuToggle.setAttribute("aria-label", "Open navigation");}
menuToggle.addEventListener("click", () => {const open = nav.classList.toggle("open");menuToggle.setAttribute("aria-expanded", String(open));menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");});
nav.addEventListener("click", e => {if (e.target.closest("a")) closeMenu();});
document.addEventListener("keydown", e => {if (e.key === "Escape" && nav.classList.contains("open")) {closeMenu();menuToggle.focus();}});
document.addEventListener("click", e => {if (!e.target.closest(".site-header")) closeMenu();});
const themeButton = document.getElementById("theme-toggle");
function applyTheme(theme) {document.documentElement.dataset.theme = theme;themeButton.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#141d1a" : "#f7f8f4";}
try {const saved = localStorage.getItem("rakib-theme");applyTheme(saved === "dark" || saved === "light" ? saved : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));} catch {applyTheme("light");}
themeButton.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  const update = () => {applyTheme(theme);try {localStorage.setItem("rakib-theme", theme);} catch { /* Optional persistence. */ }};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !reduced) {
    try {document.startViewTransition(update);} catch {update();}
  } else {update();document.documentElement.animate([{opacity:.85},{opacity:1}],{duration:reduced?120:300,easing:"ease-out"});}
});
document.getElementById("copy-email")?.addEventListener("click", async () => {
  const status = document.getElementById("copy-status");
  try {await navigator.clipboard.writeText("iftakherahmedrakib09@gmail.com");status.textContent = "Email copied. Thanks for reaching out!";} catch {status.textContent = "Select the email address below to copy it, or choose Get in touch.";}
});
const year = document.getElementById("year"); if (year) year.textContent = new Date().getFullYear();
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {entries.forEach(entry => {if (entry.isIntersecting) {nav.querySelectorAll("a").forEach(a => {const active = a.hash === `#${entry.target.id}`;a.classList.toggle("current", active);if (active) a.setAttribute("aria-current", "location");else a.removeAttribute("aria-current");});}});}, {rootMargin: "-18% 0px -60% 0px"});
  document.querySelectorAll("main section[id]").forEach(section => observer.observe(section));
}
