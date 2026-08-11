const CATS = [
  ["Modul", "📘", "Bahan ajar dan materi pembelajaran"],
  ["Kurikulum", "🎓", "Struktur dan desain program pelatihan"],
  ["SOP", "⚙️", "Standar operasional prosedur"],
  ["Pedoman", "📕", "Acuan dan panduan pelaksanaan"],
  ["Juknis", "📋", "Petunjuk teknis program"],
  ["Juklak", "📄", "Petunjuk pelaksanaan kegiatan"],
  ["Sertifikat Pelatihan", "🏅", "Arsip sertifikat dan verifikasi peserta"],
  ["Alumni Pelatihan", "👥", "Data peserta dan alumni pelatihan"]
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
      container.innerHTML = "";
    }

    if (empty) {
      empty.hidden = false;
    }

    // Tetap tampilkan kategori meskipun database gagal dimuat
    setup();
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
console.log("SETUP BERJALAN");
  
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
        class="btn primary"
       onclick="previewFile(${d.id})"
        Lihat File
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

async function previewDocument(id) {
  const d = docs.find(x => x.id === id);

  if (!d || !d.url) {
    alert("File belum tersedia.");
    return;
  }

  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = `
    <div style="padding:10px">
      <span class="tag">${esc(d.cat)}</span>

      <h2 style="margin-bottom:6px">
        ${esc(d.title)}
      </h2>

      <p style="color:#6d7d77">
        Preview dokumen sebelum di-download.
      </p>

      <div id="previewArea" style="
        margin-top:18px;
        max-height:55vh;
        overflow:auto;
        border:1px solid #dce7e2;
        border-radius:12px;
        background:white;
      ">
        <div style="padding:30px;text-align:center">
          Memuat file...
        </div>
      </div>

      <div style="
        display:flex;
        gap:10px;
        margin-top:18px;
      ">
        <a
          <button
  class="btn primary"
  onclick="previewDocument(${d.id})">
  Lihat File
</button>
        </a>

        <button
          class="btn"
          onclick="closeModal()">
          Tutup
        </button>
      </div>
    </div>
  `;

  document.getElementById("modal").classList.add("on");

  try {
    const response = await fetch(d.url);

    if (!response.ok) {
      throw new Error("File tidak dapat diakses.");
    }

    const buffer = await response.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array"
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const html = XLSX.utils.sheet_to_html(worksheet, {
      editable: false
    });

    const previewArea = document.getElementById("previewArea");

    previewArea.innerHTML = `
      <div style="
        padding:14px;
        min-width:max-content;
      ">
        <div style="
          margin-bottom:12px;
          font-weight:700;
          color:#1d4f3f;
        ">
          Sheet: ${esc(sheetName)}
        </div>

        <div class="excel-preview">
          ${html}
        </div>
      </div>
    `;

  } catch (error) {

    console.error("Preview Excel error:", error);

    document.getElementById("previewArea").innerHTML = `
      <div style="
        padding:30px;
        text-align:center;
        color:#a06b20;
      ">
        <strong>Preview Excel tidak dapat ditampilkan.</strong>

        <p style="margin-top:8px">
          File tetap bisa di-download menggunakan tombol
          <b>Download Excel</b>.
        </p>
      </div>
    `;
  }
}
function previewFile(id) {
  const d = docs.find(x => x.id === id);

  if (!d) return;

  const fileUrl = d.url;

  if (!fileUrl) {
    alert("File tidak tersedia.");
    return;
  }

  const cleanUrl = fileUrl.split("?")[0];
  const ext = cleanUrl.split(".").pop().toLowerCase();

  // PDF
  if (ext === "pdf") {
    window.open(fileUrl, "_blank");
    return;
  }

  // Gambar
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    window.open(fileUrl, "_blank");
    return;
  }

  // Microsoft Office + CSV
  if (
    [
      "xls",
      "xlsx",
      "xlsm",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "csv"
    ].includes(ext)
  ) {
    const viewer =
      "https://docs.google.com/gview?embedded=1&url=" +
      encodeURIComponent(fileUrl);

    window.open(viewer, "_blank");
    return;
  }

  // Format lain
  window.open(fileUrl, "_blank");
}
  const cleanUrl = fileUrl.split("?")[0];
  const ext = cleanUrl.split(".").pop().toLowerCase();

  // PDF
  if (ext === "pdf") {
    window.open(fileUrl, "_blank");
    return;
  }

  // Gambar
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    window.open(fileUrl, "_blank");
    return;
  }

  // File Microsoft Office
  if (
    [
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "csv"
    ].includes(ext)
  ) {
    const viewer =
      "https://docs.google.com/gview?embedded=1&url=" +
      encodeURIComponent(fileUrl);

    window.open(viewer, "_blank");
    return;
  }

  // Format lain
  window.open(fileUrl, "_blank");
}
  const ext = fileUrl.split("?")[0].split(".").pop().toLowerCase();

  if (!["xlsx", "xls", "csv"].includes(ext)) {
    alert("Preview hanya tersedia untuk file Excel (.xlsx, .xls, .csv).");
    return;
  }

  window.open(
    "https://docs.google.com/gview?embedded=1&url=" +
    encodeURIComponent(fileUrl),
    "_blank"
  );
}
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

