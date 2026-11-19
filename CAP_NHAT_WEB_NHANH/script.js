// ========================================================
// 1. PORTFOLIO GRID, TVC REELS SHOWCASE & MODAL PLAYER
// ========================================================
const grid = document.getElementById('grid');
const fl = document.getElementById('filters');
const m = document.getElementById('modal');
const pl = document.getElementById('player');
const modalBox = m.querySelector('.box');
const yt = u => (u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/) || [])[1];

function render(c) {
  grid.innerHTML = '';
  const filtered = PROJECTS.filter(p => c === 'all' || p.cat === c);
  if (!filtered.length) {
    if (c === 'ads') {
      grid.innerHTML = `
        <div style="grid-column:1/-1; padding:50px 20px; text-align:center; background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.18); border-radius:18px;">
          <p style="font-size:1.3rem; font-weight:800; color:#fff; margin-bottom:10px;">⏳ TVC Quảng Cáo (Sản phẩm Gia Dụng &amp; Dược Phẩm)</p>
          <p style="color:#94a3b8; font-size:0.95rem; max-width:600px; margin:0 auto;">Dự án đang trong quá trình sản xuất &amp; hoàn thiện kỹ xảo hậu kỳ. Các video TVC quảng cáo sẽ được cập nhật sớm nhất tại đây!</p>
        </div>
      `;
    } else {
      grid.innerHTML = '<p style="color:#888; grid-column:1/-1; padding:36px 0; text-align:center;">Đang cập nhật video cho mục này...</p>';
    }
    return;
  }
  filtered.forEach(p => {
    const id = yt(p.video || '');
    const th = p.thumb || (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '');
    const d = document.createElement('div');
    d.className = 'item' + (p.isVertical ? ' item-vertical' : '');
    const catName = p.cat === 'tvc' ? 'TVC Biển Số' : (p.cat === 'anime' ? 'Hoạt hình AI' : p.cat);
    d.innerHTML = `
      ${th ? `<img loading="lazy" src="${th}" alt="${p.title}">` : ''}
      <div class="ov">
        <small>${catName} ${p.isVertical ? '• 9:16' : ''}</small>
        <b>${p.title}</b>
        <span>${p.desc || ''}</span>
      </div>
    `;
    d.onclick = () => openModal(p);
    grid.appendChild(d);
  });
}

// Bind clicks for TVC Showcase cards in #tvc section
document.querySelectorAll('.tvc-card').forEach(card => {
  card.onclick = () => {
    const video = card.dataset.video;
    const title = card.dataset.title;
    const isVertical = card.dataset.vertical === 'true';
    openModal({ video, title, isVertical });
  };
});

Object.keys(CATS).forEach((k, i) => {
  const b = document.createElement('button');
  b.textContent = CATS[k];
  if (!i) b.className = 'on';
  b.onclick = () => {
    fl.querySelectorAll('button').forEach(x => x.classList.remove('on'));
    b.className = 'on';
    render(k);
  };
  fl.appendChild(b);
});
render('all');

function openModal(p) {
  if (modalBox) {
    if (p.isVertical) {
      modalBox.classList.add('vertical-mode');
    } else {
      modalBox.classList.remove('vertical-mode');
    }
  }

  const id = yt(p.video || '');
  if (id) {
    pl.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1" allow="autoplay;fullscreen" allowfullscreen></iframe>`;
  } else if (p.video && p.video.endsWith('.mp4')) {
    pl.innerHTML = `<video src="${p.video}" controls autoplay playsinline style="width:100%;height:100%;object-fit:${p.isVertical ? 'cover' : 'contain'};border-radius:${p.isVertical ? '20px' : '12px'};background:#000;"></video>`;
  } else if (p.video && (p.video.endsWith('.jpg') || p.video.endsWith('.png'))) {
    pl.innerHTML = `<img src="${p.video}" style="width:100%;height:100%;object-fit:contain;background:#000;">`;
  } else if (p.video) {
    window.open(p.video, '_blank');
    return;
  }
  m.classList.add('open');
}

function closeModal() {
  m.classList.remove('open');
  if (modalBox) modalBox.classList.remove('vertical-mode');
  const vid = pl.querySelector('video');
  if (vid) { try { vid.pause(); } catch(e) {} }
  pl.innerHTML = '';
}
document.getElementById('close').onclick = closeModal;
m.onclick = e => { if (e.target === m) closeModal(); };
addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ========================================================
// 2. SCROLL REVEAL & STATS COUNTER
// ========================================================
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('show');
      e.target.querySelectorAll('[data-n]').forEach(n => {
        let v = 0;
        const target = +n.dataset.n;
        const step = Math.max(1, Math.floor(target / 35));
        const timer = setInterval(() => {
          v += step;
          if (v >= target) {
            n.textContent = target;
            clearInterval(timer);
          } else {
            n.textContent = v;
          }
        }, 30);
      });
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ========================================================
// 3. SYNTHESIZED SOUND FX ENGINE (WEB AUDIO API)
// ========================================================
class SoundFXEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 880, dur = 0.09) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  }

  playImpact() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 808 Sub-bass boom
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.6);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);

      // Punch transient
      const punch = this.ctx.createOscillator();
      const punchGain = this.ctx.createGain();
      punch.type = 'triangle';
      punch.frequency.setValueAtTime(320, now);
      punch.frequency.exponentialRampToValueAtTime(50, now + 0.14);
      punchGain.gain.setValueAtTime(0.25, now);
      punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      punch.connect(punchGain);
      punchGain.connect(this.ctx.destination);
      punch.start(now);
      punch.stop(now + 0.14);
    } catch(e) {}
  }

  playWhoosh() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.28);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch(e) {}
  }

  playClimaxSwell() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [130.81, 196.00, 261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.6 + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.8);
      });
      this.playImpact();
    } catch(e) {}
  }
}

