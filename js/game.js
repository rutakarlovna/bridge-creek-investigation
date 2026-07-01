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
          </div>
        </div>
      `;
    } else {
      grid.innerHTML += `
        <div class="card locked-card">
          <div class="info">
            <span class="tag gray">ЗАБЛОКИРОВАНО</span>
            <h2>Личность не установлена</h2>
            <p>Данные будут доступны после получения новых материалов расследования.</p>
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

  const response = await fetch("data/evidence.json");
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
          </div>
        </div>
      `;
    }
  });
}