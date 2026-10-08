/* ---------- Log tab ---------- */
  var logList = document.getElementById("logList"), logCount = document.getElementById("logCount"), logMsg = document.getElementById("logMsg");
  var logBox = document.getElementById("logBox"), pending = null;
  function when(ts){ return new Date(ts).toLocaleString([], {weekday:"short", month:"short", day:"numeric", hour:"numeric", minute:"2-digit"}); }
  function perSideText(e){
    var keys = Object.keys(e.perSide || {}).map(Number).sort(function(a, b){ return b - a; });
    var t = keys.length ? "Per side: " + keys.map(function(w){ return e.perSide[w] + " × " + w; }).join(" + ") : "No plates";
    return t + (e.bar ? "  ·  " + e.bar + " " + e.unit + " bar" : "");
  }
  function detailText(e){
    if(e.equipment === "Dumbbell" && e.perHand) return "Dumbbell · " + fmt(e.perHand) + " lb each hand" + (e.hands === 1 ? " (one at a time)" : " (both hands)");
    if(e.equipment === "EZ bar") return "EZ bar · " + fmt(e.weight) + " lb";
    if(e.equipment === "Machine") return "Machine" + (e.attachment ? " · " + e.attachment : "");
    return perSideText(e) + "  ·  " + e.plates + " plates";
  }
  function weightText(e){ return (e.equipment === "Dumbbell" && e.perHand) ? fmt(e.perHand) + " lb each hand" : fmt(e.weight) + " " + e.unit; }
  function el(tag, cls, text){ var n = document.createElement(tag); if(cls) n.className = cls; if(text != null) n.textContent = text; return n; }
  function renderLog(){
    var arr = loadLog();
    logCount.textContent = arr.length + (arr.length === 1 ? " lift" : " lifts");
    logList.innerHTML = "";
    if(!arr.length){ var empty = el("div", "card hint", "Nothing recorded yet. Load plates, enter your reps, and tap Record lift."); logList.appendChild(empty); }
    arr.forEach(function(e){
      var card = el("div", "card entry");
      card.appendChild(el("div", "t", when(e.ts)));
      var title = [e.exercise, areaName(e.area)].filter(Boolean);
      card.appendChild(el("div", "h", title.length ? title.join("  ·  ") : "Lift"));
      var ou = e.unit === "lb" ? "kg" : "lb";
      card.appendChild(el("div", "s", weightText(e) + " × " + e.reps + " reps × " + e.sets + " sets"));
      card.appendChild(el("div", "s", "Volume " + kfmt(e.volume) + " " + e.unit + "  (" + kfmt(e.unit === "lb" ? e.volumeKg : e.volumeLb) + " " + ou + ")"));
      card.appendChild(el("div", "d", detailText(e)));
      if(e.muscles && (e.muscles.p.length || e.muscles.s.length)) card.appendChild(el("div", "d", "Works: " + mnames(e.muscles.p) + (e.muscles.s.length ? "  ·  Helping: " + mnames(e.muscles.s) : "")));
      if(e.note) card.appendChild(el("div", "d", "Note: " + e.note));
      var del = el("button", "del", "Delete"); del.type = "button";
      del.addEventListener("click", function(){
        if(pending && pending.id === e.id){
          clearTimeout(pending.timer); pending = null;
          addTomb([e.id]); saveLog(loadLog().filter(function(x){ return x.id !== e.id; })); setBadge(); renderLog(); autoSync();
        } else {
          if(pending){ clearTimeout(pending.timer); }
          del.textContent = "Tap again to delete";
          pending = {id:e.id, timer:setTimeout(function(){ pending = null; del.textContent = "Delete"; }, 3500)};
        }
      });
      card.appendChild(del);
      logList.appendChild(card);
    });
  }
  function csvCell(v){ v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function toCsv(){
    var rows = [["date","time","equipment","area","exercise","attachment","weight_lb","weight_kg","per_hand_lb","reps","sets","volume_lb","volume_kg","plates_per_side","bar","main_muscles","helping_muscles","note"]];
    loadLog().slice().reverse().forEach(function(e){
      var d = new Date(e.ts);
      var per = Object.keys(e.perSide || {}).map(Number).sort(function(a, b){ return b - a; }).map(function(w){ return e.perSide[w] + "x" + w; }).join(" ");
      rows.push([d.toLocaleDateString(), d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}), e.equipment || "Barbell", areaName(e.area), e.exercise, e.attachment || "",
        fmt(e.weightLb), fmt(e.weightKg), e.perHand ? fmt(e.perHand) : "", e.reps, e.sets, fmt(e.volumeLb), fmt(e.volumeKg),
        per ? per + " " + e.unit : "", e.bar ? e.bar + " " + e.unit : "none",
        e.muscles ? mnames(e.muscles.p) : "", e.muscles ? mnames(e.muscles.s) : "", e.note]);
    });
    return rows.map(function(r){ return r.map(csvCell).join(","); }).join("\n");
  }
  document.getElementById("logCopy").addEventListener("click", function(){
    var text = toCsv();
    function fallback(){
      logBox.hidden = false; logBox.value = text; logBox.focus(); logBox.select();
      try{ document.execCommand("copy"); logMsg.textContent = "Text is selected below. Copy it."; }catch(e){ logMsg.textContent = "Select the text below and copy it."; }
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ logMsg.textContent = "Copied ✓"; setTimeout(function(){ logMsg.textContent = ""; }, 3000); }, fallback);
    } else fallback();
  });
  var clearBtn = document.getElementById("logClear"), clearTimer = null;
  clearBtn.addEventListener("click", function(){
    if(clearTimer){
      clearTimeout(clearTimer); clearTimer = null; clearBtn.textContent = "Clear all";
      addTomb(loadLog().map(function(x){ return x.id; })); saveLog([]); setBadge(); renderLog(); autoSync();
    } else {
      clearBtn.textContent = "Tap again to clear all";
      clearTimer = setTimeout(function(){ clearTimer = null; clearBtn.textContent = "Clear all"; }, 3500);
    }
  });