/* =========================
   ADD DOCUMENT
========================= */

/* =========================
   ADD DOCUMENT
========================= */

async function addDoc(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("newcat").value;
  const year = document.getElementById("newyear").value.trim();
  const number = document.getElementById("number").value.trim();
  const desc = document.getElementById("desc").value.trim();

  const fileInput = document.querySelector(
    'input[type="file"]'
  );

  const file = fileInput?.files?.[0];

  if (!title) {
    alert("Judul dokumen wajib diisi.");
    return;
  }

  if (!file) {
    alert("Silakan pilih File Lokal terlebih dahulu.");
    return;
  }

  try {

    /* =========================
       1. UPLOAD FILE
    ========================= */

    const safeName = file.name
      .replace(/[^\w.\-]+/g, "_");

    const filePath =
      `${Date.now()}_${safeName}`;

    const uploadUrl =
      `${SUPABASE_URL}/storage/v1/object/dokumen/${encodeURIComponent(filePath)}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",

      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": file.type || "application/octet-stream",
      },

      body: file
    });

    const uploadText =
      await uploadResponse.text();

    if (!uploadResponse.ok) {
      throw new Error(
        `Upload file gagal (${uploadResponse.status}): ${uploadText}`
      );
    }


    /* =========================
       2. SIMPAN DATA KE TABEL
    ========================= */

    const response = await fetch(
      `${TABLE_URL}`,
      {
        method: "POST",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },

        body: JSON.stringify({
          judul: title,
          kategori: category,
          tahun: year,
          nomor: number,
          deskripsi: desc,
          file_path: filePath
        })
      }
    );

    const responseText =
      await response.text();

    if (!response.ok) {
      throw new Error(
        `Database ${response.status}: ${responseText}`
      );
    }


    /* =========================
       3. BERHASIL
    ========================= */

    alert("Dokumen berhasil disimpan.");

    event.target.reset();

    document.getElementById("newyear").value =
      "2026";

    await loadDocs();

  } catch (error) {

    console.error(
      "Gagal menyimpan dokumen:",
      error
    );

    alert(
      "Gagal menyimpan dokumen.\n\n" +
      error.message
    );
  }
}

async function addDoc(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("newcat").value;
  const year = document.getElementById("newyear").value.trim();
  const number = document.getElementById("number").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const url = document.getElementById("url").value.trim();
  const file = document.getElementById("file").files[0];

  if (!title) {
    alert("Judul dokumen wajib diisi.");
    return;
  }

  try {
    let filePath = url || "";

    /* =========================
       UPLOAD FILE LOKAL
    ========================= */

    if (file) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");

      filePath = `${Date.now()}_${safeName}`;

      const uploadResponse = await fetch(
        `${SUPABASE_URL}/storage/v1/object/dokumen/${encodeURIComponent(filePath)}`,
        {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": file.type || "application/octet-stream"
          },
          body: file
        }
      );

      const uploadText = await uploadResponse.text();

      if (!uploadResponse.ok) {
        throw new Error(
          `Upload file gagal (${uploadResponse.status}): ${uploadText}`
        );
      }
    }

    /* =========================
       SIMPAN KE DATABASE
    ========================= */

    const response = await fetch(TABLE_URL, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        judul: title,
        kategori: category,
        tahun: year,
        nomor: number,
        deskripsi: desc,
        file_path: filePath
      })
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Supabase ${response.status}: ${responseText}`
      );
    }

    alert("Dokumen berhasil disimpan.");

    event.target.reset();

    document.getElementById("newyear").value = "2026";

    await loadDocs();

  } catch (error) {
    console.error("Gagal menyimpan dokumen:", error);

    alert(
      "Gagal menyimpan dokumen.\n\n" +
      error.message
    );
  }
}

setup();
loadDocs();
