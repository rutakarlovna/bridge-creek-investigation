function getProgress() {
  return Number(localStorage.getItem("bridgeCreekProgress")) || 1;
}

function saveProgress(level) {
  const current = getProgress();

  if (level > current) {
    localStorage.setItem("bridgeCreekProgress", level);
  }
}

async function checkAccessCode() {
  const input = document.getElementById("accessCode");
  const result = document.getElementById("accessResult");

  const code = input.value.trim().toUpperCase();

  const response = await fetch("../data/envelopes.json");
  const envelopes = await response.json();

  const found = envelopes.find(item => item.code === code);

  if (found) {
    saveProgress(found.id);

    result.innerHTML = `
  <div class="success-box">
    <h2>НОВЫЕ МАТЕРИАЛЫ ДОБАВЛЕНЫ</h2>
    <h3>${found.title}</h3>
    <p>${found.description}</p>
    <p>Прогресс расследования: ${found.progress}%</p>

    <ul class="unlock-list">
      ${found.unlocks.map(item => `<li>✓ ${item}</li>`).join("")}
    </ul>

    <button onclick="location.href='desktop.html'">Перейти к расследованию</button>
  </div>
`;
  } else {
    result.innerHTML = `
      <div class="error-box">
        Код доступа не найден. Проверьте конверт и попробуйте снова.
      </div>
    `;
  }
}

