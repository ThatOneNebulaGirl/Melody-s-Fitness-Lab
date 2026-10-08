/* ---------- Equipment: barbell, EZ bar, dumbbell, machine ---------- */
  var E = {type:"barbell", ez:30, db:25, hands:2, machine:50};
  var EQ = [{id:"barbell", label:"Barbell"}, {id:"db", label:"Dumbbell"}, {id:"machine", label:"Machine"}, {id:"ez", label:"EZ bar"}];
  function eqLabel(id){ for(var q = 0; q < EQ.length; q++) if(EQ[q].id === id) return EQ[q].label; return id; }
  function getLoad(){
    if(E.type === "barbell"){ var r = plateTotal(); return {total:r.total, unit:P.unit, why:r.why}; }
    if(E.type === "ez") return {total:E.ez, unit:"lb", why:"EZ bar · " + E.ez + " lb (fixed weight, the number is the whole bar)"};
    if(E.type === "db") return {total:E.db * E.hands, unit:"lb", perHand:E.db, hands:E.hands,
      why:E.db + " lb each hand" + (E.hands === 2 ? " × 2 hands" : ", one hand at a time")};
    return {total:E.machine, unit:"lb", why:"Machine stack · " + E.machine + " lb"};
  }
  function updateResult(){}   // the big total card was removed; weight and kg now live in the Weight box
