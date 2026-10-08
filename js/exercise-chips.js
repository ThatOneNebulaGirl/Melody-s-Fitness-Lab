/* ---------- Exercise chips ---------- */
  function exList(){
    var cat = EX[E.type], out = [];
    AREA_ORDER.forEach(function(a){ (cat[a] || []).forEach(function(x){ if(out.indexOf(x) < 0) out.push(x); }); });
    return out;
  }
  function areaOf(type, ex){
    var cat = EX[type] || {}, a;
    for(a in cat) if(cat[a].indexOf(ex) >= 0) return a;
    return "";
  }
  var lAreaWrap = document.getElementById("lAreaWrap");
  function renderLiftChips(){
    var cat = EX[E.type], flat = (E.type === "ez" || E.type === "db");
    lAreaWrap.hidden = flat;
    if(flat){
      L.area = null;
      seg(lEx, exList().concat(["Other"]).map(function(x){ return {label:x, value:x}; }),
        function(){ return L.ex; }, function(v){ L.ex = (L.ex === v) ? null : v; L.att = null; renderLiftChips(); });
    } else {
      var areas = AREA_ORDER.filter(function(a){ return cat[a]; });
      if(L.area && !cat[L.area]){ L.area = null; L.ex = null; L.att = null; }
      seg(lArea, areas.map(function(a){ return {label:a, value:a}; }),
        function(){ return L.area; }, function(v){ L.area = (L.area === v) ? null : v; L.ex = null; L.att = null; renderLiftChips(); });
      if(L.area){
        seg(lEx, cat[L.area].concat(["Other"]).map(function(x){ return {label:x, value:x}; }),
          function(){ return L.ex; }, function(v){ L.ex = (L.ex === v) ? null : v; L.att = null; renderLiftChips(); });
      } else {
        lEx.innerHTML = '<span class="hint" style="margin:0">Pick a body area to see exercises</span>';
      }
    }
    var atts = L.ex ? ATT[E.type + "|" + L.ex] : null;
    lAttWrap.hidden = !atts;
    if(atts) seg(lAtt, atts.map(function(a){ return {label:a.label, value:a.id}; }),
      function(){ return L.att; }, function(v){ L.att = (L.att === v) ? null : v; renderLiftChips(); });
    lExOther.hidden = (L.ex !== "Other");
    renderMuscles();
  }
