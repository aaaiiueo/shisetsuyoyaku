const timeSlots = [
  { id: "morning", label: "午前", time: "07:00-12:00" },
  { id: "afternoon", label: "午後", time: "12:00-17:00" },
  { id: "night", label: "夜間", time: "17:00-21:00" },
];

const facilities = [
  { id: "room-51", group: "御器所キャンパス 講義室", floor: "51号館", name: "講義室", useTime: "土日祝 7:00-21:00" },
  { id: "room-52-53", group: "御器所キャンパス 講義室", floor: "52・53号館", name: "講義室", useTime: "土日祝 7:00-21:00" },
  { id: "room-23", group: "御器所キャンパス 講義室", floor: "23号館", name: "講義室", useTime: "土日祝 7:00-21:00" },
  { id: "room-1", group: "御器所キャンパス 講義室", floor: "1号館", name: "講義室", useTime: "土日祝 7:00-21:00" },
  { id: "room-2", group: "御器所キャンパス 講義室", floor: "2号館", name: "講義室", useTime: "土日祝 7:00-21:00" },
  { id: "room-3", group: "御器所キャンパス 講義室", floor: "3号館", name: "講義室", useTime: "土日祝 7:00-21:00" },
  { id: "room-12", group: "御器所キャンパス 講義室", floor: "12号館", name: "講義室", useTime: "土日祝 7:00-21:00" },
  { id: "room-24", group: "御器所キャンパス 講義室", floor: "24号館", name: "講義室", useTime: "土日祝 7:00-21:00" },
  { id: "hall-1f", group: "御器所キャンパス NITech Hall", floor: "1階", name: "ホール・ホワイエ", useTime: "毎日 8:00-21:00" },
  { id: "hall-2f", group: "御器所キャンパス NITech Hall", floor: "2階", name: "EPSON STUDIO", useTime: "休業期の土日祝 8:00-21:00" },
  { id: "chikusa-ground", group: "千種キャンパス", floor: "グラウンド", name: "サッカーフィールド", useTime: "毎日 8:00-18:00" },
];

const state = {
  viewedDate: new Date(2026, 5, 1),
  selectedSlots: [],
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDayLabel(date) {
  return ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
}

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getAvailability(facility, day, slotId) {
  const slotIndex = timeSlots.findIndex((slot) => slot.id === slotId);
  const date = new Date(state.viewedDate.getFullYear(), state.viewedDate.getMonth(), day);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const seed = day * 9 + facility.id.length * 4 + slotIndex * 13 + state.viewedDate.getMonth();

  if (facility.group.includes("講義室") && !isWeekend) {
    return "closed";
  }
  if (facility.id === "hall-2f" && !isWeekend) {
    return "closed";
  }
  if (facility.id === "chikusa-ground" && slotId === "night") {
    return "closed";
  }
  if (seed % 13 === 0) {
    return "closed";
  }
  if (seed % 6 === 0 || seed % 8 === 0) {
    return "booked";
  }
  if (seed % 5 === 0) {
    return "limited";
  }
  return "open";
}

function getStatusMark(status) {
  return { open: "○", limited: "△", booked: "×", closed: "-" }[status];
}

function getStatusLabel(status) {
  return {
    open: "空きあり",
    limited: "残りわずか",
    booked: "予約不可",
    closed: "休館・受付外",
  }[status];
}

function isSelectable(status) {
  return status === "open" || status === "limited";
}

function setupGlobalMenu() {
  const header = document.querySelector(".site-header");
  const button = document.querySelector(".menu-button");
  if (!header || !button) {
    return;
  }

  button.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });
}

