const CATS = [
  ["Modul", "📘", "Bahan ajar dan materi pembelajaran"],
  ["Kurikulum", "🎓", "Struktur dan desain program pelatihan"],
  ["SOP", "⚙️", "Standar operasional prosedur"],
  ["Pedoman", "📕", "Acuan dan panduan pelaksanaan"],
  ["Juknis", "📋", "Petunjuk teknis program"],
  ["Juklak", "📄", "Petunjuk pelaksanaan kegiatan"],
  ["Sertifikat Pelatihan", "🏅", "Arsip sertifikat dan verifikasi peserta"]
];

/* =========================
   SUPABASE
========================= */

const SUPABASE_URL = "https://lrixdvndjiuzxcqqlyyp.supabase.co";
/*
   PENTING:
   Gunakan Publishable Key.
   JANGAN gunakan secret/service_role key.
*/
const SUPABASE_KEY = "sb_publishable_QxnF1iLbgs-meSBDLLZXww_eF1zZaZB";

const TABLE_URL = `${SUPABASE_URL}/rest/v1/dokumen`;

let docs = [];


/* =========================
   LOAD DATA SUPABASE
========================= */

async function loadDocs() {

  const container = document.getElementById("docs");
  const empty = document.getElementById("empty");

  try {

    const response = await fetch(
  `${TABLE_URL}?select=id,judul,kategori,tahun,deskripsi,file_path,created_at&order=id.asc`,
  {
    method: "GET",
    headers: {
      "apikey": SUPABASE_KEY,
      "Content-Type": "application/json"
    }
  }
);

const responseText = await response.text();

if (!response.ok) {
  throw new Error(
    `Supabase ${response.status}: ${responseText}`
  );
}

const data = JSON.parse(responseText);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    docs = data.map(d => ({
      id: d.id,
      title: d.judul || "",
      cat: d.kategori || "",
      year: String(d.tahun || ""),
      number: d.id ? `DOC-${String(d.id).padStart(4, "0")}` : "—",
      desc: d.deskripsi || "",
      url: makeFileUrl(d.file_path)
    }));

    setup();

  } catch (error) {

    console.error("Supabase error:", error);

    docs = [];

    if (container) {
      container.innerHTML = `
        <div class="empty">
          Tidak dapat terhubung ke database Supabase.
          <br><br>
          Periksa Publishable Key dan RLS tabel dokumen.
        </div>
      `;
    }

    if (empty) {
      empty.hidden = true;
    }
  }
}


/* =========================
   FILE URL
========================= */

function makeFileUrl(path) {

  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/dokumen/${path}`;
}


/* =========================
   SETUP
========================= */

function setup() {

  const cats = document.getElementById("cats");

  const selects = [
    document.getElementById("cat"),
    document.getElementById("newcat")
  ];

  if (cats) {
  cats.innerHTML = CATS.map(c => `
    <article class="cat-card" onclick="pick('${escAttr(c[0])}')">

      <div class="cat-top">
        <div class="cat-icon">${c[1]}</div>

        <span class="cat-number">
          ${String(CATS.indexOf(c) + 1).padStart(2, "0")}
        </span>
      </div>

      <div class="cat-content">
        <h3>${esc(c[0])}</h3>
        <p>${esc(c[2])}</p>
      </div>

      <div class="cat-arrow" aria-hidden="true">
        →
      </div>

    </article>
  `).join("");
}
  selects.forEach((s, i) => {

    if (!s) return;

    if (i === 0) {
      s.innerHTML =
        `<option value="">Semua kategori</option>` +
        CATS.map(c => `<option value="${c[0]}">${c[0]}</option>`).join("");
    } else {
      s.innerHTML =
        CATS.map(c => `<option value="${c[0]}">${c[0]}</option>`).join("");
    }

  });

  const years = [
    ...new Set(docs.map(d => d.year))
  ].sort().reverse();

  const year = document.getElementById("year");

  if (year) {
    year.innerHTML =
      `<option value="">Semua tahun</option>` +
      years.map(y => `<option value="${y}">${y}</option>`).join("");
  }

  render();
}


/* =========================
   RENDER
========================= */

function render() {

  const qEl = document.getElementById("q");
  const catEl = document.getElementById("cat");
  const yearEl = document.getElementById("year");

  const q = qEl ? qEl.value.toLowerCase() : "";
  const c = catEl ? catEl.value : "";
  const y = yearEl ? yearEl.value : "";

  const list = docs.filter(d =>
    (!q ||
      Object.values(d)
        .join(" ")
        .toLowerCase()
        .includes(q)
    ) &&
    (!c || d.cat === c) &&
    (!y || d.year === y)
  );

  const count = document.getElementById("count");

  if (count) {
    count.textContent = `Menampilkan ${list.length} dokumen`;
  }

  const container = document.getElementById("docs");

  if (!container) return;

  container.innerHTML = list.map(d => `
    <article class="doc">

      <span class="tag">
        ${esc(d.cat).toUpperCase()} · ${esc(d.year)}
      </span>

      <h3>${esc(d.title)}</h3>

      <p>${esc(d.desc)}</p>

      <div class="meta">
        ${esc(d.number)}
      </div>

      <div class="doc-actions">

        <button
          class="open"
          onclick="openDoc(${d.id})">
          Detail
        </button>

        ${
          d.url
          ? `
            <button
              onclick="window.open('${escAttr(d.url)}','_blank')">
              Buka/Download
            </button>
          `
          : `
            <button
              onclick="alert('Belum ada file untuk dokumen ini.')">
              File
            </button>
          `
        }

      </div>

    </article>
  `).join("");

}


/* =========================
   CATEGORY
========================= */

function pick(c) {

  const cat = document.getElementById("cat");

  if (cat) {
    cat.value = c;
  }

  const dokumen = document.getElementById("dokumen");

  if (dokumen) {
    dokumen.scrollIntoView({
      behavior: "smooth"
    });
  }

  render();
}


/* =========================
   DETAIL
========================= */

function openDoc(id) {

  const d = docs.find(x => x.id === id);

  if (!d) return;

  const body = `
    <span class="tag">
      ${esc(d.cat)}
    </span>

    <h2>
      ${esc(d.title)}
    </h2>

    <p style="color:#6d7d77">
      ${esc(d.desc)}
    </p>

    <div style="
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:8px
    ">

      <div>
        <b>Nomor</b><br>
        ${esc(d.number)}
      </div>

      <div>
        <b>Tahun</b><br>
        ${esc(d.year)}
      </div>

      <div>
        <b>Kategori</b><br>
        ${esc(d.cat)}
      </div>

      <div>
        <b>Akses</b><br>
        ${d.url ? "Publik" : "Belum ditautkan"}
      </div>

    </div>

    ${
      d.url
      ? `
        <p style="margin-top:18px">
          <a
            class="btn primary"
            href="${escAttr(d.url)}"
            target="_blank"
            rel="noopener">
            Buka Dokumen →
          </a>
        </p>
      `
      : `
        <p style="margin-top:18px;color:#a06b20">
          File belum tersedia.
        </p>
      `
    }
  `;

  document.getElementById("modalBody").innerHTML = body;

  document.getElementById("modal").classList.add("on");
}


/* =========================
   CLOSE MODAL
========================= */

function closeModal() {

  document
    .getElementById("modal")
    .classList
    .remove("on");

}


/* =========================
   ESCAPE HTML
========================= */

function esc(s) {

  return String(s ?? "").replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m])
  );

}


function escAttr(s) {

  return esc(s).replace(/`/g, "&#96;");

}


/* =========================
   START
========================= */

loadDocs();
