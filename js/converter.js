/* ---------- Converter ---------- */
  var pairs = [
    {a:"lb", b:"kg", ab:function(x){return x/LB_PER_KG;}, ba:function(x){return x*LB_PER_KG;}},
    {a:"mi", b:"km", ab:function(x){return x*1.609344;}, ba:function(x){return x/1.609344;}},
    {a:"in", b:"cm", ab:function(x){return x*2.54;}, ba:function(x){return x/2.54;}},
    {a:"ft", b:"m",  ab:function(x){return x*0.3048;}, ba:function(x){return x/0.3048;}},
    {a:"°F", b:"°C", ab:function(x){return (x-32)*5/9;}, ba:function(x){return x*9/5+32;}}
  ];
  var conv = document.getElementById("conv");
  pairs.forEach(function(p, i){
    var row = document.createElement("div");
    row.className = "row";
    row.innerHTML =
      '<div class="fld"><input type="text" id="a'+i+'" aria-label="'+p.a+'" inputmode="decimal" autocomplete="off" placeholder="0"><span class="unit">'+p.a+'</span></div>' +
      '<div class="fld"><input type="text" id="b'+i+'" aria-label="'+p.b+'" inputmode="decimal" autocomplete="off" placeholder="0"><span class="unit">'+p.b+'</span></div>';
    conv.appendChild(row);
    var A = row.querySelector("#a"+i), B = row.querySelector("#b"+i);
    A.addEventListener("input", function(){ var v = num(A.value); B.value = isNaN(v) ? "" : fmt(p.ab(v)); });
    B.addEventListener("input", function(){ var v = num(B.value); A.value = isNaN(v) ? "" : fmt(p.ba(v)); });
  });