// ========================================================
// 4. DYNAMIC PARTICLE & CYBER SPARK CANVAS ENGINE
// ========================================================
class ParticleFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.particles = [];
    this.bursts = [];
    this.w = 0;
    this.h = 0;
    this.animId = null;
    if (this.ctx) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initAmbient();
      this.loop();
    }
  }

  resize() {
    if (!this.canvas) return;
    this.w = this.canvas.width = window.innerWidth;
    this.h = this.canvas.height = window.innerHeight;
  }

  initAmbient() {
    this.particles = [];
    const count = Math.min(80, Math.floor(window.innerWidth / 18));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: Math.random() * 2 + 0.8,
        vy: -(Math.random() * 0.8 + 0.35),
        vx: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        color: Math.random() > 0.5 ? '#22d3ee' : (Math.random() > 0.4 ? '#a855f7' : '#fbbf24')
      });
    }
  }

  burst(x, y, count = 45, colors = ['#22d3ee', '#c084fc', '#ffffff']) {
    const originX = x || this.w / 2;
    const originY = y || this.h / 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2.5;
      this.bursts.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 3 + 1.2,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.015,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.w, this.h);

    // Floating ambient embers
    for (let p of this.particles) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y * 0.02) * 0.3;
      if (p.y < -10) { p.y = this.h + 10; p.x = Math.random() * this.w; }
      if (p.x < -10) p.x = this.w + 10;
      if (p.x > this.w + 10) p.x = -10;

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // High-speed shockwave spark bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= 0.95;
      b.vy *= 0.95;
      b.alpha -= b.decay;
      if (b.alpha <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.globalAlpha = b.alpha;
      this.ctx.fillStyle = b.color;
      this.ctx.shadowBlur = 14;
      this.ctx.shadowColor = b.color;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }

  stop() {
    cancelAnimationFrame(this.animId);
  }
}

// ========================================================
// 5. CINEMATIC TRAILER SCENES CONFIG
// ========================================================
const TRAILER_SCENES = [
  {
    type: 'count',
    dur: 1.8
  },
  {
    type: 'title',
    dur: 2.2,
    badge: 'OFFICIAL SHOWREEL 2026',
    title: 'NGUYỄN TUẤN HƯNG',
    sub: 'VIDEO EDITOR & AI CREATOR • HỆ THỐNG 6 KÊNH YOUTUBE AI'
  },
  {
    type: 'video',
    src: 'assets/sonic.mp4',
    badge: 'KEN SONIC // AI 3D',
    color: '#00d2ff',
    aura: 'aura-sonic',
    title: 'SIÊU TỐC ĐỘ SHADOW',
    sub: 'Sonic The Hedgehog x Shadow 100% bằng AI',
    dur: 3.0
  },
  {
    type: 'video',
    src: 'assets/mario.mp4',
    badge: 'KEN MARIO // ACTION',
    color: '#ff3b30',
    aura: 'aura-mario',
    title: 'ĐẠI CHIẾN RỒNG LỬA',
    sub: 'Mario & Bowser kịch tính đến từng khung hình',
    dur: 3.0
  },
  {
    type: 'video',
    src: 'assets/football1.mp4',
    badge: 'KEN FOOTBALL // SPEED',
    color: '#10b981',
    aura: 'aura-football',
    title: 'SIÊU KINH ĐIỂN TỐC ĐỘ',
    sub: 'Ronaldo vs Messi trên mọi địa hình hiểm trở',
    dur: 3.0
  },
  {
    type: 'video',
    src: 'assets/tomjerry.mp4',
    badge: 'TOM & JERRY // CHASE',
    color: '#f59e0b',
    aura: 'aura-tomjerry',
    title: 'CUỘC ĐUA KỲ THÚ',
    sub: 'Băng qua bão tuyết & đối đầu quái thú sa mạc',
    dur: 3.0
  },
  {
    type: 'video',
    src: 'assets/spider.mp4',
    badge: 'KEN SPIDER // HERO',
    color: '#e11d48',
    aura: 'aura-spider',
    title: 'ĐẤU TRƯỜNG THẦN THOẠI',
    sub: 'Spider-Man x Venom siêu kịch tính với mô-tô thần',
    dur: 3.0
  },
  {
    type: 'tvc_montage',
    badge: '5X VERTICAL SHOWCASE // 9:16 TVC',
    title: 'BỘ SƯU TẬP TVC BIỂN SỐ XE VIP',
    sub: '5 TVC Chuẩn Tỷ Lệ Smartphone • Biển Số Đẹp Thái Nguyên',
    dur: 3.6,
    videos: [
      {
        src: 'assets/drive/tvc_9232.mp4',
        thumb: 'assets/drive/tvc_9232_thumb.jpg',
        badge: 'SHOWROOM VIP',
        badgeClass: 'gold',
        dur: '01:13',
        client: 'BIỂN SỐ ĐẸP THÁI NGUYÊN',
        title: 'TVC Showroom Biển Đẹp'
      },
      {
        src: 'assets/drive/tvc_fake1.mp4',
        thumb: 'assets/drive/tvc_fake1_thumb.jpg',
        badge: 'KHO SỐ PHONG THỦY',
        dur: '01:11',
        client: 'BIỂN SỐ ĐẸP THÁI NGUYÊN',
        title: 'TVC Đẹp Hơn Mỗi Hành Trình'
      },
      {
        src: 'assets/drive/tvc_0202.mp4',
        thumb: 'assets/drive/tvc_0202_thumb.jpg',
        badge: 'BIỂN ĐẸP VIP',
        dur: '00:43',
        client: 'BIỂN SỐ ĐẸP THÁI NGUYÊN',
        title: 'TVC Biển Đẹp 20B - 198.99'
      },
      {
        src: 'assets/drive/tvc_0922.mp4',
        thumb: 'assets/drive/tvc_0922_thumb.jpg',
        badge: 'REELS & TIKTOK ADS',
        dur: '00:31',
        client: 'BIỂN SỐ ĐẸP THÁI NGUYÊN',
        title: 'TVC Biển Đẹp 20A - 068.68'
      },
      {
        src: 'assets/drive/tvc_3.mp4',
        thumb: 'assets/drive/tvc_3_thumb.jpg',
        badge: 'XE SANG & BIỂN SỐ',
        dur: '00:35',
        client: 'BIỂN SỐ ĐẸP THÁI NGUYÊN',
        title: 'TVC Xe Sang Đi Kèm Biển Số'
      }
    ]
  },
  {
    type: 'climax',
    dur: 7.0,
    title: 'NGUYỄN TUẤN HƯNG',
    slogan: 'BIẾN MỌI Ý TƯỞNG THÀNH SIÊU PHẨM TRIỆU VIEW'
  }
];

