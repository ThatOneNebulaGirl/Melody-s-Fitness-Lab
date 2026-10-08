/* ---------- Exercises and the muscles they hit (general estimates) ---------- */
  var AREA_ORDER = ["Chest", "Back", "Shoulders", "Arms", "Lower body", "Glutes"];
  var EX = {
    barbell:{"Chest":["Bench press"], "Back":["Barbell row","Deadlift"], "Lower body":["Squat","Front squat","Hip thrust","Lunge"], "Glutes":["Hip thrust","Glute bridge"]},
    ez:{"Arms":["Bicep curl","Skull crusher"]},
    db:{"Chest":["Chest press"], "Shoulders":["Shoulder press","Lateral raise"], "Arms":["Hammer curl"]},
    machine:{"Back":["Lat pulldown","Low row"], "Arms":["Tricep pulldown"], "Lower body":["Leg press"]}
  };
  var MUS = {
    "barbell|Bench press":   {p:["chest"], s:["fdelt","triceps"]},
    "barbell|Barbell row":   {p:["lats","rhom"], s:["traps","rdelt","biceps","lback","forearms"]},
    "barbell|Deadlift":      {p:["glutes","hams","lback"], s:["quads","lats","traps","forearms","abs"]},
    "barbell|Squat":         {p:["quads","glutes"], s:["hams","adductors","lback","abs"]},
    "barbell|Front squat":   {p:["quads"], s:["glutes","adductors","abs","lback"]},
    "barbell|Hip thrust":    {p:["glutes"], s:["hams","adductors"]},
    "barbell|Lunge":         {p:["quads","glutes"], s:["hams","adductors","calves"]},
    "barbell|Glute bridge":  {p:["glutes"], s:["hams"]},
    "ez|Bicep curl":         {p:["biceps"], s:["brachialis","forearms"]},
    "ez|Skull crusher":      {p:["triceps"], s:["forearms"]},
    "db|Chest press":        {p:["chest"], s:["fdelt","triceps"]},
    "db|Shoulder press":     {p:["fdelt","sdelt"], s:["triceps","traps"]},
    "db|Lateral raise":      {p:["sdelt"], s:["traps","fdelt"]},
    "db|Hammer curl":        {p:["brachialis","biceps"], s:["forearms"]},
    "machine|Lat pulldown":  {p:["lats"], s:["biceps","rhom","rdelt","forearms"]},
    "machine|Low row":       {p:["lats","rhom"], s:["traps","rdelt","biceps","forearms","lback"]},
    "machine|Tricep pulldown":{p:["triceps"], s:["forearms"]},
    "machine|Leg press":     {p:["quads","glutes"], s:["hams","adductors","calves"]}
  };
  var AREA_MUS = {
    "Chest":{p:["chest"], s:["fdelt","triceps"]}, "Back":{p:["lats","rhom"], s:["biceps","traps"]},
    "Shoulders":{p:["fdelt","sdelt"], s:["triceps","traps"]}, "Arms":{p:["biceps","triceps"], s:["brachialis","forearms"]},
    "Lower body":{p:["quads","glutes"], s:["hams","calves","adductors"]}, "Glutes":{p:["glutes"], s:["hams"]}
  };
  // handles change the emphasis, they don't switch muscles on or off
  var ATT = {
    "machine|Low row":[
      {id:"close", label:"Close-grip handle", p:["lats"], s:["rhom","biceps","traps","rdelt","forearms","lback"],
       note:"Close neutral grip, elbows tucked: leans toward the lats (lower lats) and the biceps."},
      {id:"straight", label:"Straight bar (diamond grip)", p:["lats","rhom"], s:["traps","rdelt","biceps","forearms","lback"],
       note:"Straight bar about shoulder width: an even mix of lats and mid-back. Palms up adds more biceps."},
      {id:"wide", label:"Wide bar", p:["rhom","rdelt"], s:["lats","traps","biceps","forearms","lback"],
       note:"Wide overhand grip with elbows out: shifts toward the upper back and rear shoulders."}
    ],
    "machine|Lat pulldown":[
      {id:"wide", label:"Wide bar", p:["lats"], s:["rhom","rdelt","biceps","forearms","traps"],
       note:"Wide overhand grip: the classic lat-width pull, a little less biceps."},
      {id:"close", label:"Close-grip handle", p:["lats"], s:["biceps","rhom","forearms","rdelt"],
       note:"Close neutral grip: lets you pull lower, so more lower lats and biceps."}
    ],
    "machine|Tricep pulldown":[
      {id:"rope", label:"Rope", p:["triceps"], s:["forearms"], note:"Rope: you can spread the ends at the bottom for a harder squeeze."},
      {id:"bar", label:"Straight bar", p:["triceps"], s:["forearms"], note:"Straight bar: easiest to load heavier."},
      {id:"vbar", label:"V-bar", p:["triceps"], s:["forearms"], note:"V-bar: neutral grip that is easy on the wrists."}
    ]
  };
  var OLD_LABELS = {"Upper: Chest":"Chest", "Upper: Back":"Back"};   // entries recorded before the rename
  function areaName(x){ return OLD_LABELS[x] || x; }
  var MN = {chest:"Chest", fdelt:"Front shoulders", sdelt:"Side shoulders", rdelt:"Rear shoulders", biceps:"Biceps", brachialis:"Brachialis", triceps:"Triceps",
    forearms:"Forearms", abs:"Core", obliques:"Obliques", quads:"Quads", adductors:"Inner thigh", traps:"Traps", rhom:"Upper back",
    lats:"Lats", lback:"Lower back", glutes:"Glutes", hams:"Hamstrings", calves:"Calves"};
  function mnames(ids){ return (ids || []).map(function(x){ return MN[x] || x; }).join(", "); }

  var L = {area:null, ex:null, att:null};
  var eqSeg = document.getElementById("eqSeg"), bbCtl = document.getElementById("bbCtl"), pVizEl = document.getElementById("pViz");
  var fxCard = document.getElementById("fxCard"), fxBody = document.getElementById("fxBody"), fxLabel = document.getElementById("fxLabel");
  var lArea = document.getElementById("lArea"), lEx = document.getElementById("lEx"), lExOther = document.getElementById("lExOther");
  var lAttWrap = document.getElementById("lAttWrap"), lAtt = document.getElementById("lAtt");
  var lReps = document.getElementById("lReps"), lSets = document.getElementById("lSets"), lNote = document.getElementById("lNote");
  lVolBig = document.getElementById("lVolBig"), lVolSub = document.getElementById("lVolSub");
  var lMsg = document.getElementById("lMsg"), lRec = document.getElementById("lRec"), msgTimer = null;
  var mMap = document.getElementById("mMap"), mLegend = document.getElementById("mLegend"), mNote = document.getElementById("mNote");

  function currentAtt(){
    var list = L.ex && ATT[E.type + "|" + L.ex];
    if(!list || !L.att) return null;
    for(var q = 0; q < list.length; q++) if(list[q].id === L.att) return list[q];
    return null;
  }
  function tidy(p, s){ return {p:p.slice(), s:s.filter(function(x){ return p.indexOf(x) < 0; })}; }
  function getMuscles(){
    var att = currentAtt();
    if(att) return tidy(att.p, att.s);
    var m = (L.ex && L.ex !== "Other") ? MUS[E.type + "|" + L.ex] : null;
    if(m) return tidy(m.p, m.s);
    if(L.area && AREA_MUS[L.area]) return tidy(AREA_MUS[L.area].p, AREA_MUS[L.area].s);
    return {p:[], s:[]};
  }
