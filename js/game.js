const accessCodes = {
  "BC-017-A1": {
    envelope: 1,
    title: "Конверт 1 открыт",
    message: "Открыты первые материалы дела Лины Харпер."
  },

  "AUTOPSY-224": {
    envelope: 2,
    title: "Конверт 2 открыт",
    message: "Открыт доступ к материалам вскрытия и месту обнаружения тела."
  },

  "PHONE-317": {
    envelope: 3,
    title: "Конверт 3 открыт",
    message: "Открыт доступ к телефону Лины и перепискам."
  }
};

function getProgress() {
  return Number(localStorage.getItem("bridgeCreekProgress")) || 1;
}

function saveProgress(level) {
  const current = getProgress();

  if (level > current) {
    localStorage.setItem("bridgeCreekProgress", level);
  }
}

function checkAccessCode() {
  const input = document.getElementById("accessCode");
  const result = document.getElementById("accessResult");

  const code = input.value.trim().toUpperCase();

  if (accessCodes[code]) {
    saveProgress(accessCodes[code].envelope);

    result.innerHTML = `
      <div class="success-box">
        <h2>${accessCodes[code].title}</h2>
        <p>${accessCodes[code].message}</p>
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