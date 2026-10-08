/* ---------- Segmented helper ---------- */
  function seg(el, options, getVal, onPick){
    el.innerHTML = "";
    options.forEach(function(o){
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = o.label;
      b.setAttribute("aria-pressed", String(getVal() === o.value));
      b.addEventListener("click", function(){ onPick(o.value); });
      el.appendChild(b);
    });
  }
