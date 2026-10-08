/* ---------- Private GitHub backup (the log goes to a file in YOUR private repo) ---------- */
  var GHKEY = "gymcalc.gh", TOMBKEY = "gymcalc.tomb";
  function lsGet(k, d){ try{ var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; }catch(e){ return d; } }
  function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }
  var gh = lsGet(GHKEY, null), tomb = lsGet(TOMBKEY, []), syncing = false, again = false;
  function addTomb(ids){ ids.forEach(function(id){ if(tomb.indexOf(id) < 0) tomb.push(id); }); lsSet(TOMBKEY, tomb); }
  function toB64(str){ var b = new TextEncoder().encode(str), bin = "", q; for(q = 0; q < b.length; q++) bin += String.fromCharCode(b[q]); return btoa(bin); }
  function fromB64(b64){ var bin = atob(String(b64).replace(/\s/g, "")), b = new Uint8Array(bin.length), q; for(q = 0; q < bin.length; q++) b[q] = bin.charCodeAt(q); return new TextDecoder().decode(b); }
  var ghStatus = document.getElementById("ghStatus"), ghSyncBtn = document.getElementById("ghSync"), ghDisc = document.getElementById("ghDisc");
  var ghSetup = document.getElementById("ghSetup"), ghRepo = document.getElementById("ghRepo"), ghPath = document.getElementById("ghPath");
  var ghBranch = document.getElementById("ghBranch"), ghToken = document.getElementById("ghToken"), ghConnectBtn = document.getElementById("ghConnect");
  function clock12(ts){ return new Date(ts).toLocaleString([], {month:"short", day:"numeric", hour:"numeric", minute:"2-digit"}); }
  function showGh(){
    ghSyncBtn.hidden = !gh; ghDisc.hidden = !gh;
    if(gh){
      ghStatus.textContent = (gh.last ? "Backed up to " + gh.repo + " · last sync " + clock12(gh.last) : "Connected to " + gh.repo);
      ghSetup.open = false; ghRepo.value = gh.repo; ghPath.value = gh.path; ghBranch.value = gh.branch;
    } else {
      ghStatus.textContent = "Saved on this device only.";
    }
  }
  function ghHeaders(cfg, json){
    var h = {"Authorization": "Bearer " + cfg.token, "Accept": "application/vnd.github+json"};
    if(json) h["Content-Type"] = "application/json";
    return h;
  }
  function ghErrText(err){
    if(err && err.http === 401) return "GitHub rejected the token. Make a new one and reconnect.";
    if(err && err.http === 403) return "GitHub said no (403). Check the token's Contents permission is Read and write.";
    if(err && err.http === 404) return "GitHub can't find that repo, file path or branch, or the token can't see it.";
    if(err && err.message && err.name !== "TypeError") return err.message;
    return "Couldn't reach GitHub from this page. (The copy that runs inside Claude blocks outside connections. Use the copy you host yourself.)";
  }
  function httpErr(res){ var e = new Error("HTTP " + res.status); e.http = res.status; return e; }
  function ghCheck(cfg){
    return fetch("https://api.github.com/repos/" + cfg.repo, {headers: ghHeaders(cfg)}).then(function(res){
      if(!res.ok) throw httpErr(res);
      return res.json();
    }).then(function(info){
      if(!info.private) throw new Error("That repo is PUBLIC, so anyone could read your log. Pick a private repo.");
      if(info.permissions && info.permissions.push === false) throw new Error("The token can see that repo but can't write to it. Give it Contents: Read and write.");
      return true;
    });
  }
  function mergeLogs(local, remote, dead){
    var kill = {}, map = {};
    dead.forEach(function(id){ kill[id] = 1; });
    remote.concat(local).forEach(function(e){ if(e && e.id && !kill[e.id]) map[e.id] = e; });
    return Object.keys(map).map(function(k){ return map[k]; }).sort(function(a, b){ return b.ts - a.ts; }).slice(0, 2000);
  }
  function sameIds(a, b){ return a.length === b.length && a.slice().sort().join("|") === b.slice().sort().join("|"); }
  function ghSyncOnce(retried){
    var url = "https://api.github.com/repos/" + gh.repo + "/contents/" + gh.path.split("/").map(encodeURIComponent).join("/");
    return fetch(url + "?ref=" + encodeURIComponent(gh.branch), {headers: ghHeaders(gh)}).then(function(res){
      if(res.status === 404) return {entries: [], deleted: [], sha: null};
      if(!res.ok) throw httpErr(res);
      return res.json().then(function(j){
        var data = {}; try{ data = JSON.parse(fromB64(j.content)); }catch(e){}
        return {entries: Array.isArray(data.entries) ? data.entries : [], deleted: Array.isArray(data.deleted) ? data.deleted : [], sha: j.sha};
      });
    }).then(function(remote){
      var dead = tomb.slice(); remote.deleted.forEach(function(id){ if(dead.indexOf(id) < 0) dead.push(id); });
      var merged = mergeLogs(loadLog(), remote.entries, dead);
      var need = !sameIds(merged.map(function(e){ return e.id; }), remote.entries.map(function(e){ return e.id; })) || !sameIds(dead, remote.deleted);
      function finish(){
        tomb = dead; lsSet(TOMBKEY, tomb); saveLog(merged); gh.last = Date.now(); lsSet(GHKEY, gh);
        setBadge(); renderLog(); showGh();
      }
      if(!need){ finish(); return; }
      var body = {message: "gym log: " + merged.length + " lifts", branch: gh.branch,
                  content: toB64(JSON.stringify({version: 1, entries: merged, deleted: dead}, null, 1))};
      if(remote.sha) body.sha = remote.sha;
      return fetch(url, {method: "PUT", headers: ghHeaders(gh, true), body: JSON.stringify(body)}).then(function(res){
        if((res.status === 409 || res.status === 422) && !retried) return ghSyncOnce(true);   // someone else wrote first: merge again
        if(!res.ok) throw httpErr(res);
        finish();
      });
    });
  }
  function ghSync(){
    if(!gh) return Promise.resolve();
    if(syncing){ again = true; return Promise.resolve(); }
    syncing = true; ghStatus.textContent = "Syncing…";
    return ghSyncOnce(false).catch(function(err){
      ghStatus.textContent = "Not backed up: " + ghErrText(err);
    }).then(function(){
      syncing = false;
      if(again){ again = false; return ghSync(); }
    });
  }
  function autoSync(){ if(gh) ghSync(); }
  ghSyncBtn.addEventListener("click", ghSync);
  ghDisc.addEventListener("click", function(){
    gh = null; try{ localStorage.removeItem(GHKEY); }catch(e){}
    ghToken.value = ""; showGh(); ghStatus.textContent = "Disconnected. The token was removed from this device. Your log is still saved here.";
  });
  ghConnectBtn.addEventListener("click", function(){
    var cfg = {repo: ghRepo.value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, ""),
               path: (ghPath.value.trim() || "gym-log.json").replace(/^\/+/, ""),
               branch: ghBranch.value.trim() || "main", token: ghToken.value.trim()};
    if(!/^[\w.-]+\/[\w.-]+$/.test(cfg.repo)){ ghStatus.textContent = "Enter the repo as owner/name, like yourname/gym-log."; return; }
    if(!cfg.token){ ghStatus.textContent = "Paste your access token first."; return; }
    ghStatus.textContent = "Checking the repo…";
    ghCheck(cfg).then(function(){
      gh = cfg; lsSet(GHKEY, gh); ghToken.value = ""; showGh();
      return ghSync();
    }).catch(function(err){ ghStatus.textContent = "Not connected: " + ghErrText(err); });
  });
  showGh();

  renderEquip();
  setBadge();
  renderPlates();
  logReady = true;
  autoSync();
  if(!document.getElementById("log").hidden) renderLog();
