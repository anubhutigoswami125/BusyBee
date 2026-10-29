(() => {
"use strict";
const $ = s => document.querySelector(s);
const KEY = "busybee-v1";
const defaults = [
{id:"genetics",name:"Genetics",color:"#e8a7a6"},
{id:"biochem",name:"Biochemistry",color:"#f5cc55"},
{id:"micro",name:"Microbiology",color:"#b6c99a"},
{id:"python",name:"Python",color:"#9ec5cf"},
{id:"cpp",name:"C++",color:"#bcb1d9"},
{id:"data",name:"Data Analysis",color:"#e6b58a"},
{id:"english",name:"English / PEL",color:"#d7b8c9"},
{id:"other",name:"Other",color:"#c6c1b1"}
];
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function date(s){const a=s.split("-").map(Number);return new Date(a[0],a[1]-1,a[2],12)}
function today(){return iso(new Date())}
function pretty(s,opts){return date(s).toLocaleDateString("en-IN",opts||{weekday:"short",month:"short",day:"numeric"})}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&Array.isArray(x.subjects)&&Array.isArray(x.deadlines))return x}catch(e){}return {subjects:defaults.map(x=>({...x})),deadlines:[]}}
let state=load(), view=date(today()), selected=today(), editing=null, toastTimer;\nconst THEME_KEY="busybee-theme-v1";\nfunction applyTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem(THEME_KEY,theme);const b=$("#themeToggle");if(b){b.innerHTML=(theme==="dark"?"☼":"◐") + " <span>"+(theme==="dark"?"LIGHT":"DARK")+"</span>";b.setAttribute("aria-label","Switch to "+(theme==="dark"?"light":"dark")+" mode");b.title="Switch to "+(theme==="dark"?"light":"dark")+" mode"}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){toast("Couldn't save. Download a backup and free some browser storage.")}}
function subj(id){return state.subjects.find(s=>s.id===id)||state.subjects.find(s=>s.id==="other")||{id:"other",name:"Other",color:"#c6c1b1"}}
function away(s){return Math.round((date(s)-date(today()))/86400000)}
function rank(u){return ({critical:0,important:1,normal:2})[u]??2}
function urgency(u){return ({critical:"HIGH STAKES",important:"NEEDS ATTENTION",normal:"COMING UP"})[u]||"COMING UP"}
function sorted(a){return a.slice().sort((x,y)=>x.date.localeCompare(y.date)||rank(x.urgency)-rank(y.urgency)||x.title.localeCompare(y.title))}
function renderLegend(){$("#legend").innerHTML=state.subjects.map(s=>'<span class="legend-item"><i class="legend-swatch" style="background:'+esc(s.color)+'"></i>'+esc(s.name)+'</span>').join("")}
function renderCalendar(){
const y=view.getFullYear(),m=view.getMonth();$("#monthTitle").textContent=view.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
const first=new Date(y,m,1,12),offset=(first.getDay()+6)%7,start=new Date(y,m,1-offset,12),grid=$("#calendarGrid");grid.innerHTML="";
for(let i=0;i<42;i++){
const d=new Date(start);d.setDate(start.getDate()+i);const key=iso(d),inMonth=d.getMonth()===m,items=sorted(state.deadlines.filter(x=>x.date===key)),primary=items.length?subj(items[0].subject):null;
const b=document.createElement("button");b.type="button";const subjectIds=[...new Set(items.map(x=>x.subject))];const colors=subjectIds.slice(0,2).map(id=>subj(id).color);b.className="day-cell"+(!inMonth?" outside":"")+(key===today()?" today":"")+(key===selected?" selected":"")+(items.length?" has-deadlines":"")+(items.some(x=>away(x.date)<0)?" overdue-cell":"")+(items.some(x=>x.date===today())?" due-today-cell":"");
b.setAttribute("aria-label",pretty(key,{weekday:"long",month:"long",day:"numeric"})+(items.length?", "+items.length+" deadlines":""));
if(colors[0])b.style.setProperty("--subject-a",colors[0]);if(colors[1])b.style.setProperty("--subject-b",colors[1]);if(colors.length===1)b.style.setProperty("--subject-color",colors[0]);if(subjectIds.length>2)b.style.setProperty("--subject-count",String(subjectIds.length));
const n=document.createElement("span");n.className="day-number"+(key===today()?" today-number":"");n.textContent=d.getDate();b.appendChild(n);
if(items.length){const max=window.innerWidth<500?1:2;items.slice(0,max).forEach(x=>{const e=document.createElement("span");e.className="day-event"+(x.urgency==="critical"?" urgency-critical":x.urgency==="important"?" urgency-important":"");e.textContent=x.title;e.title=x.title;b.appendChild(e)});
if(items.length>max){const more=document.createElement("span");more.className="more-events";more.textContent="+"+(items.length-max)+" MORE";b.appendChild(more)}
const status=items.some(x=>away(x.date)<0)?"overdue":items.some(x=>away(x.date)<=3)?"soon":"";if(status){const f=document.createElement("i");f.className="urgency-flag"+(status==="soon"?" soon":"");f.title=status==="soon"?"Due within 3 days":"Overdue";b.appendChild(f)}
}else if(inMonth){const mark=document.createElement("span");mark.className="empty-mark";mark.textContent="·";b.appendChild(mark)}
b.dataset.date=key;b.addEventListener("click",()=>{selected=key;renderAll()});grid.appendChild(b)
}
renderLegend()
}
function renderDay(){
$("#selectedHeading").textContent=pretty(selected,{weekday:"short",month:"short",day:"numeric"});
$("#selectedHint").textContent=selected===today()?"Today's deadlines, all in one place.":away(selected)<0?"Past date. Check what slipped, without judgement.":away(selected)===1?"Tomorrow's deadlines.":pretty(selected,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const holder=$("#dayDeadlines"),items=sorted(state.deadlines.filter(x=>x.date===selected));holder.innerHTML="";
if(!items.length){holder.innerHTML='<div class="empty-day">Nothing pinned here yet.<br>Add a deadline when you are ready.</div>';return}
items.forEach(x=>{const s=subj(x.subject),card=document.createElement("article");card.className="deadline-card";card.style.setProperty("--card-color",s.color);
card.innerHTML='<div class="deadline-card-top"><h3>'+esc(x.title)+'</h3><button class="edit-deadline" type="button" aria-label="Edit deadline" title="Edit deadline">✎</button></div><div class="deadline-meta"><span>'+esc(s.name)+'</span><span class="urgency-label '+esc(x.urgency)+'">'+urgency(x.urgency)+'</span></div>'+(x.notes?'<p class="deadline-notes">'+esc(x.notes)+'</p>':"");
card.querySelector("button").addEventListener("click",()=>openDeadline(x.id));holder.appendChild(card)})
}
function renderUpNext(){
const items=sorted(state.deadlines.filter(x=>x.date>=today())).slice(0,5);$("#upNextCount").textContent=items.length+" ITEM"+(items.length===1?"":"S");const holder=$("#upNextList");holder.innerHTML="";
if(!items.length){holder.innerHTML='<div class="up-next-empty">A little breathing room. Add your next deadline when it comes up.</div>';return}
items.forEach(x=>{const s=subj(x.subject),d=date(x.date),b=document.createElement("button");b.type="button";b.className="up-next-item";b.style.background="transparent";b.style.textAlign="left";b.style.width="100%";b.style.cursor="pointer";b.style.color="inherit";
let label=x.date===today()?"DUE TODAY":away(x.date)===1?"DUE TOMORROW":"IN "+away(x.date)+" DAYS";
b.innerHTML='<span class="up-next-date" style="--item-color:'+esc(s.color)+'"><b>'+d.getDate()+'</b>'+d.toLocaleDateString("en-IN",{month:"short"}).toUpperCase()+'</span><span class="up-next-info"><strong>'+esc(x.title)+'</strong><small>'+esc(s.name)+' · '+label+'</small></span>';
b.addEventListener("click",()=>{selected=x.date;view=date(x.date);renderAll()});holder.appendChild(b)})
}
function renderOptions(value){$("#deadlineSubject").innerHTML=state.subjects.map(s=>'<option value="'+esc(s.id)+'"'+(s.id===value?" selected":"")+'>'+esc(s.name)+'</option>').join("")}
function renderAll(){renderCalendar();renderDay();renderUpNext()}
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
state.subjects.forEach(s=>{const row=document.createElement("div");row.className="subject-row";row.innerHTML='<span>'+esc(s.name)+'</span><input type="color" value="'+esc(s.color)+'" aria-label="Colour for '+esc(s.name)+'"><button type="button" aria-label="Delete '+esc(s.name)+'" title="Delete subject">×</button>';
row.querySelector("input").addEventListener("input",e=>{s.color=e.target.value;save();renderAll()});
row.querySelector("button").addEventListener("click",()=>{if(state.subjects.length<=1){toast("Keep at least one subject colour.");return}if(!confirm("Remove "+s.name+"? Existing deadlines will move to Other if available."))return;let other=state.subjects.find(a=>a.id==="other"&&a.id!==s.id);if(!other){other={id:"other",name:"Other",color:"#c6c1b1"};state.subjects.push(other)}state.deadlines.forEach(d=>{if(d.subject===s.id)d.subject=other.id});state.subjects=state.subjects.filter(a=>a.id!==s.id);save();renderAll();renderSubjectEditor();renderOptions($("#deadlineSubject").value)});
holder.appendChild(row)})
}
$("#addSubjectForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#newSubjectName").value.trim();if(!name)return;if(state.subjects.some(s=>s.name.toLowerCase()===name.toLowerCase())){toast("That subject already has a colour.");return}const palette=["#e8a7a6","#f5cc55","#b6c99a","#9ec5cf","#bcb1d9","#e6b58a","#d7b8c9","#c6c1b1","#a9c9ad"],used=state.subjects.map(s=>s.color.toLowerCase()),color=palette.find(c=>!used.includes(c))||palette[state.subjects.length%palette.length];state.subjects.push({id:uid(),name,color});save();$("#newSubjectName").value="";renderSubjectEditor();renderOptions();renderAll();toast("Subject colour added.")});
$("#themeToggle").addEventListener("click",()=>applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));\n$("#calendarGrid").addEventListener("keydown",e=>{const cell=e.target.closest(".day-cell");if(!cell)return;let step=0;if(e.key==="ArrowLeft")step=-1;else if(e.key==="ArrowRight")step=1;else if(e.key==="ArrowUp")step=-7;else if(e.key==="ArrowDown")step=7;else return;e.preventDefault();const next=date(cell.dataset.date);next.setDate(next.getDate()+step);selected=iso(next);view=date(selected);renderAll();const target=$("#calendarGrid [data-date=\\""+selected+"\\"]");if(target)target.focus()});\n$("#exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({app:"BusyBee",version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="busybee-backup-"+today()+".json";a.click();URL.revokeObjectURL(url);toast("Backup downloaded.")});
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