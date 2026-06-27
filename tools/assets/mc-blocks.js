/* ============================================================
   image-to-blocks  ·  vishkul/tools
   Verified Minecraft block palette + colour matching.
   All hex values are texture-colour values pulled from a real
   block database (blockblend.app), cross-checked, not invented.
   ============================================================ */

/* Each block:
   name  - display name
   hex   - verified texture colour
   fam   - family key (for the "allow families" filter + material preference)
   stage - earliest survival stage it's realistically obtainable (1..5)
           1 = just spawned (wood/stone, dirt, sand, gravel)
           2 = settled (iron tools, sheep for wool, basic flower dyes)
           3 = established (full dye range, concrete, redstone, mining deep)
           4 = been to the Nether (quartz, nether bricks, blackstone, basalt)
           5 = end-game (the End: purpur, end stone, + everything)
   Stage is a documented best-effort guide, surfaced as such in the UI.
*/
const BLOCKS = [
  // ---- WOOL (16) · family: wool · stage 2 (needs sheep + dye; white from sheep alone) ----
  {name:"White Wool",hex:"#eaeced",fam:"wool",stage:2},
  {name:"Light Gray Wool",hex:"#8e8e87",fam:"wool",stage:2},
  {name:"Gray Wool",hex:"#3f4448",fam:"wool",stage:2},
  {name:"Black Wool",hex:"#15151a",fam:"wool",stage:2},
  {name:"Brown Wool",hex:"#724829",fam:"wool",stage:2},
  {name:"Red Wool",hex:"#a12723",fam:"wool",stage:2},
  {name:"Orange Wool",hex:"#f17614",fam:"wool",stage:2},
  {name:"Yellow Wool",hex:"#f9c628",fam:"wool",stage:2},
  {name:"Lime Wool",hex:"#70b91a",fam:"wool",stage:2},
  {name:"Green Wool",hex:"#556e1c",fam:"wool",stage:2},
  {name:"Cyan Wool",hex:"#158a91",fam:"wool",stage:3},
  {name:"Light Blue Wool",hex:"#3aafd9",fam:"wool",stage:2},
  {name:"Blue Wool",hex:"#35399d",fam:"wool",stage:3},
  {name:"Purple Wool",hex:"#7a2aad",fam:"wool",stage:3},
  {name:"Magenta Wool",hex:"#be45b4",fam:"wool",stage:3},
  {name:"Pink Wool",hex:"#ee8dac",fam:"wool",stage:2},

  // ---- CONCRETE (16) · family: concrete · stage 3 (needs dye + sand + gravel + water) ----
  {name:"White Concrete",hex:"#cfd5d6",fam:"concrete",stage:3},
  {name:"Light Gray Concrete",hex:"#7d7d73",fam:"concrete",stage:3},
  {name:"Gray Concrete",hex:"#373a3e",fam:"concrete",stage:3},
  {name:"Black Concrete",hex:"#080a0f",fam:"concrete",stage:3},
  {name:"Brown Concrete",hex:"#603c20",fam:"concrete",stage:3},
  {name:"Red Concrete",hex:"#8e2121",fam:"concrete",stage:3},
  {name:"Orange Concrete",hex:"#e06101",fam:"concrete",stage:3},
  {name:"Yellow Concrete",hex:"#f1af15",fam:"concrete",stage:3},
  {name:"Lime Concrete",hex:"#5ea919",fam:"concrete",stage:3},
  {name:"Green Concrete",hex:"#495b24",fam:"concrete",stage:3},
  {name:"Cyan Concrete",hex:"#157788",fam:"concrete",stage:3},
  {name:"Light Blue Concrete",hex:"#2489c7",fam:"concrete",stage:3},
  {name:"Blue Concrete",hex:"#2d2f8f",fam:"concrete",stage:3},
  {name:"Purple Concrete",hex:"#64209c",fam:"concrete",stage:3},
  {name:"Magenta Concrete",hex:"#a9309f",fam:"concrete",stage:3},
  {name:"Pink Concrete",hex:"#d6658f",fam:"concrete",stage:3},

  // ---- TERRACOTTA, plain (16 + base) · family: terracotta · stage 3 (dye); base undyed stage 2 ----
  {name:"Terracotta",hex:"#985e44",fam:"terracotta",stage:2},
  {name:"White Terracotta",hex:"#d2b2a1",fam:"terracotta",stage:3},
  {name:"Light Gray Terracotta",hex:"#876b62",fam:"terracotta",stage:3},
  {name:"Gray Terracotta",hex:"#3a2a24",fam:"terracotta",stage:3},
  {name:"Black Terracotta",hex:"#251710",fam:"terracotta",stage:3},
  {name:"Brown Terracotta",hex:"#4d3324",fam:"terracotta",stage:3},
  {name:"Red Terracotta",hex:"#8f3d2f",fam:"terracotta",stage:3},
  {name:"Orange Terracotta",hex:"#a25426",fam:"terracotta",stage:3},
  {name:"Yellow Terracotta",hex:"#ba8523",fam:"terracotta",stage:3},
  {name:"Lime Terracotta",hex:"#687635",fam:"terracotta",stage:3},
  {name:"Green Terracotta",hex:"#4c532a",fam:"terracotta",stage:3},
  {name:"Cyan Terracotta",hex:"#575b5b",fam:"terracotta",stage:3},
  {name:"Light Blue Terracotta",hex:"#716d8a",fam:"terracotta",stage:3},
  {name:"Blue Terracotta",hex:"#4a3c5b",fam:"terracotta",stage:3},
  {name:"Purple Terracotta",hex:"#764656",fam:"terracotta",stage:3},
  {name:"Magenta Terracotta",hex:"#96586d",fam:"terracotta",stage:3},
  {name:"Pink Terracotta",hex:"#a24e4f",fam:"terracotta",stage:3},

  // ---- GLAZED TERRACOTTA (16) · family: glazed · stage 3 (smelt dyed terracotta) ----
  {name:"White Glazed Terracotta",hex:"#bdd4cb",fam:"glazed",stage:3},
  {name:"Light Gray Glazed Terracotta",hex:"#90a6a8",fam:"glazed",stage:3},
  {name:"Gray Glazed Terracotta",hex:"#535a5e",fam:"glazed",stage:3},
  {name:"Black Glazed Terracotta",hex:"#441e20",fam:"glazed",stage:3},
  {name:"Brown Glazed Terracotta",hex:"#786a56",fam:"glazed",stage:3},
  {name:"Red Glazed Terracotta",hex:"#b63c35",fam:"glazed",stage:3},
  {name:"Orange Glazed Terracotta",hex:"#9b935c",fam:"glazed",stage:3},
  {name:"Yellow Glazed Terracotta",hex:"#eac059",fam:"glazed",stage:3},
  {name:"Lime Glazed Terracotta",hex:"#a3c637",fam:"glazed",stage:3},
  {name:"Green Glazed Terracotta",hex:"#758e43",fam:"glazed",stage:3},
  {name:"Cyan Glazed Terracotta",hex:"#34777d",fam:"glazed",stage:3},
  {name:"Light Blue Glazed Terracotta",hex:"#5fa5d1",fam:"glazed",stage:3},
  {name:"Blue Glazed Terracotta",hex:"#2f418b",fam:"glazed",stage:3},
  {name:"Purple Glazed Terracotta",hex:"#6e3098",fam:"glazed",stage:3},
  {name:"Magenta Glazed Terracotta",hex:"#d064c0",fam:"glazed",stage:3},
  {name:"Pink Glazed Terracotta",hex:"#eb9bb6",fam:"glazed",stage:3},

  // ---- WOOD PLANKS (10) · family: wood · stage 1 (overworld); nether woods stage 4 ----
  {name:"Oak Planks",hex:"#a2834f",fam:"wood",stage:1},
  {name:"Birch Planks",hex:"#c0af79",fam:"wood",stage:1},
  {name:"Spruce Planks",hex:"#735531",fam:"wood",stage:1},
  {name:"Dark Oak Planks",hex:"#432b14",fam:"wood",stage:1},
  {name:"Jungle Planks",hex:"#a07351",fam:"wood",stage:1},
  {name:"Acacia Planks",hex:"#a85a32",fam:"wood",stage:1},
  {name:"Mangrove Planks",hex:"#763631",fam:"wood",stage:1},
  {name:"Cherry Planks",hex:"#e3b3ad",fam:"wood",stage:1},
  {name:"Pale Oak Planks",hex:"#e4dad8",fam:"wood",stage:1},

  // ---- STONE & BUILDING (family: stone) · stages per obtainability ----
  {name:"Stone",hex:"#7d7d7d",fam:"stone",stage:1},
  {name:"Cobblestone",hex:"#807f80",fam:"stone",stage:1},
  {name:"Stone Bricks",hex:"#7a797a",fam:"stone",stage:1},
  {name:"Cracked Stone Bricks",hex:"#767676",fam:"stone",stage:1},
  {name:"Chiseled Stone Bricks",hex:"#787778",fam:"stone",stage:1},
  {name:"Andesite",hex:"#88898a",fam:"stone",stage:1},
  {name:"Diorite",hex:"#bdbdbe",fam:"stone",stage:1},
  {name:"Granite",hex:"#9a6b56",fam:"stone",stage:1},
  {name:"Sandstone",hex:"#dbcea1",fam:"stone",stage:1},
  {name:"Cut Sandstone",hex:"#dacea0",fam:"stone",stage:1},
  {name:"Chiseled Sandstone",hex:"#d8cb9b",fam:"stone",stage:1},
  {name:"Red Sandstone",hex:"#bd6620",fam:"stone",stage:1},
  {name:"Bricks",hex:"#96574c",fam:"stone",stage:2},
  {name:"Dripstone Block",hex:"#866c5d",fam:"stone",stage:1},
  {name:"Calcite",hex:"#dad9d4",fam:"stone",stage:3},
  {name:"Tuff",hex:"#6c6e67",fam:"stone",stage:3},
  {name:"Deepslate",hex:"#505053",fam:"stone",stage:3},
  {name:"Cobbled Deepslate",hex:"#4d4d51",fam:"stone",stage:3},
  {name:"Deepslate Bricks",hex:"#474747",fam:"stone",stage:3},
  {name:"Deepslate Tiles",hex:"#373737",fam:"stone",stage:3},
  {name:"Chiseled Deepslate",hex:"#363637",fam:"stone",stage:3},

  // ---- NETHER (family: nether) · stage 4 ----
  {name:"Basalt",hex:"#49494e",fam:"nether",stage:4},
  {name:"Polished Basalt",hex:"#59585c",fam:"nether",stage:4},
  {name:"Blackstone",hex:"#2a2429",fam:"nether",stage:4},
  {name:"Polished Blackstone",hex:"#353139",fam:"nether",stage:4},
  {name:"Polished Blackstone Bricks",hex:"#302b32",fam:"nether",stage:4},
  {name:"Gilded Blackstone",hex:"#382b26",fam:"nether",stage:4},
  {name:"Glowstone",hex:"#ac8354",fam:"nether",stage:4},

  // ---- END (family: end) · stage 5 ----
  {name:"End Stone",hex:"#dcdf9e",fam:"end",stage:5},
  {name:"End Stone Bricks",hex:"#dae0a2",fam:"end",stage:5},
];

