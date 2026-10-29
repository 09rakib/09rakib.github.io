"use strict";
document.querySelectorAll("[data-case-carousel]").forEach(carousel=>{
  const track=carousel.querySelector(".project-screen-grid");
  const slides=[...track.querySelectorAll("figure")];
  const status=carousel.querySelector("[data-slide-position]");
  let drag=null,dragged=false,frame=0;
  const leftOf=slide=>slide.offsetLeft-track.offsetLeft;
  const current=()=>{
    const center=track.scrollLeft+track.clientWidth/2;
    return slides.reduce((best,slide,index)=>{
      const slideCenter=leftOf(slide)+slide.offsetWidth/2;
      return Math.abs(slideCenter-center)<Math.abs(leftOf(slides[best])+slides[best].offsetWidth/2-center)?index:best;
    },0);
  };
  const update=()=>{frame=0;const index=current();status.textContent=`${index+1} / ${slides.length}`;};
  const go=index=>{const target=(index+slides.length)%slides.length;track.scrollTo({left:leftOf(slides[target]),behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});};
  carousel.querySelector('[data-slide="previous"]').addEventListener("click",()=>go(current()-1));
  carousel.querySelector('[data-slide="next"]').addEventListener("click",()=>go(current()+1));
  track.addEventListener("scroll",()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  track.addEventListener("keydown",event=>{if(event.key==="ArrowLeft"){event.preventDefault();go(current()-1);}if(event.key==="ArrowRight"){event.preventDefault();go(current()+1);}});
  track.querySelectorAll("img").forEach(image=>image.draggable=false);
  track.addEventListener("pointerdown",event=>{if(event.pointerType!=="mouse"||event.button!==0)return;dragged=false;drag={id:event.pointerId,x:event.clientX,left:track.scrollLeft};});
  track.addEventListener("pointermove",event=>{if(!drag)return;const delta=event.clientX-drag.x;if(!dragged&&Math.abs(delta)<7)return;if(!dragged){dragged=true;track.classList.add("is-dragging");track.setPointerCapture(drag.id);}event.preventDefault();track.scrollLeft=drag.left-delta;});
  const finish=()=>{if(!drag)return;const id=drag.id;drag=null;track.classList.remove("is-dragging");if(track.hasPointerCapture(id))track.releasePointerCapture(id);if(dragged){go(current());setTimeout(()=>{dragged=false;},0);}};
  track.addEventListener("pointerup",finish);track.addEventListener("pointercancel",finish);track.addEventListener("lostpointercapture",()=>{if(drag)finish();});
  track.addEventListener("click",event=>{if(dragged){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
  update();
});
