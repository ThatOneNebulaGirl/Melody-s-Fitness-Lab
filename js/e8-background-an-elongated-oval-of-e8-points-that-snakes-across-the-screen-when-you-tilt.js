/* ---------- E8 background: an elongated oval of E8 points that snakes across the screen when you tilt ---------- */
  var Bg = (function(){
    var cv = document.getElementById("bg");
    var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var KEEP_EVERY = 3;        // draw 1 in 3 of the edges between the remaining points
    var PAL = {
      light:{edge:["#b9a4ea","#c79fe6","#e497c8","#f08fb4","#f3a58f"], ea:.38, dot:["#b9a4ea","#d98bd0","#f27fae","#f6a38a"], da:.85, soft:true, contour:"#f08fb4"},
      dark:{edge:["#3a46ff","#1e7bff","#00d4ff","#8a4dff","#8fe6ff"], ea:.56, dot:["#00e5ff","#4a7dff","#a463ff","#ffffff"], da:.95, glow:true, spark:"#7df3ff", contour:"#4d7cff"}
    };
    var pal = PAL.light, theme = "light";
    // colours are built from a hue that the gyro (or the mouse on a computer) turns round the rainbow
    var HUE = {
      light:{base:265, edge:[0,20,55,75,115], dot:[0,35,65,115], con:75, sat:72, ls:[70,72,72,72,74], dl:[72,70,70,76]},
      dark: {base:235, edge:[0,-20,-45,30,-35], dot:[-45,-5,50,0], con:-10, sat:100, ls:[58,62,58,64,78], dl:[62,60,62,100]}
    };
    function hs(h, sa, l, a){ return "hsla(" + (((h % 360) + 360) % 360).toFixed(0) + "," + sa + "%," + l + "%," + (a == null ? 1 : a) + ")"; }
    var EC = [], DC = [], CC = "", SC = "", hue = 0, hueAcc = 0, gact = 0, rot = 0;
    function makeColors(h){
      var Hh = HUE[theme], kq;
      for(kq = 0; kq < 5; kq++) EC[kq] = hs(h + Hh.edge[kq], Hh.sat, Hh.ls[kq]);
      for(kq = 0; kq < 4; kq++) DC[kq] = (theme === "dark" && kq === 3) ? "#ffffff" : hs(h + Hh.dot[kq], Hh.sat, Hh.dl[kq]);
      CC = hs(h + Hh.con, Hh.sat, 62); SC = hs(h - 45, 100, 78);
    }
    function ca(c, a){ return c.charAt(0) === "#" ? rgba(c, a) : c.replace(/,[^,]*\)$/, "," + a + ")"); }

    // --- E8 roots (240), then keep 120 of them as 60 opposite pairs so the cloud stays balanced
    var roots = [], i, j, k, n;
    for(i = 0; i < 8; i++) for(j = i + 1; j < 8; j++) for(var si = -1; si <= 1; si += 2) for(var sj = -1; sj <= 1; sj += 2){
      var v = [0,0,0,0,0,0,0,0]; v[i] = si; v[j] = sj; roots.push(v);
    }
    for(n = 0; n < 256; n++){
      var v2 = [], neg = 0;
      for(k = 0; k < 8; k++){ var sg = ((n >> k) & 1) ? 1 : -1; if(sg < 0) neg++; v2.push(sg * 0.5); }
      if(neg % 2 === 0) roots.push(v2);
    }
    var keyOf = function(v){ return v.join(","); }, byKey = {}, seen = {}, pairs = [];
    roots.forEach(function(v, idx){ byKey[keyOf(v)] = idx; });
    roots.forEach(function(v, idx){
      if(seen[idx]) return;
      var ni = byKey[keyOf(v.map(function(x){ return -x; }))];
      seen[idx] = seen[ni] = 1; pairs.push([idx, ni]);
    });
    var order = pairs.map(function(p, pi){ return [(pi * 37) % pairs.length, p]; }).sort(function(a, b){ return a[0] - b[0]; });
    var kept = [];
    order.slice(0, pairs.length / 2).forEach(function(o){ kept.push(roots[o[1][0]], roots[o[1][1]]); });
    roots = kept;
    var N = roots.length;
    var allA = [], allB = [];
    for(i = 0; i < N; i++) for(j = i + 1; j < N; j++){
      var d = 0;
      for(k = 0; k < 8; k++) d += roots[i][k] * roots[j][k];
      if(Math.abs(d - 1) < 1e-9){ allA.push(i); allB.push(j); }
    }
    var stats = {roots:N, edges:allA.length};
    var ka = [], kb = [];
    for(i = 0; i < allA.length; i += KEEP_EVERY){ ka.push(allA[i]); kb.push(allB[i]); }
    var K = ka.length;
    var bend = new Float32Array(K);
    for(i = 0; i < K; i++) bend[i] = ((i % 2) ? 1 : -1) * (0.2 + 0.16 * (((i * 13) % 5) / 4));

    // --- the snake's route across the screen (normalised to the window): left edge up, over the top, down the right in S-bends
    var PATHN = [[.05,.66],[.05,.50],[.07,.34],[.10,.19],[.17,.08],[.30,.05],[.46,.08],[.62,.04],[.78,.07],[.90,.12],[.95,.26],[.92,.42],[.95,.58],
                 [.93,.74],[.87,.89],[.74,.95],[.58,.92],[.42,.95],[.26,.93],[.12,.87],[.06,.77]];     // a closed loop around the screen
    var poly = [], cumA = [0], pathLen = 1;
    function sampleCR(pts, nn){                          // smooth CLOSED curve through the points
      var n0 = pts.length, Q = [pts[n0 - 1]].concat(pts, [pts[0], pts[1]]), out = [], ii, kk2, t, u, p0, p1, p2, p3, c1x, c1y, c2x, c2y;
      for(ii = 1; ii <= n0; ii++){
        p0 = Q[ii-1]; p1 = Q[ii]; p2 = Q[ii+1]; p3 = Q[ii+2];
        c1x = p1[0] + (p2[0] - p0[0]) / 6; c1y = p1[1] + (p2[1] - p0[1]) / 6; c2x = p2[0] - (p3[0] - p1[0]) / 6; c2y = p2[1] - (p3[1] - p1[1]) / 6;
        for(kk2 = 0; kk2 < nn; kk2++){
          t = kk2 / nn; u = 1 - t;
          out.push([u*u*u*p1[0] + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*p2[0], u*u*u*p1[1] + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*p2[1]]);
        }
      }
      out.push(out[0].slice()); return out;
    }
    function buildPath(W, H){
      poly = sampleCR(PATHN.map(function(p){ return [(0.09 + 0.82 * p[0]) * W, (0.09 + 0.82 * p[1]) * H]; }), 14); cumA = [0];   // kept slightly inside the screen edges
      for(var ii = 1; ii < poly.length; ii++) cumA.push(cumA[ii-1] + Math.sqrt(Math.pow(poly[ii][0] - poly[ii-1][0], 2) + Math.pow(poly[ii][1] - poly[ii-1][1], 2)));
      pathLen = cumA[cumA.length - 1] || 1;
    }
    function pathAt(sv){                                 // point and normal at fraction sv of the route
      var tg = (((sv % 1) + 1) % 1) * pathLen, lo2 = 0, hi2 = cumA.length - 1, mid, f2, a2, b2, dx2, dy2, L2;
      while(hi2 - lo2 > 1){ mid = (lo2 + hi2) >> 1; if(cumA[mid] < tg) lo2 = mid; else hi2 = mid; }
      f2 = (tg - cumA[lo2]) / ((cumA[hi2] - cumA[lo2]) || 1); a2 = poly[lo2]; b2 = poly[hi2];
      dx2 = b2[0] - a2[0]; dy2 = b2[1] - a2[1]; L2 = Math.sqrt(dx2*dx2 + dy2*dy2) || 1;
      return [a2[0] + dx2 * f2, a2[1] + dy2 * f2, -dy2 / L2, dx2 / L2];
    }

    var ctx = cv && cv.getContext ? cv.getContext("2d") : null;
    var api = {stats:stats, kept:K, supported:false,
      setTheme:function(){}, enable:function(){ return Promise.resolve(false); }, disable:function(){}, isOn:function(){ return false; }};
    if(!ctx) return api;

    var base = new Float64Array(N*8), R = new Float64Array(N*8);
    for(i = 0; i < N; i++) for(k = 0; k < 8; k++) base[i*8 + k] = roots[i][k];
    var PL = [[0,1,1],[2,3,.79],[4,5,.61],[6,7,.47],[0,4,.31],[1,5,.27],[2,6,.23],[3,7,.19],[0,6,.13],[1,7,.11]];

    // --- groups: OUTLINE points sit evenly on the heart contour; INNER points fill the heart
    var isOut = new Uint8Array(N), OLx = new Float32Array(N), OLy = new Float32Array(N), ring = [], birth = new Float32Array(N), initR = new Float64Array(N), initX = new Float64Array(N);
    (function(){
      var NBIN = 24, best = [], rmax = new Float32Array(NBIN), o2, x0, y0, th2, r2, bn, kk;
      for(kk = 0; kk < NBIN; kk++) best.push(-1);
      for(i = 0; i < N; i++){
        o2 = i * 8;
        x0 = base[o2] + .45 * base[o2+3] + .3 * base[o2+6];
        y0 = base[o2+1] + .45 * base[o2+4] + .3 * base[o2+7];
        th2 = Math.atan2(x0, -y0); if(th2 < 0) th2 += 6.2832;          // clockwise from "up"
        r2 = Math.sqrt(x0*x0 + y0*y0); initR[i] = r2; initX[i] = x0;
        bn = Math.min(NBIN - 1, Math.floor(th2 / 6.2832 * NBIN));
        if(r2 > rmax[bn]){ rmax[bn] = r2; best[bn] = i; }
      }
      ring = best.filter(function(q){ return q >= 0; });
      ring.forEach(function(idx, r){                    // evenly spaced around the oval's edge
        var psi = (r + 0.5) / ring.length * 6.2832;
        isOut[idx] = 1;
        OLx[idx] = Math.sin(psi);                       // along the snake
        OLy[idx] = -Math.cos(psi);                      // across it
      });
      // inner points are "born" one after another, from the middle outwards: 15 right after the first second, the rest by about 70
      var inner = [], early = {}, later = [], stepE;
      for(kk = 0; kk < N; kk++) if(!isOut[kk]) inner.push(kk);
      inner.sort(function(a2, b2){ return initX[a2] - initX[b2]; });          // walk along the body ...
      stepE = inner.length / 36;
      for(kk = 0; kk < 36; kk++) early[inner[Math.min(inner.length - 1, Math.floor(kk * stepE + stepE / 2))]] = 1;   // ... and take 36 evenly spread points to start with
      inner.forEach(function(idx){ if(!early[idx]) later.push(idx); });
      later.sort(function(a2, b2){ return initR[a2] - initR[b2]; });
      Object.keys(early).forEach(function(idx, n3){ birth[+idx] = 0.05 + n3 * 0.015; });
      later.forEach(function(idx, rnk){ birth[idx] = 6 + 64 * Math.pow(rnk / Math.max(1, later.length - 1), 0.85); });
    })();

    var pAlpha = new Float32Array(N), dA = new Float32Array(N);
    for(i = 0; i < N; i++) dA[i] = 1;
    var tx3 = new Float32Array(N), ty3 = new Float32Array(N), tz3 = new Float32Array(N);
    var sx = new Float32Array(N), sy = new Float32Array(N), sd = new Float32Array(N), hid = new Float32Array(N);
    var eBr = new Float32Array(K), eBk = new Uint8Array(K);
    var NB = 32, rb = new Float32Array(NB), rbT = new Float32Array(NB), rbInit = false, phA = new Float64Array(N), rrA = new Float64Array(N);
    var SP = [];
    for(i = 0; i < 18; i++) SP.push({e:-1, u:1, v:0.8 + Math.random() * 1.2});

    var W = 0, H = 0, dpr = 1, needDraw = true;
    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      buildPath(W, H);
      needDraw = true;
      if(reduce) render(.016);
    }
    function clamp(x, a, b){ return x < a ? a : (x > b ? b : x); }
    function rgba(hex, a){ var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16) + ',' + ((v >> 8) & 255) + ',' + (v & 255) + ',' + a + ')'; }

    var clock = 0, tx = 0, ty = 0, stx = 0, sty = 0, act = 0, last = 0, acc = 0, stride = 1, cost = 0, nf = 0, rhoS = 0, prog = 0, tprog = 0, mode = 0, sS = null, sGap = 0, wph = 0;

    function render(dt){
      if(W < 2 || H < 2) return;
      // tilt -> smoothed position; "act" says how much tilting is happening right now
      var pstx = stx, psty = sty, s = Math.min(1, dt * 6);
      stx += (tx - stx) * s; sty += (ty - sty) * s;
      var vel = (Math.abs(stx - pstx) + Math.abs(sty - psty)) / Math.max(dt, 0.001);
      var pprog = prog; prog += (tprog - prog) * Math.min(1, dt * 3);                      // how far down the page you are (0 top .. 1 bottom)
      gact += (Math.min(1, vel * 0.5) - gact) * Math.min(1, dt * 5);                       // how much the phone is moving
      hueAcc += dt * gact * 70;                                                             // keep cycling through the rainbow while it moves
      hue = HUE[theme].base + 150 * stx + 100 * sty + hueAcc; makeColors(hue);
      act += (Math.min(1, vel * 0.5 + Math.abs(prog - pprog) / Math.max(dt, 0.001) * 8 + sGap * 6) - act) * Math.min(1, dt * 5);

      // the 8D rotation is steered by the tilt only (rests at 0 when you hold still)
      if(!reduce) rot += dt * 0.1;                      // the E8 pattern turns on its own, slowly
      var angle = rot;
      var tNow = reduce ? 1e6 : clock, grow = 0.9 + 0.1 * (1 - Math.exp(-tNow / 35)), pa;   // inner cluster starts small and spreads
      R.set(base);
      var p, o, a, b, th, c, sn, xa, xb;
      for(p = 0; p < PL.length; p++){
        a = PL[p][0]; b = PL[p][1]; th = angle * PL[p][2]; c = Math.cos(th); sn = Math.sin(th);
        for(i = 0; i < N; i++){
          o = i * 8; xa = R[o + a]; xb = R[o + b];
          R[o + a] = c * xa - sn * xb; R[o + b] = sn * xa + c * xb;
        }
      }
      var rho = 0, x, y, hh, hmin = 1e9, hmax = -1e9;
      for(i = 0; i < N; i++){
        o = i * 8;
        x = R[o] + .45 * R[o+3] + .3 * R[o+6];
        y = R[o+1] + .45 * R[o+4] + .3 * R[o+7];
        tx3[i] = x; ty3[i] = y; tz3[i] = R[o+2] + .45 * R[o+5] + .3 * R[o+6];
        hh = Math.sqrt(x*x + y*y); if(hh > rho) rho = hh;
        hh = 0; for(k = 3; k < 8; k++) hh += R[o + k] * R[o + k];
        hh = Math.sqrt(hh); hid[i] = hh; if(hh < hmin) hmin = hh; if(hh > hmax) hmax = hh;
      }
      rhoS = rhoS ? rhoS + (rho - rhoS) * Math.min(1, dt * 2) : rho;
      for(i = 0; i < N; i++) hid[i] = (hid[i] - hmin) / (hmax - hmin + 1e-12);

      // the snake: an oval of E8 points that slides along the S-shaped route as you tilt
      var Hl = 0.24, Wpx = Math.min(W, H) * 0.075, Aw = Wpx * 0.85;   // long, slim and wiggly
      wph += dt * (0.5 + act * 2.2);                   // the helix and the ripple keep turning gently                                                          // the wiggle travels down the body while it moves
      var sTarget = mode === 0 ? 0.17 + prog * 0.57 : 0.74 + (1 - prog) * 0.43;   // heading down: top-left -> right side -> bottom;  after the bottom: bottom -> up the LEFT side -> top-left
      if(sS === null) sS = sTarget;
      var dS = ((sTarget - sS + 0.5) % 1 + 1) % 1 - 0.5;                           // shortest way round the loop, so it never rewinds
      sS += dS * Math.min(1, dt * 8); sGap = Math.abs(dS);
      var s0 = sS;
      var ux, uy, ph, q, f, w, xm, ym, zm, bi, rbound, j0, j1, psn, wave, spp, tpr, psi, zz, crs, dp;
      rb.fill(0);
      for(i = 0; i < N; i++){
        ux = tx3[i]; uy = -ty3[i];
        phA[i] = Math.atan2(uy, ux); rrA[i] = Math.sqrt(ux*ux + uy*uy);
        if(isOut[i]) continue;
        bi = ((Math.floor((phA[i] + Math.PI) / (2 * Math.PI) * NB) % NB) + NB) % NB;
        if(rrA[i] > rb[bi]) rb[bi] = rrA[i];
      }
      for(pass = 0; pass < 3; pass++) for(bi = 0; bi < NB; bi++) if(rb[bi] === 0) rb[bi] = (rb[(bi + NB - 1) % NB] + rb[(bi + 1) % NB]) / 2;
      for(bi = 0; bi < NB; bi++){
        var sm = (rb[(bi + NB - 1) % NB] + 2 * rb[bi] + rb[(bi + 1) % NB]) / 4;
        rbT[bi] = rbInit ? rbT[bi] + (sm - rbT[bi]) * Math.min(1, dt * 3) : sm;
      }
      rbInit = true;
      for(i = 0; i < N; i++){
        pAlpha[i] = isOut[i] ? 1 : clamp((tNow - birth[i]) / 1.0, 0, 1);
        if(isOut[i]){ xm = OLx[i]; ym = OLy[i]; zm = tz3[i] / rhoS * 0.3; dA[i] = 1; }
        else {
          ph = phA[i];
          f = (ph + Math.PI) / (2 * Math.PI) * NB; j0 = ((Math.floor(f) % NB) + NB) % NB; j1 = (j0 + 1) % NB; w = f - Math.floor(f);
          rbound = rbT[j0] * (1 - w) + rbT[j1] * w;
          q = Math.pow(Math.min(1, rrA[i] / (rbound + 1e-9)), 0.75) * 0.85 * grow;
          xm = q * Math.cos(ph); ym = q * Math.sin(ph); zm = tz3[i] / rhoS * 0.45;
          psi = 6.2832 * 1.25 * xm + wph * 1.4;           // screw the cross-section round the spine: a slow double-helix feel
          zz = zm * 1.7; crs = ym * Math.cos(psi) - zz * Math.sin(psi); dp = ym * Math.sin(psi) + zz * Math.cos(psi);
          ym = crs; zm = dp * 0.5; dA[i] = 0.6 + 0.4 * clamp((dp + 1) / 2, 0, 1);   // the far side of the helix is dimmer
        }
        spp = s0 + xm * Hl;
        wave = Aw * Math.sin(6.2832 * 13 * spp - wph);                  // S-bends that stay on the track, like a snake following its trail
        tpr = 0.62 + 0.38 * (xm + 1) / 2;                               // slimmer tail, fuller head
        psn = pathAt(spp);
        sx[i] = psn[0] + psn[2] * (ym * Wpx * tpr + wave);
        sy[i] = psn[1] + psn[3] * (ym * Wpx * tpr + wave);
        sd[i] = zm;
      }

      var emin = 1e9, emax = -1e9, m, m2, e, ia, ib;
      for(e = 0; e < K; e++){
        ia = ka[e] * 8; ib = kb[e] * 8; m2 = 0;
        for(k = 3; k < 8; k++){ m = (R[ia + k] + R[ib + k]) * .5; m2 += m * m; }
        m2 = Math.sqrt(m2); eBr[e] = m2;
        if(m2 < emin) emin = m2; if(m2 > emax) emax = m2;
      }
      var er = emax - emin + 1e-12;
      for(e = 0; e < K; e++) eBk[e] = Math.min(4, Math.floor((eBr[e] - emin) / er * 5));

      // ---- draw ----
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      var glow = !!pal.glow;
      ctx.globalCompositeOperation = glow ? "lighter" : "source-over";
      var maxLen = Wpx * 4.4, bk, ax, ay, bx, by, dx, dy, len, shim;
      var ringRamp = 1, grp, gf, oo;   // lines that cross the middle wait for the cluster
      for(bk = 0; bk < 5; bk++){
        shim = glow ? 0.86 + 0.14 * act * Math.sin(clock * 4.5 + bk * 1.9) : 1;     // flicker only while tilting
        for(grp = 0; grp < 2; grp++){
          gf = grp ? ringRamp : 1;
          if(gf <= 0) continue;
          ctx.strokeStyle = EC[bk];
          ctx.beginPath();
          for(e = 0; e < K; e += stride){
            if(eBk[e] !== bk || pAlpha[ka[e]] <= 0 || pAlpha[kb[e]] <= 0) continue;
            oo = (isOut[ka[e]] && isOut[kb[e]]) ? 1 : 0;
            if(oo !== grp) continue;
            ax = sx[ka[e]]; ay = sy[ka[e]]; bx = sx[kb[e]]; by = sy[kb[e]];
            dx = bx - ax; dy = by - ay; len = Math.sqrt(dx*dx + dy*dy);
            if(len > maxLen) continue;
            ctx.moveTo(ax, ay);
            ctx.quadraticCurveTo((ax + bx) / 2 - dy * bend[e], (ay + by) / 2 + dx * bend[e], bx, by);
          }
          if(glow){ ctx.lineWidth = 3.8; ctx.globalAlpha = pal.ea * 0.2 * shim * gf; ctx.stroke(); }
          else if(pal.soft){ ctx.lineWidth = 4.2; ctx.globalAlpha = pal.ea * 0.22 * gf; ctx.stroke(); }
          ctx.lineWidth = glow ? 1.05 : 0.9;
          ctx.globalAlpha = pal.ea * (0.8 + 0.1 * bk) * shim * gf;
          ctx.stroke();
        }
      }

      // the heart contour: no hard line, just a soft glow that follows the outline group
      var rn = ring.length;
      if(rn > 2){
        ctx.beginPath();
        var p0x = sx[ring[rn-1]], p0y = sy[ring[rn-1]], p1x = sx[ring[0]], p1y = sy[ring[0]];
        ctx.moveTo((p0x + p1x) / 2, (p0y + p1y) / 2);
        for(k = 0; k < rn; k++){
          var A = ring[k], B2 = ring[(k + 1) % rn];
          ctx.quadraticCurveTo(sx[A], sy[A], (sx[A] + sx[B2]) / 2, (sy[A] + sy[B2]) / 2);
        }
        ctx.closePath();
        if(pal.soft){                                   // day: faint pink bloom inside the heart
          ctx.globalAlpha = 1; ctx.fillStyle = ca(CC, .06); ctx.fill();
        }
        ctx.strokeStyle = CC;
        var gw = [18, 11, 6, 3], ga = glow ? [.035, .06, .09, .13] : [.05, .08, .12, .16], gi;
        for(gi = 0; gi < gw.length; gi++){ ctx.lineWidth = gw[gi]; ctx.globalAlpha = ga[gi]; ctx.stroke(); }
      }

      var col, rd, gs = 1.35 + 0.55 * (1 - Math.exp(-clock / 90));   // points start at default size and grow
      for(i = 0; i < N; i++){
        if(!isFinite(sx[i]) || !isFinite(sy[i]) || !isFinite(sd[i])) continue;
        pa = pAlpha[i] * dA[i]; if(pa <= 0) continue;
        col = DC[clamp(Math.floor(hid[i] * 4), 0, 3)];
        rd = clamp(2.1 + sd[i] * 1.6, 1.2, 3.8) * gs * (isOut[i] ? 1.15 : 1) * (0.4 + 0.6 * pa);
        ctx.fillStyle = col;
        if(glow){
          ctx.globalAlpha = 0.16 * pa; ctx.beginPath(); ctx.arc(sx[i], sy[i], rd * 3.0, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 0.28 * pa; ctx.beginPath(); ctx.arc(sx[i], sy[i], rd * 1.9, 0, 6.2832); ctx.fill();
        } else if(pal.soft){
          var hg = ctx.createRadialGradient(sx[i], sy[i], 0, sx[i], sy[i], rd * 4.2);
          hg.addColorStop(0, ca(col, .6)); hg.addColorStop(1, ca(col, 0));
          ctx.globalAlpha = pa; ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(sx[i], sy[i], rd * 4.2, 0, 6.2832); ctx.fill();
          ctx.fillStyle = col;
        }
        ctx.globalAlpha = pal.da * pa;
        ctx.beginPath(); ctx.arc(sx[i], sy[i], rd, 0, 6.2832); ctx.fill();
        if(glow && hid[i] > 0.7){ ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.9 * pa; ctx.beginPath(); ctx.arc(sx[i], sy[i], rd * 0.45, 0, 6.2832); ctx.fill(); }
      }
      if(glow && act > 0.03){                    // sparks run along the curves only while you tilt
        var sk, mm, uu, px, py, qx, qy, tries, ee, sa = Math.min(1, act * 1.6);
        for(i = 0; i < SP.length; i++){
          sk = SP[i];
          sk.u += dt * sk.v * (0.3 + 1.7 * act);
          if(sk.u >= 1){
            sk.u = 0; sk.e = -1;
            for(tries = 0; tries < 14; tries++){
              ee = Math.floor(Math.random() * K);
              dx = sx[kb[ee]] - sx[ka[ee]]; dy = sy[kb[ee]] - sy[ka[ee]]; len = Math.sqrt(dx*dx + dy*dy);
              if(len <= maxLen && len > 14 && pAlpha[ka[ee]] >= 1 && pAlpha[kb[ee]] >= 1){ sk.e = ee; break; }
            }
          }
          if(sk.e < 0) continue;
          e = sk.e; ax = sx[ka[e]]; ay = sy[ka[e]]; bx = sx[kb[e]]; by = sy[kb[e]];
          dx = bx - ax; dy = by - ay;
          qx = (ax + bx) / 2 - dy * bend[e]; qy = (ay + by) / 2 + dx * bend[e];
          for(mm = 0; mm < 6; mm++){
            uu = sk.u - mm * 0.035; if(uu < 0) break;
            px = (1-uu)*(1-uu)*ax + 2*(1-uu)*uu*qx + uu*uu*bx;
            py = (1-uu)*(1-uu)*ay + 2*(1-uu)*uu*qy + uu*uu*by;
            if(mm === 0){ ctx.globalAlpha = .35 * sa; ctx.fillStyle = SC; ctx.beginPath(); ctx.arc(px, py, 8, 0, 6.2832); ctx.fill(); }
            ctx.globalAlpha = (1 - mm / 6) * 0.95 * sa;
            ctx.fillStyle = mm === 0 ? "#ffffff" : SC;
            ctx.beginPath(); ctx.arc(px, py, Math.max(0.8, (mm === 0 ? 2.6 : 2.0 - mm * 0.25)), 0, 6.2832); ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    }

    function loop(ts){
      var dt = last ? Math.min((ts - last) / 1000, .1) : .016; last = ts;
      clock += dt; acc += dt;
      var idle = false;                                 // the turning never stops
      if(!idle || needDraw || acc > (clock < 150 ? 0.045 : 0.15)){          // resting = a still heart, redrawn only a few times a second (growth)
        var t0 = performance.now();
        try{ render(acc); }catch(err){ if(window.console) console.warn("bg frame skipped:", err); }
        acc = 0; needDraw = false;
        cost += performance.now() - t0; nf++;
        if(nf === 45){ if(cost / nf > 12 && stride < 3) stride++; cost = 0; nf = 0; }
      }
      requestAnimationFrame(loop);
    }

    // --- tilt input: the iPhone gyro (or the mouse on a computer) ---
    var motionOn = false, ob = null;
    function onOri(e){
      if(e.gamma == null || e.beta == null) return;
      if(!ob) ob = {b:e.beta, g:e.gamma};
      ob.b += (e.beta - ob.b) * .0015; ob.g += (e.gamma - ob.g) * .0015;   // slowly re-centres
      tx = clamp((e.gamma - ob.g) / 30, -1, 1);
      ty = clamp((e.beta - ob.b) / 30, -1, 1);
    }
    api.enable = function(){
      var D = window.DeviceOrientationEvent;
      function on(){ window.addEventListener("deviceorientation", onOri); motionOn = true; ob = null; return true; }
      if(D && typeof D.requestPermission === "function"){
        return D.requestPermission().then(function(r){ return r === "granted" ? on() : false; });
      }
      return Promise.resolve(on());
    };
    api.disable = function(){ window.removeEventListener("deviceorientation", onOri); motionOn = false; tx = 0; ty = 0; ob = null; };
    api.isOn = function(){ return motionOn; };
    api.supported = ("DeviceOrientationEvent" in window) && !reduce;
    api.setTheme = function(th){ theme = th === "dark" ? "dark" : "light"; pal = PAL[theme]; needDraw = true; if(reduce) render(.016); };
    api.frame = function(dt){ render(dt || .016); };

    window.addEventListener("pointermove", function(e){          // computer only: the mouse stands in for tilting
      if(motionOn || e.pointerType !== "mouse" || W < 2 || H < 2) return;
      tx = (e.clientX / W - .5) * 2; ty = (e.clientY / H - .5) * 2;
    });
    function onScroll(){
      var m = Math.max(1, document.documentElement.scrollHeight - window.innerHeight), y = window.scrollY || document.documentElement.scrollTop || 0;
      tprog = clamp(y / m, 0, 1);
      if(m > 40 && m - y <= 24) mode = 1;          // bottom reached: from here the snake heads back up the left-hand side
      else if(y <= 24) mode = 0;                   // back at the top: the next trip goes down the right again
    }
    if(!reduce){ window.addEventListener("scroll", onScroll, {passive:true}); window.addEventListener("resize", onScroll); onScroll(); prog = tprog; }
    api.setProgress = function(v, m){ tprog = prog = clamp(v, 0, 1); if(m != null) mode = m; sS = null; needDraw = true; };
    window.addEventListener("resize", resize);
    resize();
    if(reduce) render(.016); else requestAnimationFrame(loop);
    return api;
  })();
