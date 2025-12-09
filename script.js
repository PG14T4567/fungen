/* ========= Data for generators ========= */
const generators = {
  nickname: {
    title: "Nickname Generator",
    inputs: [{ id: "name", placeholder: "Enter your name (optional)", type:"text" }],
    fn: (vals) => {
      const base = (vals.name || "").trim() || ["Neo","Lil","Big","Lil","X","Sky"][rand(0,5)];
      const suf = ["_Pro","_God","XD","_King","Prime","_Beast","Nova","Bolt"];
      return `${base}${suf[rand(0,suf.length-1)]}`;
    }
  },

  roast: {
    title: "Roast Generator (fun & harmless)",
    inputs: [{ id:"target", placeholder:"Enter a name (optional)", type:"text" }],
    fn: (vals) => {
      const t = (vals.target||"").trim();
      const picks = [
        "You make normal look chaotic.",
        "If laziness was an Olympic sport you'd come second — you wouldn't even show up for gold.",
        "You're proof that even amazing things take practice... maybe not you though.",
        "I’d say you’re one-of-a-kind, but that’s not true — I’ve seen that look before."
      ];
      return t ? `${t}, ${picks[rand(0,picks.length-1)]}` : picks[rand(0,picks.length-1)];
    }
  },

  pickup: {
    title: "Pickup Line Generator",
    inputs: [{ id:"tone", placeholder:"", type:"select", options:["Cute","Sassy","Cheeky"] }],
    fn: (vals) => {
      const tone = vals.tone || "Cute";
      const map = {
        Cute: [
          "Are you a charger? Because without you I die.",
          "Do you have a map? I keep getting lost in your eyes."
        ],
        Sassy: [
          "You must be tired — you’ve been running through my mind all day.",
          "You look like something I’d steal... and keep forever."
        ],
        Cheeky: [
          "Are you Wi-Fi? Because I’m feeling a connection.",
          "If you were a vegetable you’d be a cute-cumber."
        ]
      };
      const arr = map[tone] || map["Cute"];
      return arr[rand(0, arr.length-1)];
    }
  },

  username: {
    title: "Username Generator",
    inputs: [{ id:"keyword", placeholder:"Keyword (optional)", type:"text" }],
    fn: (vals) => {
      const kw = (vals.keyword||"").replace(/\s+/g,"");
      const num = Math.floor(10 + Math.random()*8999);
      return kw ? `${kw}${num}` : `User${num}`;
    }
  },

  fake: {
    title: "Fake Message Generator (fun)",
    inputs: [
      { id:"to", placeholder:"Recipient name", type:"text" },
      { id:"from", placeholder:"Sender name", type:"text" }
    ],
    fn: (vals) => {
      const to = vals.to || "Friend";
      const from = vals.from || "Someone";
      const msgs = ["Hey, I'm outside.", "Call me now!", "Can't wait to see you!", "Running late — bring snacks!"];
      return `Hey ${to}, ${msgs[rand(0,msgs.length-1)]} — ${from}`;
    }
  },

  age: {
    title: "Age Calculator",
    inputs: [{ id:"year", placeholder:"Birth year (e.g. 2008)", type:"number" }],
    fn: (vals) => {
      const y = parseInt(vals.year,10);
      const now = new Date();
      const thisYear = now.getFullYear();
      if (!y || y < 1900 || y > thisYear) return "Enter a valid year";
      return `Age: ${thisYear - y} years`;
    }
  },

  meme: {
    title: "Meme Caption Generator",
    inputs: [{ id:"scene", placeholder:"Short scene (optional)", type:"text"}],
    fn: (vals) => {
      const s = vals.scene || "";
      const caps = [
        "POV: You tried your best... it was still hilarious.",
        "When your phone autocorrects 'lol' to 'LOL'.",
        "That face you make when Wi-Fi drops during the final scene."
      ];
      return s ? `${s} — ${caps[rand(0,caps.length-1)]}` : caps[rand(0,caps.length-1)];
    }
  },

  excuse: {
    title: "Funny Excuse Generator",
    inputs: [{ id:"context", placeholder:"Where were you? (optional)", type:"text" }],
    fn: (vals) => {
      const exc = [
        "My goldfish needed therapy.",
        "I couldn’t come because my homework was emotional.",
        "My phone was charging in another dimension.",
        "I was busy being excellent at nothing."
      ];
      return exc[rand(0, exc.length-1)];
    }
  },

  compliment: {
    title: "Compliment Generator",
    inputs: [{ id:"style", placeholder:"", type:"select", options:["Cute","Sweet","Sassy"] }],
    fn: (vals) => {
      const style = vals.style || "Cute";
      const map = {
        Cute:["Your smile could solve climate change.","You’re like sunshine but better."],
        Sweet:["You make people feel at home.","You're a wonderful human."],
        Sassy:["Slaying as usual.","Unapologetically iconic."]
      };
      const arr = map[style]||map["Cute"];
      return arr[rand(0,arr.length-1)];
    }
  }
};

/* ========= Utility helpers ========= */
function rand(a,b){ return Math.floor(a + Math.random()*(b - a + 1)); }

function el(q){ return document.querySelector(q); }
function elAll(q){ return document.querySelectorAll(q); }