async function loadSuspects() {
  const grid = document.getElementById("suspectsGrid");
  const progress = getProgress();

  const response = await fetch("data/suspects.json");
  const suspects = await response.json();

  grid.innerHTML = "";

  suspects.forEach(person => {
    if (person.unlockLevel <= progress) {
      grid.innerHTML += `
        <div class="card">
          <img src="assets/images/${person.photo}" alt="${person.name}">
          <div class="info">
            <span class="tag blue">${person.role}</span>
            <h2>${person.name}</h2>
            <p><strong>Возраст:</strong> ${person.age}</p>
            <p>${person.description}</p>
          
            <button onclick="openSuspect('${person.id}')">Открыть досье</button>
          </div>
        </div>
      `;
    } else {
      grid.innerHTML += `
  <div class="card locked-card suspect-locked">
    <div class="locked-silhouette">?</div>
    <div class="info">
      <span class="tag gray">ЗАБЛОКИРОВАНО</span>
      <h2>Личность не установлена</h2>
      <p>Досье скрыто. Требуется новый код доступа.</p>
    </div>
  </div>
`;
    }
  });
}
function updateDesktopProgress() {
  const progressText = document.getElementById("progressText");
  const level = getProgress();
  const percent = level * 10;

  if (progressText) {
    progressText.textContent = percent + "%";
  }
}
function resetProgress() {
  localStorage.removeItem("bridgeCreekProgress");
  alert("Прогресс сброшен. Сейчас сайт вернётся к началу расследования.");
  location.reload();
}
function updateLockedSections() {
  const level = getProgress();
  const sections = document.querySelectorAll(".locked-section");

  sections.forEach(section => {
    const unlockLevel = Number(section.dataset.unlock);
    const tag = section.querySelector(".tag");
    const button = section.querySelector(".section-button");

    if (level >= unlockLevel) {
     section.classList.add("unlocked");

      if (tag) {
        tag.textContent = "ДОСТУПНО";
        tag.className = "tag blue";
      }

      if (button) {
        button.disabled = false;
button.textContent = "Открыть";
button.onclick = function () {
  location.href = button.dataset.link;
};
      }
    }
  });
}
async function loadTimeline() {
  const list = document.getElementById("timelineList");
  if (!list) return;

  const progress = getProgress();

  const response = await fetch("../data/timeline.json");
  const timeline = await response.json();

  list.innerHTML = "";

  timeline.forEach(item => {
    if (item.level <= progress) {
      list.innerHTML += `
        <div class="journal-item">
          <div class="journal-time">${item.time}</div>
          <div>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </div>
        </div>
      `;
    }
  });
}
async function loadEvidence() {
  const list = document.getElementById("evidenceList");
  if (!list) return;

  const progress = getProgress();

  const response = await fetch("data/evidence.json?v=" + Date.now());
  const evidence = await response.json();

  list.innerHTML = "";

  evidence.forEach(item => {
    if (item.level <= progress) {
      list.innerHTML += `
        <div class="evidence-item">
          <div class="evidence-type">${item.type}</div>
          <div>
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            <span>${item.status}</span>
           <button onclick="openDocument('${item.file}', '${item.title}')">Открыть документ</button>
          </div>
        </div>
      `;
    }
  });
}
async function loadNews() {
  const list = document.getElementById("newsList");
  if (!list) return;

  const progress = getProgress();

  const response = await fetch("../data/news.json");
  const news = await response.json();

  list.innerHTML = "";

  news.forEach(item => {
    if (item.level <= progress) {
      list.innerHTML += `
        <article class="news-card">
          <div class="news-date">${item.date}</div>
          <h2>${item.title}</h2>
          <p class="news-source">${item.source}</p>
          <p>${item.text}</p>
        </article>
      `;
    }
  });
}
function openSuspect(id) {
  localStorage.setItem("selectedSuspect", id);
  location.href = "pages/suspect-profile.html";
}
async function loadSuspectProfile() {
  const box = document.getElementById("suspectProfile");
  if (!box) return;

  const id = localStorage.getItem("selectedSuspect");

  const response = await fetch("../data/suspects.json");
  const suspects = await response.json();

  const person = suspects.find(item => item.id === id);

  if (!person) {
    box.innerHTML = "<p>Досье не найдено.</p>";
    return;
  }

  box.innerHTML = `
    <div class="profile-card">
      <img src="../assets/images/${person.photo}" alt="${person.name}">
      <div>
        <span class="tag blue">${person.role}</span>
        <h1>${person.name}</h1>
        <p><strong>Возраст:</strong> ${person.age}</p>
        <p>${person.description}</p>
        <div class="suspect-meter">
  <div>Уровень подозрения: ${person.suspicion || 0}%</div>
  <div class="bar">
    <div class="fill" style="width:${person.suspicion || 0}%"></div>
  </div>
</div>

<div class="case-section">
  <h2>Алиби</h2>
  <p>${person.alibi || "Нет данных."}</p>
</div>

<div class="case-section">
  <h2>Связи</h2>
  <ul>
    ${(person.connections || []).map(item => `<li>${item}</li>`).join("")}
  </ul>
</div>

        <div class="suspect-meter">
  <div>Уровень подозрения: ${person.suspicion || 0}%</div>
  <div class="bar">
    <div class="fill" style="width:${person.suspicion || 0}%"></div>
  </div>
</div>

<div class="case-section">
  <h2>Алиби</h2>
  <p>${person.alibi || "Нет данных."}</p>
</div>

<div class="case-section">
  <h2>Связи</h2>
  <ul>
    ${(person.connections || []).map(item => `<li>${item}</li>`).join("")}
  </ul>
</div>

        <button onclick="location.href='../suspects.html'">Назад к базе лиц</button>
      </div>
    </div>
  `;
}
function openDocument(filePath, title) {
  const modal = document.getElementById("documentModal");
  const viewer = document.getElementById("documentViewer");
  const titleBox = document.getElementById("documentTitle");

  titleBox.textContent = title;

  const lower = filePath.toLowerCase();

  if (lower.endsWith(".mp4")) {
    viewer.innerHTML = `
      <video controls autoplay class="document-video">
        <source src="${filePath}" type="video/mp4">
      </video>
    `;
  } else {
    viewer.innerHTML = `
      <img src="${filePath}" class="document-image" alt="${title}">
    `;
  }

  modal.style.display = "flex";
}

function closeDocument() {
  const modal = document.getElementById("documentModal");
  const viewer = document.getElementById("documentViewer");

  viewer.innerHTML = "";
  modal.style.display = "none";
}
function submitDecision() {
  const selected = document.querySelector('input[name="killer"]:checked');

  if (!selected) {
    alert("Выберите подозреваемого.");
    return;
  }

  if (selected.value === "ryan") {
    localStorage.setItem("finalUnlocked", "true");

    alert("ДОСТУП РАЗРЕШЁН. Засекреченные материалы открыты.");

    location.href = "classified.html";
  } else {
    alert("Заключение не подтверждено. Доказательств недостаточно. Вернитесь к материалам дела.");

    location.href = "desktop.html";
  }
}