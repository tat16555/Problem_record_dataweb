const API = "https://script.google.com/macros/s/AKfycbwFFI_bDZKwNG47eYcm0zxGTnzPULsl1kQrvpivd5c8K5yxguOt-VgNrVJHyGaBwKV8/exec";

let allData = [];

// โหลดข้อมูล
async function loadData() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("ไม่สามารถเชื่อมต่อ API: " + res.status);
    const data = await res.json();
    allData = data;
    render(data);
  } catch (err) {
    console.error(err);
    document.getElementById("thead").innerHTML = "";
    document.getElementById("tbody").innerHTML = `<tr><td colspan="100%" class="text-center text-danger">❌ โหลดข้อมูลไม่สำเร็จ: ${err.message}</td></tr>`;
  }
}

// แสดงตาราง
function render(data) {
  if (!data.length) {
    document.getElementById("thead").innerHTML = "";
    document.getElementById("tbody").innerHTML = `<tr><td colspan="100%" class="text-center">ไม่มีข้อมูล</td></tr>`;
    return;
  }

  const headers = Object.keys(data[0]).filter(h => h !== "_row");
  document.getElementById("thead").innerHTML = "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "<th>จัดการ</th></tr>";

  let html = "";
  data.forEach(row => {
    html += "<tr>";
    headers.forEach(h => {
      if (h === "ไฟล์แนบ" && row[h]) {
        html += `<td><a href="${row[h]}" target="_blank">📎 เปิดไฟล์</a></td>`;
      } else {
        html += `<td contenteditable="true">${row[h] || ""}</td>`;
      }
    });
    html += `<td>
      <button onclick="saveRow(this, ${row._row})" class="btn btn-warning btn-sm">💾</button>
      <button onclick="deleteData(${row._row})" class="btn btn-danger btn-sm">❌</button>
    </td></tr>`;
  });

  document.getElementById("tbody").innerHTML = html;
}

// ➕ เพิ่ม
async function addData() {
  const name = document.getElementById("name").value.trim();
  const detail = document.getElementById("detail").value.trim();
  if (!name || !detail) return alert("กรุณากรอกชื่อและรายละเอียด");

  try {
    await fetch(API, {
      method: "POST",
      body: JSON.stringify({ "ชื่อ": name, "รายละเอียด": detail })
    });
    document.getElementById("name").value = "";
    document.getElementById("detail").value = "";
    loadData();
  } catch (err) {
    console.error(err);
    alert("❌ เพิ่มข้อมูลไม่สำเร็จ");
  }
}

// 💾 แก้ไข
async function saveRow(btn, row) {
  const tr = btn.closest("tr");
  const cells = tr.querySelectorAll("td");
  let values = [];

  for (let i = 0; i < cells.length - 1; i++) {
    const a = cells[i].querySelector("a");
    values.push(a ? a.href : cells[i].innerText);
  }

  try {
    const res = await fetch(API, {
      method: "PUT",
      body: JSON.stringify({ row, values })
    });
    const result = await res.json();
    if(result.status === "updated") {
      alert("💾 บันทึกเรียบร้อย");
      loadData();
    } else {
      alert("❌ บันทึกไม่สำเร็จ: " + result.message);
    }
  } catch(err) {
    console.error(err);
    alert("❌ เกิดข้อผิดพลาด");
  }
}

// ❌ ลบ
async function deleteData(row) {
  if (!confirm("ลบข้อมูล?")) return;
  try {
    const res = await fetch(API + "?row=" + row, { method: "DELETE" });
    const result = await res.json();
    if(result.status === "deleted") {
      loadData();
    } else {
      alert("❌ ลบไม่สำเร็จ: " + result.message);
    }
  } catch(err) {
    console.error(err);
    alert("❌ เกิดข้อผิดพลาด");
  }
}

// 🔍 search
document.getElementById("search").addEventListener("input", function() {
  const keyword = this.value.toLowerCase();
  render(allData.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(keyword))));
});

// โหลดครั้งแรก
loadData();