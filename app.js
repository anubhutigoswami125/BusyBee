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
const monthPalettes=[["#8ED1FC","#EC008C","#1B365D","#FF6F61"],["#FF4D88","#C80036","#00C2D1","#FFD700"],["#7CB342","#59C3C3","#E5A93C","#FF85A1"],["#FFE600","#D8B4F8","#98FF98","#FFB7B2"],["#00875A","#D81B60","#FFF176","#1B4D3E"],["#00A896","#FF6B35","#FF8811","#FFD166"],["#0055A5","#FF1D25","#FFEB3B","#E040FB"],["#FF9E7D","#FFC107","#00B4D8","#8AC926"],["#D4AF37","#005B60","#C85A17","#8E1600"],["#FF6700","#4A154B","#121212","#00F5D4"],["#800020","#E09F3E","#556B2F","#9E2A2B"],["#0B5345","#D32F2F","#D4AF37","#E0F7FA"]];
const monthTone=monthPalettes[m];const panel=$(".calendar-panel");panel.style.setProperty("--month-color",monthTone[0]);panel.style.setProperty("--month-accent",monthTone[1]);panel.style.setProperty("--month-deep",monthTone[2]);panel.style.setProperty("--month-ink",monthTone[3]);panel.dataset.month=String(m);
const first=new Date(y,m,1,12),offset=(first.getDay()+6)%7,start=new Date(y,m,1-offset,12),grid=$("#calendarGrid");grid.innerHTML="";
for(let i=0;i<42;i++){
const d=new Date(start);d.setDate(start.getDate()+i);const key=iso(d),inMonth=d.getMonth()===m,items=sorted(state.deadlines.filter(x=>x.date===key));
const b=document.createElement("button");b.type="button";const colors=[...new Set(items.map(x=>x.color||subj(x.subject).color))].slice(0,3);b.className="day-cell"+(!inMonth?" outside":"")+(key===today()?" today":"")+(key===selected?" selected":"")+(items.length?" has-deadlines":"")+(items.some(x=>away(x.date)<0)?" overdue-cell":"")+(items.some(x=>x.date===today())?" due-today-cell":"");
b.setAttribute("aria-label",pretty(key,{weekday:"long",month:"long",day:"numeric"})+(items.length?", "+items.length+" deadlines":""));
if(colors[0])b.style.setProperty("--subject-a",colors[0]);if(colors[1])b.style.setProperty("--subject-b",colors[1]);if(colors[2])b.style.setProperty("--subject-c",colors[2]);if(colors.length===1)b.style.setProperty("--subject-color",colors[0]);
/* Deadline cells are intentionally color-only. */
b.dataset.date=key;b.addEventListener("click",()=>{selected=key;renderAll()});grid.appendChild(b)
}
renderLegend()
}
function renderDay(){
$("#selectedHeading").textContent=pretty(selected,{weekday:"short",month:"short",day:"numeric"});
$("#selectedHint").textContent=selected===today()?"Today's deadlines, all in one place.":away(selected)<0?"Past date. Check what slipped, without judgement.":away(selected)===1?"Tomorrow's deadlines.":pretty(selected,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const holder=$("#dayDeadlines"),items=sorted(state.deadlines.filter(x=>x.date===selected));holder.innerHTML="";
if(!items.length){holder.innerHTML='<div class="empty-day">No tasks on this date yet.<br>Add a deadline when you are ready.</div>';return}
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
editing=id;const x=id?state.deadlines.find(d=>d.id===id):null;$("#deadlineForm").reset();$("#formTitle").innerHTML=(x?"Edit deadline":"Add a deadline")+'<span class="dot">.</span>';$("#formEyebrow").textContent=x?"MAKE A CHANGE":"ADD A TASK";
$("#deadlineTitle").value=x?x.title:"";$("#deadlineDate").value=x?x.date:selected;renderOptions(x?x.subject:(state.subjects[0]||{}).id);$("#deadlineUrgency").value=x?(x.urgency||"normal"):"normal";$("#deadlineNotes").value=x?(x.notes||""):"";$("#deleteDeadline").hidden=!x;$("#deadlineDialog").showModal();setTimeout(()=>$("#deadlineTitle").focus(),40)
}
$("#prevMonth").addEventListener("click",()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1,12);renderCalendar()});
$("#nextMonth").addEventListener("click",()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1,12);renderCalendar()});
$("#todayBtn").addEventListener("click",()=>{selected=today();view=date(selected);renderAll()});