/* Families shown in the "allow families" picker, with friendly labels */
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
function hexToRgb(h){
  const n=parseInt(h.slice(1),16);
  return [(n>>16)&255,(n>>8)&255,n&255];
}
// precompute rgb for every block once
BLOCKS.forEach(b=>b.rgb=hexToRgb(b.hex));

// perceptual-ish weighted distance (favours how the eye sees colour)
function dist(r1,g1,b1, r2,g2,b2){
  const rm=(r1+r2)/2;
  const dr=r1-r2, dg=g1-g2, db=b1-b2;
  return Math.sqrt((2+rm/256)*dr*dr + 4*dg*dg + (2+(255-rm)/256)*db*db);
}

/* ---------------- state ---------------- */
const state={
  mode:"flat",            // flat | ref
  game:"creative",        // creative | survival
  stage:5,
  width:64,
  pref:"none",            // none | wool | concrete | terracotta
  allow:new Set(FAMILIES.map(f=>f.key)),
  img:null,
};

/* build the active palette from filters.
   If a material preference is set, the build is restricted to that family
   (plus the always-needed greyscale anchors it already contains), so you
   get a coherent single-material build. "No preference" uses everything
   for the most accurate colour match. */
function activePalette(){
  let pool=BLOCKS.filter(b=>state.allow.has(b.fam));
  if(state.game==="survival") pool=pool.filter(b=>b.stage<=state.stage);
  if(state.pref&&state.pref!=="none"){
    const only=pool.filter(b=>b.fam===state.pref);
    // guard: only restrict if that family is actually allowed/available
    if(only.length) pool=only;
  }
  return pool;
}

