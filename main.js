window.onload = async () => {
  await renderTable(members);
};


async function renderTable(data) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  for (const member of data) {
    const row = document.createElement("tr");

    // Check if both files exist
    const frontCardPath = `/cards/${member.id}_ID_Card.png`;
    const backCardPath = `/cards/ID_Card_back_side.png`;

    const frontExists = await checkFileExists(frontCardPath);
    const backExists = await checkFileExists(backCardPath);

    const buttonHtml = (frontExists && backExists)
      ? `<button class="download-btn" onclick="downloadZip('${member.id}')">Download</button>`
      : `<button class="download-btn" disabled>Missing Files</button>`;

    row.innerHTML = `
      <td>${member.id}</td>
      <td>${member.name}</td>
      <td>${member.phone}</td>
      <td>${member.email}</td>
      <td>${buttonHtml}</td>
    `;

    tableBody.appendChild(row);
  }
}


async function searchMembers() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = members.filter(member => member.id.toLowerCase().includes(query));
  await renderTable(filtered);
}


function downloadZip(memberId) {
  const zip = new JSZip();  // ✅ This must be capitalized properly

  const files = [
    { name: `${memberId}_ID_Card.png`, path: `/cards/${memberId}_ID_Card.png` },
    { name: `ID_Card_back_side.png`, path: `/cards/ID_Card_back_side.png` }
  ];

  const fetchPromises = files.map(file =>
    fetch(file.path)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${file.name}`);
        return res.blob();
      })
      .then(blob => zip.file(file.name, blob))
  );

  Promise.all(fetchPromises)
    .then(() => {
      zip.generateAsync({ type: "blob" })
        .then(content => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(content);
          link.download = `${memberId}_RPST_Access_Card.zip`;
          link.click();
        });
    })
    .catch(error => {
      alert("One or more ID card images could not be found. Please check the card directory.");
      console.error(error);
    });

}

async function checkFileExists(path) {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

