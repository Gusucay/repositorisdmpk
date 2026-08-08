const CATS = [
  ["Modul", "📘", "Bahan ajar dan materi pembelajaran"],
  ["Kurikulum", "🎓", "Struktur dan desain program pelatihan"],
  ["SOP", "⚙️", "Standar operasional prosedur"],
  ["Pedoman", "📕", "Acuan dan panduan pelaksanaan"],
  ["Juknis", "📋", "Petunjuk teknis program"],
  ["Juklak", "📄", "Petunjuk pelaksanaan kegiatan"],
  ["Sertifikat Pelatihan", "🏅", "Arsip sertifikat dan verifikasi peserta"]
];

/* ================================
   SUPABASE
================================ */

const SUPABASE_URL = "https://trixvdnjijuzxcqqlyyp.supabase.co";

/*
  TEMPEL PUBLISHABLE KEY YANG TADI SUDAH KAMU COPY
  DI DALAM TANDA KUTIP DI BAWAH.

  JANGAN gunakan Secret key.
*/
const SUPABASE_KEY = "sb_publishable_QxnF1iLbgs-meSBDLLZXww_eF1zZaZB";

const TABLE_URL = `${SUPABASE_URL}/rest/v1/dokumen`;

const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/dokumen`;

let docs = [];


/* ================================
   LOAD DATA DARI SUPABASE
================================ */

async function loadDocs() {

  try {

    const response = await fetch(
      `${TABLE_URL}?select=id,judul,kategori,tahun,deskripsi,file_path,created_at&order=id.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase error ${response.status}`);
    }

    const data = await response.json();

    docs = data.map(d => ({
      id: d.id,
      title: d.judul,
      cat: d.kategori,
      year: String(d.tahun),
      number: d.id ? `DOC-${String(d.id).padStart(4, "0")}` : "—",
      desc: d.deskripsi || "",
      url: d.file_path ? makeFileUrl(d.file_path) : "",
      file_path: d.file_path || "",
      created_at: d.created_at
    }));

    setup();

  } catch (error) {

    console.error(error);

    document.getElementById("count").textContent =
      "Gagal mengambil data dari database.";

    document.getElementById("docs").innerHTML = `
      <div class="empty">
        Tidak dapat terhubung ke database Supabase.
        <br><br>
        Periksa Publishable Key dan RLS tabel dokumen.
      </div>
    `;

  }

}


/* ================================
   STORAGE PUBLIC URL
================================ */

function makeFileUrl(path) {

  if (!path) return "";

  return `${STORAGE_URL}/${path
    .split("/")
    .map(part => encodeURIComponent(part))
    .join("/")}`;

}


/* ================================
   SETUP WEBSITE
================================ */

function setup() {

  const cats = document.getElementById("cats");

  const selects = [
    document.getElementById("cat"),
    document.getElementById("newcat")
  ];

  cats.innerHTML = CATS.map(c => `
    <div class="cat-card" onclick="pick('${escAttr(c[0])}')">
      <div class="cat-icon">${c[1]}</div>
      <h3>${esc(c[0])}</h3>
      <p>${esc(c[2])}</p>
    </div>
  `).join("");

  selects.forEach((s, i) => {

    if (!s) return;

    s.innerHTML =
      (i
        ? ""
        : `<option value="">Semua kategori</option>`
      ) +
      CATS.map(c =>
        `<option value="${escAttr(c[0])}">${esc(c[0])}</option>`
      ).join("");

  });

  const years = [
    ...new Set(
      docs
        .map(d => d.year)
        .filter(Boolean)
    )
  ].sort().reverse();

  document.getElementById("year").innerHTML =
    `<option value="">Semua tahun</option>` +
    years.map(y => `<option value="${escAttr(y)}">${esc(y)}</option>`).join("");

  render();

}


/* ================================
   RENDER DOKUMEN
================================ */

function render() {

  const q = document.getElementById("q").value.toLowerCase().trim();
  const c = document.getElementById("cat").value;
  const y = document.getElementById("year").value;

  const list = docs.filter(d => {

    const searchable = [
      d.title,
      d.cat,
      d.year,
      d.desc,
      d.number
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!q || searchable.includes(q)) &&
      (!c || d.cat === c) &&
      (!y || d.year === y)
    );

  });

  document.getElementById("count").textContent =
    `Menampilkan ${list.length} dokumen`;

  document.getElementById("docs").innerHTML = list.map(d => {

    const index = docs.indexOf(d);

    return `
      <article class="doc">

        <span class="tag">
          ${esc(d.cat || "UMUM").toUpperCase()} · ${esc(d.year || "")}
        </span>

        <h3>${esc(d.title)}</h3>

        <p>${esc(d.desc || "")}</p>

        <div class="meta">
          ${esc(d.number || "—")}
        </div>

        <div class="doc-actions">

          <button class="open" onclick="openDoc(${index})">
            Detail
          </button>

          ${
            d.url
              ? `
                <button onclick="window.open('${escAttr(d.url)}','_blank')">
                  Buka/Download
                </button>
              `
              : `
                <button onclick="alert('File belum tersedia.')">
                  File
                </button>
              `
          }

        </div>

      </article>
    `;

  }).join("");

  document.getElementById("empty").hidden = list.length > 0;

}


/* ================================
   FILTER KATEGORI
================================ */

function pick(c) {

  document.getElementById("cat").value = c;

  document
    .getElementById("dokumen")
    .scrollIntoView({ behavior: "smooth" });

  render();

}


/* ================================
   DETAIL DOKUMEN
================================ */

function openDoc(i) {

  const d = docs[i];

  if (!d) return;

  const body = `
    <span class="tag">${esc(d.cat || "Umum")}</span>

    <h2>${esc(d.title)}</h2>

    <p style="color:#6d7d77">
      ${esc(d.desc || "")}
    </p>

    <div style="
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:8px
    ">

      <div>
        <b>ID</b><br>
        ${esc(String(d.id ?? "—"))}
      </div>

      <div>
        <b>Tahun</b><br>
        ${esc(d.year || "—")}
      </div>

      <div>
        <b>Kategori</b><br>
        ${esc(d.cat || "—")}
      </div>

      <div>
        <b>Akses</b><br>
        ${d.url ? "Publik" : "Belum tersedia"}
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
              rel="noopener"
            >
              Buka Dokumen →
            </a>
          </p>
        `
        : `
          <p style="margin-top:18px;color:#a06b20">
            File PDF belum ditautkan ke dokumen ini.
          </p>
        `
    }
  `;

  document.getElementById("modalBody").innerHTML = body;

  document
    .getElementById("modal")
    .classList.add("on");

}


/* ================================
   MODAL
================================ */

function closeModal() {

  document
    .getElementById("modal")
    .classList.remove("on");

}


/* ================================
   EXPORT DATA
================================ */

function exportData() {

  const blob = new Blob(
    [JSON.stringify(docs, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);

  a.download = "katalog-repositori-sdmpk.json";

  a.click();

}


/* ================================
   IMPORT DATA
================================ */

function importData(e) {

  alert(
    "Import katalog lokal belum digunakan. " +
    "Data utama sekarang berasal dari Supabase."
  );

}


/* ================================
   ESCAPE HTML
================================ */

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


/* ================================
   MULAI
================================ */

loadDocs();