function setupCalendar() {
  const calendarHead = document.querySelector("#calendarHead");
  const calendarBody = document.querySelector("#calendarBody");
  const currentMonth = document.querySelector("#currentMonth");
  const prevMonth = document.querySelector("#prevMonth");
  const nextMonth = document.querySelector("#nextMonth");
  const buildingFilter = document.querySelector("#buildingFilter");
  const timeFilter = document.querySelector("#timeFilter");
  const availableOnly = document.querySelector("#availableOnly");
  const selectedSlots = document.querySelector("#selectedSlots");

  if (!calendarHead || !calendarBody || !currentMonth) {
    return;
  }

  const getFilteredFacilities = () => {
    const group = buildingFilter.value;
    return facilities.filter((facility) => group === "all" || facility.group === group);
  };

  const getVisibleSlots = () => {
    const selected = timeFilter.value;
    return timeSlots.filter((slot) => selected === "all" || slot.id === selected);
  };

  const renderBuildingFilter = () => {
    const groups = [...new Set(facilities.map((facility) => facility.group))];
    buildingFilter.innerHTML = [
      `<option value="all">すべて</option>`,
      ...groups.map((group) => `<option value="${group}">${group}</option>`),
    ].join("");
  };

  const renderHead = () => {
    const days = getDaysInMonth(state.viewedDate);
    const slots = getVisibleSlots();
    const year = state.viewedDate.getFullYear();
    const month = state.viewedDate.getMonth();
    const dateHeads = Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      const date = new Date(year, month, day);
      const weekend = date.getDay() === 0 ? " sunday" : date.getDay() === 6 ? " saturday" : "";
      return `<th class="date-head${weekend}" colspan="${slots.length}">${pad(day)}(${getDayLabel(date)})</th>`;
    }).join("");
    const slotHeads = Array.from({ length: days }, () =>
      slots.map((slot) => `<th class="slot-head">${slot.label}</th>`).join("")
    ).join("");

    calendarHead.innerHTML = `
      <tr>
        <th class="sticky room-spacer" colspan="2"></th>
        ${dateHeads}
      </tr>
      <tr>
        <th class="sticky room-head">部屋名</th>
        <th class="sticky capacity-head">使用可能日時</th>
        ${slotHeads}
      </tr>
    `;
  };

  const renderBody = () => {
    const days = getDaysInMonth(state.viewedDate);
    const slots = getVisibleSlots();
    const rows = [];
    let groupName = "";

    getFilteredFacilities().forEach((facility) => {
      if (facility.group !== groupName) {
        groupName = facility.group;
        rows.push(`<tr class="group-row"><th colspan="${days * slots.length + 2}">${facility.group}</th></tr>`);
      }

      const cells = Array.from({ length: days }, (_, index) => {
        const day = index + 1;
        const date = new Date(state.viewedDate.getFullYear(), state.viewedDate.getMonth(), day);
        const dateValue = formatDate(date);

        return slots
          .map((slot) => {
            const status = getAvailability(facility, day, slot.id);
            const key = `${facility.id}-${dateValue}-${slot.id}`;
            const selected = state.selectedSlots.some((item) => item.key === key);
            const dim = availableOnly.checked && !isSelectable(status) ? " dimmed" : "";
            const selectedClass = selected ? " selected" : "";
            const label = `${dateValue} ${facility.name} ${slot.label} ${getStatusLabel(status)}`;

            if (!isSelectable(status)) {
              return `<td class="status status-${status}${dim}" aria-label="${label}"><span>${getStatusMark(status)}</span></td>`;
            }

            return `
              <td class="status status-${status}${selectedClass}" aria-label="${label}">
                <button type="button" data-key="${key}" data-facility="${facility.id}" data-date="${dateValue}" data-slot="${slot.id}" aria-pressed="${selected}">
                  ${getStatusMark(status)}
                </button>
              </td>
            `;
          })
          .join("");
      }).join("");

      rows.push(`
        <tr>
          <th class="sticky room-name"><span>${facility.floor}</span>${facility.name}</th>
          <td class="sticky capacity">${facility.useTime}</td>
          ${cells}
        </tr>
      `);
    });

    calendarBody.innerHTML = rows.join("");
  };

  const renderSelected = () => {
    if (!selectedSlots) {
      return;
    }
    if (state.selectedSlots.length === 0) {
      selectedSlots.innerHTML = `<div class="empty-note">まだ候補が選択されていません。</div>`;
      return;
    }

    selectedSlots.innerHTML = state.selectedSlots
      .map((item) => {
        const facility = facilities.find((entry) => entry.id === item.facilityId);
        const slot = timeSlots.find((entry) => entry.id === item.slotId);
        return `
          <article class="selected-slot">
            <div>
              <strong>${facility.name}</strong>
              <p>${item.date} ${slot.label} ${slot.time}</p>
            </div>
            <button type="button" data-remove="${item.key}" aria-label="${facility.name}を削除">×</button>
          </article>
        `;
      })
      .join("");
  };

  const render = () => {
    currentMonth.textContent = `${state.viewedDate.getFullYear()}年 ${pad(state.viewedDate.getMonth() + 1)}月`;
    renderHead();
    renderBody();
    renderSelected();
  };

  const changeMonth = (amount) => {
    state.viewedDate = new Date(state.viewedDate.getFullYear(), state.viewedDate.getMonth() + amount, 1);
    render();
  };

  renderBuildingFilter();
  render();

  prevMonth.addEventListener("click", () => changeMonth(-1));
  nextMonth.addEventListener("click", () => changeMonth(1));
  buildingFilter.addEventListener("change", render);
  timeFilter.addEventListener("change", render);
  availableOnly.addEventListener("change", render);

  calendarBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-key]");
    if (!button) {
      return;
    }

    const key = button.dataset.key;
    const exists = state.selectedSlots.some((item) => item.key === key);
    if (exists) {
      state.selectedSlots = state.selectedSlots.filter((item) => item.key !== key);
    } else {
      state.selectedSlots = [
        ...state.selectedSlots,
        {
          key,
          facilityId: button.dataset.facility,
          date: button.dataset.date,
          slotId: button.dataset.slot,
        },
      ];
    }
    render();
  });

  selectedSlots?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) {
      return;
    }
    state.selectedSlots = state.selectedSlots.filter((item) => item.key !== button.dataset.remove);
    render();
  });
}

function setupMockForms() {
  document.querySelectorAll("form[data-mock-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      window.alert(form.dataset.message || "入力内容を受け付けました。");
    });
  });
}

setupGlobalMenu();
setupCalendar();
setupMockForms();