$("#addDeadlineBtn").addEventListener("click",()=>openDeadline());
// Quick capture: one scribbled line per task, with a date and an individual colour.
const quickPalette=["#8ED1FC","#EC008C","#1B365D","#FF6F61","#FF4D88","#C80036","#00C2D1","#FFD700","#7CB342","#59C3C3","#E5A93C","#FF85A1","#FFE600","#D8B4F8","#98FF98","#FFB7B2","#00875A","#D81B60","#FFF176","#1B4D3E","#00A896","#FF6B35","#FF8811","#FFD166","#0055A5","#FF1D25","#FFEB3B","#E040FB","#FF9E7D","#FFC107","#00B4D8","#8AC926","#D4AF37","#005B60","#C85A17","#8E1600","#FF6700","#4A154B","#121212","#00F5D4","#800020","#E09F3E","#556B2F","#9E2A2B","#0B5345","#D32F2F","#D4AF37","#E0F7FA"];
let quickRows=[];
function parseQuickLine(raw,index){
const monthMap={jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11};
const match=raw.match(/(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(20\d{2}))?/i);
if(!match)return {raw,title:raw.trim(),dates:[],error:"Add a date like 30 oct",color:quickPalette[index%quickPalette.length]};
const month=monthMap[match[3].toLowerCase()],year=Number(match[4]||view.getFullYear()),first=Number(match[1]),last=Number(match[2]||match[1]);
if(first<1||first>31||last<first||last>31)return {raw,title:raw.replace(match[0],"").trim(),dates:[],error:"Check the day number",color:quickPalette[index%quickPalette.length]};
let actualYear=year;if(!match[4]&&month<view.getMonth()-5)actualYear=year+1;
const dates=[];for(let day=first;day<=last;day++){const dt=new Date(actualYear,month,day,12);if(dt.getMonth()!==month)return {raw,title:raw.replace(match[0],"").trim(),dates:[],error:"That date does not exist",color:quickPalette[index%quickPalette.length]};dates.push(iso(dt))}
const title=raw.replace(match[0],"").replace(/\s+/g," ").replace(/[,:-]+$/,"").trim();
const subject=state.subjects.find(s=>title.toLowerCase().includes(s.name.toLowerCase()))||state.subjects.find(s=>s.id==="other")||state.subjects[0];
return {raw,title:title||raw.trim(),dates,subject:subject&&subject.id,color:(subject&&subject.color)||quickPalette[index%quickPalette.length],error:title?"":"Add a task name"};
}
function renderQuickPreview(){
const area=$("#quickTasks"),holder=$("#quickTaskPreview");if(!area||!holder)return;
const lines=area.value.split(/\n/).map(x=>x.trim()).filter(Boolean);const previousColours=new Map(quickRows.map(x=>[x.raw,x.color]));quickRows=lines.map(parseQuickLine);quickRows.forEach(x=>{if(previousColours.has(x.raw))x.color=previousColours.get(x.raw)});holder.innerHTML="";
if(!quickRows.length){holder.innerHTML='<p class="quick-help">One task per line. Add a date, then pick its colour.</p>';return}
quickRows.forEach((row,index)=>{
const item=document.createElement("div");item.className="quick-task-row"+(row.error?" needs-date":"");
const chosen=/^#[0-9a-f]{6}$/i.test(row.color)?row.color:quickPalette[index%quickPalette.length];
item.style.setProperty("--quick-color",chosen);
const copy=document.createElement("span");copy.className="quick-task-copy";copy.textContent=row.title||row.raw;
const dateLabel=document.createElement("small");dateLabel.className="quick-task-date";dateLabel.textContent=row.error?row.error:row.dates.length===1?pretty(row.dates[0]):pretty(row.dates[0])+" to "+pretty(row.dates[row.dates.length-1]);
const picker=document.createElement("div");picker.className="quick-colour-grid";picker.setAttribute("role","group");picker.setAttribute("aria-label","Choose a colour for "+row.title);
quickPalette.forEach(color=>{const swatch=document.createElement("button");swatch.type="button";swatch.className="quick-colour-swatch"+(color.toLowerCase()===chosen.toLowerCase()?" active":"");swatch.style.setProperty("--swatch-color",color);swatch.setAttribute("aria-label","Choose "+color);swatch.title=color;swatch.addEventListener("click",()=>{row.color=color;item.style.setProperty("--quick-color",color);picker.querySelectorAll("button").forEach(button=>button.classList.toggle("active",button===swatch))});picker.appendChild(swatch)});
item.append(copy,dateLabel,picker);holder.appendChild(item)
})
}
$("#quickTasks").addEventListener("input",renderQuickPreview);
$("#quickTasksDone").addEventListener("click",()=>{
renderQuickPreview();if(!quickRows.length){toast("Write at least one task first.");return}
const invalid=quickRows.find(x=>x.error||!x.dates.length);if(invalid){toast("Add a task name and date to every line first.");return}
let added=0;
quickRows.forEach(row=>row.dates.forEach(day=>{
const existing=state.deadlines.find(x=>x.date===day&&x.title.toLowerCase()===row.title.toLowerCase());
if(existing){existing.color=row.color;if(row.subject)existing.subject=row.subject}
else state.deadlines.push({id:uid(),title:row.title,date:day,subject:row.subject||(state.subjects[0]||{}).id,color:row.color,urgency:"normal",notes:"",createdAt:new Date().toISOString()});
added++
}));
save();const latest=quickRows[quickRows.length-1];selected=latest.dates[0];view=date(selected);$("#quickTasks").value="";renderAll();toast(added+" task date"+(added===1?"":"s")+" added to your calendar.")
});

