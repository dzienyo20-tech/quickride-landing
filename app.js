/* Rydon — shared site behaviour + header/footer injection (static multi-page) */
(function(){
  'use strict';

  var NAV = [
    ['/ride','Ride'],['/drive','Drive'],['/business','Business'],
    ['/safety','Safety'],['/about','About'],['/careers','Careers'],['/contact','Contact']
  ];
  var page = document.body.getAttribute('data-page') || '';

  function navLinks(sheet){
    return NAV.map(function(n){
      var cur = (n[0] === '/'+page) ? ' aria-current="page"' : '';
      return '<a href="'+n[0]+'"'+cur+'>'+n[1]+'</a>';
    }).join(sheet ? '\n' : '');
  }

  var HEADER =
  '<header class="topbar" id="topbar">'+
    '<nav class="nav" id="nav"><div class="wrap nav-in">'+
      '<a href="/" class="brand" aria-label="Rydon — home"><img src="rydon-lockup.webp" alt="Rydon"/></a>'+
      '<div class="nav-links">'+navLinks(false)+'</div>'+
      '<div class="nav-cta">'+
        '<a href="/drive" class="btn btn-ghost">Drive with Rydon</a>'+
        '<a href="/get" class="btn btn-primary"><svg><use href="#i-phone"/></svg>Get the app</a>'+
      '</div>'+
      '<button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span></button>'+
    '</div></nav>'+
  '</header>'+
  '<div class="sheet" id="sheet">'+navLinks(true)+
    '<a href="/get" class="btn btn-primary"><svg><use href="#i-phone"/></svg>Get the app</a>'+
  '</div>';

  var FOOTER =
  '<div class="kente" aria-hidden="true"></div>'+
  '<footer><div class="wrap">'+
    '<div class="ft-grid">'+
      '<div class="ft-col ft-brand">'+
        '<a href="/" class="brand brand-lg" aria-label="Rydon — home"><img src="rydon-lockup.webp" alt="Rydon"/></a>'+
        '<p>Ghana\'s own ride-sharing and food-delivery app. Ride Together. Go Further.</p>'+
        '<div class="ft-social">'+
          '<a href="https://instagram.com/rydonghana" aria-label="Instagram"><svg><use href="#i-ig"/></svg></a>'+
          '<a href="https://tiktok.com/@rydongh" aria-label="TikTok"><svg><use href="#i-tt"/></svg></a>'+
          '<a href="https://twitter.com/rydongh" aria-label="X"><svg><use href="#i-x"/></svg></a>'+
          '<a href="https://facebook.com/rydonghana" aria-label="Facebook"><svg><use href="#i-fb"/></svg></a>'+
        '</div>'+
      '</div>'+
      '<div class="ft-col"><h5>Product</h5><a href="/ride">Ride</a><a href="/drive">Drive with Rydon</a><a href="/business">For business</a><a href="/ride">Rydon Foods</a></div>'+
      '<div class="ft-col"><h5>Company</h5><a href="/about">About</a><a href="/safety">Safety</a><a href="/careers">Careers</a><a href="/news">News &amp; press</a><a href="/contact">Contact</a></div>'+
      '<div class="ft-col"><h5>Support &amp; legal</h5><a href="mailto:support@rydonghana.com">support@rydonghana.com</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms of service</a><a href="/delete-account">Delete account</a></div>'+
    '</div>'+
    '<div class="ft-bottom"><span>&copy; <span id="yr"></span> Rydon Ghana. Proudly Ghanaian-owned.</span><span>Made in Ghana</span></div>'+
  '</div></footer>';

  function inject(id, html, where){
    var slot = document.getElementById(id);
    if(slot){ slot.outerHTML = html; return; }
    // fallback: insert at body edge
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    while(tmp.firstChild){ where==='top' ? document.body.insertBefore(tmp.firstChild, document.body.firstChild) : document.body.appendChild(tmp.firstChild); }
  }

  // 1) sprite — fetch once and inject so <use href="#i-*"> resolves on every page
  fetch('icons.svg').then(function(r){return r.text();}).then(function(svg){
    var d=document.createElement('div'); d.style.display='none'; d.innerHTML=svg;
    document.body.insertBefore(d, document.body.firstChild);
  }).catch(function(){});

  // 2) header + footer
  inject('site-header', HEADER, 'top');
  inject('site-footer', FOOTER, 'bottom');

  var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();

  // 3) nav scroll state
  var nav=document.getElementById('nav');
  if(nav){ var onScroll=function(){nav.classList.toggle('scrolled',window.scrollY>24);}; onScroll(); window.addEventListener('scroll',onScroll,{passive:true}); }

  // 4) mobile menu
  var burger=document.getElementById('burger');
  if(burger){ burger.addEventListener('click',function(){var o=document.body.classList.toggle('menu-open');burger.setAttribute('aria-expanded',o?'true':'false');}); }
  document.querySelectorAll('.sheet a').forEach(function(a){a.addEventListener('click',function(){document.body.classList.remove('menu-open');if(burger)burger.setAttribute('aria-expanded','false');});});

  // 5) marquee seamless loop
  var marq=document.getElementById('marq'); if(marq) marq.innerHTML+=marq.innerHTML;

  // scrollytelling stepper — sticky phone steps through app screens (robust, Lenis-independent)
  (function(){
    var sc=document.querySelector('.scrolly'); if(!sc || !('IntersectionObserver' in window)) return;
    var imgs=sc.querySelectorAll('.scrolly-phone .scr img'),
        steps=sc.querySelectorAll('.ss'),
        dots=sc.querySelectorAll('.pdots i'),
        cur=-1;
    function setActive(i){
      if(i===cur) return; cur=i;
      imgs.forEach(function(el,k){el.classList.toggle('on',k===i);});
      steps.forEach(function(el,k){el.classList.toggle('on',k===i);});
      dots.forEach(function(el,k){el.classList.toggle('on',k===i);});
    }
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) setActive(+e.target.getAttribute('data-i')); });
    },{rootMargin:'-45% 0px -45% 0px',threshold:0});
    steps.forEach(function(s){io.observe(s);});
  })();

  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  // 6) reveals — robust IntersectionObserver
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});},{threshold:0.12,rootMargin:'0px 0px -7% 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
  } else { document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('is-in');}); }

  // 7) smooth scroll
  if(window.Lenis){
    var lenis=new Lenis({duration:1.1,smoothWheel:true});
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf);})();
    if(window.ScrollTrigger) lenis.on('scroll',ScrollTrigger.update);
    document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();lenis.scrollTo(el,{offset:-80});}});});
  }

  // 8) hero load + parallax + counters (GSAP enhancement)
  if(window.gsap){
    if(document.querySelector('.hero-reveal')) gsap.to('.hero-reveal',{opacity:1,y:0,duration:1,ease:'power3.out',stagger:.12,delay:.12});
    if(window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      if(document.querySelector('.hero-media')) gsap.to('.hero-media',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.hero,.page-hero',start:'top top',end:'bottom top',scrub:true}});
      document.querySelectorAll('[data-count]').forEach(function(el){
        var to=+el.getAttribute('data-count'),suf=el.getAttribute('data-suffix')||'';
        ScrollTrigger.create({trigger:el,start:'top 92%',once:true,onEnter:function(){var o={v:0};gsap.to(o,{v:to,duration:1.4,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(o.v)+suf;}});}});
      });

      // 8b) parallax on dark brand-band backgrounds
      document.querySelectorAll('.band-bg').forEach(function(bg){
        var band=bg.closest('.band')||bg.parentElement;
        gsap.fromTo(bg,{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:band,start:'top bottom',end:'bottom top',scrub:true}});
      });

      window.addEventListener('load',function(){ScrollTrigger.refresh();});
    }

    // 8d) cursor tilt on single-phone stages (fine pointers only)
    if(window.matchMedia && window.matchMedia('(pointer:fine)').matches){
      document.querySelectorAll('.stage,.scrolly-phone').forEach(function(st){
        var ph=st.querySelector('.phone'); if(!ph) return;
        st.addEventListener('mousemove',function(e){
          var r=st.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
          ph.style.transform='perspective(1100px) rotateY('+(x*7).toFixed(2)+'deg) rotateX('+(-y*7).toFixed(2)+'deg)';
        });
        st.addEventListener('mouseleave',function(){ph.style.transform='';});
      });
    }
  } else { document.querySelectorAll('.hero-reveal').forEach(function(el){el.style.opacity=1;el.style.transform='none';}); }
})();