class TrailerPlayer {
  constructor() {
    this.overlay = document.getElementById('trailer');
    this.stage = document.getElementById('trailer-stage');
    this.bar = document.getElementById('trailer-bar');
    this.flash = document.getElementById('trailer-flash');
    this.timecode = document.getElementById('hud-timecode');
    this.audio = document.getElementById('trailer-audio');
    this.skipBtn = document.getElementById('skip-btn');
    this.canvas = document.getElementById('trailer-canvas');
    this.particles = new ParticleFX(this.canvas);
    this.replayBtns = [
      document.getElementById('replay-btn'),
      document.getElementById('hero-trailer-btn')
    ].filter(Boolean);

    this.sfx = new SoundFXEngine();
    this.audioUnlocked = false;
    this.currentIndex = 0;
    this.timer = null;
    this.countInterval = null;
    this.animFrame = null;
    this.startTime = 0;
    this.totalDuration = TRAILER_SCENES.reduce((sum, s) => sum + s.dur, 0);

    this.initEvents();

    // Tự động chạy nếu chưa xem trong phiên này
    if (sessionStorage.getItem('seen_trailer_v10')) {
      this.stop();
    } else {
      this.play();
    }
  }

  unlockAudio() {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
    this.sfx.ensureContext();
    if (this.audio) {
      const targetTime = Math.max(0, (performance.now() - this.startTime) / 1000);
      if (Math.abs(this.audio.currentTime - targetTime) > 0.5) {
        this.audio.currentTime = targetTime;
      }
      this.audio.play().catch(() => {});
    }
  }

