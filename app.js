(() => {
"use strict";
const $ = s => document.querySelector(s);
const KEY = "busybee-v1";
const defaults = [
{id:"genetics",name:"Genetics",color:"#FF4F87"},
{id:"biochem",name:"Biochemistry",color:"#FFD400"},
{id:"micro",name:"Microbiology",color:"#35C759"},
{id:"python",name:"Python",color:"#00C2FF"},
{id:"cpp",name:"C++",color:"#9B5DE5"},
{id:"data",name:"Data Analysis",color:"#FF7A00"},
{id:"english",name:"English / PEL",color:"#F15BB5"},
{id:"other",name:"Other",color:"#8D99AE"}
];
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function date(s){const a=s.split("-").map(Number);return new Date(a[0],a[1]-1,a[2],12)}
function today(){return iso(new Date())}
function pretty(s,opts){return date(s).toLocaleDateString("en-IN",opts||{weekday:"short",month:"short",day:"numeric"})}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&Array.isArray(x.subjects)&&Array.isArray(x.deadlines)){const migration={"#e8a7a6":"#FF4F87","#f5cc55":"#FFD400","#b6c99a":"#35C759","#9ec5cf":"#00C2FF","#bcb1d9":"#9B5DE5","#e6b58a":"#FF7A00","#d7b8c9":"#F15BB5","#c6c1b1":"#8D99AE"};x.subjects.forEach(s=>{const c=String(s.color||"").toLowerCase();if(migration[c])s.color=migration[c]});return x}}catch(e){}return {subjects:defaults.map(x=>({...x})),deadlines:[]}}
let state=load(), view=date(today()), selected=today(), editing=null, toastTimer;
const THEME_KEY="busybee-theme-v1";
function applyTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem(THEME_KEY,theme);const b=$("#themeToggle");if(b){b.innerHTML=(theme==="dark"?"☼":"◐") + " <span>"+(theme==="dark"?"LIGHT":"DARK")+"</span>";b.setAttribute("aria-label","Switch to "+(theme==="dark"?"light":"dark")+" mode");b.title="Switch to "+(theme==="dark"?"light":"dark")+" mode"}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){toast("Couldn't save. Download a backup and free some browser storage.")}}
function subj(id){return state.subjects.find(s=>s.id===id)||state.subjects.find(s=>s.id==="other")||{id:"other",name:"Other",color:"#c6c1b1"}}
function away(s){return Math.round((date(s)-date(today()))/86400000)}
function rank(u){return ({critical:0,important:1,normal:2})[u]??2}
function urgency(u){return ({critical:"HIGH STAKES",important:"NEEDS ATTENTION",normal:"COMING UP"})[u]||"COMING UP"}
function sorted(a){return a.slice().sort((x,y)=>x.date.localeCompare(y.date)||rank(x.urgency)-rank(y.urgency)||x.title.localeCompare(y.title))}
function renderLegend(){}
function renderCalendar(){
const y=view.getFullYear(),m=view.getMonth();$("#monthTitle").textContent=view.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
const monthPalettes=[["#B612D0","#F8B8FF","#6B1AA8","#FFFFFF"],["#4AC912","#D9FF8F","#167D2B","#171717"],["#CA2E30","#FFB4A8","#7E101A","#FFFFFF"],["#2364ED","#7AD8FF","#172C91","#FFFFFF"],["#FFE724","#FF9F1C","#FFF5A5","#171717"],["#FE3CB3","#FFB5D9","#9C175D","#171717"],["#4F0303","#880C12","#D64343","#FFF4D6"],["#880C12","#BA4545","#F4A6A6","#FFF4D6"],["#BA4545","#F0DFA3","#7C1D24","#FFFFFF"],["#F0DFA3","#C8970E","#FFE9A8","#38230D"],["#C8970E","#4AC912","#4F0303","#171717"],["#D64343","#FE3CB3","#F0DFA3","#FFFFFF"]];
const monthTone=monthPalettes[m];const panel=$(".calendar-panel");panel.style.setProperty("--month-color",monthTone[0]);panel.style.setProperty("--month-accent",monthTone[1]);panel.style.setProperty("--month-deep",monthTone[2]);panel.style.setProperty("--month-ink",monthTone[3]);panel.dataset.month=String(m);
const first=new Date(y,m,1,12),offset=(first.getDay()+6)%7,start=new Date(y,m,1-offset,12),grid=$("#calendarGrid");grid.innerHTML="";
for(let i=0;i<42;i++){
const d=new Date(start);d.setDate(start.getDate()+i);const key=iso(d),inMonth=d.getMonth()===m,items=sorted(state.deadlines.filter(x=>x.date===key));
const b=document.createElement("button");b.type="button";const colors=[...new Set(items.map(x=>x.color||subj(x.subject).color))].slice(0,3);b.className="day-cell"+(!inMonth?" outside":"")+(key===today()?" today":"")+(key===selected?" selected":"")+(items.length?" has-deadlines":"")+(items.some(x=>away(x.date)<0)?" overdue-cell":"")+(items.some(x=>x.date===today())?" due-today-cell":"");
b.setAttribute("aria-label",pretty(key,{weekday:"long",month:"long",day:"numeric"})+(items.length?", "+items.length+" deadlines":""));
if(colors[0])b.style.setProperty("--subject-a",colors[0]);if(colors[1])b.style.setProperty("--subject-b",colors[1]);if(colors[2])b.style.setProperty("--subject-c",colors[2]);if(colors.length===1)b.style.setProperty("--subject-color",colors[0]);
const n=document.createElement("span");n.className="day-number"+(key===today()?" today-number":"");n.textContent=d.getDate();b.appendChild(n);
if(items.length){
const stack=document.createElement("span");stack.className="task-colour-stack";stack.setAttribute("aria-hidden","true");colors.forEach((color,index)=>{const chip=document.createElement("i");chip.style.setProperty("--chip-color",color);chip.style.setProperty("--chip-index",String(index));stack.appendChild(chip)});b.appendChild(stack);
const count=document.createElement("span");count.className="deadline-count";count.textContent=items.length===1?"1 TASK":items.length+" TASKS";b.appendChild(count);
const status=items.some(x=>away(x.date)<0)?"overdue":items.some(x=>away(x.date)<=3)?"soon":"";
if(status){const flag=document.createElement("i");flag.className="urgency-flag"+(status==="soon"?" soon":"");flag.title=status==="soon"?"Due within 3 days":"Overdue";b.appendChild(flag)}
}else if(inMonth){const mark=document.createElement("span");mark.className="empty-mark";mark.textContent="✿";b.appendChild(mark)}
b.dataset.date=key;b.addEventListener("click",()=>{selected=key;renderAll()});grid.appendChild(b)
}
renderLegend()
}
function renderDay(){
$("#selectedHeading").textContent=pretty(selected,{weekday:"short",month:"short",day:"numeric"});
$("#selectedHint").textContent=selected===today()?"Today's deadlines, all in one place.":away(selected)<0?"Past date. Check what slipped, without judgement.":away(selected)===1?"Tomorrow's deadlines.":pretty(selected,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const holder=$("#dayDeadlines"),items=sorted(state.deadlines.filter(x=>x.date===selected));holder.innerHTML="";
if(!items.length){holder.innerHTML='<div class="empty-day">Nothing pinned here yet.<br>Add a deadline when you are ready.</div>';return}
items.forEach(x=>{const s=subj(x.subject),card=document.createElement("article");card.className="deadline-card";card.style.setProperty("--card-color",x.color||s.color);
card.innerHTML='<div class="deadline-card-top"><h3>'+esc(x.title)+'</h3><button class="edit-deadline" type="button" aria-label="Edit deadline" title="Edit deadline">✎</button></div><div class="deadline-meta"><span>'+esc(s.name)+'</span><span class="urgency-label '+esc(x.urgency)+'">'+urgency(x.urgency)+'</span></div>'+(x.notes?'<p class="deadline-notes">'+esc(x.notes)+'</p>':"");
card.querySelector("button").addEventListener("click",()=>openDeadline(x.id));holder.appendChild(card)})
}
function renderUpNext(){
const items=sorted(state.deadlines.filter(x=>x.date>=today())).slice(0,5);$("#upNextCount").textContent=items.length+" ITEM"+(items.length===1?"":"S");const holder=$("#upNextList");holder.innerHTML="";
if(!items.length){holder.innerHTML='<div class="up-next-empty">A little breathing room. Add your next deadline when it comes up.</div>';return}
items.forEach(x=>{const s=subj(x.subject),d=date(x.date),b=document.createElement("button");b.type="button";b.className="up-next-item";b.style.background="transparent";b.style.textAlign="left";b.style.width="100%";b.style.cursor="pointer";b.style.color="inherit";
let label=x.date===today()?"DUE TODAY":away(x.date)===1?"DUE TOMORROW":"IN "+away(x.date)+" DAYS";
b.innerHTML='<span class="up-next-date" style="--item-color:'+esc(x.color||s.color)+'"><b>'+d.getDate()+'</b>'+d.toLocaleDateString("en-IN",{month:"short"}).toUpperCase()+'</span><span class="up-next-info"><strong>'+esc(x.title)+'</strong><small>'+esc(s.name)+' · '+label+'</small></span>';
b.addEventListener("click",()=>{selected=x.date;view=date(x.date);renderAll()});holder.appendChild(b)})
}
function renderOptions(value){$("#deadlineSubject").innerHTML=state.subjects.map(s=>'<option value="'+esc(s.id)+'"'+(s.id===value?" selected":"")+'>'+esc(s.name)+'</option>').join("")}
function renderAll(){renderCalendar();renderDay();renderUpNext();renderQuickPreview()}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2800)}
function openDeadline(id){
editing=id;const x=id?state.deadlines.find(d=>d.id===id):null;$("#deadlineForm").reset();$("#formTitle").innerHTML=(x?"Edit deadline":"Add a deadline")+'<span class="dot">.</span>';$("#formEyebrow").textContent=x?"MAKE A CHANGE":"PIN IT DOWN";
$("#deadlineTitle").value=x?x.title:"";$("#deadlineDate").value=x?x.date:selected;renderOptions(x?x.subject:(state.subjects[0]||{}).id);$("#deadlineUrgency").value=x?(x.urgency||"normal"):"normal";$("#deadlineNotes").value=x?(x.notes||""):"";$("#deleteDeadline").hidden=!x;$("#deadlineDialog").showModal();setTimeout(()=>$("#deadlineTitle").focus(),40)
}
$("#prevMonth").addEventListener("click",()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1,12);renderCalendar()});
$("#nextMonth").addEventListener("click",()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1,12);renderCalendar()});
$("#todayBtn").addEventListener("click",()=>{selected=today();view=date(selected);renderAll()});
$("#addDeadlineBtn").addEventListener("click",()=>openDeadline());
$("#closeDeadline").addEventListener("click",()=>$("#deadlineDialog").close());
$("#deadlineForm").addEventListener("submit",e=>{
e.preventDefault();const data={title:$("#deadlineTitle").value.trim(),date:$("#deadlineDate").value,subject:$("#deadlineSubject").value,urgency:$("#deadlineUrgency").value,notes:$("#deadlineNotes").value.trim()};
if(!data.title||!data.date||!data.subject){toast("Add a title, date, and subject first.");return}
if(editing){const i=state.deadlines.findIndex(x=>x.id===editing);if(i>=0)state.deadlines[i]={...state.deadlines[i],...data}}else state.deadlines.push({id:uid(),...data,createdAt:new Date().toISOString()});
selected=data.date;view=date(data.date);save();$("#deadlineDialog").close();renderAll();toast(editing?"Deadline updated.":"Deadline pinned to your calendar.")
});
$("#deleteDeadline").addEventListener("click",()=>{if(!editing)return;const x=state.deadlines.find(d=>d.id===editing);if(!confirm('Delete "'+(x?x.title:"this deadline")+'"?'))return;state.deadlines=state.deadlines.filter(d=>d.id!==editing);save();$("#deadlineDialog").close();renderAll();toast("Deadline deleted.")});
$("#manageSubjects").addEventListener("click",()=>{$("#subjectsDialog").showModal();renderSubjectEditor()});
$("#closeSubjects").addEventListener("click",()=>$("#subjectsDialog").close());
$("#doneSubjects").addEventListener("click",()=>{$("#subjectsDialog").close();renderAll()});
function renderSubjectEditor(){
const holder=$("#subjectEditor");holder.innerHTML="";
const swatches=["#FF4F87","#FFD400","#35C759","#00C2FF","#9B5DE5","#FF7A00","#F15BB5","#8D99AE","#FF3B30","#00A896","#FFFFFF","#24251F"];
state.subjects.forEach(s=>{
const row=document.createElement("div");row.className="subject-row";
row.innerHTML='<label class="subject-name-label">COURSE NAME<input class="subject-name-input" type="text" maxlength="36" value="'+esc(s.name)+'" aria-label="Course name"></label><label class="subject-colour-label"><span>COLOUR</span><input class="subject-hexagon" type="color" value="'+esc(s.color)+'" aria-label="Choose colour for '+esc(s.name)+'"></label><button type="button" class="remove-subject" aria-label="Delete '+esc(s.name)+'" title="Delete subject">×</button><div class="swatch-row" aria-label="More colour choices">'+swatches.map(c=>'<button type="button" class="preset-swatch" data-colour="'+c+'" style="--swatch:'+c+'" aria-label="Use '+c+'"></button>').join("")+'</div>';
const hex=row.querySelector(".subject-hexagon");
hex.addEventListener("input",()=>{s.color=hex.value.toLowerCase();save();renderAll()});
row.querySelector(".subject-name-input").addEventListener("change",e=>{const name=e.target.value.trim();if(!name||state.subjects.some(a=>a.id!==s.id&&a.name.toLowerCase()===name.toLowerCase())){e.target.value=s.name;toast("Choose a unique course name.");return}s.name=name;save();renderSubjectEditor();renderAll();renderOptions($("#deadlineSubject").value)});
row.querySelectorAll(".preset-swatch").forEach(btn=>btn.addEventListener("click",()=>{s.color=btn.dataset.colour;hex.value=s.color;save();renderAll()}));
row.querySelector(".remove-subject").addEventListener("click",()=>{if(state.subjects.length<=1){toast("Keep at least one subject colour.");return}if(!confirm("Remove "+s.name+"? Existing deadlines will move to Other if available."))return;let other=state.subjects.find(a=>a.id==="other"&&a.id!==s.id);if(!other){other={id:"other",name:"Other",color:"#c6c1b1"};state.subjects.push(other)}state.deadlines.forEach(d=>{if(d.subject===s.id)d.subject=other.id});state.subjects=state.subjects.filter(a=>a.id!==s.id);save();renderAll();renderSubjectEditor();renderOptions($("#deadlineSubject").value)});
holder.appendChild(row)
})
}
$("#addSubjectForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#newSubjectName").value.trim();if(!name)return;if(state.subjects.some(s=>s.name.toLowerCase()===name.toLowerCase())){toast("That subject already has a colour.");return}const palette=["#FF4F87","#FFD400","#35C759","#00C2FF","#9B5DE5","#FF7A00","#F15BB5","#8D99AE","#FF3B30"],used=state.subjects.map(s=>s.color.toLowerCase()),color=palette.find(c=>!used.includes(c))||palette[state.subjects.length%palette.length];state.subjects.push({id:uid(),name,color});save();$("#newSubjectName").value="";renderSubjectEditor();renderOptions();renderAll();toast("Subject colour added.")});
$("#themeToggle").addEventListener("click",()=>applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
$("#calendarGrid").addEventListener("keydown",e=>{const cell=e.target.closest(".day-cell");if(!cell)return;let step=0;if(e.key==="ArrowLeft")step=-1;else if(e.key==="ArrowRight")step=1;else if(e.key==="ArrowUp")step=-7;else if(e.key==="ArrowDown")step=7;else return;e.preventDefault();const next=date(cell.dataset.date);next.setDate(next.getDate()+step);selected=iso(next);view=date(selected);renderAll();const target=[...$("#calendarGrid").querySelectorAll(".day-cell")].find(el=>el.dataset.date===selected);if(target)target.focus()});
$("#exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({app:"BusyBee",version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="busybee-backup-"+today()+".json";a.click();URL.revokeObjectURL(url);toast("Backup downloaded.")});
$("#importBtn").addEventListener("click",()=>$("#importFile").click());
$("#importFile").addEventListener("change",async e=>{
const file=e.target.files&&e.target.files[0];if(!file)return;
try{const data=JSON.parse(await file.text());const validDate=s=>typeof s==="string"&&s.length===10&&s.charAt(4)==="-"&&s.charAt(7)==="-";
if(!Array.isArray(data.subjects)||!Array.isArray(data.deadlines)||!data.subjects.every(s=>s.id&&s.name&&/^#[0-9a-f]{6}$/i.test(s.color))||!data.deadlines.every(d=>d.id&&typeof d.title==="string"&&validDate(d.date)&&d.subject))throw new Error("invalid");
if(!confirm("Replace current BusyBee data with "+data.deadlines.length+" imported deadline(s)? Export a backup first if you want to keep the current data."))return;
state={subjects:data.subjects,deadlines:data.deadlines.map(d=>({...d,urgency:["normal","important","critical"].includes(d.urgency)?d.urgency:"normal",notes:d.notes||""}))};save();selected=today();view=date(selected);renderAll();toast("Backup restored.")
}catch(err){toast("That backup file doesn't look valid.")}finally{e.target.value=""}
});
renderAll();
})();