/* ---------- Recording lifts (saved in this browser) ---------- */
  var LOGKEY = "gymcalc.log", memLog = null;
  function loadLog(){
    try{ var a = JSON.parse(localStorage.getItem(LOGKEY) || "[]"); if(Array.isArray(a)) return a; }catch(e){}
    return memLog || [];
  }
  function saveLog(a){
    try{ localStorage.setItem(LOGKEY, JSON.stringify(a)); memLog = null; return true; }
    catch(e){ memLog = a; return false; }
  }
  var navLog = document.getElementById("t-log");
  function setBadge(){ var n = loadLog().length; navLog.textContent = n ? "Log · " + n : "Log"; }

  lRec.addEventListener("click", function(){
    var ld = getLoad(), reps = parseInt(lReps.value, 10), sets = parseInt(lSets.value, 10);
    if(isNaN(sets)) sets = 1;
    if(!(ld.total > 0)){ flash(E.type === "machine" ? "Enter the stack weight first." : "Pick a weight first."); return; }
    if(!(reps > 0) || !(sets > 0)){ flash("Enter your reps (and sets) first."); return; }
    var exName = L.ex === "Other" ? (lExOther.value.trim() || "Other") : (L.ex || "");
    var att = currentAtt(), mus = getMuscles();
    var per = {}, plateCount = 0;
    if(E.type === "barbell") SETS[P.unit].plates.forEach(function(w){ var c = P.counts[P.unit][w] || 0; if(c){ per[w] = c; plateCount += c * 2; } });
    var wl = ld.unit === "lb" ? ld.total : ld.total * LB_PER_KG, wk = ld.unit === "kg" ? ld.total : ld.total / LB_PER_KG;
    var entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(),
      equipment: eqLabel(E.type), attachment: att ? att.label : "", perHand: ld.perHand || null, hands: ld.hands || null,
      area: L.area || areaOf(E.type, L.ex), exercise: exName, muscles: {p: mus.p, s: mus.s},
      unit: ld.unit, bar: E.type === "barbell" ? P.bar : 0, perSide: per, plates: plateCount,
      weight: ld.total, weightLb: wl, weightKg: wk, reps: reps, sets: sets,
      volume: ld.total * reps * sets, volumeLb: wl * reps * sets, volumeKg: wk * reps * sets,
      note: lNote.value.trim()
    };
    var arr = loadLog(); arr.unshift(entry); if(arr.length > 500) arr.length = 500;
    var ok = saveLog(arr);
    flash(ok ? "Recorded ✓  It's in your Log tab." + (gh ? " Backing up to GitHub…" : "") : "Recorded for this session only: this browser isn't allowing saved data.");
    autoSync();
    lNote.value = ""; setBadge();
    if(E.type === "barbell"){ P.halo = true; renderPlates(); }
  });