$("#closeDeadline").addEventListener("click",()=>$("#deadlineDialog").close());
$("#deadlineForm").addEventListener("submit",e=>{
e.preventDefault();const data={title:$("#deadlineTitle").value.trim(),date:$("#deadlineDate").value,subject:$("#deadlineSubject").value,urgency:$("#deadlineUrgency").value,notes:$("#deadlineNotes").value.trim()};
if(!data.title||!data.date||!data.subject){toast("Add a title, date, and subject first.");return}
if(editing){const i=state.deadlines.findIndex(x=>x.id===editing);if(i>=0)state.deadlines[i]={...state.deadlines[i],...data}}else state.deadlines.push({id:uid(),...data,createdAt:new Date().toISOString()});
selected=data.date;view=date(data.date);save();$("#deadlineDialog").close();renderAll();toast(editing?"Deadline updated.":"Task added to your calendar.")
});
$("#deleteDeadline").addEventListener("click",()=>{if(!editing)return;const x=state.deadlines.find(d=>d.id===editing);if(!confirm('Delete "'+(x?x.title:"this deadline")+'"?'))return;state.deadlines=state.deadlines.filter(d=>d.id!==editing);save();$("#deadlineDialog").close();renderAll();toast("Deadline deleted.")});
const manageSubjectsButton=$("#manageSubjects");if(manageSubjectsButton)manageSubjectsButton.addEventListener("click",()=>{$("#subjectsDialog").showModal();renderSubjectEditor()});
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