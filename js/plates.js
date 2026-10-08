/* ---------- Plates ---------- */
  var SETS = {
    lb: {plates:[45,35,25,10,5,2.5], bars:[45,35,33], colors:{
      "45":["#3a6bff","#ffffff"],"35":["#9a5bff","#ffffff"],"25":["#00d7ff","#04122a"],"10":["#d4f1ff","#04122a"],"5":["#28f0b0","#04122a"],"2.5":["#7a8cff","#ffffff"]}},
    kg: {plates:[25,20,15,10,5,2.5,1.25], bars:[20,15], colors:{
      "25":["#3a6bff","#ffffff"],"20":["#9a5bff","#ffffff"],"15":["#00d7ff","#04122a"],"10":["#d4f1ff","#04122a"],"5":["#28f0b0","#04122a"],"2.5":["#7a8cff","#ffffff"],"1.25":["#b9c4ff","#04122a"]}}
  };
  var P = {unit:"lb", mode:"side", bar:45, halo:false, counts:{lb:{}, kg:{}}};   // each + is a pair: one plate per side

  function plateTotal(){
    var set = SETS[P.unit], sum = 0, parts = [];
    set.plates.forEach(function(w){
      var c = P.counts[P.unit][w] || 0;
      if(c){ sum += c*w; parts.push(c+" × "+w); }
    });
    var total = sum*2 + P.bar;                       // every + is 2 plates, so double it behind the scenes
    var why = parts.length ? parts.join(" + ") + " each side" : "Tap + to add a pair of plates (one each side)";
    if(parts.length && P.bar) why += " + " + P.bar + " bar";
    return {total:total, why:why};
  }
