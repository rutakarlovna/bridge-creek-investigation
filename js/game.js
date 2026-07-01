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
        <h2>${found.title}</h2>
        <p>${found.description}</p>
        <p>Прогресс расследования: ${found.progress}%</p>
        <button onclick="location.href='desktop.html'">Вернуться к расследованию</button>
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