  initEvents() {
    const handleUserGesture = () => {
      this.unlockAudio();
    };

    // Bất kỳ tương tác tự nhiên nào trên màn hình đều kích hoạt âm thanh ngay
    window.addEventListener('click', handleUserGesture, { capture: true });
    window.addEventListener('pointerdown', handleUserGesture, { capture: true });
    window.addEventListener('keydown', handleUserGesture, { capture: true });

    if (this.skipBtn) {
      this.skipBtn.onclick = (e) => {
        e.stopPropagation();
        this.stop();
      };
    }

    this.replayBtns.forEach(btn => {
      btn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.audioUnlocked = false;
        this.unlockAudio();
        this.play();
      };
    });
  }

  triggerFlash(isHeavy = false) {
    if (this.flash) {
      this.flash.classList.remove('active');
      void this.flash.offsetWidth; // reflow
      this.flash.classList.add('active');
    }

    if (this.stage) {
      this.stage.classList.remove('shake');
      void this.stage.offsetWidth;
      this.stage.classList.add('shake');
    }

    if (this.particles) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      this.particles.burst(centerX, centerY, isHeavy ? 65 : 25);
    }

    if (isHeavy) {
      this.sfx.playImpact();
    } else {
      this.sfx.playWhoosh();
    }
  }

  play() {
    clearTimeout(this.timer);
    clearInterval(this.countInterval);
    cancelAnimationFrame(this.animFrame);

    document.body.style.overflow = 'hidden';
    this.overlay.style.transform = 'none';
    this.overlay.classList.remove('hidden');
    this.currentIndex = 0;
    this.startTime = performance.now();
    this.updateProgress();

    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().then(() => {
        this.audioUnlocked = true;
      }).catch(() => {
        // Tự động giải phóng ngay khi người dùng chạm chuột
      });
    }

    this.sfx.ensureContext();
    this.renderScene(0);
  }

  updateProgress() {
    const elapsed = (performance.now() - this.startTime) / 1000;
    const pct = Math.min(100, (elapsed / this.totalDuration) * 100);
    this.bar.style.width = pct + '%';

    // Cập nhật timecode điện ảnh chuẩn 60 FPS
    if (this.timecode) {
      const sec = Math.floor(elapsed);
      const frame = Math.floor((elapsed % 1) * 60);
      const sStr = String(sec).padStart(2, '0');
      const fStr = String(frame).padStart(2, '0');
      this.timecode.textContent = `00:00:${sStr}:${fStr}`;
    }

    if (elapsed < this.totalDuration && !this.overlay.classList.contains('hidden')) {
      this.animFrame = requestAnimationFrame(() => this.updateProgress());
    }
  }

  renderScene(idx) {
    if (idx >= TRAILER_SCENES.length) {
      this.stop();
      return;
    }

    this.currentIndex = idx;
    const scene = TRAILER_SCENES[idx];
    this.stage.innerHTML = '';

    const el = document.createElement('div');
    el.className = 'tr-scene';

    if (scene.type === 'count') {
      this.triggerFlash(true);
      el.innerHTML = `
        <div class="count-box">
          <div class="count-radar-ring"></div>
          <span id="tr-count-txt" class="count-num">3</span>
          <span class="count-sub">SYSTEM READY // ACTION INCOMING</span>
        </div>
      `;
      this.stage.appendChild(el);
      requestAnimationFrame(() => el.classList.add('active'));

      this.sfx.playBeep(600, 0.1);
      let num = 3;
      const countTxt = el.querySelector('#tr-count-txt');
      this.countInterval = setInterval(() => {
        num--;
        if (num === 2) {
          countTxt.textContent = '2';
          this.sfx.playBeep(700, 0.1);
        } else if (num === 1) {
          countTxt.textContent = '1';
          this.sfx.playBeep(850, 0.1);
        } else if (num === 0) {
          countTxt.textContent = 'ACTION!';
          countTxt.style.color = 'var(--c)';
          countTxt.style.fontSize = 'clamp(4rem, 14vw, 8rem)';
          this.triggerFlash(true);
        } else {
          clearInterval(this.countInterval);
        }
      }, 650);

    } else if (scene.type === 'title') {
      this.triggerFlash(false);
      el.innerHTML = `
        <div class="trailer-title">
          <span class="tr-badge" style="border-color: rgba(34, 211, 238, 0.6); color: #22d3ee; background: rgba(34, 211, 238, 0.12); margin-bottom: 16px;">
            ${scene.badge || 'OFFICIAL SHOWREEL 2026'}
          </span>
          <h1>${scene.title}</h1>
          <p>${scene.sub}</p>
        </div>
      `;
      this.stage.appendChild(el);
      requestAnimationFrame(() => el.classList.add('active'));

    } else if (scene.type === 'video') {
      this.triggerFlash(true);

      const vid = document.createElement('video');
      vid.className = 'tr-media';
      vid.src = scene.src;
      vid.muted = true;
      vid.playsInline = true;
      vid.autoplay = true;
      vid.loop = true;
      vid.currentTime = 0;

      el.appendChild(vid);
      el.innerHTML += `
        <div class="tr-shade"></div>
        <div class="tr-aura ${scene.aura || ''}"></div>
        <div class="tr-content tr-bottom">
          <span class="tr-badge" style="background:${scene.color}33; color:${scene.color}; border:1px solid ${scene.color}">
            ${scene.badge}
          </span>
          <h2 class="tr-title" style="color:#fff">${scene.title}</h2>
          <p class="tr-sub">${scene.sub}</p>
        </div>
      `;
      this.stage.appendChild(el);

      requestAnimationFrame(() => {
        el.classList.add('active');
        const v = el.querySelector('video');
        if (v) v.play().catch(() => {});
      });

    } else if (scene.type === 'tvc_montage') {
      this.triggerFlash(true);
      this.sfx.playWhoosh();
      if (this.particles) {
        this.particles.burst(window.innerWidth / 2, window.innerHeight / 2, 70, [
          '#fef08a', '#f59e0b', '#38bdf8', '#ffffff'
        ]);
      }

      el.innerHTML = `
        <div class="tr-shade" style="background: radial-gradient(circle at center, rgba(15,23,42,0.4) 0%, rgba(0,0,0,0.95) 100%)"></div>
        <div class="tvc-montage-container">
          <div class="tvc-montage-header">
            <span class="tr-badge montage-badge">${scene.badge}</span>
            <h2 class="tr-title montage-title">${scene.title}</h2>
            <p class="tr-sub montage-sub">${scene.sub}</p>
          </div>
          <div class="tvc-montage-grid">
            ${scene.videos.map((v, i) => `
              <div class="tvc-phone-card" style="animation-delay: ${i * 0.08}s">
                <div class="tvc-phone-inner">
                  <img class="tvc-phone-img" src="${v.thumb}" alt="${v.title}">
                  <video class="tvc-phone-vid" src="${v.src}" poster="${v.thumb}" muted playsinline loop autoplay preload="auto"></video>
                  <div class="tvc-phone-top">
                    <span class="tvc-top-badge ${v.badgeClass || ''}">${v.badge}</span>
                    <span class="tvc-top-dur">${v.dur}</span>
                  </div>
                  <div class="tvc-phone-play">▶</div>
                  <div class="tvc-phone-info">
                    <div class="tvc-phone-client">${v.client}</div>
                    <div class="tvc-phone-name">${v.title}</div>
                  </div>
                  <div class="tvc-phone-glow"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      this.stage.appendChild(el);

      requestAnimationFrame(() => {
        el.classList.add('active');
        const vids = el.querySelectorAll('video');
        vids.forEach(v => {
          v.currentTime = 0;
          v.play().catch(() => {});
        });
      });

    } else if (scene.type === 'climax') {
      this.triggerFlash(true);
      this.sfx.playClimaxSwell();

      if (this.particles) {
        this.particles.burst(window.innerWidth / 2, window.innerHeight / 2, 90, [
          '#22d3ee', '#ffffff', '#c084fc', '#f59e0b', '#ec4899'
        ]);
      }

      el.innerHTML = `
        <div class="climax-box">
          <div class="climax-rays"></div>
          <div class="climax-ring"></div>
          <div class="climax-ring-outer"></div>
          
          <!-- LEFT COLUMN: CINEMATIC CREDENTIALS & BRANDING -->
          <div class="climax-col-text">
            <div class="climax-badge">
              <span>★</span> OFFICIAL SHOWREEL 2026 <span>★</span>
            </div>

            <h1 class="climax-name">
              ${scene.title}
            </h1>

            <div class="climax-roles">
              <span class="role-pill">AI VIDEO DIRECTOR</span>
              <span class="role-pill">CINEMATIC TVC CREATOR</span>
              <span class="role-pill">KỸ XẢO HOẠT HÌNH 4K</span>
            </div>

            <p class="climax-slogan">
              "${scene.slogan}"
            </p>

            <div class="climax-tools">
              <span class="climax-tool-pill"><img src="assets/logos/capcut.svg" alt="CapCut"> CapCut PC</span>
              <span class="climax-tool-pill"><img src="assets/logos/vbee.svg" alt="Vbee"> Vbee AI</span>
              <span class="climax-tool-pill"><img src="assets/logos/suno.svg" alt="Suno"> Suno</span>
              <span class="climax-tool-pill"><img src="assets/logos/veo.svg" alt="Veo 3"> Veo 3</span>
              <span class="climax-tool-pill"><img src="assets/logos/kling.svg" alt="Kling"> Kling AI</span>
              <span class="climax-tool-pill"><img src="assets/logos/muse.svg" alt="Muse"> Muse</span>
            </div>

            <div class="climax-metrics">
              <div class="metric-item"><b>50+</b><span>Dự án</span></div>
              <div class="metric-sep">•</div>
              <div class="metric-item"><b>6 KÊNH</b><span>YouTube AI</span></div>
              <div class="metric-sep">•</div>
              <div class="metric-item"><b>1+ NĂM</b><span>Thực chiến</span></div>
              <div class="metric-sep">•</div>
              <div class="metric-item"><b>100%</b><span>Sáng tạo</span></div>
            </div>

            <button id="climax-cta-btn" class="climax-cta">
              <span>KHÁM PHÁ PORTFOLIO NGAY</span>
              <span>➔</span>
            </button>
          </div>

          <!-- RIGHT COLUMN: PROMINENT LARGE PORTRAIT SHOWCASE -->
          <div class="climax-col-visual">
            <div class="climax-portrait-stage">
              <div class="climax-portrait-halo"></div>
              <div class="climax-portrait-ring ring-1"></div>
              <div class="climax-portrait-ring ring-2"></div>
              
              <div class="climax-portrait-frame">
                <img src="assets/avatar_portrait.png" alt="Nguyễn Tuấn Hưng" class="climax-portrait-img">
              </div>

              <div class="climax-director-badge">
                <span class="director-pulse"></span>
                <span>NGUYỄN TUẤN HƯNG // CREATIVE LEAD</span>
              </div>
            </div>
          </div>
        </div>
      `;
      this.stage.appendChild(el);
      requestAnimationFrame(() => {
        el.classList.add('active');
        const ctaBtn = el.querySelector('#climax-cta-btn');
        if (ctaBtn) {
          ctaBtn.onclick = (e) => {
            e.stopPropagation();
            this.stop();
          };
        }
      });
    }

    this.timer = setTimeout(() => {
      this.renderScene(idx + 1);
    }, scene.dur * 1000);
  }

  stop() {
    clearTimeout(this.timer);
    clearInterval(this.countInterval);
    cancelAnimationFrame(this.animFrame);

    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch(e) {}
    }

    sessionStorage.setItem('seen_trailer_v10', '1');
    this.overlay.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    this.overlay.style.transform = 'scale(1.1)';
    this.overlay.classList.add('hidden');
    document.body.style.overflow = '';

    // Dừng tất cả video đang chạy ngầm trong stage
    const vids = this.stage.querySelectorAll('video');
    vids.forEach(v => {
      try { v.pause(); } catch(e) {}
    });
    setTimeout(() => {
      if (this.overlay.classList.contains('hidden')) {
        this.stage.innerHTML = '';
      }
    }, 700);
  }
}

