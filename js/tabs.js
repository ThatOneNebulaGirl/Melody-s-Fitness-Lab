/* ---------- Tabs ---------- */
  var tabs = document.querySelectorAll("nav button");
  var logReady = false;
  function showTab(name){
    if(["plates","log","conv"].indexOf(name) < 0) name = "plates";
    tabs.forEach(function(b){ b.setAttribute("aria-selected", b.dataset.tab === name ? "true" : "false"); });
    ["plates","log","conv"].forEach(function(id){ document.getElementById(id).hidden = (id !== name); });
    if(name === "log" && logReady) renderLog();
    try{ localStorage.setItem("gymcalc.tab", name); }catch(e){}
  }
  tabs.forEach(function(b){ b.addEventListener("click", function(){ showTab(b.dataset.tab); }); });
  try{ var saved = localStorage.getItem("gymcalc.tab"); if(saved) showTab(saved); }catch(e){}
