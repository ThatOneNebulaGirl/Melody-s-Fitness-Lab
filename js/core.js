var LB_PER_KG = 2.20462262185;
  function fmt(n){ if(!isFinite(n)) return ""; return String(parseFloat(n.toFixed(2))); }
  function hexA(h, a){ var v = parseInt(h.slice(1), 16); return 'rgba(' + (v >> 16) + ',' + ((v >> 8) & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function num(s){ var v = parseFloat(String(s).replace(",", ".")); return isFinite(v) ? v : NaN; }
