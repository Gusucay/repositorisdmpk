const CATS = [
  ["Modul", "📘", "Bahan ajar dan materi pembelajaran"],
  ["Kurikulum", "🎓", "Struktur dan desain program pelatihan"],
  ["SOP", "⚙️", "Standar operasional prosedur"],
  ["Pedoman", "📕", "Acuan dan panduan pelaksanaan"],
  ["Juknis", "📋", "Petunjuk teknis program"],
  ["Juklak", "📄", "Petunjuk pelaksanaan kegiatan"],
  ["Sertifikat Pelatihan", "🏅", "Arsip sertifikat dan verifikasi peserta"]
];

/* ==============================
   SUPABASE
============================== */

const SUPABASE_URL =
  "https://trixvdnjijuzxcqqlyyp.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_QxnF1iLbgs-meSBDLLZXww_eF1zZaZB";

const TABLE_URL =
  `${SUPABASE_URL}/rest/v1/dokumen`;

const STORAGE_URL =
  `${SUPABASE_URL}/storage/v1/object/public/dokumen`;

let docs = [];

/* ==============================
   AMBIL DATA SUPABASE
============================== */

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
      throw new Error(`Supabase HTTP ${response.status}`);
    }

    const data = await response.json();

    docs = data.map(d => ({
      id: d.id,
      title: d.judul,
      cat: d.kategori,
      year: String(d.tahun),
      number: d.id ? `DOC-${String(d.id).padStart(4, "0")}` : "—",
      desc: d.deskripsi || "",
      url: d.file_path
        ? `${STORAGE_URL}/${d.file_path}`
        : ""
    }));

    setup();

  } catch (error) {

    console.error("Supabase error:", error);

    const count = document.getElementById("count");
    const empty = document.getElementById("empty");

    if (count) {
      count.textContent = "Gagal mengambil data dari database.";
    }

    if (empty) {
      empty.hidden = false;
      empty.innerHTML = `
        <p>
          Tidak dapat terhubung ke database Supabase.
        </p>
        <p>
          Periksa Publishable Key dan RLS tabel dokumen.
        </p>
      `;
    }
  }
}

/* ==============================
   SETUP
============================== */

function setup() {

  const cats = document.getElementById("cats");

  const selects = [
    document.getElementById("cat"),
    document.getElementById("newcat")
  ];

  if (cats) {
    cats.innerHTML = CATS.map(c => `
      <div class="cat-card" onclick="pick('${c[0]}')">
        <div class="cat-icon">${c[1]}</div>
        <h3>${c[0]}</h3>
        <p>${c[2]}</p>
      </div>
    `).join("");
  }

  selects.forEach((s, i) => {

    if (!s) return;

    s.innerHTML = i
      ? CATS.map(c => `<option>${c[0]}</option>`).join("")
      : `<option value="">Semua kategori</option>` +
        CATS.map(c => `<option>${c[0]}</option>`).join("");
  });

  const yearSelect = document.getElementById("year");

  if (yearSelect) {

    const years = [
      ...new Set(docs.map(d => d.year))
    ].sort().reverse();

    yearSelect.innerHTML =
      `<option value="">Semua tahun</option>` +
      years.map(y => `<option>${y}</option>`).join("");
  }

  render();
}

/* ==============================
   RENDER
============================== */

function render() {

  const q =
    document.getElementById("q")?.value.toLowerCase() || "";

  const c =
    document.getElementById("cat")?.value || "";

  const y =
    document.getElementById("year")?.value || "";

  const list = docs.filter(d =>
    (!q ||
      Object.values(d)
        .join(" ")
        .toLowerCase()
        .includes(q)) &&
    (!c || d.cat === c) &&
    (!y || d.year === y)
  );

  const count = document.getElementById("count");

  if (count) {
    count.textContent =
      `Menampilkan ${list.length} dokumen`;
  }

  const docsEl = document.getElementById("docs");

  if (docsEl) {

    docsEl.innerHTML = list.map(d => {

      const index = docs.indexOf(d);

      return `
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
              onclick="openDoc(${index})">
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
                  onclick="alert('File belum tersedia.')">
                  File
                </button>
              `
            }

          </div>

        </article>
      `;

    }).join("");
  }

  const empty = document.getElementById("empty");

  if (empty) {
    empty.hidden = list.length > 0;
  }
}

/* ==============================
   FILTER
============================== */

function pick(c) {

  const cat = document.getElementById("cat");

  if (cat) {
    cat.value = c;
  }

  document
    .getElementById("dokumen")
    ?.scrollIntoView({
      behavior: "smooth"
    });

  render();
}

/* ==============================
   DETAIL
============================== */

function openDoc(i) {

  const d = docs[i];

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
      gap:8px">

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

  document
    .getElementById("modal")
    .classList.add("on");
}

function closeModal() {

  document
    .getElementById("modal")
    .classList.remove("on");
}

/* ==============================
   ESCAPE HTML
============================== */

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

/* ==============================
   START
============================== */

loadDocs();
