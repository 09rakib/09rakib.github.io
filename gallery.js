"use strict";
const grid=document.getElementById("project-grid"),count=document.getElementById("project-count");
count.textContent="4 projects";
document.querySelectorAll(".filter").forEach(button=>button.addEventListener("click",()=>{
 if(window.portfolioMotion){window.portfolioMotion.filterProjects(button);return;}
 let visible=0;
 document.querySelectorAll(".filter").forEach(b=>{const active=b===button;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
 grid.querySelectorAll(".project-card").forEach(card=>{card.hidden=button.dataset.filter!=="all"&&card.dataset.category!==button.dataset.filter;if(!card.hidden)visible++;});
 count.textContent=`${visible} project${visible===1?"":"s"}`;
}));
const galleries=JSON.parse(document.getElementById("gallery-data").textContent);
const gallery=document.getElementById("gallery-dialog");
let currentGallery=null,currentIndex=0;
function showScreenshot(index){
 currentIndex=(index+currentGallery.images.length)%currentGallery.images.length;
 const [file,alt,caption]=currentGallery.images[currentIndex],image=document.getElementById("gallery-image");
 image.src=`assets/screenshots/${file}`;image.alt=alt;
 document.dispatchEvent(new CustomEvent("portfolio:image",{detail:{image}}));
 document.getElementById("gallery-caption").textContent=caption;
 document.getElementById("gallery-position").textContent=`${currentIndex+1} / ${currentGallery.images.length}`;
}
document.querySelectorAll("[data-gallery]").forEach(button=>button.addEventListener("click",()=>{
 currentGallery=galleries[button.dataset.gallery];document.getElementById("gallery-title").textContent=currentGallery.title;showScreenshot(Number(button.dataset.index||0));gallery.showModal();document.body.classList.add("dialog-open");document.getElementById("close-gallery").focus();
}));
function closeGallery(){if(window.portfolioMotion){window.portfolioMotion.closeGallery();}else gallery.close();}
document.getElementById("close-gallery").addEventListener("click",closeGallery);
gallery.addEventListener("cancel",event=>{event.preventDefault();closeGallery();});
document.getElementById("gallery-prev").addEventListener("click",()=>showScreenshot(currentIndex-1));
document.getElementById("gallery-next").addEventListener("click",()=>showScreenshot(currentIndex+1));
gallery.addEventListener("keydown",event=>{if(event.key==="ArrowRight"){event.preventDefault();showScreenshot(currentIndex+1);}if(event.key==="ArrowLeft"){event.preventDefault();showScreenshot(currentIndex-1);}});
gallery.addEventListener("close",()=>document.body.classList.remove("dialog-open"));
gallery.addEventListener("click",event=>{if(event.target===gallery){const r=gallery.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeGallery();}});
let draftResetTimer;
document.getElementById("contact-form").addEventListener("submit",async event=>{
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const submit=form.querySelector('button[type="submit"]'),original=submit.dataset.idleLabel||submit.textContent;
 submit.dataset.idleLabel=original;clearTimeout(draftResetTimer);
 if(submit.disabled)return;
 submit.disabled=true;submit.setAttribute("aria-busy","true");submit.textContent="Preparing draft…";
 await new Promise(resolve=>setTimeout(resolve,320));
 const name=form.elements.name.value.trim(),email=form.elements.email.value.trim(),message=form.elements.message.value.trim();
 const body=`Hello Rakib,\n\n${message}\n\nFrom: ${name}\nReply email: ${email}`;
 const link=document.getElementById("email-draft-link");
 link.href=`mailto:iftakherahmedrakib09@gmail.com?subject=${encodeURIComponent(`Portfolio inquiry from ${name}`)}&body=${encodeURIComponent(body)}`;
 link.hidden=false;document.getElementById("form-status").textContent="Draft prepared below. Open it in your email app, review it, and press Send there.";submit.disabled=false;submit.removeAttribute("aria-busy");submit.dataset.state="ready";submit.textContent="Draft ready ✓";link.focus();
 draftResetTimer=setTimeout(()=>{submit.textContent=original;delete submit.dataset.state;},2200);
});