/* find nearest blocks to an rgb, returns sorted [{block,d}].
   prefKey no longer biases here (the pool is already restricted when a
   material is chosen); kept as a param for call-site simplicity. */
function nearest(r,g,b,pool){
  const scored=pool.map(bl=>({
    block:bl,
    d:dist(r,g,b, bl.rgb[0],bl.rgb[1],bl.rgb[2])
  }));
  scored.sort((a,b)=>a.d-b.d);
  return scored;
}

/* ============================================================
   UI WIRING
   ============================================================ */
const $=s=>document.querySelector(s);
const fileInput=$("#file"), drop=$("#drop"), afterUpload=$("#afterUpload");

// ---- mode toggle ----
$("#modeToggle").addEventListener("click",e=>{
  const btn=e.target.closest("button"); if(!btn)return;
  state.mode=btn.dataset.mode;
  document.querySelectorAll("#modeToggle button").forEach(b=>b.classList.toggle("on",b===btn));
  $("#modeSub").innerHTML = state.mode==="flat"
    ? '<b style="color:var(--dim)">Flat build:</b> for pixel art, walls, floors, banners, facades, anything one block thick. You get a block-by-block map and <b style="color:var(--dim)">exact</b> counts, because every block is one cell in a flat grid.'
    : '<b style="color:var(--dim)">3D reference:</b> for building something with real depth (a house, a statue) from a photo. A flat photo can\u2019t reveal a 3D structure, so this gives you the <b style="color:var(--dim)">matched block palette</b> to build from, not a fake total. Honest about what an image can and can\u2019t tell you.';
});

