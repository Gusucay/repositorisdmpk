const CATS=[
["Modul","📘","Bahan ajar dan materi pembelajaran"],
["Kurikulum","🎓","Struktur dan desain program pelatihan"],
["SOP","⚙️","Standar operasional prosedur"],
["Pedoman","📕","Acuan dan panduan pelaksanaan"],
["Juknis","📋","Petunjuk teknis program"],
["Juklak","📄","Petunjuk pelaksanaan kegiatan"],
["Sertifikat Pelatihan","🏅","Arsip sertifikat dan verifikasi peserta"]
];
const KEY="sdmpk_personal_repository_v1";
let docs=JSON.parse(localStorage.getItem(KEY)||"null")||[
{title:"Modul Pelatihan Pengembangan Kompetensi ASN",cat:"Modul",year:"2026",number:"MOD-2026-001",desc:"Bahan pembelajaran pengembangan kompetensi ASN.",url:""},
{title:"Kurikulum Pelatihan Pengembangan SDM",cat:"Kurikulum",year:"2026",number:"KUR-2026-001",desc:"Struktur dan desain program pelatihan.",url:""},
{title:"SOP Penyelenggaraan Pelatihan",cat:"SOP",year:"2026",number:"SOP-2026-004",desc:"Standar operasional penyelenggaraan pelatihan.",url:""},
{title:"Pedoman Mutu Pengembangan Kompetensi",cat:"Pedoman",year:"2026",number:"PED-2026-002",desc:"Acuan penjaminan mutu pengembangan kompetensi.",url:""},
{title:"Petunjuk Teknis Pelaksanaan Pelatihan",cat:"Juknis",year:"2026",number:"JUKNIS-2026-003",desc:"Petunjuk teknis pelaksanaan program.",url:""},
{title:"Petunjuk Pelaksanaan Program Bangkom",cat:"Juklak",year:"2026",number:"JUKLAK-2026-001",desc:"Petunjuk operasional program.",url:""},
{title:"Sertifikat Pelatihan Angkatan I",cat:"Sertifikat Pelatihan",year:"2026",number:"SDMPK-2026-0001",desc:"Sertifikat peserta pelatihan.",url:""},
];
function save(){localStorage.setItem(KEY,JSON.stringify(docs))}
function setup(){
 const cats=document.getElementById("cats"), selects=[document.getElementById("cat"),document.getElementById("newcat")];
 cats.innerHTML=CATS.map(c=>`<div class="cat-card" onclick="pick('${c[0]}')"><div class="cat-icon">${c[1]}</div><h3>${c[0]}</h3><p>${c[2]}</p></div>`).join("");
 selects.forEach((s,i)=>s.innerHTML=(i?CATS.map(c=>`<option>${c[0]}</option>`).join(""):`<option value="">Semua kategori</option>`+CATS.map(c=>`<option>${c[0]}</option>`).join("")));
 let years=[...new Set(docs.map(d=>d.year))].sort().reverse(); document.getElementById("year").innerHTML=`<option value="">Semua tahun</option>`+years.map(y=>`<option>${y}</option>`).join("");
 render();
}
function render(){
 let q=document.getElementById("q").value.toLowerCase(),c=document.getElementById("cat").value,y=document.getElementById("year").value;
 let list=docs.filter(d=>(!q||Object.values(d).join(" ").toLowerCase().includes(q))&&(!c||d.cat===c)&&(!y||d.year===y));
 document.getElementById("count").textContent=`Menampilkan ${list.length} dokumen`;
 document.getElementById("docs").innerHTML=list.map((d,i)=>`<article class="doc"><span class="tag">${d.cat.toUpperCase()} · ${d.year}</span><h3>${esc(d.title)}</h3><p>${esc(d.desc||"")}</p><div class="meta">${esc(d.number||"—")}</div><div class="doc-actions"><button class="open" onclick="openDoc(${docs.indexOf(d)})">Detail</button>${d.url?`<button onclick="window.open('${escAttr(d.url)}','_blank')">Buka/Download</button>`:`<button onclick="alert('Belum ada Public File URL untuk dokumen ini.')">File</button>`}</div></article>`).join("");
 document.getElementById("empty").hidden=list.length>0;
}
function pick(c){document.getElementById("cat").value=c;document.getElementById("dokumen").scrollIntoView({behavior:"smooth"});render()}
function addDoc(e){
 e.preventDefault();
 let d={title:title.value.trim(),cat:newcat.value,year:newyear.value.trim(),number:number.value.trim()||"—",desc:desc.value.trim(),url:url.value.trim()};
 if(!d.title)return;docs.unshift(d);save();setup();e.target.reset();newyear.value="2026";alert("Dokumen masuk ke katalog personal.");
}
function openDoc(i){
 let d=docs[i],body=`<span class="tag">${esc(d.cat)}</span><h2>${esc(d.title)}</h2><p style="color:#6d7d77">${esc(d.desc||"")}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><b>Nomor</b><br>${esc(d.number)}</div><div><b>Tahun</b><br>${esc(d.year)}</div><div><b>Kategori</b><br>${esc(d.cat)}</div><div><b>Akses</b><br>${d.url?"Publik":"Belum ditautkan"}</div></div>${d.url?`<p style="margin-top:18px"><a class="btn primary" href="${escAttr(d.url)}" target="_blank" rel="noopener">Buka Dokumen →</a></p>`:`<p style="margin-top:18px;color:#a06b20">Tambahkan Public File URL melalui menu Kelola File agar pengunjung dapat mengunduh dokumen.</p>`}`;
 document.getElementById("modalBody").innerHTML=body;document.getElementById("modal").classList.add("on");
}
function closeModal(){document.getElementById("modal").classList.remove("on")}
function exportData(){let blob=new Blob([JSON.stringify(docs,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="katalog-repositori-sdmpk.json";a.click()}
function importData(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{docs=JSON.parse(r.result);save();setup();alert("Katalog berhasil diimpor.")}catch{alert("File katalog tidak valid.")}};r.readAsText(f)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function escAttr(s){return esc(s).replace(/`/g,"&#96;")}
setup();
