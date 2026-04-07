const API = "https://script.google.com/macros/s/AKfycbwFFI_bDZKwNG47eYcm0zxGTnzPULsl1kQrvpivd5c8K5yxguOt-VgNrVJHyGaBwKV8/exec";

let allData = [];

// โหลดข้อมูล
async function loadData() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("ไม่สามารถเชื่อมต่อ API ได้: " + res.status);
    const data = await res.json();
    allData = data;
    render(data);
  } catch (err) {
    console.error(err);
    document.getElementById("tbody").innerHTML = `<tr><td colspan="100%" class="text-center text-danger">❌ ไม่สามารถโหลดข้อมูลได้: ${err.message}</td></tr>`;
    document.getElementById("thead").innerHTML = "";
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

  // สร้าง header
  document.getElementById("thead").innerHTML =
    "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "<th>จัดการ</th></tr>";

  // สร้าง rows
  let html = "";
  data.forEach(row => {
    html += "<tr>";
    headers.forEach(h => {
      // ถ้าเป็นไฟล์แนบ ให้สร้างลิงก์คลิกได้
      if (h === "ไฟล์แนบ" && row[h]) {
        html += `<td><a href="${row[h]}" target="_blank">📎 เปิดไฟล์</a></td>`;
      } else {
        html += `<td contenteditable="true">${row[h] || ""}</td>`;
      }
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
async function addData() {
  const name = document.getElementById("name").value.trim();
  const detail = document.getElementById("detail").value.trim();

  if (!name || !detail) {
    alert("กรุณากรอกชื่อและรายละเอียดก่อนเพิ่ม");
    return;
  }

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

// 💾 บันทึกแก้ไข
async function saveRow(btn, row) {
  const tr = btn.closest("tr");
  const cells = tr.querySelectorAll("td");
  let values = [];

  for (let i = 0; i < cells.length - 1; i++) {
    // ถ้าเป็นไฟล์แนบ ให้เก็บ url จริง
    const a = cells[i].querySelector("a");
    if (a) values.push(a.href);
    else values.push(cells[i].innerText);
  }

  try {
    await fetch(API, {
      method: "PUT",
      body: JSON.stringify({ row: row, values: values })
    });
    loadData();
  } catch (err) {
    console.error(err);
    alert("❌ บันทึกไม่สำเร็จ");
  }
}

// ❌ ลบ
async function deleteData(row) {
  if (!confirm("ลบข้อมูล?")) return;
  try {
    await fetch(API + "?row=" + row, { method: "DELETE" });
    loadData();
  } catch (err) {
    console.error(err);
    alert("❌ ลบไม่สำเร็จ");
  }
}

// 🔍 search
document.getElementById("search").addEventListener("input", function() {
  const keyword = this.value.toLowerCase();
  const filtered = allData.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(keyword))
  );
  render(filtered);
});

// โหลดครั้งแรก
loadData();