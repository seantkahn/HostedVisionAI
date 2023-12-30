System.register(["./index-legacy-a1b5fada.js","https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"],(function(e,t){"use strict";var s,n,r,i,o;return{setters:[e=>{s=e.r,n=e.f,r=e.b,i=e.w,o=e.s},null],execute:function(){
/*!
       * (C) Ionic http://ionicframework.com - MIT License
       */
e("startStatusTap",(()=>{const e=window;e.addEventListener("statusTap",(()=>{s((()=>{const t=e.innerWidth,s=e.innerHeight,a=document.elementFromPoint(t/2,s/2);if(!a)return;const c=n(a);c&&new Promise((e=>r(c,e))).then((()=>{i((async()=>{c.style.setProperty("--overflow","hidden"),await o(c,300),c.style.removeProperty("--overflow")}))}))}))}))}))}}}));
