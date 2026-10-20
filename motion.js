"use strict";
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia("(hover: hover) and (pointer: fine)");
  const easing = "cubic-bezier(.22,1,.36,1)";
  const clamp = (value,min=0,max=1) => Math.min(max,Math.max(min,value));
  const animate = (element,frames,options={}) => element.animate(frames,{duration:reduced.matches?120:450,easing,...options});
  const root = document.documentElement;
  root.classList.add("motion-ready");

  // Reserve all geometry in CSS. Reveal effects never change document flow.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    }),{threshold:.08,rootMargin:"0px 0px -24px 0px"});
    const elements = document.querySelectorAll("main h2,.section-heading>p,.project-card,.screenshot-thumb,.supporting-info,.skills-grid article,.capability,.timeline h3,.experience-achievements li,.case-features li,.challenge-grid article,.case-overview>p,.case-meta>div,.case-result>p:not(.eyebrow)");
    elements.forEach((element,index) => {
      element.dataset.reveal="";
      element.style.setProperty("--reveal-delay",`${(index%4)*70}ms`);
      observer.observe(element);
    });
    document.querySelectorAll("main .eyebrow").forEach(element=>observer.observe(element));
  }

  // A single, accessible copy of the focus text; the duplicate is decorative.
  const focusStrip=document.querySelector(".specialties"), focusText=focusStrip?.querySelector("p");
  if(focusText){
    const viewport=document.createElement("div"),track=document.createElement("div");
    viewport.className="marquee-window";track.className="marquee-track";
    focusText.before(viewport);viewport.append(track);track.append(focusText);
    const clone=focusText.cloneNode(true);clone.setAttribute("aria-hidden","true");clone.inert=true;track.append(clone);
    const pause=document.createElement("button");pause.type="button";pause.className="marquee-toggle";
    pause.textContent="Ⅱ";pause.setAttribute("aria-label","Pause focus strip");pause.setAttribute("aria-pressed","false");
    pause.addEventListener("click",()=>{const paused=focusStrip.classList.toggle("is-paused");pause.textContent=paused?"▷":"Ⅱ";pause.setAttribute("aria-pressed",String(paused));pause.setAttribute("aria-label",paused?"Play focus strip":"Pause focus strip");});
    focusStrip.querySelector(".specialties-inner").append(pause);
  }

  const art=document.querySelector(".hero-art"),portrait=document.querySelector(".portrait-frame");
  if(art){const motif=document.createElement("span");motif.className="hero-signature";motif.textContent="</>";motif.setAttribute("aria-hidden","true");art.append(motif);}
  if(portrait){
    const highlight=document.createElement("span");highlight.className="portrait-highlight";highlight.setAttribute("aria-hidden","true");portrait.append(highlight);
    let bounds,frame=0,x=0,y=0;
    portrait.addEventListener("pointerenter",()=>{if(!desktop.matches||reduced.matches)return;bounds=portrait.getBoundingClientRect();portrait.classList.add("is-tilting");});
    portrait.addEventListener("pointermove",event=>{
      if(!bounds||!desktop.matches||reduced.matches)return;
      x=event.clientX-bounds.left;y=event.clientY-bounds.top;
      if(frame)return;
      frame=requestAnimationFrame(()=>{frame=0;portrait.style.setProperty("--tilt-x",`${clamp((.5-y/bounds.height)*12,-6,6)}deg`);portrait.style.setProperty("--tilt-y",`${clamp((x/bounds.width-.5)*12,-6,6)}deg`);highlight.style.transform=`translate(${x-120}px,${y-120}px)`;});
    });
    portrait.addEventListener("pointerleave",()=>{bounds=null;cancelAnimationFrame(frame);frame=0;portrait.classList.remove("is-tilting");portrait.style.setProperty("--tilt-x","0deg");portrait.style.setProperty("--tilt-y","0deg");});
  }

  const filters=document.querySelector(".filters");
  let indicator;
  function positionIndicator(){
    const active=filters?.querySelector(".filter.active");if(!active||!indicator)return;
    indicator.style.transform=`translate(${active.offsetLeft}px,${active.offsetTop}px) scaleX(${active.offsetWidth})`;
  }
  if(filters){filters.classList.add("motion-filters");indicator=document.createElement("span");indicator.className="filter-indicator";indicator.setAttribute("aria-hidden","true");filters.prepend(indicator);positionIndicator();new ResizeObserver(positionIndicator).observe(filters);}
  let filterAnimations=[];
  function filterProjects(button){
    const grid=document.getElementById("project-grid");if(!grid)return;
    filterAnimations.forEach(animation=>animation.cancel());filterAnimations=[];
    grid.querySelectorAll(".filter-ghost").forEach(ghost=>ghost.remove());
    const cards=[...grid.querySelectorAll(".project-card")];
    const oldRects=new Map(cards.filter(card=>!card.hidden).map(card=>[card,card.getBoundingClientRect()]));
    const gridRect=grid.getBoundingClientRect();
    const exiting=cards.filter(card=>oldRects.has(card)&&button.dataset.filter!=="all"&&card.dataset.category!==button.dataset.filter);
    if(!reduced.matches)exiting.forEach(card=>{
      const rect=oldRects.get(card),ghost=card.cloneNode(true);ghost.classList.add("filter-ghost");ghost.removeAttribute("data-reveal");ghost.inert=true;ghost.setAttribute("aria-hidden","true");ghost.querySelectorAll("[id]").forEach(node=>node.removeAttribute("id"));
      Object.assign(ghost.style,{width:`${rect.width}px`,left:`${rect.left-gridRect.left}px`,top:`${rect.top-gridRect.top}px`});grid.append(ghost);
      const animation=animate(ghost,[{opacity:1,transform:"none"},{opacity:0,transform:"translateY(-8px) scale(.98)"}],{duration:300});animation.finished.catch(()=>{}).finally(()=>ghost.remove());filterAnimations.push(animation);
    });
    document.querySelectorAll(".filter").forEach(tab=>{const active=tab===button;tab.classList.toggle("active",active);tab.setAttribute("aria-pressed",String(active));});
    let visible=0;
    cards.forEach(card=>{card.hidden=button.dataset.filter!=="all"&&card.dataset.category!==button.dataset.filter;if(!card.hidden)visible++;});
    const newRects=new Map(cards.filter(card=>!card.hidden).map(card=>[card,card.getBoundingClientRect()]));
    newRects.forEach((rect,card)=>{
      card.classList.add("is-revealed");
      const old=oldRects.get(card),dx=old?old.left-rect.left:0,dy=old?old.top-rect.top:12;
      const frames=reduced.matches?[{opacity:.75},{opacity:1}]:[{transform:`translate(${dx}px,${dy}px)`,opacity:old?1:0},{transform:"none",opacity:1}];
      filterAnimations.push(animate(card,frames,{duration:reduced.matches?120:500}));
    });
    document.getElementById("project-count").textContent=`${visible} project${visible===1?"":"s"}`;positionIndicator();
  }
  if(filters)filters.addEventListener("keydown",event=>{
    if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
    const tabs=[...filters.querySelectorAll(".filter")],index=tabs.indexOf(document.activeElement);if(index<0)return;
    event.preventDefault();const next=event.key==="Home"?0:event.key==="End"?tabs.length-1:(index+(event.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click();
  });

  // Native touch scrolling retains browser momentum; mouse dragging adds a short coast.
  document.querySelectorAll(".screenshot-strip").forEach(strip=>{
    const shell=document.createElement("div");shell.className="carousel-shell";strip.before(shell);shell.append(strip);
    const progress=document.createElement("div"),fill=document.createElement("span");progress.className="carousel-progress";progress.setAttribute("role","progressbar");progress.setAttribute("aria-label",`${strip.getAttribute("aria-label")} scroll position`);progress.setAttribute("aria-valuemin","0");progress.setAttribute("aria-valuemax","100");progress.append(fill);shell.append(progress);
    let maximum=0,scrollFrame=0,drag=null,dragged=false;
    const paint=()=>{scrollFrame=0;const value=maximum?clamp(strip.scrollLeft/maximum):0;fill.style.transform=`scaleX(${maximum?value:1})`;progress.setAttribute("aria-valuenow",String(Math.round(value*100)));};
    new ResizeObserver(()=>{maximum=Math.max(0,strip.scrollWidth-strip.clientWidth);paint();}).observe(strip);
    strip.addEventListener("scroll",()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(paint);},{passive:true});
    strip.querySelectorAll("img").forEach(image=>image.draggable=false);
    strip.addEventListener("pointerdown",event=>{if(event.pointerType!=="mouse"||event.button!==0)return;dragged=false;drag={id:event.pointerId,x:event.clientX,left:strip.scrollLeft,lastX:event.clientX,time:performance.now(),velocity:0};});
    strip.addEventListener("pointermove",event=>{
      if(!drag)return;
      const delta=event.clientX-drag.x;
      if(!dragged&&Math.abs(delta)<6)return;
      if(!dragged){dragged=true;strip.classList.add("is-dragging");strip.setPointerCapture(drag.id);}
      event.preventDefault();const now=performance.now();drag.velocity=(event.clientX-drag.lastX)/Math.max(1,now-drag.time);drag.lastX=event.clientX;drag.time=now;strip.scrollLeft=drag.left-delta;
    });
    const finish=()=>{if(!drag)return;const velocity=drag.velocity,id=drag.id;drag=null;strip.classList.remove("is-dragging");if(strip.hasPointerCapture(id))strip.releasePointerCapture(id);if(dragged){const target=clamp(strip.scrollLeft-(reduced.matches?0:velocity*160),0,maximum);strip.scrollTo({left:target,behavior:reduced.matches?"instant":"smooth"});setTimeout(()=>{dragged=false;},0);}};
    strip.addEventListener("pointerup",finish);strip.addEventListener("pointercancel",finish);strip.addEventListener("lostpointercapture",()=>{if(drag)finish();});
    strip.addEventListener("click",event=>{if(dragged){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
    paint();
  });

  const gallery=document.getElementById("gallery-dialog");
  let closing=false;
  async function closeGallery(){if(!gallery?.open||closing)return;closing=true;await animate(gallery,reduced.matches?[{opacity:1},{opacity:0}]:[{opacity:1,transform:"none"},{opacity:0,transform:"translateY(6px) scale(.98)"}],{duration:reduced.matches?100:300}).finished.catch(()=>{});gallery.close();closing=false;}
  let swipe=null;
  const galleryImage=document.getElementById("gallery-image");
  galleryImage?.addEventListener("pointerdown",event=>{if(event.pointerType==="touch")swipe={x:event.clientX,y:event.clientY};});
  galleryImage?.addEventListener("pointerup",event=>{if(!swipe)return;const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2)document.getElementById(dx<0?"gallery-next":"gallery-prev").click();});
  galleryImage?.addEventListener("pointercancel",()=>{swipe=null;});

  document.querySelectorAll(".skills-grid article").forEach((card,index)=>{
    const icon=document.createElement("span");icon.className="skill-icon";icon.setAttribute("aria-hidden","true");icon.textContent=["</>","{ }","[ ]","✓","↗"][index%5];card.querySelector("h3").before(icon);
    const text=card.querySelector("p");if(!text)return;
    const parts=text.textContent.split(" · ");text.replaceChildren();parts.forEach((part,i)=>{if(i)text.append(document.createTextNode(" · "));const chip=document.createElement("span");chip.className="skill-chip";chip.style.setProperty("--chip-index",String(i));chip.textContent=part;text.append(chip);});
  });
  const countObserver="IntersectionObserver" in window?new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;countObserver.unobserve(entry.target);const total=Number(entry.target.dataset.count);if(reduced.matches)return;const start=performance.now();const tick=now=>{const ratio=clamp((now-start)/650);entry.target.textContent=String(Math.round(total*(1-Math.pow(1-ratio,3))));if(ratio<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);
  }),{threshold:.5}):null;
  document.querySelectorAll(".supporting-info .small-label,.more-work-gallery>div:first-child>p").forEach(element=>{
    const node=element.firstChild;if(node?.nodeType!==Node.TEXT_NODE)return;const match=node.textContent.match(/^(\d+)(.*)$/s);if(!match)return;
    const number=document.createElement("span"),accessible=document.createElement("span");number.className="counter-value";number.dataset.count=match[1];number.textContent=match[1];number.setAttribute("aria-hidden","true");accessible.className="sr-only";accessible.textContent=match[1];node.replaceWith(number,accessible,document.createTextNode(match[2]));countObserver?.observe(number);
  });

  document.querySelectorAll(".button-primary").forEach(button=>{
    let rect,frame=0,x=0,y=0;
    button.addEventListener("pointerenter",()=>{if(desktop.matches&&!reduced.matches)rect=button.getBoundingClientRect();});
    button.addEventListener("pointermove",event=>{if(!rect||!desktop.matches||reduced.matches)return;x=clamp((event.clientX-rect.left-rect.width/2)*.1,-5,5);y=clamp((event.clientY-rect.top-rect.height/2)*.12,-4,4);if(!frame)frame=requestAnimationFrame(()=>{frame=0;button.style.setProperty("--magnetic-x",`${x}px`);button.style.setProperty("--magnetic-y",`${y}px`);});});
    button.addEventListener("pointerleave",()=>{rect=null;cancelAnimationFrame(frame);frame=0;button.style.setProperty("--magnetic-x","0px");button.style.setProperty("--magnetic-y","0px");});
  });
  const cursor=document.createElement("span");cursor.className="project-cursor";cursor.textContent="View";cursor.setAttribute("aria-hidden","true");document.body.append(cursor);
  let cursorFrame=0,cursorX=0,cursorY=0;
  document.querySelectorAll(".project-card").forEach(card=>{
    card.addEventListener("pointerenter",event=>{if(desktop.matches&&!reduced.matches){cursor.style.transform=`translate(${event.clientX-26}px,${event.clientY-26}px)`;cursor.classList.add("is-visible");}});
    card.addEventListener("pointermove",event=>{if(!desktop.matches||reduced.matches)return;cursorX=event.clientX-26;cursorY=event.clientY-26;if(!cursorFrame)cursorFrame=requestAnimationFrame(()=>{cursorFrame=0;cursor.style.transform=`translate(${cursorX}px,${cursorY}px)`;});});
    card.addEventListener("pointerleave",()=>cursor.classList.remove("is-visible"));
    card.addEventListener("click",event=>{if(event.target.closest("a,button")||getSelection()?.toString())return;card.querySelector(".project-title-row a")?.click();});
  });
  document.addEventListener("pointerdown",()=>cursor.classList.remove("is-visible"));

  const header=document.querySelector(".site-header");
  const reading=document.createElement("div");reading.className="reading-progress";reading.setAttribute("aria-hidden","true");document.body.prepend(reading);
  const topButton=document.createElement("button");topButton.className="back-to-top";topButton.type="button";topButton.setAttribute("aria-label","Back to top");topButton.inert=true;topButton.innerHTML='<span class="progress-track" aria-hidden="true"></span><span class="ring-half" aria-hidden="true"><span class="ring-arc"></span></span><span class="ring-half left" aria-hidden="true"><span class="ring-arc"></span></span><span aria-hidden="true">↑</span>';document.body.append(topButton);
  topButton.addEventListener("click",()=>{window.scrollTo({top:0,behavior:reduced.matches?"instant":"smooth"});document.querySelector(".brand")?.focus({preventScroll:true});});
  const timelines=[...document.querySelectorAll(".timeline-content")];
  let lastY=scrollY,lastHeaderY=scrollY,scrollFrame=0;
  function updateScroll(){
    scrollFrame=0;const y=Math.max(0,scrollY),maximum=document.documentElement.scrollHeight-innerHeight,progress=maximum>0?clamp(y/maximum):0;
    const segments=timelines.map(item=>({item,rect:item.getBoundingClientRect()}));
    reading.style.transform=`scaleX(${progress})`;topButton.style.setProperty("--ring-a",`${Math.min(progress*360,180)}deg`);topButton.style.setProperty("--ring-b",`${Math.max(0,progress*360-180)}deg`);
    const visible=y>600;topButton.classList.toggle("is-visible",visible);topButton.inert=!visible;topButton.setAttribute("aria-hidden",String(!visible));
    header.classList.toggle("is-scrolled",y>20);
    const pinned=document.getElementById("site-nav")?.classList.contains("open")||!!document.querySelector("dialog[open]")||header.contains(document.activeElement);
    if(y<100||pinned){header.classList.remove("is-hidden");lastHeaderY=y;}else if(Math.abs(y-lastHeaderY)>12){header.classList.toggle("is-hidden",y>lastY);lastHeaderY=y;}
    lastY=y;
    segments.forEach(({item,rect})=>{const value=clamp((innerHeight*.78-rect.top)/Math.max(1,rect.height));item.style.setProperty("--timeline-progress",String(value));if(value>0)item.querySelector(".timeline-dot")?.classList.add("is-reached");});
  }
  addEventListener("scroll",()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});addEventListener("resize",()=>{positionIndicator();if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});updateScroll();
  if(document.querySelector(".case-main")){const link=document.querySelector('#site-nav a[href$="#work"]');link?.classList.add("current");link?.setAttribute("aria-current","page");}

  const intro=document.querySelector(".contact-inner>div:first-child");
  if(intro){const motif=document.createElement("span");motif.className="contact-motif";motif.textContent="↗";motif.setAttribute("aria-hidden","true");intro.append(motif);}
  document.querySelectorAll(".contact-form label").forEach(label=>{const input=document.getElementById(label.htmlFor);if(!input)return;const field=document.createElement("div");field.className="form-field";label.before(field);field.append(label,input);input.placeholder=" ";});

  function prepareImage(image){
    if(!image.getAttribute("src")||image.dataset.imageWatched)return;image.dataset.imageWatched="true";
    const parent=image.parentElement;
    const ready=()=>{image.classList.remove("image-pending");image.classList.add("image-ready");parent.classList.remove("image-loading");};
    if(image.complete&&image.naturalWidth){ready();return;}
    image.classList.add("image-pending");parent.classList.add("image-loading");image.addEventListener("load",ready,{once:true});image.addEventListener("error",ready,{once:true});
  }
  document.querySelectorAll("img[src]").forEach(prepareImage);
  document.addEventListener("portfolio:image",event=>{
    const image=event.detail?.image;if(!image)return;
    image.decode().then(()=>animate(image,reduced.matches?[{opacity:.6},{opacity:1}]:[{opacity:.5,transform:"scale(.99)"},{opacity:1,transform:"none"}],{duration:350})).catch(()=>{});
  });

  let leavingAnimation;
  document.addEventListener("click",event=>{
    const link=event.target.closest("a[href]");if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==="_blank"||link.hasAttribute("download"))return;
    const destination=new URL(link.href,location.href);if(destination.origin!==location.origin||destination.pathname===location.pathname)return;
    if(!destination.pathname.endsWith(".html")||!(/\/projects\//.test(destination.pathname)||/\/projects\//.test(location.pathname)))return;
    event.preventDefault();document.body.classList.add("page-leaving");cursor.classList.remove("is-visible");leavingAnimation=animate(document.body,[{opacity:1},{opacity:0}],{duration:reduced.matches?100:300,fill:"forwards"});leavingAnimation.finished.then(()=>location.assign(destination.href)).catch(()=>{});
  });
  addEventListener("pageshow",()=>{leavingAnimation?.cancel();document.body.classList.remove("page-leaving");});
  reduced.addEventListener("change",()=>{cursor.classList.remove("is-visible");if(reduced.matches)document.querySelectorAll("[data-reveal]").forEach(element=>element.classList.add("is-revealed"));});
  window.portfolioMotion={filterProjects,closeGallery,reduced};
})();
