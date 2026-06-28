/* ============================================================
   pixel-to-blocks  ·  vishkul/tools
   Turn an image into a Minecraft build plan.
   - Verified block colours (texture-colour values, hand-checked).
   - Real CC-BY block textures from ProgrammerArt where available.
   - Version / Creative-Survival / stage / family / material gating.
   No AI, no API. Pure colour maths against a checked block list.
   ============================================================ */

const BLOCKS = [
  {name:"White Wool",hex:"#eaeced",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Light Gray Wool",hex:"#8e8e87",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Gray Wool",hex:"#3f4448",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Black Wool",hex:"#15151a",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Brown Wool",hex:"#724829",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Red Wool",hex:"#a12723",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Orange Wool",hex:"#f17614",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Yellow Wool",hex:"#f9c628",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Lime Wool",hex:"#70b91a",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Green Wool",hex:"#556e1c",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Cyan Wool",hex:"#158a91",fam:"wool",stage:3,since:"1.8",tex:true},
  {name:"Light Blue Wool",hex:"#3aafd9",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"Blue Wool",hex:"#35399d",fam:"wool",stage:3,since:"1.8",tex:true},
  {name:"Purple Wool",hex:"#7a2aad",fam:"wool",stage:3,since:"1.8",tex:true},
  {name:"Magenta Wool",hex:"#be45b4",fam:"wool",stage:3,since:"1.8",tex:true},
  {name:"Pink Wool",hex:"#ee8dac",fam:"wool",stage:2,since:"1.8",tex:true},
  {name:"White Concrete",hex:"#cfd5d6",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Light Gray Concrete",hex:"#7d7d73",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Gray Concrete",hex:"#373a3e",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Black Concrete",hex:"#080a0f",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Brown Concrete",hex:"#603c20",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Red Concrete",hex:"#8e2121",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Orange Concrete",hex:"#e06101",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Yellow Concrete",hex:"#f1af15",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Lime Concrete",hex:"#5ea919",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Green Concrete",hex:"#495b24",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Cyan Concrete",hex:"#157788",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Light Blue Concrete",hex:"#2489c7",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Blue Concrete",hex:"#2d2f8f",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Purple Concrete",hex:"#64209c",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Magenta Concrete",hex:"#a9309f",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Pink Concrete",hex:"#d6658f",fam:"concrete",stage:3,since:"1.12",tex:false},
  {name:"Terracotta",hex:"#985e44",fam:"terracotta",stage:2,since:"1.8",tex:false},
  {name:"White Terracotta",hex:"#d2b2a1",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Light Gray Terracotta",hex:"#876b62",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Gray Terracotta",hex:"#3a2a24",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Black Terracotta",hex:"#251710",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Brown Terracotta",hex:"#4d3324",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Red Terracotta",hex:"#8f3d2f",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Orange Terracotta",hex:"#a25426",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Yellow Terracotta",hex:"#ba8523",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Lime Terracotta",hex:"#687635",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Green Terracotta",hex:"#4c532a",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Cyan Terracotta",hex:"#575b5b",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Light Blue Terracotta",hex:"#716d8a",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Blue Terracotta",hex:"#4a3c5b",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Purple Terracotta",hex:"#764656",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Magenta Terracotta",hex:"#96586d",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"Pink Terracotta",hex:"#a24e4f",fam:"terracotta",stage:3,since:"1.8",tex:false},
  {name:"White Glazed Terracotta",hex:"#bdd4cb",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Light Gray Glazed Terracotta",hex:"#90a6a8",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Gray Glazed Terracotta",hex:"#535a5e",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Black Glazed Terracotta",hex:"#441e20",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Brown Glazed Terracotta",hex:"#786a56",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Red Glazed Terracotta",hex:"#b63c35",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Orange Glazed Terracotta",hex:"#9b935c",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Yellow Glazed Terracotta",hex:"#eac059",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Lime Glazed Terracotta",hex:"#a3c637",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Green Glazed Terracotta",hex:"#758e43",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Cyan Glazed Terracotta",hex:"#34777d",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Light Blue Glazed Terracotta",hex:"#5fa5d1",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Blue Glazed Terracotta",hex:"#2f418b",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Purple Glazed Terracotta",hex:"#6e3098",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Magenta Glazed Terracotta",hex:"#d064c0",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Pink Glazed Terracotta",hex:"#eb9bb6",fam:"glazed",stage:3,since:"1.12",tex:false},
  {name:"Oak Planks",hex:"#a2834f",fam:"wood",stage:1,since:"1.8",tex:true},
  {name:"Birch Planks",hex:"#c0af79",fam:"wood",stage:1,since:"1.8",tex:true},
  {name:"Spruce Planks",hex:"#735531",fam:"wood",stage:1,since:"1.8",tex:true},
  {name:"Dark Oak Planks",hex:"#432b14",fam:"wood",stage:1,since:"1.8",tex:true},
  {name:"Jungle Planks",hex:"#a07351",fam:"wood",stage:1,since:"1.8",tex:true},
  {name:"Acacia Planks",hex:"#a85a32",fam:"wood",stage:1,since:"1.8",tex:true},
  {name:"Mangrove Planks",hex:"#763631",fam:"wood",stage:1,since:"1.19",tex:false},
  {name:"Cherry Planks",hex:"#e3b3ad",fam:"wood",stage:1,since:"1.20",tex:false},
  {name:"Pale Oak Planks",hex:"#e4dad8",fam:"wood",stage:1,since:"1.21",tex:false},
  {name:"Stone",hex:"#7d7d7d",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Cobblestone",hex:"#807f80",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Stone Bricks",hex:"#7a797a",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Cracked Stone Bricks",hex:"#767676",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Chiseled Stone Bricks",hex:"#787778",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Andesite",hex:"#88898a",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Diorite",hex:"#bdbdbe",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Granite",hex:"#9a6b56",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Sandstone",hex:"#dbcea1",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Cut Sandstone",hex:"#dacea0",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Chiseled Sandstone",hex:"#d8cb9b",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Red Sandstone",hex:"#bd6620",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Dirt",hex:"#866043",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Sand",hex:"#dbd3a0",fam:"stone",stage:1,since:"1.8",tex:true},
  {name:"Bricks",hex:"#96574c",fam:"stone",stage:2,since:"1.8",tex:true},
  {name:"Dripstone Block",hex:"#866c5d",fam:"stone",stage:1,since:"1.17",tex:false},
  {name:"Calcite",hex:"#dad9d4",fam:"stone",stage:3,since:"1.17",tex:false},
  {name:"Tuff",hex:"#6c6e67",fam:"stone",stage:3,since:"1.17",tex:false},
  {name:"Deepslate",hex:"#505053",fam:"stone",stage:3,since:"1.17",tex:false},
  {name:"Cobbled Deepslate",hex:"#4d4d51",fam:"stone",stage:3,since:"1.17",tex:false},
  {name:"Deepslate Bricks",hex:"#474747",fam:"stone",stage:3,since:"1.17",tex:false},
  {name:"Deepslate Tiles",hex:"#373737",fam:"stone",stage:3,since:"1.17",tex:false},
  {name:"Chiseled Deepslate",hex:"#363637",fam:"stone",stage:3,since:"1.17",tex:false},
  {name:"Nether Bricks",hex:"#2a1417",fam:"nether",stage:4,since:"1.8",tex:true},
  {name:"Glowstone",hex:"#ac8354",fam:"nether",stage:4,since:"1.8",tex:true},
  {name:"Basalt",hex:"#49494e",fam:"nether",stage:4,since:"1.16",tex:false},
  {name:"Polished Basalt",hex:"#59585c",fam:"nether",stage:4,since:"1.16",tex:false},
  {name:"Blackstone",hex:"#2a2429",fam:"nether",stage:4,since:"1.16",tex:false},
  {name:"Polished Blackstone",hex:"#353139",fam:"nether",stage:4,since:"1.16",tex:false},
  {name:"Polished Blackstone Bricks",hex:"#302b32",fam:"nether",stage:4,since:"1.16",tex:false},
  {name:"Gilded Blackstone",hex:"#382b26",fam:"nether",stage:4,since:"1.16",tex:false},
  {name:"End Stone",hex:"#dcdf9e",fam:"end",stage:5,since:"1.8",tex:true},
  {name:"End Stone Bricks",hex:"#dae0a2",fam:"end",stage:5,since:"1.9",tex:false},
];

/* version order for the slider (oldest -> newest). Each block has .since;
   a block is available if its since-version <= selected version.
   These major versions verified against the wiki for block additions. */
const VERSIONS = ["1.8","1.9","1.12","1.16","1.17","1.19","1.20","1.21"];
const VERSION_LABELS = {
  "1.8":"1.8 (classic)","1.9":"1.9","1.12":"1.12 (concrete + glazed)",
  "1.16":"1.16 (Nether)","1.17":"1.17 (Caves & Cliffs)","1.19":"1.19 (Wild)",
  "1.20":"1.20 (Trails & Tales)","1.21":"1.21 (latest)"
};
function vIndex(v){ return VERSIONS.indexOf(v); }

const FAMILIES = [
  {key:"wool",label:"Wool"},
  {key:"concrete",label:"Concrete"},
  {key:"terracotta",label:"Terracotta"},
  {key:"glazed",label:"Glazed terracotta"},
  {key:"wood",label:"Wood planks"},
  {key:"stone",label:"Stone & brick"},
  {key:"nether",label:"Nether"},
  {key:"end",label:"End"},
];

/* ---------------- colour maths ---------------- */
function hexToRgb(h){ const n=parseInt(h.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
BLOCKS.forEach(b=>b.rgb=hexToRgb(b.hex));
function dist(r1,g1,b1,r2,g2,b2){
  const rm=(r1+r2)/2, dr=r1-r2, dg=g1-g2, db=b1-b2;
  return Math.sqrt((2+rm/256)*dr*dr + 4*dg*dg + (2+(255-rm)/256)*db*db);
}

/* ---------------- state ---------------- */
const state={
  mode:"helper",            // helper (build helper) | pixel (pixel art)
  game:"survival", stage:3, width:64,
  pref:"none", render:"color", version:"1.21",
  allow:new Set(FAMILIES.map(f=>f.key)), img:null,
  onlyGettable:false,       // build helper: hide blocks not gettable at stage
  bTall:20, bWide:12, bDepth:10,  // rough size inputs (blocks)
};

/* ---------------- active palette from all filters ---------------- */
function activePalette(){
  let pool=BLOCKS.filter(b=>state.allow.has(b.fam));
  pool=pool.filter(b=>vIndex(b.since)<=vIndex(state.version)); // version gate (always)
  // Stage gating of the MATCHING pool:
  //  - pixel art: hard-gate (you're placing real blocks, only offer gettable ones)
  //  - build helper: do NOT hard-gate, so the build can want blocks you can't get yet,
  //    and we tag them "not yet". Unless the user ticks "only show blocks I can get".
  const hardGate = state.game==="survival" && (state.mode!=="helper" || state.onlyGettable);
  if(hardGate) pool=pool.filter(b=>b.stage<=state.stage);
  if(state.pref&&state.pref!=="none"){
    const only=pool.filter(b=>b.fam===state.pref);
    if(only.length) pool=only;
  }
  return pool;
}

function nearest(r,g,b,pool){
  const scored=pool.map(bl=>({block:bl,d:dist(r,g,b,bl.rgb[0],bl.rgb[1],bl.rgb[2])}));
  scored.sort((a,b)=>a.d-b.d);
  return scored;
}

/* texture image cache (decoded once) */
const texImgCache={};
function getTexImg(name){
  if(texImgCache[name]!==undefined) return texImgCache[name];
  if(typeof BLOCK_TEXTURES!=="undefined" && BLOCK_TEXTURES[name]){
    const img=new Image(); img.src="data:image/png;base64,"+BLOCK_TEXTURES[name];
    texImgCache[name]=img; return img;
  }
  texImgCache[name]=null; return null;
}

/* ============================================================ UI ============================================================ */
const $=s=>document.querySelector(s);

/* Safety net: if any wiring throws (e.g. a stale/mismatched file is deployed),
   show a visible banner instead of failing silently with an empty list. */
function showFatal(msg){
  let bar=document.getElementById("fatalBar");
  if(!bar){
    bar=document.createElement("div"); bar.id="fatalBar";
    bar.style.cssText="margin:16px 0;padding:12px 16px;border:1px solid #ff2d78;border-radius:8px;background:rgba(255,45,120,.08);color:#ff8db4;font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.5";
    const main=document.querySelector("main"); if(main) main.insertBefore(bar, main.firstChild);
  }
  bar.textContent="Something went wrong loading the tool: "+msg+". If you just deployed, the page and its script files may be out of sync, try a hard refresh (Ctrl+Shift+R).";
}
window.addEventListener("error",e=>{ showFatal(e.message||"script error"); });

// ---- mode toggle (build helper vs pixel art) ----
$("#modeToggle").addEventListener("click",e=>{
  const btn=e.target.closest("button"); if(!btn)return;
  state.mode=btn.dataset.mode;
  document.querySelectorAll("#modeToggle button").forEach(b=>b.classList.toggle("on",b===btn));
  const helper = state.mode==="helper";
  $("#modeSub").innerHTML = helper
    ? '<b>Build helper</b> \u2014 for building a real 3D thing (a house, a tower) freehand from a reference. Tells you which blocks it uses, which you can get at your stage, and roughly how many. You build it by eye; this is your materials list.'
    : '<b>Pixel art</b> \u2014 for building a flat picture of an image, one block thick. You get a block-by-block map and <b>exact</b> counts, because every block is one cell in a flat grid.';
  // show/hide the size inputs (helper only) and width (pixel only)
  $("#sizeBox").classList.toggle("hidden", !helper);
  $("#widthBox").classList.toggle("hidden", helper);
  if(lastResult) build();
});

// ---- render mode toggle (colour vs texture) ----
$("#renderToggle").addEventListener("click",e=>{
  const btn=e.target.closest("button"); if(!btn)return;
  state.render=btn.dataset.render;
  document.querySelectorAll("#renderToggle button").forEach(b=>b.classList.toggle("on",b===btn));
  $("#renderNote").innerHTML = state.render==="texture"
    ? 'Showing real open-source block textures (ProgrammerArt, CC-BY). Only ~40 classic blocks have textures; newer ones (concrete, terracotta) fall back to their true colour. Note: these textures are stylised and their colours differ a little from the real game.'
    : 'Showing each block\u2019s verified in-game colour. Consistent across every block, and true to how the block actually looks in Minecraft.';
  if(lastResult) renderOutput(); // re-render if we have a build
});

// ---- file + paste handling ----
const drop=$("#drop"), fileInput=$("#file");
drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("drag");});
drop.addEventListener("dragleave",()=>drop.classList.remove("drag"));
drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("drag");
  if(e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);});
fileInput.addEventListener("change",e=>{ if(e.target.files[0]) loadImage(e.target.files[0]); });

// paste image from clipboard (Ctrl/Cmd+V anywhere on the page)
window.addEventListener("paste",e=>{
  const items=(e.clipboardData||{}).items||[];
  for(const it of items){
    if(it.type&&it.type.startsWith("image/")){
      const f=it.getAsFile(); if(f){ loadImage(f); e.preventDefault(); return; }
    }
  }
});

function loadImage(f){
  if(!f.type.startsWith("image/"))return;
  const r=new FileReader();
  r.onload=ev=>{ const im=new Image();
    im.onload=()=>{ state.img=im; $("#afterUpload").classList.remove("hidden"); updateEstDims();
      drop.querySelector(".big").textContent="\u2713 image loaded \u00b7 tap to change"; };
    im.src=ev.target.result; };
  r.readAsDataURL(f);
}

// ---- width slider ----
const widthRange=$("#widthRange");
widthRange.addEventListener("input",()=>{ state.width=+widthRange.value; $("#wLabel").textContent=state.width; updateEstDims(); });

// ---- build-helper size inputs (tall / wide / depth) ----
["Tall","Wide","Depth"].forEach(dim=>{
  const el=$("#b"+dim); if(!el) return;
  el.addEventListener("input",()=>{
    const v=Math.max(1,Math.min(256,+el.value||1));
    state["b"+dim]=v;
    if(lastResult && state.mode==="helper") renderOutput();
  });
});
// ---- only-gettable toggle ----
const onlyGet=$("#onlyGet");
if(onlyGet) onlyGet.addEventListener("change",()=>{ state.onlyGettable=onlyGet.checked; if(lastResult) build(); });
function updateEstDims(){ if(!state.img)return;
  const h=Math.max(1,Math.round(state.width*state.img.height/state.img.width));
  $("#estDims").textContent=`build: ${state.width} \u00d7 ${h} blocks (${(state.width*h).toLocaleString()} cells)`;
}

// ---- version slider ----
const verRange=$("#verRange");
if(verRange){
  verRange.max=VERSIONS.length-1;
  verRange.value=VERSIONS.length-1;
  verRange.addEventListener("input",()=>{
    state.version=VERSIONS[+verRange.value];
    $("#verLabel").textContent=VERSION_LABELS[state.version];
  });
}

// ---- game seg + stage ----
$("#gameSeg").addEventListener("click",e=>{ const btn=e.target.closest("button"); if(!btn)return;
  state.game=btn.dataset.game;
  document.querySelectorAll("#gameSeg button").forEach(b=>b.classList.toggle("on",b===btn));
  $("#stageWrap").classList.toggle("hidden",state.game!=="survival");
  $("#onlyGetWrap").classList.toggle("hidden",state.game!=="survival"||state.mode!=="helper");
  if(lastResult) build(); });
$("#stageSel").addEventListener("change",e=>{ state.stage=+e.target.value; if(lastResult) build(); });

// ---- family picker ----
const palettePick=$("#palettePick");
FAMILIES.forEach(f=>{ const b=document.createElement("button");
  b.textContent=f.label; b.dataset.fam=f.key; b.classList.add("on");
  b.addEventListener("click",()=>{
    if(state.allow.has(f.key)){ if(state.allow.size>1){ state.allow.delete(f.key); b.classList.remove("on"); } }
    else { state.allow.add(f.key); b.classList.add("on"); } });
  palettePick.appendChild(b); });

// ---- material preference ----
$("#prefSeg").addEventListener("click",e=>{ const btn=e.target.closest("button"); if(!btn)return;
  state.pref=btn.dataset.pref;
  document.querySelectorAll("#prefSeg button").forEach(b=>b.classList.toggle("on",b===btn)); });

// ---- BUILD ----
$("#goBtn").addEventListener("click",build);
let lastResult=null;

function build(){
  if(!state.img)return;
  const pool=activePalette();
  if(!pool.length){ alert("No blocks available with those filters. Allow more families, a later version, or a later stage."); return; }
  // helper mode samples at a fixed resolution (we only need colour proportions);
  // pixel-art mode uses the chosen build width (each cell is a real block).
  const W = state.mode==="helper" ? 96 : state.width;
  const H=Math.max(1,Math.round(W*state.img.height/state.img.width));
  const off=document.createElement("canvas"); off.width=W; off.height=H;
  const octx=off.getContext("2d"); octx.imageSmoothingEnabled=true;
  octx.drawImage(state.img,0,0,W,H);
  const data=octx.getImageData(0,0,W,H).data;

  const counts=new Map(), cellBlock=new Array(W*H), cellAlts=new Array(W*H), cache=new Map();
  for(let i=0;i<W*H;i++){
    const a=data[i*4+3];
    if(a<24){ cellBlock[i]=null; continue; }
    const r=data[i*4],g=data[i*4+1],b=data[i*4+2];
    const key=(r>>2)+","+(g>>2)+","+(b>>2);
    let sorted=cache.get(key);
    if(!sorted){ sorted=nearest(r,g,b,pool); cache.set(key,sorted); }
    const best=sorted[0].block; cellBlock[i]=best; cellAlts[i]=sorted.slice(0,4);
    const c=counts.get(best.name)||{block:best,count:0}; c.count++; counts.set(best.name,c);
  }
  lastResult={counts,W,H,cellBlock,cellAlts};
  renderOutput();
}

/* is a block gettable at the current survival stage? (creative = always) */
function gettableNow(bl){ return state.game!=="survival" || bl.stage<=state.stage; }

/* ---------------- render the block map + list ---------------- */
let zoom=1, panX=0, panY=0;

function drawMap(){
  const {W,H,cellBlock}=lastResult;
  const cv=$("#mapCanvas");
  const cell=Math.max(3,Math.floor(640/W));
  cv.width=W*cell; cv.height=H*cell;
  const ctx=cv.getContext("2d");
  ctx.imageSmoothingEnabled=false;
  ctx.clearRect(0,0,cv.width,cv.height);

  const useTex=state.render==="texture";
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const bl=cellBlock[y*W+x]; if(!bl)continue;
    if(useTex && bl.tex){
      const img=getTexImg(bl.name);
      if(img&&img.complete&&img.naturalWidth){ ctx.drawImage(img,x*cell,y*cell,cell,cell); continue; }
    }
    ctx.fillStyle=bl.hex; ctx.fillRect(x*cell,y*cell,cell,cell);
  }
  // if textures still decoding, repaint shortly
  if(useTex){ setTimeout(()=>{ if(state.render==="texture"&&lastResult) drawMapQuiet(); },180); }
}
function drawMapQuiet(){ try{ drawMap(); }catch(e){} }

/* zoom + inspect on the map */
function setupMapInteraction(){
  const wrap=$("#mapWrap"), cv=$("#mapCanvas"), tip=$("#inspectTip");
  if(wrap.dataset.wired) return; wrap.dataset.wired="1";

  function cellAt(clientX,clientY){
    const rect=cv.getBoundingClientRect();
    const {W,H}=lastResult;
    const x=Math.floor((clientX-rect.left)/rect.width*W);
    const y=Math.floor((clientY-rect.top)/rect.height*H);
    if(x<0||y<0||x>=W||y>=H) return null;
    return {x,y,block:lastResult.cellBlock[y*W+x]};
  }
  function showTip(e){
    const c=cellAt(e.clientX,e.clientY);
    if(!c||!c.block){ tip.style.display="none"; return; }
    const sw = (state.render==="texture"&&c.block.tex)
      ? `<img src="data:image/png;base64,${(typeof BLOCK_TEXTURES!=='undefined'&&BLOCK_TEXTURES[c.block.name])||''}" style="width:22px;height:22px;image-rendering:pixelated;border-radius:3px;vertical-align:middle">`
      : `<span style="display:inline-block;width:22px;height:22px;background:${c.block.hex};border-radius:3px;vertical-align:middle;border:1px solid rgba(255,255,255,.2)"></span>`;
    tip.innerHTML=`${sw} <b>${c.block.name}</b> <span style="color:var(--dimmer)">· col ${c.x+1}, row ${c.y+1}</span>`;
    tip.style.display="block";
  }
  cv.addEventListener("mousemove",showTip);
  cv.addEventListener("mouseleave",()=>tip.style.display="none");
  cv.style.cursor="crosshair";

  // zoom buttons
  $("#zoomIn").onclick=()=>{ zoom=Math.min(8,zoom*1.4); applyZoom(); };
  $("#zoomOut").onclick=()=>{ zoom=Math.max(1,zoom/1.4); applyZoom(); };
  $("#zoomReset").onclick=()=>{ zoom=1; panX=0; panY=0; applyZoom(); };
  function applyZoom(){ cv.style.transform=`scale(${zoom})`; cv.style.transformOrigin="top left"; }
}

function renderOutput(){
  const {counts,W,H}=lastResult;
  $("#out").classList.add("show");
  const helper = state.mode==="helper";

  // map: pixel-art only
  $("#mapCard").classList.toggle("hidden", helper);
  if(!helper){
    $("#canvasTitle").textContent="Block map";
    $("#canvasCap").textContent="Each cell is one block, face-on. Hover to see which block a cell is. Zoom to build square by square.";
    drawMap(); setupMapInteraction();
  }

  const rows=[...counts.values()].sort((a,b)=>b.count-a.count);
  const totalCells=rows.reduce((s,r)=>s+r.count,0);

  // ---- compute amounts ----
  // pixel art: exact cell counts. build helper: coverage% x rough volume from size inputs.
  let roughTotal=0;
  if(helper){
    const w=Math.max(1,state.bWide), h=Math.max(1,state.bTall), d=Math.max(1,state.bDepth);
    // rough hollow shell: 2 walls (w x h) + 2 walls (d x h) + roof-ish (w x d). honest ballpark.
    roughTotal = Math.round(2*w*h + 2*d*h + w*d);
  }

  // ---- totals bar ----
  const tot=$("#totals");
  if(helper){
    const shown = state.onlyGettable ? rows.filter(r=>gettableNow(r.block)) : rows;
    const gettableCount = rows.filter(r=>gettableNow(r.block)).length;
    tot.innerHTML=`<div>materials <b>${shown.length}</b></div>
      <div>gettable now <b>${gettableCount}</b>/${rows.length}</div>
      <div>rough total <b>~${roughTotal.toLocaleString()}</b></div>
      <div>stacks <b>~${Math.round(roughTotal/64).toLocaleString()}</b></div>`;
  } else {
    tot.innerHTML=`<div>total blocks <b>${totalCells.toLocaleString()}</b></div>
      <div>types <b>${rows.length}</b></div><div>grid <b>${W}\u00d7${H}</b></div>
      <div>stacks <b>${Math.floor(totalCells/64).toLocaleString()}</b>+${totalCells%64}</div>`;
  }

  // ---- block list ----
  const list=$("#blockList"); list.innerHTML="";
  rows.forEach(r=>{
    const pct = r.count/totalCells;
    const get = gettableNow(r.block);
    if(helper && state.onlyGettable && !get) return; // hide locked when toggled

    const row=document.createElement("div"); row.className="blockrow";
    const hasTex = r.block.tex && typeof BLOCK_TEXTURES!=="undefined" && BLOCK_TEXTURES[r.block.name];
    // ONE square per row, following the render toggle.
    // Textures mode: show the texture (fall back to colour if the block has none).
    // Colour mode: show the verified colour swatch.
    let squareHtml;
    if(state.render==="texture" && hasTex){
      squareHtml=`<img class="btex" src="data:image/png;base64,${BLOCK_TEXTURES[r.block.name]}" alt="" title="${r.block.name}">`;
    } else {
      squareHtml=`<span class="swatch" style="background:${r.block.hex}" title="verified colour ${r.block.hex}"></span>`;
    }

    // amount shown per mode
    let amountHtml="";
    if(helper){
      const amt=Math.round(pct*roughTotal);
      const tag = state.game==="survival"
        ? (get ? `<span class="tag-get">can get</span>` : `<span class="tag-lock">not yet</span>`)
        : "";
      amountHtml=`${tag}<span class="bcount">~${amt.toLocaleString()}</span>`;
    } else {
      amountHtml=`<span class="bcount">\u00d7${r.count.toLocaleString()}<span class="bpct">${(pct*100).toFixed(1)}%</span></span>`;
    }

    row.innerHTML=`${squareHtml}
      <div class="bname">${r.block.name}${helper?`<span class="bcov">${(pct*100).toFixed(0)}% of build</span>`:""}</div>
      <div class="bright">${amountHtml}</div>`;
    if(helper && !get) row.classList.add("locked");

    const alts=document.createElement("div"); alts.className="alts";
    const rep=lastResult.cellAlts.find(a=>a&&a[0]&&a[0].block.name===r.block.name);
    if(rep){ let inner='<div class="hint">closest swaps for this colour:</div>';
      rep.slice(1).forEach(a=>{
        const ag=gettableNow(a.block);
        inner+=`<div class="altrow"><span class="sw2" style="background:${a.block.hex}"></span>${a.block.name}${state.game==="survival"?(ag?' <span class="tag-get sm">get</span>':' <span class="tag-lock sm">no</span>'):""}</div>`; });
      alts.innerHTML=inner; }
    row.addEventListener("click",()=>alts.classList.toggle("show"));
    list.appendChild(row); list.appendChild(alts);
  });

  // ---- honest note ----
  $("#honestNote").innerHTML = helper
    ? `<b>Amounts are rough.</b> They assume the build is solid-ish at the size you set (${state.bWide}\u00d7${state.bTall}\u00d7${state.bDepth}) and that materials sit in 3D roughly as they look in the photo. Real numbers depend on how you actually build it. The point is the <b>palette and proportions</b>: which blocks, which you can get now, and a ballpark of each.`
    : `<b>Counts are exact</b> because pixel art is one block thick: every grid cell is one block. Transparent areas are skipped. Colours match verified in-game values; lighting and shaders shift them a little.`;

  $("#out").scrollIntoView({behavior:"smooth",block:"start"});
}

// ---- copy as text ----
$("#copyBtn").addEventListener("click",()=>{
  if(!lastResult)return;
  const helper=state.mode==="helper";
  const rows=[...lastResult.counts.values()].sort((a,b)=>b.count-a.count);
  const totalCells=rows.reduce((s,r)=>s+r.count,0);
  let txt;
  if(helper){
    const w=state.bWide,h=state.bTall,d=state.bDepth;
    const roughTotal=Math.round(2*w*h+2*d*h+w*d);
    txt=`Minecraft build helper \u00b7 ~${w}\u00d7${h}\u00d7${d} \u00b7 MC ${state.version}${state.game==="survival"?` \u00b7 stage ${state.stage}`:""}\n\n`;
    rows.forEach(r=>{
      if(state.onlyGettable && !gettableNow(r.block)) return;
      const amt=Math.round(r.count/totalCells*roughTotal);
      const mark = state.game==="survival" ? (gettableNow(r.block)?"[can get] ":"[not yet] ") : "";
      txt+=`${mark}~${amt} ${r.block.name}\n`;
    });
    txt+=`\nRough total: ~${roughTotal} blocks (~${Math.round(roughTotal/64)} stacks). Estimates.`;
  } else {
    txt=`Minecraft pixel art \u00b7 ${lastResult.W}\u00d7${lastResult.H} blocks \u00b7 MC ${state.version}\n\n`;
    rows.forEach(r=>{ txt+=`${r.count}\u00d7 ${r.block.name}\n`; });
    txt+=`\nTotal: ${totalCells} blocks (${Math.floor(totalCells/64)} stacks + ${totalCells%64})`;
  }
  txt+=`\n\nvia vishkul.com/tools`;
  navigator.clipboard.writeText(txt).then(()=>{ const b=$("#copyBtn"); const o=b.textContent;
    b.textContent="\u2713 copied"; setTimeout(()=>b.textContent=o,1400); });
});
