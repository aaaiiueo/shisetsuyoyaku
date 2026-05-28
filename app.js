const facilities = [
  {
    id: "meeting-a",
    name: "4号館 会議室A",
    detail: "御器所 / 会議室 / 定員16",
    badge: "モニタ・Web会議",
  },
  {
    id: "seminar-b",
    name: "2号館 セミナー室B",
    detail: "御器所 / 演習室 / 定員40",
    badge: "プロジェクタ・録画設備",
  },
  {
    id: "hall-c",
    name: "共用ホールC",
    detail: "御器所 / 共用スペース / 定員80",
    badge: "大型スクリーン・配信設備",
  },
  {
    id: "studio-d",
    name: "デザイン工房D",
    detail: "多治見 / 実験室 / 定員24",
    badge: "3Dプリンタ・工作台",
  },
];

const state = {
  selectedFacilityIds: ["meeting-a"],
  selectedDates: ["2026-04-20"],
  selectedSlots: [{ id: 1, date: "2026-04-20", start: "13:00", end: "15:00" }],
};

const facilityOptions = document.querySelector("#facilityOptions");
const selectedSlots = document.querySelector("#selectedSlots");
const previewPanel = document.querySelector("#previewPanel");
const reservationForm = document.querySelector("#reservationForm");
const dateInput = document.querySelector("#dateInput");
const startTimeInput = document.querySelector("#startTimeInput");
const endTimeInput = document.querySelector("#endTimeInput");
const addSlotButton = document.querySelector("#addSlotButton");
const addDateButton = document.querySelector("#addDateButton");
const selectedDates = document.querySelector("#selectedDates");

function renderFacilities() {
  facilityOptions.innerHTML = facilities
    .map((facility) => {
      const checked = state.selectedFacilityIds.includes(facility.id) ? "checked" : "";
      return `
        <label class="facility-option">
          <input type="checkbox" value="${facility.id}" ${checked} />
          <div>
            <strong>${facility.name}</strong>
            <div class="option-meta">${facility.detail}</div>
          </div>
          <span class="option-badge">${facility.badge}</span>
        </label>
      `;
    })
    .join("");
}

function renderSlots() {
  if (state.selectedSlots.length === 0) {
    selectedSlots.innerHTML = `<div class="empty-note">利用日時を追加してください。</div>`;
    return;
  }

  selectedSlots.innerHTML = state.selectedSlots
    .map(
      (slot) => `
        <article class="slot-item">
          <div>
            <strong>${slot.date}</strong>
            <div class="slot-meta">${slot.start} - ${slot.end}</div>
          </div>
          <button type="button" class="ghost-remove" data-slot-id="${slot.id}">削除</button>
        </article>
      `
    )
    .join("");
}

function renderDates() {
  if (state.selectedDates.length === 0) {
    selectedDates.innerHTML = `<div class="empty-note">先に利用日を追加してください。</div>`;
    return;
  }

  selectedDates.innerHTML = state.selectedDates
    .map(
      (date) => `
        <span class="date-tag">
          ${date}
          <button type="button" data-date="${date}">×</button>
        </span>
      `
    )
    .join("");
}

function renderPreview() {
  const selectedFacilityNames = facilities
    .filter((facility) => state.selectedFacilityIds.includes(facility.id))
    .map((facility) => facility.name);

  const applicantName = document.querySelector("#applicantName").value || "未入力";
  const department = document.querySelector("#department").value || "未入力";
  const email = document.querySelector("#email").value || "未入力";
  const phone = document.querySelector("#phone").value || "未入力";
  const purpose = document.querySelector("#purpose").value || "未入力";
  const notes = document.querySelector("#notes").value || "特記事項なし";

  previewPanel.innerHTML = `
    <div class="preview-block">
      <strong>利用施設</strong>
      <p>${selectedFacilityNames.length > 0 ? selectedFacilityNames.join(" / ") : "未選択"}</p>
    </div>
    <div class="preview-block">
      <strong>利用日時</strong>
      <p>${state.selectedSlots.map((slot) => `${slot.date} ${slot.start}-${slot.end}`).join("<br />")}</p>
    </div>
    <div class="preview-block">
      <strong>申請者情報</strong>
      <p>${applicantName} / ${department}</p>
      <p class="preview-muted">${email} / ${phone}</p>
    </div>
    <div class="preview-block">
      <strong>利用目的・備考</strong>
      <p>${purpose}</p>
      <p class="preview-muted">${notes}</p>
    </div>
  `;
}

function render() {
  renderFacilities();
  renderDates();
  renderSlots();
  renderPreview();
}

function addDate() {
  const date = dateInput.value;

  if (!date || state.selectedDates.includes(date)) {
    return;
  }

  state.selectedDates = [...state.selectedDates, date].sort();
  renderDates();
  renderPreview();
}

function addSlot() {
  const start = startTimeInput.value;
  const end = endTimeInput.value;

  if (state.selectedDates.length === 0 || !start || !end) {
    return;
  }

  const nextSlots = state.selectedDates
    .filter(
      (date) =>
        !state.selectedSlots.some(
          (slot) => slot.date === date && slot.start === start && slot.end === end
        )
    )
    .map((date) => ({
      id: Date.now() + Math.floor(Math.random() * 10000),
      date,
      start,
      end,
    }));

  if (nextSlots.length === 0) {
    return;
  }

  state.selectedSlots = [...state.selectedSlots, ...nextSlots].sort((a, b) =>
    `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)
  );

  render();
}

function handleSubmit(event) {
  event.preventDefault();
  renderPreview();
  window.alert("確認画面へ進む想定のモックです。");
}

facilityOptions.addEventListener("change", () => {
  state.selectedFacilityIds = [...facilityOptions.querySelectorAll('input[type="checkbox"]:checked')].map(
    (input) => input.value
  );
  renderPreview();
});

selectedSlots.addEventListener("click", (event) => {
  const button = event.target.closest("[data-slot-id]");
  if (!button) {
    return;
  }

  state.selectedSlots = state.selectedSlots.filter(
    (slot) => String(slot.id) !== button.dataset.slotId
  );
  render();
});

selectedDates.addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button) {
    return;
  }

  state.selectedDates = state.selectedDates.filter((date) => date !== button.dataset.date);
  renderDates();
  renderPreview();
});

addDateButton.addEventListener("click", addDate);
addSlotButton.addEventListener("click", addSlot);

reservationForm.addEventListener("input", renderPreview);
reservationForm.addEventListener("submit", handleSubmit);

render();
