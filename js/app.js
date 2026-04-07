const API = "https://script.google.com/macros/s/https://tat16555.github.io/Problem_record_dataweb//exec";

let allData = [];

// โหลดข้อมูล
function loadData() {
  fetch(API)
    .then(res => res.json())
    .then(data => {
      allData = data;
      render(data);
    });
}

// แสดงตาราง
function render(data) {
  if (!data.length) return;

  const headers = Object.keys(data[0]).filter(h => h !== "_row");

  document.getElementById("thead").innerHTML =
    "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "<th>จัดการ</th></tr>";

  let html = "";

  data.forEach(row => {
    html += "<tr>";

    headers.forEach(h => {
      html += `<td contenteditable="true">${row[h] || ""}</td>`;
    });

    html += `
      <td>
        <button onclick="saveRow(this, ${row._row})" class="btn btn-warning btn-sm">💾</button>
        <button onclick="deleteData(${row._row})" class="btn btn-danger btn-sm">❌</button>
      </td>
    </tr>`;
  });

  document.getElementById("tbody").innerHTML = html;
}

// ➕ เพิ่ม
function addData() {
  const data = {
    "ชื่อ": document.getElementById("name").value,
    "รายละเอียด": document.getElementById("detail").value
  };

  fetch(API, {
    method: "POST",
    body: JSON.stringify(data)
  }).then(() => loadData());
}

// 💾 บันทึกแก้ไข
function saveRow(btn, row) {
  const tr = btn.closest("tr");
  const cells = tr.querySelectorAll("td");

  let values = [];

  for (let i = 0; i < cells.length - 1; i++) {
    values.push(cells[i].innerText);
  }

  fetch(API, {
    method: "PUT",
    body: JSON.stringify({
      row: row,
      values: values
    })
  }).then(() => alert("บันทึกแล้ว"));
}

// ❌ ลบ
function deleteData(row) {
  if (!confirm("ลบข้อมูล?")) return;

  fetch(API + "?row=" + row, {
    method: "DELETE"
  }).then(() => loadData());
}

// 🔍 search
document.getElementById("search").addEventListener("input", function() {
  const keyword = this.value.toLowerCase();

  const filtered = allData.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(keyword)
    )
  );

  render(filtered);
});

// โหลดครั้งแรก
loadData();