// Khởi chạy Trailer
const trailerPlayer = new TrailerPlayer();

// ========================================================
// 6. MULTI-THEME DYNAMIC ENGINE & INTERACTIVE CLICK FX
//    - ✨ Trắng Bạc Mắt Mèo (Silver Cat-Eye Chrome)
//    - 👑 Hoàng Kim Đế Vương (24K Metallic Royal Gold)
//    - 🌸 Sakura Zen Nhật Bản (Falling Cherry Blossoms)
//    - 🎬 Đêm Điện Ảnh (Cyber Cinema Dark Mode)
// ========================================================
class MultiThemeEngine {
  constructor() {
    this.bgCanvas = document.getElementById('cat-eye-bg');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
    this.fxCanvas = document.getElementById('click-fx-canvas');
    this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext('2d') : null;

    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.mouseX = this.w * 0.65;
    this.mouseY = this.h * 0.38;
    this.targetMouseX = this.mouseX;
    this.targetMouseY = this.mouseY;

    this.currentTheme = 'silver';
    this.time = 0;
    this.excitation = 0;

    // Interactive pools
    this.ripples = [];
    this.sparks = [];

    // 1. SILVER CAT-EYE CONFIG
    this.silverRings = [
      { rx: 140, ry: 65, speed: 0.003, rot: -0.45, nodes: [0.2, 0.75] },
      { rx: 240, ry: 110, speed: -0.0022, rot: -0.45, nodes: [0.1, 0.5, 0.85] },
      { rx: 360, ry: 165, speed: 0.0018, rot: -0.45, nodes: [0.35, 0.8] },
      { rx: 500, ry: 230, speed: -0.0015, rot: -0.45, nodes: [0.15, 0.65] },
      { rx: 660, ry: 305, speed: 0.0012, rot: -0.45, nodes: [0.4, 0.9] },
      { rx: 840, ry: 390, speed: -0.0009, rot: -0.45, nodes: [0.25, 0.7] }
    ];

    // 2. APPLE LIQUID GLASS (VISIONOS REFRACTIVE FROST) CONFIG
    this.liquidDroplets = [];
    this.initLiquidDroplets(36);

    // 3. SAKURA FALLING PETALS CONFIG
    this.sakuraPetals = [];
    this.initSakuraPetals(65);

    // 4. DARK CYBER STARFIELD CONFIG
    this.darkStars = [];
    this.initDarkStars(90);

    if (this.bgCtx && this.fxCtx) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initEvents();
      this.initThemeUI();
      this.loop();
    }
  }

  resize() {
    if (!this.bgCanvas || !this.fxCanvas) return;
    this.w = this.bgCanvas.width = this.fxCanvas.width = window.innerWidth;
    this.h = this.bgCanvas.height = this.fxCanvas.height = window.innerHeight;
  }

  // --- ENTITY INITIALIZERS ---
  initLiquidDroplets(count) {
    this.liquidDroplets = [];
    for (let i = 0; i < count; i++) {
      this.liquidDroplets.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 0.45,
        speedY: -Math.random() * 0.45 - 0.18,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        alpha: Math.random() * 0.4 + 0.4,
        colorTone: Math.random() > 0.4 ? 'cyan' : (Math.random() > 0.5 ? 'violet' : 'white')
      });
    }
  }

  initSakuraPetals(count) {
    this.sakuraPetals = [];
    for (let i = 0; i < count; i++) {
      this.sakuraPetals.push({
        x: Math.random() * (this.w + 200) - 100,
        y: Math.random() * this.h,
        size: Math.random() * 8 + 10,
        speedX: Math.random() * 1.5 + 0.8,
        speedY: Math.random() * 1.4 + 1.0,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.04 + 0.02,
        wobbleAmp: Math.random() * 1.5 + 1.0,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.025,
        flipX: Math.random() * Math.PI * 2,
        vFlipX: Math.random() * 0.03 + 0.015,
        opacity: Math.random() * 0.4 + 0.55,
        petalTone: Math.random() > 0.4 ? 'pink' : 'white'
      });
    }
  }

  initDarkStars(count) {
    this.darkStars = [];
    for (let i = 0; i < count; i++) {
      this.darkStars.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.6 ? '#38bdf8' : (Math.random() > 0.5 ? '#c084fc' : '#ffffff')
      });
    }
  }

  // --- THEME SELECTOR & UI ---
  initThemeUI() {
    const wrap = document.querySelector('.theme-selector-wrap');
    const themeBtn = document.getElementById('theme-btn');
    const dropdown = document.getElementById('theme-dropdown');
    const opts = document.querySelectorAll('.theme-opt');

    // Always default to 'silver' (Trắng Bạc Mắt Mèo - theme gốc của Tuấn Hưng)
    localStorage.removeItem('theme_preference'); // clear test override
    const stored = localStorage.getItem('theme_user_choice') || 'silver';
    this.setTheme(stored, false);

    if (themeBtn && wrap) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrap.classList.toggle('open');
        themeBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) {
          wrap.classList.remove('open');
          themeBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Escape key closes dropdown
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && wrap.classList.contains('open')) {
          wrap.classList.remove('open');
          themeBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.dataset.theme;
        localStorage.setItem('theme_user_choice', theme);
        this.setTheme(theme, true);
        if (wrap) wrap.classList.remove('open');
        if (themeBtn) themeBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  setTheme(theme, triggerFX = true) {
    this.currentTheme = theme;
    localStorage.setItem('theme_user_choice', theme);

    // Clean body classes
    document.body.classList.remove('silver-theme', 'theme-silver', 'theme-gold', 'theme-liquid', 'liquid-glass', 'apple-theme', 'theme-sakura', 'sakura-theme');

    const themeMap = {
      liquid: { icon: '💧', label: 'Apple Liquid Glass', bodyClass: ['theme-liquid', 'liquid-glass', 'apple-theme'] },
      silver: { icon: '✨', label: 'Bạc Mắt Mèo', bodyClass: ['silver-theme', 'theme-silver'] },
      sakura: { icon: '🌸', label: 'Sakura Zen', bodyClass: ['theme-sakura', 'sakura-theme'] },
      dark: { icon: '🎬', label: 'Đêm Điện Ảnh', bodyClass: [] }
    };

    const cfg = themeMap[theme] || themeMap.silver;
    cfg.bodyClass.forEach(cls => document.body.classList.add(cls));

    // Update button display
    const iconEl = document.getElementById('theme-icon');
    const labelEl = document.getElementById('theme-label');
    if (iconEl) iconEl.textContent = cfg.icon;
    if (labelEl) labelEl.textContent = cfg.label;

    // Update active state in dropdown
    document.querySelectorAll('.theme-opt').forEach(opt => {
      if (opt.dataset.theme === theme) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    this.excitation = 1.0;
    if (triggerFX) {
      this.spawnClickFX(this.w / 2, this.h * 0.35);
    }
  }

  initEvents() {
    window.addEventListener('pointermove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;
    });

    window.addEventListener('pointerdown', (e) => {
      // Don't trigger canvas click burst if clicking inside trailer HUD or video modal
      if (e.target.closest('#modal') || e.target.closest('#trailer-overlay')) return;
      this.spawnClickFX(e.clientX, e.clientY);
    });

    // 3D Card tilt on hover
    const cards = document.querySelectorAll('.channel-card, .tvc-card, .tool-card, .card, .item, .hero-portrait-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(850px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // --- CLICK FX SPAWNER ---
  spawnClickFX(x, y) {
    this.excitation = 1.0;

    if (this.currentTheme === 'liquid') {
      // Apple Minimalist Optical Glass Ripple - subtle, clean, crystal pure
      this.ripples.push({
        x, y, r: 0, maxR: Math.min(180, this.w * 0.25), speed: 5.5,
        alpha: 0.7, color: 'rgba(255, 255, 255, 0.5)', strokeWidth: 1.5
      });
      this.ripples.push({
        x, y, r: 0, maxR: Math.min(100, this.w * 0.16), speed: 3.5,
        alpha: 0.5, color: 'rgba(255, 255, 255, 0.35)', strokeWidth: 1.0
      });
    } else if (this.currentTheme === 'sakura') {
      // Sakura Cherry Blossom Shockwave + Fluttering Blossom Burst
      this.ripples.push({
        x, y, r: 0, maxR: Math.min(190, this.w * 0.28), speed: 6,
        alpha: 1, color: '#f472b6', strokeWidth: 2.5
      });
      this.ripples.push({
        x, y, r: 0, maxR: Math.min(130, this.w * 0.18), speed: 4.5,
        alpha: 0.85, color: '#fce7f3', strokeWidth: 2
      });

      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        this.sparks.push({
          type: 'sakura_petal',
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 8 + 9,
          alpha: 1,
          decay: Math.random() * 0.018 + 0.012,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          flipX: Math.random() * Math.PI,
          vFlipX: 0.08,
          color: Math.random() > 0.5 ? '#f472b6' : '#fce7f3'
        });
      }
    } else if (this.currentTheme === 'dark') {
      // Cyber Neon Cyan & Violet Shockwave
      this.ripples.push({
        x, y, r: 0, maxR: Math.min(200, this.w * 0.3), speed: 8,
        alpha: 1, color: '#06b6d4', strokeWidth: 2.5
      });
      this.ripples.push({
        x, y, r: 0, maxR: Math.min(140, this.w * 0.2), speed: 6,
        alpha: 0.9, color: '#a855f7', strokeWidth: 2
      });

      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 3;
        this.sparks.push({
          type: 'cyber_dot',
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.8 + 1.2,
          alpha: 1,
          decay: Math.random() * 0.025 + 0.018,
          rot: 0, vRot: 0,
          color: Math.random() > 0.5 ? '#06b6d4' : '#a855f7'
        });
      }
    } else {
      // Silver Diamond Sparkle Shockwave
      this.ripples.push({
        x, y, r: 0, maxR: Math.min(180, this.w * 0.28), speed: 7,
        alpha: 1, color: '#ffffff', strokeWidth: 2.2
      });
      this.ripples.push({
        x, y, r: 0, maxR: Math.min(130, this.w * 0.2), speed: 5.5,
        alpha: 0.85, color: '#cbd5e1', strokeWidth: 1.8
      });

      for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8.5 + 2.5;
        this.sparks.push({
          type: 'silver_diamond',
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.2 + 1.4,
          alpha: 1,
          decay: Math.random() * 0.024 + 0.016,
          rot: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.22,
          color: Math.random() > 0.45 ? '#ffffff' : (Math.random() > 0.5 ? '#cbd5e1' : '#e0f2fe')
        });
      }
    }
  }

  // --- RENDERERS FOR EACH THEME ---
  drawSilverTheme(ctx) {
    const cx = this.w * 0.65 + (this.mouseX - this.w / 2) * 0.035;
    const cy = this.h * 0.38 + (this.mouseY - this.h / 2) * 0.035;

    const lightAngle = Math.atan2(this.mouseY - cy, this.mouseX - cx);
    const slitAngle = lightAngle + Math.PI / 2;

    const breathe = 1 + Math.sin(this.time * 0.75) * 0.025;
    const glowBoost = 1 + this.excitation * 1.5;

    ctx.save();
    ctx.translate(cx, cy);

    // Deep ambient silver halo
    const halo = ctx.createRadialGradient(0, 0, 40, 0, 0, 650);
    halo.addColorStop(0, `rgba(255, 255, 255, ${0.12 * glowBoost})`);
    halo.addColorStop(0.3, `rgba(203, 213, 225, ${0.07 * glowBoost})`);
    halo.addColorStop(0.7, `rgba(148, 163, 184, ${0.025 * glowBoost})`);
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 650, 0, Math.PI * 2);
    ctx.fill();

    // Concentric cat-eye orbital rings
    this.silverRings.forEach((r, idx) => {
      const rx = r.rx * breathe;
      const ry = r.ry * breathe;
      const rot = r.rot;

      ctx.save();
      ctx.rotate(rot);

      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(226, 232, 240, ${0.32 * (0.85 - idx * 0.08)})`;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // Specular chatoyant slit
      const relSlit = slitAngle - rot;
      [relSlit, relSlit + Math.PI].forEach(slit => {
        const fx = Math.cos(slit) * rx;
        const fy = Math.sin(slit) * ry;

        const flare = ctx.createRadialGradient(fx, fy, 1, fx, fy, 45 + idx * 7);
        flare.addColorStop(0, `rgba(255, 255, 255, ${0.92 * glowBoost})`);
        flare.addColorStop(0.2, `rgba(241, 245, 249, ${0.72 * glowBoost})`);
        flare.addColorStop(0.5, `rgba(203, 213, 225, ${0.32 * glowBoost})`);
        flare.addColorStop(1, 'transparent');

        ctx.fillStyle = flare;
        ctx.beginPath();
        ctx.arc(fx, fy, 45 + idx * 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 14 * glowBoost;
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Orbiting stardust nodes
      r.nodes.forEach(pos => {
        const currentPos = (pos + this.time * r.speed) % (Math.PI * 2);
        const nx = Math.cos(currentPos) * rx;
        const ny = Math.sin(currentPos) * ry;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#cbd5e1';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(nx, ny, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.restore();
    });

    // Central iris cat-eye core
    const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 48);
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * glowBoost})`);
    coreGrad.addColorStop(0.35, `rgba(226, 232, 240, ${0.45 * glowBoost})`);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawLiquidTheme(ctx) {
    // Pure, Crystal-Clear Apple Minimalist Ambient Spotlight
    // Smooth, calm, sophisticated - no chaotic floating beads or cosmic rings
    const cx = this.w * 0.5 + (this.mouseX - this.w / 2) * 0.035;
    const cy = this.h * 0.32 + (this.mouseY - this.h / 2) * 0.035;
    const glowBoost = 1 + this.excitation * 0.6;

    ctx.save();

    // 1. Apple Keynote Studio Spotlight (Center-top diffuse ambient glow)
    const maxDim = Math.max(this.w, this.h);
    const spot = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDim * 0.55);
    spot.addColorStop(0, `rgba(255, 255, 255, ${0.08 * glowBoost})`);
    spot.addColorStop(0.35, `rgba(255, 255, 255, ${0.03 * glowBoost})`);
    spot.addColorStop(0.7, `rgba(255, 255, 255, ${0.003 * glowBoost})`);
    spot.addColorStop(1, 'transparent');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, this.w, this.h);

    // 2. Soft studio fill light behind portrait area
    const heroX = this.w * 0.68 + (this.mouseX - this.w / 2) * 0.02;
    const heroY = this.h * 0.42 + (this.mouseY - this.h / 2) * 0.02;
    const heroGlow = ctx.createRadialGradient(heroX, heroY, 0, heroX, heroY, 340);
    heroGlow.addColorStop(0, `rgba(255, 255, 255, ${0.06 * glowBoost})`);
    heroGlow.addColorStop(0.5, `rgba(255, 255, 255, ${0.008 * glowBoost})`);
    heroGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = heroGlow;
    ctx.beginPath();
    ctx.arc(heroX, heroY, 340, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawSakuraTheme(ctx) {
    const cx = this.w * 0.65 + (this.mouseX - this.w / 2) * 0.025;
    const cy = this.h * 0.38 + (this.mouseY - this.h / 2) * 0.025;
    const glowBoost = 1 + this.excitation * 1.5;

    ctx.save();
    ctx.translate(cx, cy);

    // Zen Cherry Blossom soft circular aura
    const aura = ctx.createRadialGradient(0, 0, 50, 0, 0, 650);
    aura.addColorStop(0, `rgba(244, 114, 182, ${0.18 * glowBoost})`);
    aura.addColorStop(0.35, `rgba(251, 113, 133, ${0.09 * glowBoost})`);
    aura.addColorStop(0.7, `rgba(159, 18, 57, ${0.03 * glowBoost})`);
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 650, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Japanese Zen circular wave rings (Enso ripple style)
    for (let i = 1; i <= 4; i++) {
      const r = i * 160 + Math.sin(this.time * 0.8 + i) * 8;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(244, 114, 182, ${0.18 - i * 0.035})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }

  // FOREGROUND 3D SAKURA PETALS (Drawn on fxCtx so petals float over cards and text)
  drawSakuraPetals(ctx) {
    if (!this.sakuraPetals || this.sakuraPetals.length === 0) {
      this.initSakuraPetals(65);
    }

    this.sakuraPetals.forEach(p => {
      // Wind deflection when cursor moves nearby
      const dx = p.x - this.mouseX;
      const dy = p.y - this.mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < 160) {
        const force = (1 - dist / 160) * 4;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
        p.rot += 0.05;
      }

      // Physics update: falling with wind drift
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * p.wobbleAmp;
      p.y += p.speedY;
      p.rot += p.vRot;
      p.flipX += p.vFlipX;

      // Wrap around bounds
      if (p.y > this.h + 30) {
        p.y = -30;
        p.x = Math.random() * (this.w + 200) - 100;
      }
      if (p.x > this.w + 50) {
        p.x = -50;
      }
      if (p.x < -50) {
        p.x = this.w + 50;
      }

      // 3D tumbling foreshortening
      const scaleX = Math.cos(p.flipX);
      const sz = p.size;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(scaleX, 1);
      ctx.globalAlpha = p.opacity;

      // Realistic Sakura Petal Bezier Curve
      ctx.beginPath();
      ctx.moveTo(0, 0); // petal base
      ctx.bezierCurveTo(-sz * 0.6, -sz * 0.4, -sz * 0.75, -sz * 0.85, -sz * 0.15, -sz * 1.25);
      ctx.lineTo(0, -sz * 1.15); // delicate tip notch
      ctx.lineTo(sz * 0.15, -sz * 1.25);
      ctx.bezierCurveTo(sz * 0.75, -sz * 0.85, sz * 0.6, -sz * 0.4, 0, 0);
      ctx.closePath();

      // Petal gradient: deep rose base to white-blush tip
      const grad = ctx.createLinearGradient(0, 0, 0, -sz * 1.25);
      if (p.petalTone === 'pink') {
        grad.addColorStop(0, 'rgba(225, 29, 72, 0.95)');
        grad.addColorStop(0.3, 'rgba(244, 114, 182, 0.9)');
        grad.addColorStop(0.8, 'rgba(253, 242, 248, 0.85)');
        grad.addColorStop(1, '#ffffff');
      } else {
        grad.addColorStop(0, 'rgba(244, 114, 182, 0.9)');
        grad.addColorStop(0.4, 'rgba(252, 231, 243, 0.9)');
        grad.addColorStop(1, '#ffffff');
      }

      ctx.fillStyle = grad;
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Subtle petal vein
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -sz * 1.05);
      ctx.stroke();

      ctx.restore();
    });
  }

  drawDarkTheme(ctx) {
    const cx = this.w * 0.65;
    const cy = this.h * 0.38;

    // Cyber space ambient nebula
    const nebula = ctx.createRadialGradient(cx, cy, 50, cx, cy, 600);
    nebula.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
    nebula.addColorStop(0.4, 'rgba(168, 85, 247, 0.06)');
    nebula.addColorStop(0.8, 'rgba(15, 23, 42, 0.02)');
    nebula.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula;
    ctx.beginPath();
    ctx.arc(cx, cy, 600, 0, Math.PI * 2);
    ctx.fill();

    // 90 Twinkling cyber stars
    this.darkStars.forEach(s => {
      s.phase += s.twinkleSpeed;
      const alpha = s.alpha * (0.5 + Math.sin(s.phase) * 0.5);

      ctx.save();
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // --- MAIN BACKGROUND CANVAS LOOP ---
  drawBackground() {
    const ctx = this.bgCtx;
    ctx.clearRect(0, 0, this.w, this.h);

    this.time += 0.016;
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    if (this.currentTheme === 'liquid') {
      this.drawLiquidTheme(ctx);
    } else if (this.currentTheme === 'sakura') {
      this.drawSakuraTheme(ctx);
    } else if (this.currentTheme === 'dark') {
      this.drawDarkTheme(ctx);
    } else {
      this.drawSilverTheme(ctx);
    }

    // Decay click excitation
    if (this.excitation > 0) {
      this.excitation *= 0.92;
      if (this.excitation < 0.01) this.excitation = 0;
    }
  }

  // --- FOREGROUND CLICK FX CANVAS LOOP ---
  drawClickFX() {
    const ctx = this.fxCtx;
    ctx.clearRect(0, 0, this.w, this.h);

    // 0. Falling 3D Sakura Petals in foreground (over all cards, text & hero)
    if (this.currentTheme === 'sakura') {
      this.drawSakuraPetals(ctx);
    }

    // 1. Expanding shockwave ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.r += rip.speed;
      rip.alpha = Math.max(0, 1 - rip.r / rip.maxR);

      if (rip.alpha <= 0) {
        this.ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.strokeStyle = rip.color || '#ffffff';
      ctx.globalAlpha = rip.alpha;
      ctx.lineWidth = (rip.strokeWidth || 2) * rip.alpha;
      ctx.shadowColor = rip.color || '#ffffff';
      ctx.shadowBlur = 14 * rip.alpha;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Glittering sparks / diamond stars / sakura burst petals
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.94;
      s.vy *= 0.94;
      s.vy += 0.08; // subtle gravity
      s.rot += s.vRot;
      s.alpha -= s.decay;

      if (s.alpha <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = Math.max(0, s.alpha);

      if (s.type === 'liquid_bead') {
        // Apple Liquid Glass Droplet with Glossy Specular Sheen
        const sz = s.size;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(0, 0, sz, 0, Math.PI * 2);
        ctx.fill();

        // Glossy reflection highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-sz * 0.32, -sz * 0.32, sz * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Delicate refractive rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, sz, 0, Math.PI * 2);
        ctx.stroke();
      } else if (s.type === 'sakura_petal') {
        // Tumbling petal on click
        s.flipX += s.vFlipX || 0.05;
        ctx.scale(Math.cos(s.flipX), 1);
        ctx.fillStyle = s.color;
        ctx.shadowColor = '#f472b6';
        ctx.shadowBlur = 8;
        const sz = s.size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-sz * 0.5, -sz * 0.4, -sz * 0.6, -sz * 0.8, 0, -sz);
        ctx.bezierCurveTo(sz * 0.6, -sz * 0.8, sz * 0.5, -sz * 0.4, 0, 0);
        ctx.fill();
      } else if (s.type === 'cyber_dot') {
        // High tech cyber particle
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 4-point Diamond / Sunburst Star (Silver or Gold)
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        const sz = s.size;
        ctx.beginPath();
        ctx.moveTo(0, -sz * 2);
        ctx.lineTo(sz * 0.45, -sz * 0.45);
        ctx.lineTo(sz * 2, 0);
        ctx.lineTo(sz * 0.45, sz * 0.45);
        ctx.lineTo(0, sz * 2);
        ctx.lineTo(-sz * 0.45, sz * 0.45);
        ctx.lineTo(-sz * 2, 0);
        ctx.lineTo(-sz * 0.45, -sz * 0.45);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  loop() {
    this.drawBackground();
    this.drawClickFX();
    requestAnimationFrame(() => this.loop());
  }
}

// Khởi chạy Multi-Theme Dynamic Engine & Click FX
const catEyeEngine = new MultiThemeEngine();

// ========================================================
// 8. INTERACTIVE FRAMELESS PORTRAIT & THEME PARTICLE BURST
// ========================================================
function initFramelessHero() {
  const stage = document.getElementById('frameless-stage');
  const person = document.getElementById('frameless-person');
  if (!stage || !person) return;

  let burstThrottle = 0;
  let isHovered = false;

  // On mouse enter: trigger initial lush particle burst
  stage.addEventListener('mouseenter', (e) => {
    isHovered = true;
    stage.classList.add('is-hovered');

    if (typeof catEyeEngine !== 'undefined' && catEyeEngine && catEyeEngine.currentTheme !== 'liquid') {
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.48;

      // Spawn lush burst framing shoulders & halo (keeps face clear)
      catEyeEngine.spawnClickFX(cx - 110, cy);
      catEyeEngine.spawnClickFX(cx + 110, cy);

      // Staggered top aura puff
      setTimeout(() => {
        if (isHovered && catEyeEngine && catEyeEngine.currentTheme !== 'liquid') {
          catEyeEngine.spawnClickFX(cx, rect.top + 40);
        }
      }, 150);
    }
  });

  // On mouse move: 3D parallax tilt & gentle ambient emission
  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // 3D elevation & tilt
    person.style.transform = `perspective(1000px) rotateY(${x * 14}deg) rotateX(${-y * 12}deg) scale3d(1.08, 1.08, 1.08) translateY(-14px)`;

    // Throttle particle emission trail around perimeter
    const now = Date.now();
    if (now - burstThrottle > 220) {
      burstThrottle = now;
      if (typeof catEyeEngine !== 'undefined' && catEyeEngine && catEyeEngine.currentTheme !== 'liquid') {
        // Emit from sides to frame character
        const sideX = x > 0 ? e.clientX + 30 : e.clientX - 30;
        catEyeEngine.spawnClickFX(sideX, e.clientY);
      }
    }
  });

  // On mouse leave: reset cleanly
  stage.addEventListener('mouseleave', () => {
    isHovered = false;
    stage.classList.remove('is-hovered');
    person.style.transform = '';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFramelessHero);
} else {
  initFramelessHero();
}