/* ========= Panel & UI handling ========= */
const panel = el("#panel");
const panelTitle = el("#panelTitle");
const panelBody = el("#panelBody");
const resultText = el("#resultText");
const copyBtn = el("#copyBtn");
const againBtn = el("#againBtn");
const shareBtn = el("#shareBtn");
const darkToggle = el("#darkToggle");
const cards = elAll(".card");
let activeGenKey = null;

/* attach card clicks */
cards.forEach(card => {
  card.addEventListener("click", () => {
    const gen = card.dataset.gen;
    openGenerator(gen);
  });
});

/* open generator */
function openGenerator(key){
  const g = generators[key];
  activeGenKey = key;
  panelTitle.textContent = g.title;
  panelBody.innerHTML = "";
  // create inputs
  (g.inputs || []).forEach(inp => {
    if (inp.type === "select"){
      const s = document.createElement("select");
      s.className = "input";
      s.id = inp.id;
      (inp.options || []).forEach(opt => {
        const o = document.createElement("option");
        o.value = opt; o.textContent = opt;
        s.appendChild(o);
      });
      panelBody.appendChild(s);
    } else {
      const i = document.createElement("input");
      i.className = "input";
      i.id = inp.id;
      i.type = inp.type || "text";
      i.placeholder = inp.placeholder || "";
      panelBody.appendChild(i);
    }
  });
  // show panel & generate first result
  panel.classList.remove("hidden");
  generateCurrent(true);
  // autoplay a small bounce + fireworks
  triggerBounce();
}

/* gather input values */
function gatherInputs(g){
  const vals = {};
  (g.inputs || []).forEach(inp => {
    const node = document.getElementById(inp.id);
    if (!node) return;
    vals[inp.id] = node.value;
  });
  return vals;
}

/* generate for current generator */
function generateCurrent(initial=false){
  if (!activeGenKey) return;
  const g = generators[activeGenKey];
  const vals = gatherInputs(g);
  const out = g.fn(vals);
  resultText.textContent = out;
  // small visual effect: fireworks for certain actions (not for every click on age)
  const fireworksGenerators = ["nickname","pickup","meme","username","compliment","roast","fake"];
  if (fireworksGenerators.includes(activeGenKey)) launchFireworks();
}

/* copy to clipboard */
copyBtn.addEventListener("click", () => {
  const text = resultText.textContent || "";
  if (!text) { alert("Nothing to copy yet"); return; }
  navigator.clipboard.writeText(text).then(() => {
    flashCopied();
  }, () => {
    alert("Copy failed — select and copy manually.");
  });
});

/* generate again */
againBtn.addEventListener("click", () => generateCurrent());

/* share button */
shareBtn.addEventListener("click", async () => {
  const url = window.location.href;
  const shareData = { title: "FunGen — Try this!", text: resultText.textContent || "Check FunGen", url };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch(e){ /* ignore */ }
  } else {
    // fallback: copy link
    navigator.clipboard.writeText(url);
    alert("Link copied — share it with friends!");
  }
});

/* flash copied animation */
function flashCopied(){
  const old = resultText.style.background;
  resultText.style.transition = "background .25s";
  resultText.style.background = "linear-gradient(90deg,#e6ffe8,#eafff2)";
  setTimeout(()=> resultText.style.background = old || "transparent", 700);
}

/* dark mode toggle */
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkToggle.textContent = document.body.classList.contains("dark") ? "Light" : "Dark";
});

/* small bounce effect on panel when opened */
function triggerBounce(){
  panel.classList.add("pop");
  setTimeout(()=> panel.classList.remove("pop"), 420);
}

/* launch small bouncing animation on title */
(function initBounce(){
  const logo = document.querySelector(".logo");
  if(!logo) return;
  // already animated by CSS
})();

/* initialize: open default generator */
document.addEventListener("DOMContentLoaded", () => {
  // open nickname by default
  openGenerator("nickname");
});

/* ========= Fireworks implementation ========= */
const canvas = document.getElementById("fxCanvas");
const ctx = canvas.getContext("2d");
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;
window.addEventListener("resize", () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

const particles = [];
function launchFireworks(){
  // create several bursts
  for (let i=0;i<18;i++){
    const cx = Math.random()*W;
    const cy = Math.random()*(H*0.45);
    createBurst(cx, cy, rand(20,60));
  }
  // animate for a short time
  if (!animating) animate();
}

function createBurst(x,y,count){
  const hue = Math.floor(Math.random()*360);
  for (let i=0;i<count;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = Math.random()*3 + 1;
    particles.push({
      x,y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      life: 80 + Math.random()*40,
      age:0,
      color: `hsl(${hue} ${50 + Math.random()*50}% ${50 + Math.random()*20}%)`,
      size: 1 + Math.random()*2
    });
  }
}

let animating = false;
function animate(){
  animating = true;
  requestAnimationFrame(frame);
}

function frame(){
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation = 'lighter';

  for (let i = particles.length-1; i>=0; i--){
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02; // gravity
    p.age++;
    const lifeRatio = 1 - p.age / p.life;
    if (lifeRatio <= 0){ particles.splice(i,1); continue; }

    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0.05, lifeRatio);
    ctx.arc(p.x, p.y, p.size*lifeRatio*2, 0, Math.PI*2);
    ctx.fill();
  }

  if (particles.length > 0) requestAnimationFrame(frame);
  else animating = false;
}

/* ===== small helpers to generate initial default generators and values ===== */
// Nothing else needed

/* End of script.js */
