/* ---------- Weight pickers for the non-barbell equipment ---------- */
  function renderFx(){
    fxBody.innerHTML = "";
    if(E.type === "ez"){
      fxLabel.textContent = "EZ bar weight (lb). The number on the bar is the whole bar.";
      var s1 = el("div", "seg"); fxBody.appendChild(s1);
      seg(s1, [20, 30, 40, 50].map(function(w){ return {label:w + " lb", value:w}; }),
        function(){ return E.ez; }, function(v){ E.ez = v; renderFx(); afterWeight(); });
    } else if(E.type === "db"){
      fxLabel.textContent = "Dumbbell weight, each hand (lb)";
      var s2 = el("div", "seg"); fxBody.appendChild(s2);
      var ws = []; for(var w = 5; w <= 50; w += 5) ws.push({label:String(w), value:w});
      seg(s2, ws, function(){ return E.db; }, function(v){ E.db = v; renderFx(); afterWeight(); });
      var l2 = el("label", "f", "Lifting"); l2.style.marginTop = "10px"; fxBody.appendChild(l2);
      var s3 = el("div", "seg"); fxBody.appendChild(s3);
      seg(s3, [{label:"Both hands together", value:2}, {label:"One hand at a time", value:1}],
        function(){ return E.hands; }, function(v){ E.hands = v; renderFx(); afterWeight(); });
    } else {
      fxLabel.textContent = "Stack weight (lb)";
      var row = el("div", "step"); row.style.justifyContent = "center";
      var minus = el("button", "stepbig", "−5"), plus = el("button", "stepbig", "+5"), inp = el("input");
      minus.type = "button"; plus.type = "button"; inp.type = "text"; inp.className = "mi"; inp.setAttribute("inputmode", "numeric");
      inp.setAttribute("aria-label", "Machine stack weight in pounds"); inp.autocomplete = "off"; inp.value = E.machine;
      function set(n){ E.machine = Math.max(0, n || 0); inp.value = E.machine; afterWeight(); }
      minus.addEventListener("click", function(){ set(E.machine - 5); });
      plus.addEventListener("click", function(){ set(E.machine + 5); });
      inp.addEventListener("input", function(){ var n = parseInt(inp.value, 10); E.machine = isNaN(n) ? 0 : Math.max(0, n); afterWeight(); });
      row.appendChild(minus); row.appendChild(inp); row.appendChild(plus); fxBody.appendChild(row);
    }
  }
  function renderEquip(){
    seg(eqSeg, EQ.map(function(q){ return {label:q.label, value:q.id}; }),
      function(){ return E.type; }, function(v){ if(E.type !== v){ E.type = v; L.area = null; L.ex = null; L.att = null; } renderEquip(); });
    var bb = E.type === "barbell";
    pVizEl.hidden = !bb; bbCtl.hidden = !bb; fxCard.hidden = bb; document.getElementById("pReset").hidden = !bb;
    document.getElementById("dbViz").hidden = E.type !== "db"; document.getElementById("ezViz").hidden = E.type !== "ez";
    if(!bb) renderFx();
    renderGfx(); renderLiftChips(); updateLift();
  }

  function kfmt(n){ return Number(parseFloat(n.toFixed(1))).toLocaleString(); }
  function updateLift(){
    var ld = getLoad(), reps = parseInt(lReps.value, 10), sets = parseInt(lSets.value, 10);
    if(isNaN(sets)) sets = 1;
    var ou = ld.unit === "lb" ? "kg" : "lb", conv = ld.unit === "lb" ? ld.total / LB_PER_KG : ld.total * LB_PER_KG;
    if(ld.perHand){
      document.getElementById("lWMain").textContent = fmt(ld.perHand) + " lb ×" + ld.hands;
      document.getElementById("lWSub").textContent = fmt(ld.perHand / LB_PER_KG) + " kg each";
    } else {
      document.getElementById("lWMain").textContent = (fmt(ld.total) || "0") + " " + ld.unit;
      document.getElementById("lWSub").textContent = (fmt(conv) || "0") + " " + ou;
    }
    if(ld.total > 0 && reps > 0 && sets > 0){
      var vol = ld.total * reps * sets, other = ld.unit === "lb" ? vol / LB_PER_KG : vol * LB_PER_KG;
      lVolBig.textContent = kfmt(vol) + " " + ld.unit;
      lVolSub.textContent = fmt(ld.total) + " " + ld.unit + " × " + reps + " reps × " + sets + " sets  ·  " + kfmt(other) + " " + ou;
    } else {
      lVolBig.textContent = "0 " + ld.unit;
      lVolSub.textContent = "Weight × reps × sets";
    }
  }
  function flash(t){
    lMsg.textContent = t;
    if(msgTimer) clearTimeout(msgTimer);
    msgTimer = setTimeout(function(){ lMsg.textContent = ""; }, 4500);
  }
  [lReps, lSets].forEach(function(el2){ el2.addEventListener("input", updateLift); });
