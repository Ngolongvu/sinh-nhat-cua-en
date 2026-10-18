const C = window.CONFIG;
document.querySelectorAll('.nm').forEach(e => e.textContent = C.name);
document.getElementById('wish').textContent = C.wish;

// vệt sáng theo ngón tay/chuột khi phòng còn tối
const glow = document.getElementById('glow');
['mousemove','touchmove'].forEach(ev => addEventListener(ev, e => {
  const p = e.touches ? e.touches[0] : e;
  glow.style.setProperty('--x', p.clientX + 'px');
  glow.style.setProperty('--y', p.clientY + 'px');
}, {passive:true}));

const stages = [...document.querySelectorAll('.stage')];
const show = i => stages.forEach((s,k) => s.classList.toggle('on', k === i));

// pháo giấy
const cv = document.getElementById('confetti'), cx = cv.getContext('2d');
let parts = [], running = false;
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
fit(); addEventListener('resize', fit);
function burst(n = 150){
  const cols = ['#ff69b4','#ffc857','#8fd3ff','#b79bff','#9fffc9','#fff'];
  for(let i=0;i<n;i++) parts.push({x:innerWidth/2,y:innerHeight*.55,vx:(Math.random()-.5)*15,vy:-Math.random()*15-4,r:Math.random()*6+3,c:cols[i%cols.length],a:Math.random()*6});
  if(!running){ running = true; requestAnimationFrame(tick); }
}
function tick(){
  cx.clearRect(0,0,cv.width,cv.height);
  parts.forEach(p => { p.vy+=.35; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.a+=.15;
    cx.fillStyle=p.c; cx.save(); cx.translate(p.x,p.y); cx.rotate(p.a); cx.fillRect(-p.r,-p.r/2,p.r*2,p.r); cx.restore(); });
  parts = parts.filter(p => p.y < cv.height+20);
  if(parts.length) requestAnimationFrame(tick); else { running=false; cx.clearRect(0,0,cv.width,cv.height); }
}

// thổi nến
const cake = document.getElementById('cake');
let blown = false, micStream = null;
function blow(){
  if(blown) return; blown = true;
  if(micStream){ micStream.getTracks().forEach(t => t.stop()); micStream = null; }
  cake.classList.add('out');
  setTimeout(() => burst(), 400);
  setTimeout(() => { show(2); burst(80); }, 2400);
}

document.getElementById('lightBtn').onclick = () => { document.body.classList.add('lit'); setTimeout(() => show(1), 500); };
document.getElementById('blowBtn').onclick = blow;
cake.onclick = blow;

// thổi bằng micro (cần https hoặc localhost)
document.getElementById('micBtn').onclick = async function(){
  try{
    micStream = await navigator.mediaDevices.getUserMedia({audio:true});
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const an = ac.createAnalyser(); an.fftSize = 512;
    ac.createMediaStreamSource(micStream).connect(an);
    const buf = new Uint8Array(an.fftSize);
    this.textContent = 'Đang nghe… thổi đi nào 🌬️';
    (function listen(){
      if(blown) return;
      an.getByteTimeDomainData(buf);
      let s = 0; for(const v of buf) s += (v-128)*(v-128);
      if(Math.sqrt(s/buf.length) > 28) return blow();
      requestAnimationFrame(listen);
    })();
  }catch(e){ this.textContent = 'Không dùng được micro, hãy chạm vào nến'; }
};

// mở quà → trang kế tiếp
document.getElementById('openBtn').onclick = () => {
  burst();
  gsap.to('body', {opacity:0, duration:1, delay:.4, onComplete:() => location.href = 'cause.html'});
};
