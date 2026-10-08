/* ---------- Barbell drawing ---------- */
  var DEFS =
    '<defs>' +
    // mirror-polished chrome for bar and sleeves
    '<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262b30"/><stop offset=".12" stop-color="#97a0a7"/><stop offset=".22" stop-color="#ffffff"/><stop offset=".32" stop-color="#c7ced3"/><stop offset=".45" stop-color="#6b7278"/><stop offset=".58" stop-color="#a9b1b7"/><stop offset=".70" stop-color="#e9eef1"/><stop offset=".85" stop-color="#788087"/><stop offset="1" stop-color="#1f2327"/></linearGradient>' +
    '<linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15181b"/><stop offset=".2" stop-color="#7d868c"/><stop offset=".38" stop-color="#d4dadf"/><stop offset=".6" stop-color="#4c5359"/><stop offset=".8" stop-color="#8f979d"/><stop offset="1" stop-color="#121417"/></linearGradient>' +
    // gunmetal layer that gives coloured plates a metal body
    '<linearGradient id="steelOv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f353a"/><stop offset=".2" stop-color="#d3dade"/><stop offset=".4" stop-color="#868e94"/><stop offset=".6" stop-color="#454b51"/><stop offset=".8" stop-color="#9aa2a8"/><stop offset="1" stop-color="#1f2326"/></linearGradient>' +
    // specular highlights + falloff
    '<linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".09" stop-color="#fff" stop-opacity=".80"/><stop offset=".19" stop-color="#fff" stop-opacity=".12"/><stop offset=".32" stop-color="#fff" stop-opacity=".32"/><stop offset=".52" stop-color="#000" stop-opacity=".06"/><stop offset=".78" stop-color="#000" stop-opacity=".32"/><stop offset=".90" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></linearGradient>' +
    // fine turned-metal lines around the plate edge
    '<pattern id="brush" width="1.6" height="10" patternUnits="userSpaceOnUse"><line x1=".4" y1="0" x2=".4" y2="10" stroke="#fff" stroke-opacity=".14" stroke-width=".5"/></pattern>' +
    '<pattern id="knurl" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#000" stroke-opacity=".55" stroke-width="1"/></pattern>' +
    '<radialGradient id="floor"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
    '<filter id="haloBlur" filterUnits="userSpaceOnUse" x="0" y="0" width="400" height="172"><feGaussianBlur stdDeviation="5"/></filter>' +
    '<filter id="heartSoft0" filterUnits="userSpaceOnUse" x="-20" y="-20" width="440" height="212"><feGaussianBlur stdDeviation=".9"/></filter>' +
    '<filter id="heartSoft1" filterUnits="userSpaceOnUse" x="-20" y="-20" width="440" height="212"><feGaussianBlur stdDeviation="1.5"/></filter>' +
    '<filter id="heartSoft2" filterUnits="userSpaceOnUse" x="-20" y="-20" width="440" height="212"><feGaussianBlur stdDeviation="2.2"/></filter>' +
    '<radialGradient id="heartGrad" cx="50%" cy="40%" r="65%"><stop offset="0" style="stop-color:var(--accent)" stop-opacity=".8"/><stop offset="1" style="stop-color:var(--strong)" stop-opacity=".45"/></radialGradient>' +
    '</defs>';

  var CY = 85;            // bar centre line
  var FL = 88, FR = 312; // inner faces where plates rest (short sleeves, long shaft)
  var AVAIL = 64;        // room for plates on each sleeve

  function renderViz(){
    var set = SETS[P.unit], el = document.getElementById("pViz");
    var pct = P.unit === "lb"
      ? {"45":100,"35":88,"25":74,"10":58,"5":44,"2.5":34}
      : {"25":100,"20":100,"15":90,"10":78,"5":60,"2.5":46,"1.25":36};
    var thick = P.unit === "lb"
      ? {"45":10,"35":8.5,"25":7,"10":6,"5":4.5,"2.5":3.5}
      : {"25":11,"20":10,"15":9,"10":7.5,"5":5.5,"2.5":4.5,"1.25":3.5};
    var L = [], R = [], odd = [];
    set.plates.forEach(function(w){
      var c = P.counts[P.unit][w] || 0, l, r, i;
      if(!c) return;
      if(P.mode === "side"){ l = c; r = c; }
      else { l = Math.ceil(c/2); r = Math.floor(c/2); if(c % 2) odd.push(w); }
      for(i = 0; i < l; i++) L.push(w);
      for(i = 0; i < r; i++) R.push(w);
    });
    function tot(a){ return a.reduce(function(s,w){ return s + thick[w] + 0.8; }, 0); }
    var k = Math.min(1, AVAIL / Math.max(tot(L), tot(R), 1));

    function draw(arr, startX, dir){
      var x = startX, out = "";
      arr.forEach(function(w){
        var t = Math.max(2.2, thick[w]*k), h = pct[w]*1.5, col = set.colors[String(w)][0];
        var rx = dir < 0 ? x - t : x, ry = CY - h/2;
        var X = rx.toFixed(2), Y = ry.toFixed(2), W = t.toFixed(2), H = h.toFixed(2);
        out += '<rect x="'+X+'" y="'+Y+'" width="'+W+'" height="'+H+'" rx="2.2" fill="'+col+'" stroke="rgba(0,0,0,.7)" stroke-width=".7"/>' +
               '<rect x="'+X+'" y="'+Y+'" width="'+W+'" height="'+H+'" rx="2.2" fill="url(#steelOv)" opacity=".26"/>' +
               '<rect x="'+X+'" y="'+Y+'" width="'+W+'" height="'+H+'" rx="2.2" fill="url(#brush)"/>' +
               '<rect x="'+X+'" y="'+Y+'" width="'+W+'" height="'+H+'" rx="2.2" fill="url(#shine)"/>' +
               '<rect x="'+(rx+.6).toFixed(2)+'" y="'+(ry+.6).toFixed(2)+'" width="'+Math.max(t-1.2,.5).toFixed(2)+'" height="'+(h-1.2).toFixed(2)+'" rx="1.8" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width=".5"/>';
        if(t > 5){
          var r1 = (rx + t*0.22).toFixed(2), r2 = (rx + t*0.78).toFixed(2);
          out += '<line x1="'+r1+'" y1="'+(ry+2).toFixed(2)+'" x2="'+r1+'" y2="'+(ry+h-2).toFixed(2)+'" stroke="#000" stroke-opacity=".45" stroke-width=".6"/>' +
                 '<line x1="'+r2+'" y1="'+(ry+2).toFixed(2)+'" x2="'+r2+'" y2="'+(ry+h-2).toFixed(2)+'" stroke="#000" stroke-opacity=".45" stroke-width=".6"/>' +
                 '<line x1="'+(rx + t*0.22 + .7).toFixed(2)+'" y1="'+(ry+2).toFixed(2)+'" x2="'+(rx + t*0.22 + .7).toFixed(2)+'" y2="'+(ry+h-2).toFixed(2)+'" stroke="#fff" stroke-opacity=".3" stroke-width=".5"/>';
        }
        x += dir*(t + 0.8*k);
      });
      return {svg: out, end: x};
    }
    function collar(x, dir){
      // lock collar sits just outside the last plate
      var w = 9, rx = dir < 0 ? x - w : x;
      return '<rect x="'+rx.toFixed(2)+'" y="'+(CY-13)+'" width="'+w+'" height="26" rx="2" fill="#17191b" stroke="#000" stroke-width=".6"/>' +
             '<rect x="'+rx.toFixed(2)+'" y="'+(CY-13)+'" width="'+w+'" height="26" rx="2" fill="url(#shine)" opacity=".55"/>' +
             '<circle cx="'+(rx + w/2).toFixed(2)+'" cy="'+(CY-7)+'" r="2" fill="url(#steel)"/>';
    }
    function summ(arr){
      var m = {}, order = [];
      arr.forEach(function(w){ if(!m[w]){ m[w] = 0; order.push(w); } m[w]++; });
      return order.map(function(w){ return m[w] + " × " + w; }).join(" + ");
    }

    var barOp = P.bar === 0 ? ".28" : "1";
    var bar =
      '<g opacity="'+barOp+'">' +
        // sleeves
        '<rect x="12" y="'+(CY-8)+'" width="80" height="16" rx="2" fill="url(#chrome)"/>' +
        '<rect x="308" y="'+(CY-8)+'" width="80" height="16" rx="2" fill="url(#chrome)"/>' +
        // sleeve end caps + groove
        '<rect x="8" y="'+(CY-7)+'" width="7" height="14" rx="2.5" fill="url(#steel)"/>' +
        '<rect x="385" y="'+(CY-7)+'" width="7" height="14" rx="2.5" fill="url(#steel)"/>' +
        '<rect x="19" y="'+(CY-8)+'" width="1.5" height="16" fill="#000" opacity=".35"/>' +
        '<rect x="379.5" y="'+(CY-8)+'" width="1.5" height="16" fill="#000" opacity=".35"/>' +
        // shaft
        '<rect x="92" y="'+(CY-4.5)+'" width="216" height="9" fill="url(#chrome)"/>' +
        // knurled grip (smooth centre band)
        '<rect x="132" y="'+(CY-4.5)+'" width="60" height="9" fill="url(#knurl)"/>' +
        '<rect x="208" y="'+(CY-4.5)+'" width="60" height="9" fill="url(#knurl)"/>' +
        '<rect x="124" y="'+(CY-4.5)+'" width="2" height="9" fill="#000" opacity=".45"/>' +
        '<rect x="274" y="'+(CY-4.5)+'" width="2" height="9" fill="#000" opacity=".45"/>' +
        // inner collar flanges
        '<rect x="'+(FL-1)+'" y="'+(CY-19)+'" width="9" height="38" rx="2" fill="url(#steel)" stroke="#000" stroke-width=".6"/>' +
        '<rect x="'+(FR-8)+'" y="'+(CY-19)+'" width="9" height="38" rx="2" fill="url(#steel)" stroke="#000" stroke-width=".6"/>' +
      '</g>';

    var left = draw(L, FL - 1, -1), right = draw(R, FR + 1, 1);
    var collars = "";
    if(L.length && P.bar) collars += collar(left.end - 0.5, -1);
    if(R.length && P.bar) collars += collar(right.end + 0.5, 1);

    var halo = "";
    if(P.halo){
      P.halo = false;
      var HEART = "M0 4C-7 -1 -5 -7 -1.8 -7C-0.8 -7 0 -6.2 0 -5.4C0 -6.2 0.8 -7 1.8 -7C5 -7 7 -1 0 4Z";
      var barR = {x:8, y:CY-22, w:384, h:44};          // bar glow, 44 tall (double the old 22)
      var stacks = [];
      var tallest = function(arr){ return arr.reduce(function(m,w){ return Math.max(m, pct[w]*1.5); }, 0); };
      if(L.length){ var hL = tallest(L) + 16; stacks.push({side:"L", x:left.end-12, y:CY-hL/2, w:(FL-1)-(left.end-12)+9, h:hL}); }
      if(R.length){ var hR = tallest(R) + 16; stacks.push({side:"R", x:FR-8, y:CY-hR/2, w:(right.end+12)-(FR-8), h:hR}); }
      var box = function(r, rad){ return '<rect x="'+r.x.toFixed(1)+'" y="'+r.y.toFixed(1)+'" width="'+r.w.toFixed(1)+'" height="'+r.h.toFixed(1)+'" rx="'+rad+'" fill="var(--accent)"/>'; };
      var glow = '<g class="halo-glow">' + box(barR, 22) + stacks.map(function(r){ return box(r, 14); }).join("") + '</g>';

      var n = 0, layer = 0, hearts = ["", "", ""];
      var heart = function(x, y, dx, dy){
        var sc = (0.75 + ((n*7) % 5) * 0.1) * (1 - layer*0.12);
        var dl = ((n*37) % 10) * 0.06 + layer*0.12;
        var op = [0.85, 0.6, 0.4][layer];
        var ox = dx ? (dx > 0 ? 1 : -1) * layer * 5 : 0, oy = dy ? (dy > 0 ? 1 : -1) * layer * 5 : 0;
        var k2 = 1 + layer*0.3;
        n++;
        return '<g transform="translate('+(x+ox).toFixed(1)+' '+(y+oy).toFixed(1)+') scale('+sc.toFixed(2)+')"><path class="halo-heart" d="'+HEART+'" fill="url(#heartGrad)" fill-opacity="'+op+'" style="--dx:'+(dx*k2).toFixed(1)+'px;--dy:'+(dy*k2).toFixed(1)+'px;animation-delay:'+dl.toFixed(2)+'s"/></g>';
      };
      var inStack = function(x){ return stacks.some(function(r){ return x > r.x - 6 && x < r.x + r.w + 6; }); };
      var xx, yy, h, ph, pv;
      for(layer = 0; layer < 3; layer++){
        ph = layer * 9;   // layers are shifted so they interleave instead of stacking
        pv = layer * 5;
        h = "";
        // along the bar (skipping the parts hidden behind the plate stacks)
        for(xx = barR.x + 14 + ph; xx <= barR.x + barR.w - 14; xx += 28){
          if(!inStack(xx)) h += heart(xx, barR.y - 1, 0, -6);
          if(!inStack(xx + 14)) h += heart(xx + 14, barR.y + barR.h + 1, 0, 6);
        }
        if(!L.length){ for(yy = barR.y + 8 + pv; yy <= barR.y + barR.h - 8; yy += 14) h += heart(barR.x - 2, yy, -6, 0); }
        if(!R.length){ for(yy = barR.y + 8 + pv; yy <= barR.y + barR.h - 8; yy += 14) h += heart(barR.x + barR.w + 2, yy, 6, 0); }
        // around each plate stack: top, bottom and the outer end
        stacks.forEach(function(r){
          for(xx = r.x + 8 + pv; xx <= r.x + r.w - 8; xx += 16){
            h += heart(xx, r.y - 1, 0, -6) + heart(xx, r.y + r.h + 1, 0, 6);
          }
          var ox = r.side === "L" ? r.x - 1 : r.x + r.w + 1, dxo = r.side === "L" ? -6 : 6;
          for(yy = r.y + 14 + pv; yy <= r.y + r.h - 14; yy += 20) h += heart(ox, yy, dxo, 0);
        });
        hearts[layer] = h;
      }
      halo = '<g filter="url(#haloBlur)" style="pointer-events:none">' + glow + '</g>' +
             '<g filter="url(#heartSoft0)" style="pointer-events:none">' + hearts[0] + '</g>' +
             '<g filter="url(#heartSoft1)" style="pointer-events:none">' + hearts[1] + '</g>' +
             '<g filter="url(#heartSoft2)" style="pointer-events:none">' + hearts[2] + '</g>';
    }
    var svg = '<svg viewBox="0 0 400 172" role="img" aria-label="Barbell with plates loaded">' + DEFS +
      '<ellipse cx="200" cy="166" rx="190" ry="5" fill="url(#floor)"/>' +
      halo + bar + left.svg + right.svg + collars +
      '<text x="200" y="'+(CY+30)+'" text-anchor="middle" font-size="13" fill="var(--muted)" font-family="var(--body)">' +
      (P.bar ? P.bar + " " + P.unit + " bar" : "no bar") + '</text></svg>';

    var cap, warn = false;
    if(!L.length && !R.length) cap = "";
    else if(P.mode === "all" && odd.length){ cap = "Uneven: odd number of " + odd.join(", ") + " plates, so one side has an extra"; warn = true; }
    else cap = "Each side: " + summ(L);
    el.innerHTML = svg + '<div class="cap' + (warn ? ' warn' : '') + '">' + cap + '</div>';
  }

  function renderPlates(){
    var set = SETS[P.unit];
    renderViz();
    seg(document.getElementById("pBarSeg"), set.bars.map(function(b){ return {label: b+" "+P.unit, value:b}; }),
      function(){return P.bar;}, function(v){ P.bar = v; P.halo = true; renderPlates(); });

    var list = document.getElementById("pList");
    list.innerHTML = "";
    set.plates.forEach(function(w){
      var c = P.counts[P.unit][w] || 0;
      var col = set.colors[String(w)];
      var row = document.createElement("div");
      row.className = "plate";
      row.innerHTML =
        '<div class="chip" style="background:'+hexA(col[0], .16)+';border:1.5px solid '+hexA(col[0], .95)+';color:var(--ink);box-shadow:0 0 10px '+hexA(col[0], .35)+'">'+w+'</div>' +
        '<div class="pl2">'+(c ? (c*2)+' plates' : '')+'</div>' +
        '<div class="step"><button type="button" aria-label="Remove a pair of '+w+' plates">−</button><output>'+c+'</output><button type="button" aria-label="Add a pair of '+w+' plates">+</button></div>';
      var btns = row.querySelectorAll("button");
      btns[0].addEventListener("click", function(){ P.counts[P.unit][w] = Math.max(0, (P.counts[P.unit][w]||0) - 1); renderPlates(); });
      btns[1].addEventListener("click", function(){ P.counts[P.unit][w] = (P.counts[P.unit][w]||0) + 1; P.halo = true; renderPlates(); });
      list.appendChild(row);
    });

    updateResult();
    updateLift();
  }
  document.getElementById("pReset").addEventListener("click", function(){ P.counts[P.unit] = {}; renderPlates(); });
  document.getElementById("barChk").addEventListener("change", function(){
    var on = this.checked;
    document.getElementById("pBarSeg").hidden = !on;
    if(!on){ P.bar = SETS[P.unit].bars[0]; P.halo = true; renderPlates(); }       // unticked = the standard 45 lb bar
  });
