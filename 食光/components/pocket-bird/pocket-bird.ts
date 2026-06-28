// 口袋小鸟 - WeChat组件
import { Birb, createBehavior, PET_MSGS, SPECIES, ALL_SPECIES, HAT, HAT_ORDER, HAT_META } from '../../utils/pocket-bird-engine';

Component({
  properties: {
    pixelSize: { type: Number, value: 3 },
    pageTargets: { type: Array, value: [], observer: function (targets: any[]) {
      if (targets && targets.length > 0 && this._bh) {
        this._bh.setTargets(targets);
      }
    }},
    scrollTop: { type: Number, value: 0 },
  },

  data: {
    canvasWidth: 96, canvasHeight: 96, hitW: 192, hitH: 192,
    birdLeft: 0, birdBottom: 0,
    bubbleText: '', showBubble: false, bubbleColor: '#3f2c15',
    showMenu: false, menuLeft: 0, menuTop: 0,
    showPanel: false, panelMode: '',
    speciesList: [], hatList: [],
    showFeather: false, featherLeft: 0, featherTop: 0,
    showHatDrop: false, hatDropX: 0, hatDropY: 0,
    birdHidden: false, birdFrozen: false, birdFlyMode: true,
    bouncing: false,
  },

  lifetimes: {
    ready: function () { this._setup(); },
    detached: function () { this._teardown(); },
  },
  pageLifetimes: {
    show: function () { this._onShow(); },
    hide: function () { this._onHide(); },
  },

  methods: {
    // ======== 初始化和清理 ========
    _setup: function () {
      var self = this;
      // 所有内部状态挂载在 this 上
      self._paused = false; self._fc = 0;
      self._raf = 0; self._tick = 0; self._bt = 0; self._lpt = 0;
      self._ts = { x: 0, y: 0, t: 0 };
      self._fy = 0; self._fx = 0; self._fsp = ''; self._ftick = 0;
      self._showHat = false; self._hatId = '';

      var ps = self.properties.pixelSize;
      var cw = 32 * ps, ch = 32 * ps;
      var sw = wx.getWindowInfo().windowWidth;
      var wh = wx.getWindowInfo().windowHeight;
      // 小鸟起始位置（默认底部居中，会被 restoreState 覆盖）
      var saved = self._restoreState();
      var startX = saved.x || sw / 2, startY = saved.y || 120;
      self.setData({ canvasWidth: cw, canvasHeight: ch, hitW: cw * 1.5, hitH: ch * 1.5, birdLeft: startX - cw, birdBottom: 0 });

      var q = self.createSelectorQuery();
      q.select('#bird-canvas').fields({ node: true, size: true }).exec(function (res) {
        if (!res || !res[0] || !res[0].node) return;
        var cnv = res[0].node, ctx = cnv.getContext('2d');
        var dpr = wx.getWindowInfo().pixelRatio;
        cnv.width = cw * dpr; cnv.height = ch * dpr;
        ctx.scale(dpr, dpr);
        self._ctx = ctx; self._canvas = cnv;
        self._birb = new Birb(ps); // 构造函数内部 loadData() 恢复物种/帽子/解锁
        self._bh = createBehavior(self._birb, sw, wh);
        // 恢复位置（引擎不保存位置）
        if (saved.x) self._bh.moveTo(saved.x, saved.y);
        // 恢复行为状态（引擎不保存这些）
        if (saved.frozen && self._bh) self._bh.setFrozen(true);
        if (saved.flyMode === false && self._bh) self._bh.setFlyMode(false);
        self.setData({ birdFrozen: !!saved.frozen, birdFlyMode: saved.flyMode !== false });
        if (saved.hidden) { self.setData({ birdHidden: true }); if (self._birb) self._birb.visible = false; }
        self._startLoop();
      });
    },

    _teardown: function () {
      this._saveState();
      this._pause();
      if (this._bt) clearTimeout(this._bt);
      if (this._lpt) clearTimeout(this._lpt);
    },

    // ======== 动画循环 ========
    _startLoop: function () {
      var self = this;
      if (self._paused) return;
      var cnv = self._canvas;
      if (cnv && typeof cnv.requestAnimationFrame === 'function') {
        var loop = function () { self._loop(); if (!self._paused) self._raf = cnv.requestAnimationFrame(loop); };
        self._raf = cnv.requestAnimationFrame(loop);
      } else {
        self._loop();
        self._tick = setInterval(function () { self._loop(); }, 16);
      }
    },

    _loop: function () {
      var self = this;
      self._fc++;
      if (self._paused || !self._birb || !self._bh || !self._ctx) return;
      var bh = self._bh;
      bh.update();
      bh.draw(self._ctx);

      if (self._fc % 3 === 0) {
        var x = bh.getX(), y = bh.getY(), hw = self.data.hitW;
        // 跟滚：birdBottom+scrollTop使鸟随页面内容同步移动
        var st = self.properties.scrollTop || 0;
        self.setData({ birdLeft: x - hw / 2, birdBottom: y + st });
      }
      // 每60帧自动保存位置（约1秒一次）
      if (self._fc % 60 === 0) self._saveState();
      if (self.data.showFeather) self._updFeather();
      // 帽子自动掉落：每60秒20%概率
      if (self._fc % 3600 === 0 && Math.random() < 0.2) self._spawnHat();
    },

    // 扫描页面元素作为飞行目标
    _scanTargets: function () {
      var self = this;
      // 用最宽泛选择器：找所有有样式类的view元素
      var q = wx.createSelectorQuery();
      q.selectAll('view[class]').boundingClientRect(function (rects) {
        var count = rects ? rects.length : 0;
        console.log('[scan] found', count, 'elements');
        if (rects && count > 0 && self._bh) {
          var targets = [];
          for (var i = 0; i < rects.length; i++) {
            var r = rects[i];
            if (r.width > 40 && r.height > 20 && r.top > 10 && r.top < wx.getWindowInfo().windowHeight - 50) {
              targets.push({ x: r.left, y: r.top, w: r.width, h: r.height });
            }
          }
          console.log('[scan] filtered', targets.length, 'targets');
          if (targets.length > 0) self._bh.setTargets(targets);
        }
      });
      q.exec();
    },

    // ======== 触摸 ========
    onTouchStart: function (e) {
      var self = this, t = e.touches[0];
      self._ts = { x: t.clientX, y: t.clientY, t: Date.now() };
      self._dragging = false;
      if (self._lpt) clearTimeout(self._lpt);
      self._lpt = setTimeout(function () { if(!self._dragging) self._showMenu(); }, 500);
    },
    onTouchMove: function (e) {
      var self = this, t = e.touches[0];
      var dx = Math.abs(t.clientX - self._ts.x);
      var dy = Math.abs(t.clientY - self._ts.y);
      if (dx > 20 || dy > 20) {
        self._dragging = true;
        if (self._lpt) { clearTimeout(self._lpt); self._lpt = 0; }
        // 拖拽鸟到手指位置
        var bh = self._bh; if (!bh) return;
        var y = wx.getWindowInfo().windowHeight - t.clientY;
        bh.moveTo(t.clientX, y);
      }
    },
    onTouchEnd: function (e) {
      var self = this;
      if (self._lpt) { clearTimeout(self._lpt); self._lpt = 0; }
      if (self._dragging) return; // 拖拽结束，不触发抚摸
      if (self.data.showMenu) return;
      var bh = self._bh; if (!bh) return;
      var ts = self._ts, dt = Date.now() - ts.t;
      var cx = (e.changedTouches[0] || {}).clientX || 0;
      var cy = (e.changedTouches[0] || {}).clientY || 0;
      if (dt < 300 && Math.abs(cx - ts.x) < 15 && Math.abs(cy - ts.y) < 15) {
        if (bh.getState() === 'petting') return;
        bh.pet();
        self._chirp();
        var msg = PET_MSGS[Math.floor(Math.random() * PET_MSGS.length)];
        var rc = '#' + Math.floor(Math.random()*256).toString(16).padStart(2,'0') + Math.floor(Math.random()*256).toString(16).padStart(2,'0') + Math.floor(Math.random()*256).toString(16).padStart(2,'0');
        self.setData({ bubbleText: msg, showBubble: true, bubbleColor: rc });
        if (self._bt) clearTimeout(self._bt);
        self._bt = setTimeout(function () { self.setData({ showBubble: false }); }, 2500);
      }
    },

    // ======== 菜单 ========
    _showMenu: function () {
      var self = this;
      if (self.data.showMenu || !self._bh) return;
      self._bh.showMenu();
      var bx = self._bh.getX(), sw = wx.getWindowInfo().windowWidth;
      self.setData({ showMenu: true, menuLeft: bx > sw / 2 ? bx - 220 : bx + 40, menuTop: 80 });
      wx.vibrateShort({ type: 'light' });
    },
    closeMenu: function () {
      if (this._bh) this._bh.hideMenu();
      this.setData({ showMenu: false, showPanel: false });
    },
    tapPet: function () {
      this.closeMenu();
      var self = this, bh = self._bh; if (!bh) return;
      bh.pet();
      self._chirp();
      var msg = PET_MSGS[Math.floor(Math.random() * PET_MSGS.length)];
      var rc = '#' + Math.floor(Math.random()*256).toString(16).padStart(2,'0') + Math.floor(Math.random()*256).toString(16).padStart(2,'0') + Math.floor(Math.random()*256).toString(16).padStart(2,'0');
      self.setData({ bubbleText: msg, showBubble: true, bubbleColor: rc });
      if (self._bt) clearTimeout(self._bt);
      self._bt = setTimeout(function () { self.setData({ showBubble: false }); }, 2500);
    },
    tapSpecies: function () {
      var bh = this._bh; if (!bh) return;
      var unl = bh.getUnlocked(), cur = bh.getCurrentSpecies();
      var list = ALL_SPECIES.map(function (k) {
        var sp = SPECIES[k];
        var c = sp.colors;
        var color = c['theme-highlight'] || c.hood || c.face || '#639bff';
        return { key: k, name: sp.name, unlocked: unl.indexOf(k) >= 0, active: k === cur, color: color };
      });
      this.setData({ showPanel: true, panelMode: 'species', speciesList: list });
    },
    tapHats: function () {
      var bh = this._bh; if (!bh) return;
      var unl = bh.getUnlockedHats(), cur = bh.getCurrentHat();
      var list = HAT_ORDER.map(function (k) {
        return { key: k, name: HAT_META[k] ? HAT_META[k].name : k,
          unlocked: unl.indexOf(k) >= 0, active: k === cur };
      });
      list.unshift({ key: HAT.NONE, name: '不戴帽', unlocked: true, active: cur === HAT.NONE });
      this.setData({ showPanel: true, panelMode: 'hats', hatList: list });
    },
    tapFeather: function () { this.closeMenu(); this._spawnFeather(); },
    tapHide: function () {
      var h = !this.data.birdHidden;
      this.setData({ birdHidden: h, showMenu: false });
      if (this._birb) this._birb.visible = !h;
    },
    tapFreeze: function () {
      var f = !this.data.birdFrozen;
      this.setData({ birdFrozen: f, showMenu: false });
      if (this._bh) this._bh.setFrozen(f);
    },
    tapFlyMode: function () {
      var m = !this.data.birdFlyMode;
      this.setData({ birdFlyMode: m, showMenu: false });
      if (this._bh) this._bh.setFlyMode(m);
      wx.showToast({ title: '【状态】: ' + (m ? '自由' : '底部'), icon: 'none', duration: 1000 });
    },
    tapUnlockAll: function () {
      var bh = this._bh; if (bh) { bh.unlockAll(); }
      wx.showToast({ title: '已全部解锁!', icon: 'success' });
      this.setData({ showMenu: false });
    },
    tapReset: function () {
      if (this._bh) { this._bh.resetAll(); }
      this.setData({ birdHidden: false });
      if (this._birb) this._birb.visible = true;
      wx.showToast({ title: '已重置', icon: 'success' });
      this.setData({ showMenu: false });
    },
    selectSpecies: function (e) {
      var k = e.currentTarget.dataset.key;
      if (!e.currentTarget.dataset.unlocked) return;
      var bh = this._bh; if (!bh) return;
      bh.switchSpecies(k);
      this.setData({ showPanel: false });
      this._saveState();
      wx.showToast({ title: '已切换', icon: 'success', duration: 800 });
    },
    selectHat: function (e) {
      var k = e.currentTarget.dataset.key;
      if (!e.currentTarget.dataset.unlocked) return;
      var bh = this._bh; if (!bh) return;
      bh.switchHat(k);
      this.setData({ showPanel: false });
      this._saveState();
      wx.showToast({ title: '已换帽', icon: 'success', duration: 800 });
    },
    closePanel: function () { this.setData({ showPanel: false }); },

    // ======== 羽毛 (原版参数) ========
    _spawnFeather: function () {
      try {
      var self = this;
      if (self.data.showFeather || !self._bh) return;
      var unl = self._bh.getUnlocked();
      // 原版：15%罕见, 85%常见
      var uncommonFirst = Math.random() < 0.15;
      var avail = ALL_SPECIES.filter(function (s) {
        if (unl.indexOf(s) >= 0) return false;
        var r = SPECIES[s].rarity;
        return uncommonFirst ? r === 'uncommon' : r === 'common';
      });
      if (avail.length === 0) avail = ALL_SPECIES.filter(function (s) { return unl.indexOf(s) < 0; });
      if (avail.length === 0) avail = ALL_SPECIES; // 全解锁了也掉，随便选一种
      self._fsp = avail[Math.floor(Math.random() * avail.length)];
      self._ftick = 0;
      self._fx = 60 + Math.random() * (wx.getWindowInfo().windowWidth - 120);
      self._fy = 10;
      self.setData({ showFeather: true, featherLeft: self._fx, featherTop: self._fy });
      } catch(e) { console.error('[F] spawn error:', e); }
    },
    _updFeather: function () {
      var self = this;
      self._ftick++;
      self._fy += 0.25;
      var wh = wx.getWindowInfo().windowHeight;
      var sw = wx.getWindowInfo().windowWidth;
      var amp = sw * 0.07; // 振幅为屏幕宽度的7%
      if (self._fy < wh - 50) {
        self._fx += Math.sin(3.14 * 2 * (self._ftick / 120)) * amp -
                    Math.sin(3.14 * 2 * ((self._ftick - 1) / 120)) * amp;
      }
      self._fx = Math.max(10, Math.min(sw - 42, self._fx));
      if (self._fc % 3 === 0) self.setData({ featherLeft: self._fx, featherTop: self._fy });
      if (self._fy > wh - 80) self.setData({ showFeather: false });
    },
    collectFeather: function () {
      var self = this;
      if (!self.data.showFeather || !self._fsp) return;
      var bh = self._bh; if (!bh) return;
      bh.unlockSpecies(self._fsp);
      bh.switchSpecies(self._fsp);
      wx.showToast({ title: '新鸟解锁! ' + (SPECIES[self._fsp] ? SPECIES[self._fsp].name : self._fsp), icon: 'none', duration: 2000 });
      self.setData({ showFeather: false });
    },

    // ======== 帽子掉落 (原版) ========
    _spawnHat: function () {
      var self = this;
      if (self._showHat || !self._bh) return;
      var unl = self._bh.getUnlockedHats();
      var avail = HAT_ORDER.filter(function (h) { return unl.indexOf(h) < 0; });
      if (avail.length === 0) return;
      self._hatId = avail[Math.floor(Math.random() * avail.length)];
      var sw = wx.getWindowInfo().windowWidth;
      self._hatX = 40 + Math.random() * (sw - 80);
      self._hatY = 60 + Math.random() * 200;
      self._showHat = true;
      self.setData({ showHatDrop: true, hatDropX: self._hatX, hatDropY: self._hatY });
    },
    collectHat: function () {
      var self = this;
      if (!self._showHat || !self._hatId) return;
      var bh = self._bh; if (!bh) return;
      bh.unlockHat(self._hatId);
      bh.switchHat(self._hatId);
      var name = HAT_META[self._hatId] ? HAT_META[self._hatId].name : self._hatId;
      wx.showToast({ title: '新帽子解锁! ' + name, icon: 'none', duration: 2000 });
      self._showHat = false;
      self.setData({ showHatDrop: false });
    },

    // ======== 暂停/恢复 ========
    _pause: function () {
      this._paused = true;
      var cnv = this._canvas;
      if (this._raf && cnv && cnv.cancelAnimationFrame) { cnv.cancelAnimationFrame(this._raf); this._raf = 0; }
      if (this._tick) { clearInterval(this._tick); this._tick = 0; }
    },
    // ======== 跨页面状态持久化 ========
    _saveState: function () {
      var self = this;
      var bh = self._bh;
      if (!bh) return;
      try {
        wx.setStorageSync('pocketBirdState', {
          x: bh.getX(), y: bh.getY(),
          frozen: self.data.birdFrozen,
          flyMode: self.data.birdFlyMode,
          hidden: self.data.birdHidden,
          ts: Date.now()
        });
      } catch(e) {}
    },
    _restoreState: function () {
      try {
        var s = wx.getStorageSync('pocketBirdState');
        return s || {};
      } catch(e) { return {}; }
    },

    // ======== 鸟叫（Web Audio 合成） ========
    _chirp: function () {
      try {
        var count = Math.floor(1 + Math.random() * 1.5);
        for (var i = 0; i < count; i++) {
          var that = this;
          setTimeout(function () {
            try {
              // WeChat 用 wx.createWebAudioContext，标准浏览器用 AudioContext
              var AudioCtx = wx.createWebAudioContext ? wx.createWebAudioContext() :
                (typeof AudioContext !== 'undefined' ? new AudioContext() :
                (typeof webkitAudioContext !== 'undefined' ? new webkitAudioContext() : null));
              if (!AudioCtx) return;

              var TIMES = [0, 0.06, 0.10, 0.15];
              var FREQUENCIES = [
                2200,
                3500 + Math.random() * 600 * count,
                2100 + Math.random() * 200 * count,
                1600 + Math.random() * 400 * count,
              ];
              var VOLUMES = [0.00005, 0.165, 0.165, 0.0001];

              var oscillator = AudioCtx.createOscillator();
              oscillator.type = "sine";
              var gain = AudioCtx.createGain();
              oscillator.connect(gain);
              gain.connect(AudioCtx.destination);

              var now = AudioCtx.currentTime;
              for (var j = 0; j < TIMES.length; j++) {
                var time = TIMES[j] + now;
                if (j === 0) {
                  oscillator.frequency.setValueAtTime(FREQUENCIES[j], time);
                  gain.gain.setValueAtTime(VOLUMES[j], time);
                } else {
                  oscillator.frequency.exponentialRampToValueAtTime(FREQUENCIES[j], time);
                  gain.gain.exponentialRampToValueAtTime(VOLUMES[j], time);
                }
              }

              oscillator.start(now);
              oscillator.stop(now + TIMES[TIMES.length - 1]);
            } catch(e) {}
          }, i * 120);
        }
      } catch(e) {}
    },

    _onShow: function () {
      if (!this._paused) return;
      this._paused = false;
      // 切换tab时自动显示小鸟
      this.setData({ birdHidden: false });
      if (this._birb) { this._birb.visible = true; this._birb.animStart = Date.now(); }
      this._startLoop();
    },
    _onHide: function () {
      this._saveState();
      this._pause();
    },
  },
});
