/* ---------- Equipment pictures: dumbbells and EZ bar (same metal look as the barbell) ---------- */
  var PASTEL = ["#c5a6ec", "#8fb8f0", "#8fdcb4", "#f7d77a", "#f59cbc"];
  function gdefs(q){
    return '<defs>' +
      '<linearGradient id="ch' + q + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262b30"/><stop offset=".12" stop-color="#97a0a7"/><stop offset=".22" stop-color="#ffffff"/><stop offset=".32" stop-color="#c7ced3"/><stop offset=".45" stop-color="#6b7278"/><stop offset=".58" stop-color="#a9b1b7"/><stop offset=".70" stop-color="#e9eef1"/><stop offset=".85" stop-color="#788087"/><stop offset="1" stop-color="#1f2327"/></linearGradient>' +
      '<linearGradient id="so' + q + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f353a"/><stop offset=".2" stop-color="#d3dade"/><stop offset=".4" stop-color="#868e94"/><stop offset=".6" stop-color="#454b51"/><stop offset=".8" stop-color="#9aa2a8"/><stop offset="1" stop-color="#1f2326"/></linearGradient>' +
      '<linearGradient id="sh' + q + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".09" stop-color="#fff" stop-opacity=".80"/><stop offset=".19" stop-color="#fff" stop-opacity=".12"/><stop offset=".32" stop-color="#fff" stop-opacity=".32"/><stop offset=".52" stop-color="#000" stop-opacity=".06"/><stop offset=".78" stop-color="#000" stop-opacity=".32"/><stop offset=".90" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></linearGradient>' +
      '<radialGradient id="fc' + q + '" cx="40%" cy="38%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".55" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>' +
      '<pattern id="br' + q + '" width="1.6" height="10" patternUnits="userSpaceOnUse"><line x1=".4" y1="0" x2=".4" y2="10" stroke="#fff" stroke-opacity=".14" stroke-width=".5"/></pattern>' +
      '<pattern id="kn' + q + '" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2.6" stroke="#000" stroke-opacity=".5" stroke-width=".9"/></pattern>' +
      '<radialGradient id="fl' + q + '"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '</defs>';
  }
  function disc(x, y, w, h, col, q, rx){
    var a = 'x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + w.toFixed(2) + '" height="' + h.toFixed(2) + '" rx="' + rx + '"';
    return '<rect ' + a + ' fill="' + col + '" stroke="rgba(0,0,0,.65)" stroke-width=".7"/>' +
      '<rect ' + a + ' fill="url(#so' + q + ')" opacity=".26"/><rect ' + a + ' fill="url(#br' + q + ')"/><rect ' + a + ' fill="url(#sh' + q + ')"/>' +
      '<rect x="' + (x + .6).toFixed(2) + '" y="' + (y + .6).toFixed(2) + '" width="' + Math.max(w - 1.2, .5).toFixed(2) + '" height="' + (h - 1.2).toFixed(2) + '" rx="' + Math.max(rx - .4, .5) + '" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width=".5"/>';
  }
  function dumbbellG(lb, cx, cy, ang, threeD, q){
    var R = 13 + (lb - 5) * (23 / 45), T = 9 + (lb - 5) * 0.18, e = R * 0.5, Lh = 62 + R * 0.7, rh = 5 + R * 0.09;
    var col = PASTEL[(Math.round(lb / 5) - 1) % PASTEL.length], g = '', fs = Math.max(7, R * 0.62);
    g += '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + ang + ')">';
    function side(sd){                                  // flat side view: one rounded disc, the number runs up its edge
      var x0 = sd < 0 ? -Lh / 2 - T : Lh / 2;
      return disc(x0, -R, T, 2 * R, col, q, 3) +
        '<text transform="translate(' + (x0 + T / 2).toFixed(2) + ' 0) rotate(-90)" text-anchor="middle" dominant-baseline="central" font-size="' + Math.min(T * 0.78, fs).toFixed(1) + '" font-weight="700" font-family="Instrument Sans,Arial,sans-serif" fill="#3b2237" fill-opacity=".7">' + lb + '</text>';
    }
    function head3d(sd){                                // round disc seen at an angle: back rim, side wall, face
      var xf = sd < 0 ? -Lh / 2 : Lh / 2 + T, xb = xf - T, o = '';
      o += '<ellipse cx="' + xb.toFixed(2) + '" cy="0" rx="' + e.toFixed(2) + '" ry="' + R.toFixed(2) + '" fill="' + col + '" stroke="rgba(0,0,0,.6)" stroke-width=".7"/>' +
           '<ellipse cx="' + xb.toFixed(2) + '" cy="0" rx="' + e.toFixed(2) + '" ry="' + R.toFixed(2) + '" fill="rgba(0,0,0,.3)"/>';
      o += '<rect x="' + xb.toFixed(2) + '" y="' + (-R).toFixed(2) + '" width="' + T.toFixed(2) + '" height="' + (2 * R).toFixed(2) + '" fill="' + col + '"/>' +
           '<rect x="' + xb.toFixed(2) + '" y="' + (-R).toFixed(2) + '" width="' + T.toFixed(2) + '" height="' + (2 * R).toFixed(2) + '" fill="url(#so' + q + ')" opacity=".26"/>' +
           '<rect x="' + xb.toFixed(2) + '" y="' + (-R).toFixed(2) + '" width="' + T.toFixed(2) + '" height="' + (2 * R).toFixed(2) + '" fill="url(#sh' + q + ')"/>' +
           '<line x1="' + xb.toFixed(2) + '" y1="' + (-R).toFixed(2) + '" x2="' + xf.toFixed(2) + '" y2="' + (-R).toFixed(2) + '" stroke="rgba(0,0,0,.6)" stroke-width=".7"/>' +
           '<line x1="' + xb.toFixed(2) + '" y1="' + R.toFixed(2) + '" x2="' + xf.toFixed(2) + '" y2="' + R.toFixed(2) + '" stroke="rgba(0,0,0,.6)" stroke-width=".7"/>';
      o += '<ellipse cx="' + xf.toFixed(2) + '" cy="0" rx="' + e.toFixed(2) + '" ry="' + R.toFixed(2) + '" fill="' + col + '" stroke="rgba(0,0,0,.6)" stroke-width=".7"/>' +
           '<ellipse cx="' + xf.toFixed(2) + '" cy="0" rx="' + e.toFixed(2) + '" ry="' + R.toFixed(2) + '" fill="url(#fc' + q + ')"/>' +
           '<ellipse cx="' + xf.toFixed(2) + '" cy="0" rx="' + (e * 0.8).toFixed(2) + '" ry="' + (R * 0.82).toFixed(2) + '" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width=".6"/>';
      if(sd > 0) o += '<text transform="translate(' + xf.toFixed(2) + ' 0) rotate(' + (-ang) + ')" text-anchor="middle" dominant-baseline="central" font-size="' + fs.toFixed(1) + '" font-weight="700" font-family="Instrument Sans,Arial,sans-serif" fill="#3b2237" fill-opacity=".72">' + lb + '</text>';
      return o;
    }
    var handle = '<rect x="' + (-Lh / 2) + '" y="' + (-rh).toFixed(2) + '" width="' + Lh.toFixed(1) + '" height="' + (2 * rh).toFixed(2) + '" fill="url(#ch' + q + ')" stroke="rgba(0,0,0,.55)" stroke-width=".6"/>' +
      '<rect x="-17" y="' + (-rh + .4).toFixed(2) + '" width="34" height="' + (2 * rh - .8).toFixed(2) + '" fill="url(#kn' + q + ')"/>';
    if(threeD) g += head3d(-1) + handle + head3d(1);
    else g += side(-1) + handle + side(1);
    return g + '</g>';
  }
  function renderDbViz(){
    var q = "db", lb = E.db, svg = '<svg viewBox="0 12 400 207" role="img" aria-label="Dumbbells, ' + lb + ' pounds each">' + gdefs(q);
    svg += '<ellipse cx="200" cy="208" rx="150" ry="9" fill="url(#fl' + q + ')"/>';
    if(E.hands === 2) svg += dumbbellG(lb, 172, 164, 0, false, q) + dumbbellG(lb, 230, 102, 50, true, q);
    else svg += dumbbellG(lb, 200, 118, 50, true, q);
    document.getElementById("dbViz").innerHTML = svg + '</svg><div class="cap">' + lb + ' lb ' + (E.hands === 2 ? "in each hand" : "in one hand") + '</div>';
  }
  function renderEzViz(){
    var q = "ez", lb = E.ez, R = 16 + (lb - 20) * (26 / 30), T = 7 + (lb - 20) * 0.2, cy = 80;
    var col = {20:"#8fb8f0", 30:"#f7d77a", 40:"#8fdcb4", 50:"#f59cbc"}[lb] || PASTEL[0];
    var pts = [[56, cy], [148, cy], [165, cy - 17], [200, cy + 17], [235, cy - 17], [252, cy], [344, cy]];
    var d = 'M' + pts.map(function(p){ return p[0] + ' ' + p[1]; }).join(' L');
    var grip = 'M148 ' + cy + ' L165 ' + (cy - 17) + ' L200 ' + (cy + 17) + ' L235 ' + (cy - 17) + ' L252 ' + cy;
    var svg = '<svg viewBox="0 0 400 160" role="img" aria-label="EZ bar, ' + lb + ' pounds">' + gdefs(q);
    svg += '<ellipse cx="200" cy="146" rx="150" ry="8" fill="url(#fl' + q + ')"/>';
    var st = 'fill="none" stroke-linejoin="round" stroke-linecap="round"';
    svg += '<path d="' + d + '" ' + st + ' stroke="#262b30" stroke-width="11"/>' +
           '<path d="' + d + '" ' + st + ' stroke="#c9d0d5" stroke-width="8.2"/>' +
           '<path d="' + d + '" ' + st + ' stroke="#7c858c" stroke-width="3" transform="translate(0 2.3)"/>' +
           '<path d="' + d + '" ' + st + ' stroke="#ffffff" stroke-width="2.2" stroke-opacity=".9" transform="translate(0 -2.1)"/>' +
           '<path d="' + grip + '" ' + st + ' stroke="#1b1f23" stroke-width="8" stroke-dasharray="1.1 2.1" stroke-opacity=".38"/>';
    function side(x){
      return disc(x, cy - R, T, 2 * R, col, q, 2.6) +
        '<rect x="' + (x < 200 ? x + T : x - 5).toFixed(2) + '" y="' + (cy - 11) + '" width="5" height="22" rx="1.4" fill="url(#ch' + q + ')" stroke="rgba(0,0,0,.6)" stroke-width=".5"/>';
    }
    svg += side(86) + side(314 - T);
    svg += '<rect x="52" y="' + (cy - 5) + '" width="8" height="10" rx="3" fill="url(#ch' + q + ')" stroke="rgba(0,0,0,.6)" stroke-width=".5"/><rect x="340" y="' + (cy - 5) + '" width="8" height="10" rx="3" fill="url(#ch' + q + ')" stroke="rgba(0,0,0,.6)" stroke-width=".5"/>';
    document.getElementById("ezViz").innerHTML = svg + '</svg><div class="cap">EZ bar · ' + lb + ' lb (weights are built in)</div>';
  }
  function renderGfx(){ if(E.type === "ez") renderEzViz(); else if(E.type === "db") renderDbViz(); }
  function afterWeight(){ renderGfx(); updateLift(); }