// ---- file handling ----
drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("drag");});
drop.addEventListener("dragleave",()=>drop.classList.remove("drag"));
drop.addEventListener("drop",e=>{
  e.preventDefault();drop.classList.remove("drag");
  if(e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change",e=>{ if(e.target.files[0]) loadImage(e.target.files[0]); });

function loadImage(f){
  if(!f.type.startsWith("image/"))return;
  const r=new FileReader();
  r.onload=ev=>{
    const im=new Image();
    im.onload=()=>{ state.img=im; afterUpload.classList.remove("hidden"); updateEstDims();
      drop.querySelector(".big").textContent="✓ "+f.name+"  tap to change"; };
    im.src=ev.target.result;
  };
  r.readAsDataURL(f);
}

// ---- width slider ----
const widthRange=$("#widthRange");
widthRange.addEventListener("input",()=>{ state.width=+widthRange.value; $("#wLabel").textContent=state.width; updateEstDims(); });
function updateEstDims(){
  if(!state.img)return;
  const h=Math.max(1,Math.round(state.width*state.img.height/state.img.width));
  $("#estDims").textContent=`build will be ${state.width} \u00d7 ${h} blocks (${(state.width*h).toLocaleString()} total cells)`;
}

// ---- game seg ----
$("#gameSeg").addEventListener("click",e=>{
  const btn=e.target.closest("button"); if(!btn)return;
  state.game=btn.dataset.game;
  document.querySelectorAll("#gameSeg button").forEach(b=>b.classList.toggle("on",b===btn));
  $("#stageWrap").classList.toggle("hidden",state.game!=="survival");
});
$("#stageSel").addEventListener("change",e=>state.stage=+e.target.value);

// ---- palette family picker ----
const palettePick=$("#palettePick");
FAMILIES.forEach(f=>{
  const b=document.createElement("button");
  b.textContent=f.label; b.dataset.fam=f.key; b.classList.add("on");
  b.addEventListener("click",()=>{
    if(state.allow.has(f.key)){
      if(state.allow.size>1){ state.allow.delete(f.key); b.classList.remove("on"); }
    } else { state.allow.add(f.key); b.classList.add("on"); }
  });
  palettePick.appendChild(b);
});

// ---- material preference ----
$("#prefSeg").addEventListener("click",e=>{
  const btn=e.target.closest("button"); if(!btn)return;
  state.pref=btn.dataset.pref;
  document.querySelectorAll("#prefSeg button").forEach(b=>b.classList.toggle("on",b===btn));
});

// ---- GO ----
$("#goBtn").addEventListener("click",build);

let lastResult=null;
function build(){
  if(!state.img)return;
  const pool=activePalette();
  if(!pool.length){ alert("No blocks available with those filters. Allow more families or a later stage."); return; }

  const W=state.width;
  const H=Math.max(1,Math.round(W*state.img.height/state.img.width));

  // downscale the image into a WxH grid by averaging, via an offscreen canvas
  const off=document.createElement("canvas"); off.width=W; off.height=H;
  const octx=off.getContext("2d");
  octx.imageSmoothingEnabled=true;
  octx.drawImage(state.img,0,0,W,H);
  const data=octx.getImageData(0,0,W,H).data;

  // match each cell
  const counts=new Map();           // block.name -> {block,count}
  const cellBlock=new Array(W*H);    // store best block per cell
  const cellAlts=new Array(W*H);     // store top alternatives per cell (for click)
  const cache=new Map();             // rgb key -> sorted matches (speed)

  for(let i=0;i<W*H;i++){
    const a=data[i*4+3];
    // treat fully transparent as empty (skipped in flat builds)
    if(a<24){ cellBlock[i]=null; continue; }
    const r=data[i*4],g=data[i*4+1],b=data[i*4+2];
    const key=(r>>2)+","+(g>>2)+","+(b>>2);
    let sorted=cache.get(key);
    if(!sorted){ sorted=nearest(r,g,b,pool); cache.set(key,sorted); }
    const best=sorted[0].block;
    cellBlock[i]=best;
    cellAlts[i]=sorted.slice(0,4);
    const c=counts.get(best.name)||{block:best,count:0}; c.count++; counts.set(best.name,c);
  }

  // render the map
  const cv=$("#mapCanvas");
  const px=Math.max(2,Math.floor(640/W)); // on-screen px per block
  cv.width=W*px; cv.height=H*px;
  const ctx=cv.getContext("2d");
  ctx.clearRect(0,0,cv.width,cv.height);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const bl=cellBlock[y*W+x];
    if(!bl)continue;
    ctx.fillStyle=bl.hex;
    ctx.fillRect(x*px,y*px,px,px);
  }

  lastResult={counts,W,H,cellBlock,cellAlts,px};
  renderOutput();
}

function renderOutput(){
  const {counts,W,H}=lastResult;
  const out=$("#out"); out.classList.add("show");

  const isFlat=state.mode==="flat";
  $("#refBanner").classList.toggle("show",!isFlat);
  $("#canvasTitle").textContent=isFlat?"Block map":"Colour reference";
  $("#canvasCap").textContent=isFlat
    ? "Each cell is one block, viewed face-on. This is exactly what to place."
    : "Each cell shows the closest-matching block colour. Use it to read the palette, not as a literal build.";
  $("#listCap").textContent=isFlat
    ? "Tap any block to see close alternatives you could swap in. Counts are exact for a flat, one-block-thick build."
    : "The blocks that best match the colours in your image. Tap any to see alternatives.";

  // sorted list, most-used first
  const rows=[...counts.values()].sort((a,b)=>b.count-a.count);
  const totalCells=rows.reduce((s,r)=>s+r.count,0);

  // totals box
  const tot=$("#totals");
  if(isFlat){
    tot.innerHTML=`<div>total blocks: <b>${totalCells.toLocaleString()}</b></div>
      <div>distinct types: <b>${rows.length}</b></div>
      <div>grid: <b>${W} \u00d7 ${H}</b></div>
      <div>full stacks (\u00d764): <b>${Math.floor(totalCells/64).toLocaleString()}</b> + ${totalCells%64}</div>`;
  } else {
    tot.innerHTML=`<div>palette size: <b>${rows.length}</b> blocks</div>
      <div style="color:var(--dimmer)">counts hidden in reference mode \u2014 see note below</div>`;
  }

  // list
  const list=$("#blockList"); list.innerHTML="";
  rows.forEach((r,idx)=>{
    const row=document.createElement("div");
    row.className="blockrow";
    const pct=((r.count/totalCells)*100).toFixed(1);
    row.innerHTML=`<div class="swatch" style="background:${r.block.hex}"></div>
      <div class="bname">${r.block.name}</div>
      <div class="bcount">${isFlat?("\u00d7"+r.count.toLocaleString()):""}<span class="bpct">${isFlat?pct+"%":""}</span></div>`;
    const alts=document.createElement("div");
    alts.className="alts";
    // find a representative cell using this block to show its alternatives
    const rep=lastResult.cellAlts.find(a=>a&&a[0]&&a[0].block.name===r.block.name);
    if(rep){
      let inner='<div class="hint">closest alternatives for this colour:</div>';
      rep.slice(1).forEach(a=>{
        inner+=`<div class="altrow"><span class="sw2" style="background:${a.block.hex}"></span>${a.block.name}</div>`;
      });
      alts.innerHTML=inner;
    }
    row.addEventListener("click",()=>alts.classList.toggle("show"));
    list.appendChild(row); list.appendChild(alts);
  });

  // honest note
  $("#honestNote").innerHTML=isFlat
    ? `<b>Why these counts are exact:</b> a flat build is one block thick, so every cell in the grid is exactly one block. Count the cells, you get the blocks. Place them facing you, matching the map above. If your image had transparent areas, those cells are left empty (not counted). Colours are matched to verified block texture values, so what you see is close to what you'll get in-game (lighting and shaders will shift it a little).`
    : `<b>Why there's no total here:</b> your image shows one or two faces of a 3D object. The depth, the back, the inside, the roof, none of that is in a single photo, so any "total blocks" number would be invented. What's real and useful is the <b>palette</b> above: these are the blocks whose colours genuinely match your reference. Build the structure yourself in-game (you're the only one who can see all sides), and pull from this block list. Want exact numbers? Switch to <b>Flat build</b> and it'll count a single face precisely.`;

  out.scrollIntoView({behavior:"smooth",block:"start"});
}

// ---- copy list ----
$("#copyBtn").addEventListener("click",()=>{
  if(!lastResult)return;
  const isFlat=state.mode==="flat";
  const rows=[...lastResult.counts.values()].sort((a,b)=>b.count-a.count);
  let txt=isFlat?`Minecraft build · ${lastResult.W}\u00d7${lastResult.H} blocks\n\n`:`Minecraft block palette (reference)\n\n`;
  rows.forEach(r=>{ txt+= isFlat ? `${r.count}\u00d7 ${r.block.name}\n` : `${r.block.name}\n`; });
  if(isFlat){
    const total=rows.reduce((s,r)=>s+r.count,0);
    txt+=`\nTotal: ${total} blocks (${Math.floor(total/64)} stacks + ${total%64})`;
  }
  txt+=`\n\nvia vishkul.com/tools`;
  navigator.clipboard.writeText(txt).then(()=>{
    const b=$("#copyBtn"); const o=b.textContent; b.textContent="✓ copied"; setTimeout(()=>b.textContent=o,1400);
  });
});
