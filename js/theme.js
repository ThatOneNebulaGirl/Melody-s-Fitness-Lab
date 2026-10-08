/* ---------- Theme (pastel by default, plum night mode) ---------- */
  var modeBtn = document.getElementById("modeBtn");
  function setTheme(t){
    if(t === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    modeBtn.setAttribute("aria-pressed", String(t === "dark"));
    modeBtn.textContent = t === "dark" ? "Day" : "Night";
    Bg.setTheme(t);
    try{ localStorage.setItem("gymcalc.theme", t); }catch(e){}
  }
  var th = "light";
  try{ th = localStorage.getItem("gymcalc.theme") || "light"; }catch(e){}
  setTheme(th);
  modeBtn.addEventListener("click", function(){
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  var motionBtn = document.getElementById("motionBtn");
  if(!Bg.supported) motionBtn.hidden = true;
  function motionUI(on){ motionBtn.setAttribute("aria-pressed", String(on)); motionBtn.textContent = on ? "Tilt on" : "Tilt"; }
  motionBtn.addEventListener("click", function(){
    if(Bg.isOn()){ Bg.disable(); motionUI(false); return; }
    Bg.enable().then(function(ok){
      if(ok) motionUI(true); else motionBtn.textContent = "Tilt blocked";
    }).catch(function(){ motionBtn.textContent = "Tilt n/a"; });
  });

  var askedTilt = false;
  document.addEventListener("click", function(ev){
    if(askedTilt || !Bg.supported || Bg.isOn() || (ev.target && ev.target.closest && ev.target.closest("#motionBtn"))) return;
    askedTilt = true;
    Bg.enable().then(function(ok){ if(ok) motionUI(true); }).catch(function(){});
  }, true);
