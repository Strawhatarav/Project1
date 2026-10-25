/*=======================js for invitation=======================*/

"use strict";

/*=======================HELPER FUNCTIONS=======================*/

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

function setText(selector, text) {
  const element = $(selector);
  if (element) element.textContent = text;
}

function setReaction(selector, message) {
  const element = $(selector);
  if (!element) return;

  element.textContent = message;

  // Restart the reaction animation.
  element.classList.remove("pop");
  void element.offsetWidth;
  element.classList.add("pop");
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatTime(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${String(hours12).padStart(2, "0")}:${String(minutes)
    .padStart(2, "0")} ${suffix}`;
}

/*=======================SHARED INVITATION STATE=======================*/

const invitation = {
  date: null,
  timeMinutes: 19 * 60,
  place: "",
  customPlace: "",
  company: "",
  customCompany: ""
};

/*=======================SCENE NAVIGATION=======================*/

function showScene(sceneId) {
  const nextScene = document.getElementById(sceneId);

  if (!nextScene) {
    console.error(`Cannot find scene: ${sceneId}`);
    return;
  }

  $$(".scene").forEach((scene) => {
    scene.classList.remove("active");
    scene.hidden = true;
  });

  nextScene.hidden = false;
  nextScene.classList.add("active");

  // Move keyboard focus to the new scene heading when possible.
  const heading = $("h1, h2", nextScene);

  if (heading) {
    if (!heading.hasAttribute("tabindex")) {
      heading.setAttribute("tabindex", "-1");
    }

    heading.focus({ preventScroll: true });
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}


// Generic navigation for buttons using data-next.
$$("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    showScene(button.dataset.next);
  });
});

/*=======================SCENE 1: envelope animation=======================*/

document.addEventListener("DOMContentLoaded", () => {
  const envelope = document.querySelector("#envelope");

  if (!envelope) {
    console.error("Could not find #envelope.");
    return;
  }

  // Original entrance: 1s delay + 2s animation
  const entranceDelay = 1000;
  const entranceDuration = 2000;

  // Original animation durations
  const shakeDuration = 2000;
  const movementDuration = 4000;
  const flapDuration = 2000;

  // 1. Wait for the entrance to finish, then shake.
  setTimeout(() => {
    envelope.classList.add("shake");

    // 2. After shaking, move the envelope downward.
    setTimeout(() => {
      envelope.classList.remove("shake");
      envelope.classList.add("opening");

      // 3. After downward movement, open the flap.
      setTimeout(() => {
        envelope.classList.add("flap-open");

        // 4. After flap opening, let the letter emerge.
        setTimeout(() => {
          envelope.classList.add("letter-out");
          envelope.classList.add("open");
        }, flapDuration);

      }, movementDuration);

    }, shakeDuration);

  }, entranceDelay + entranceDuration);
});

/*=======================SCENE 2: Missed buttons=======================*/

const missedYes = $("#missed-yes");
const missedNo = $("#missed-no");

let missedNoAttempts = 0;

missedYes?.addEventListener("click", () => {
  setReaction(
    "#missed-reaction",
    "Hehe, I knew it! Now I have another question. 👀"
  );

  showScene("scene-hangout");
});

missedNo?.addEventListener("click", () => {
  missedNoAttempts++;

  // Playful shrinking, with a minimum size so the button
  // remains accessible rather than disappearing forever.
  const scale = Math.max(0.65, 1 - missedNoAttempts * 0.08);

  missedNo.style.transform = `scale(${scale})`;

  const messages = [
    "Excuse me?! 😭 Try that answer again.",
    "Hmm. I'm not convinced. 👀",
    "The evidence says otherwise. 😂",
    "Okay okay, I'll stop teasing you!"
  ];

  setReaction(
    "#missed-reaction",
    messages[Math.min(missedNoAttempts - 1, messages.length - 1)]
  );
});

document.addEventListener("DOMContentLoaded", () => {
  const navigationButtons = document.querySelectorAll("[data-next]");

  navigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextSceneId = button.dataset.next;
      const nextScene = document.getElementById(nextSceneId);

      if (!nextScene) {
        console.error(`Scene not found: ${nextSceneId}`);
        return;
      }

      document.querySelectorAll(".scene").forEach((scene) => {
        scene.hidden = true;
        scene.classList.remove("active");
      });

      nextScene.hidden = false;
      nextScene.classList.add("active");
    });
  });
});

/*Missed buttons*/
document.addEventListener("DOMContentLoaded", () => {
  const yesButton = document.querySelector("#missed-yes");
  const noButton = document.querySelector("#missed-no");

  if (!yesButton || !noButton) return;

  const buttonGroup = noButton.closest(".button-group");
  if (!buttonGroup) return;

  let attempts = 0;
  const maxAttempts = 4;

  // How much space each button receives.
  const yesGrowth = [1.25, 1.7, 2.5, 8];
  const noGrowth = [0.75, 0.5, 0.25, 0];

  // Small movements so No dances without covering Yes.
  const danceMoves = [
    { x: -8, y: -12 },
    { x: 10, y: 10 },
    { x: -12, y: 5 },
    { x: 8, y: -8 }
  ];

  function dodgeNo(event) {
    event.preventDefault();

    if (attempts >= maxAttempts) return;

    const move = danceMoves[attempts];

    attempts++;

    // Let Yes take more of the available flex space.
    yesButton.style.setProperty(
      "--yes-grow",
      yesGrowth[attempts - 1]
    );

    // Let No release its share of the available space.
    noButton.style.setProperty(
      "--no-grow",
      noGrowth[attempts - 1]
    );

    // Animate No dancing within its own area.
    noButton.style.setProperty("--no-x", `${move.x}px`);
    noButton.style.setProperty("--no-y", `${move.y}px`);

    if (attempts === maxAttempts) {
      noButton.classList.add("no-disappear");
      noButton.disabled = true;
      noButton.setAttribute("aria-hidden", "true");

      yesButton.focus({ preventScroll: true });
    }
  }

  // Clicking No triggers the effect.
  noButton.addEventListener("click", dodgeNo);

});

/*=======================SCENE 3: Wanna hangout?=======================*/

const hangoutYes = $("#hangout-yes");
const hangoutNo = $("#hangout-no");
console.log("Hangout NO button:", hangoutNo);

/* =======================YES BUTTON=======================*/

hangoutYes?.addEventListener("click", () => {
  setReaction(
    "#date-reaction",
    "Excellent. Now, when are you free? 💗"
  );

  showScene("scene-date");
});


/* =======================NO BUTTON: FIVE-POSITION ESCAPE LOOP=======================*/

if (hangoutNo) {

const positions = [
  { x: 0,    y: 0    },  // 1. Original position: bottom
  { x: -750, y: 100  },  // 3. Left
  { x: -600, y: -400 },  // 2. Upper-left
  { x: 370,  y: -450 },  // 4. Upper-right
  { x: 300,  y: 100  }   // 5. Right
];

  const reactions = [
    "Hey! You almost caught me! 😳",
    "Nope! Try again! 💨",
    "Almost! But not quite! 😂",
    "You really want to catch me, huh? 👀",
    "I'm back where I started! 💗"
  ];

  let currentPosition = 0;
  let movementCount = 0;
  let canEscape = true;

  const escapeDistance = 75;

  document.addEventListener("pointermove", (event) => {

    // Ignore touch movement.
    if (event.pointerType === "touch") return;

    if (!canEscape) return;

    const rect = hangoutNo.getBoundingClientRect();

    // Find the closest point on the button to the cursor.
    const closestX = Math.max(
      rect.left,
      Math.min(event.clientX, rect.right)
    );

    const closestY = Math.max(
      rect.top,
      Math.min(event.clientY, rect.bottom)
    );

    const distance = Math.hypot(
      event.clientX - closestX,
      event.clientY - closestY
    );

    // Move only when the cursor gets close to the button.
    if (distance <= escapeDistance) {

      canEscape = false;

      currentPosition =
        (currentPosition + 1) % positions.length;

      const position = positions[currentPosition];

      hangoutNo.style.transform =
        `translate(${position.x}px, ${position.y}px)`;

      setReaction(
        "#hangout-reaction",
        reactions[movementCount % reactions.length]
      );

      movementCount++;

      setTimeout(() => {
        canEscape = true;
      }, 350);
    }

  });
}

/* ================================= SCENE 4: Calendar ================================= */

const calendarDays = $("#calendar-days");
const calendarMonth = $("#calendar-month");
const selectedDateOutput = $("#selected-date");

const previousMonthButton = $("#previous-month");
const nextMonthButton = $("#next-month");
const confirmDateButton = $("#confirm-date");

const today = new Date();
today.setHours(0, 0, 0, 0);

let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);

function renderCalendar() {
  if (!calendarDays || !calendarMonth) return;

  calendarDays.replaceChildren();

  calendarMonth.textContent = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric"
  }).format(visibleMonth);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstWeekday = new Date(year, month, 1).getDay();
  const numberOfDays = new Date(year, month + 1, 0).getDate();

  // Blank cells before the first day of the month.
  for (let i = 0; i < firstWeekday; i++) {
    const blank = document.createElement("span");
    blank.className = "calendar-empty";
    blank.setAttribute("aria-hidden", "true");
    calendarDays.append(blank);
  }

  for (let day = 1; day <= numberOfDays; day++) {
    const date = new Date(year, month, day);
    const dateKey = localDateKey(date);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = String(day);
    button.dataset.date = dateKey;

    button.setAttribute("aria-label", formatDate(date));

    // Do not allow dates before today.
    if (date < today) {
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
    }

    if (invitation.date && dateKey === localDateKey(invitation.date)) {
      button.classList.add("selected");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }

    button.addEventListener("click", () => {
      invitation.date = date;

      renderCalendar();

      if (selectedDateOutput) {
        selectedDateOutput.textContent = formatDate(date);
        selectedDateOutput.dateTime = dateKey;
      }

      setReaction(
        "#date-reaction",
        `Oho, ${formatDate(date)}? I'll keep that in mind. 💗`
      );
    });

    calendarDays.append(button);
  }

  // Don't allow navigating into a month before the current one.
  if (previousMonthButton) {
    previousMonthButton.disabled =
      year === today.getFullYear() && month === today.getMonth();
  }

  if (nextMonthButton) {
    nextMonthButton.disabled = false;
  }
}

previousMonthButton?.addEventListener("click", () => {
  visibleMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() - 1,
    1
  );

  renderCalendar();
});

nextMonthButton?.addEventListener("click", () => {
  visibleMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    1
  );

  renderCalendar();
});

confirmDateButton?.addEventListener("click", () => {
  if (!invitation.date) {
    setReaction("#date-reaction", "Pick a date first, silly. 💗");
    return;
  }

  showScene("scene-time");
});

renderCalendar();

/* ================================= SCENE 5: Clock ================================= */

// DOM elements
const clock = $("#clock");
const hourHand = $("#hour-hand");
const minuteHand = $("#minute-hand");
const selectedTimeOutput = $("#selected-time");
const manualTimeInput = $("#manual-time");
const editTimeButton = $("#edit-time");
const confirmTimeButton = $("#confirm-time");

// Track which clock hand is being dragged.
let activeClockHand = null;


/* ===========================
   === UPDATE CLOCK DISPLAY ===
   =========================== */

function updateClockDisplay() {
  // Keep the time within a 24-hour day.
  invitation.timeMinutes =
    ((invitation.timeMinutes % 1440) + 1440) % 1440;

  const hours24 = Math.floor(invitation.timeMinutes / 60);
  const minutes = invitation.timeMinutes % 60;

  // Update the visible selected-time display.
  if (selectedTimeOutput) {
    selectedTimeOutput.textContent =
      formatTime(invitation.timeMinutes);
  }

  // Calculate the clock-hand angles.
  const hourAngle =
    ((hours24 % 12) + minutes / 60) * 30;

  const minuteAngle = minutes * 6;

  // Rotate the hour hand.
  if (hourHand) {
    hourHand.style.transform =
      `translateX(-50%) rotate(${hourAngle}deg)`;
  }

  // Rotate the minute hand.
  if (minuteHand) {
    minuteHand.style.transform =
      `translateX(-50%) rotate(${minuteAngle}deg)`;
  }

  // Keep the manual input synchronized.
  if (manualTimeInput) {
    manualTimeInput.value =
      formatTime(invitation.timeMinutes);
  }
}


/* ===========================
   === MANUAL TIME EDITING ===
   =========================== */

// Clicking the displayed time opens the text input.
editTimeButton?.addEventListener("click", () => {
  if (!manualTimeInput) return;

  // Display the current selected time in the input.
  manualTimeInput.value =
    formatTime(invitation.timeMinutes);

  // Show the input and hide the display button.
  manualTimeInput.hidden = false;
  editTimeButton.hidden = true;

  // Focus the input and select its current text.
  manualTimeInput.focus();
  manualTimeInput.select();
});


/* ===========================
   === PARSE MANUAL TIME ===
   =========================== */

// Convert a time such as "07:30 PM" into minutes since midnight.
function parseManualTime(value) {
  const match = value.trim().match(
    /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i
  );

  // Reject invalid formats.
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  // Convert 12-hour time to 24-hour time.
  if (period === "AM" && hours === 12) {
    hours = 0;
  } else if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  return hours * 60 + minutes;
}


/* ===========================
   === FINISH TIME EDITING ===
   =========================== */

function finishTimeEditing() {
  if (!manualTimeInput || manualTimeInput.hidden) {
    return;
  }

  const parsedTime =
    parseManualTime(manualTimeInput.value);

  if (parsedTime === null) {
    // Invalid input: restore the previous valid time.
    updateClockDisplay();
  } else {
    // Save the newly selected time.
    invitation.timeMinutes = parsedTime;

    // Update the display and both clock hands.
    updateClockDisplay();
  }

  // Return to the normal selected-time display.
  manualTimeInput.hidden = true;
  editTimeButton.hidden = false;
}


// Press Enter to confirm or Escape to cancel.
manualTimeInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    finishTimeEditing();
  }

  if (event.key === "Escape") {
    event.preventDefault();

    // Restore the previously selected time.
    updateClockDisplay();

    manualTimeInput.hidden = true;
    editTimeButton.hidden = false;

    editTimeButton.focus();
  }
});


// Finish editing when the user leaves the input.
manualTimeInput?.addEventListener("blur", () => {
  finishTimeEditing();
});


/* ===========================
   === CLOCK ANGLE CALCULATION ===
   =========================== */

function angleFromPointer(event) {
  if (!clock) return 0;

  const rect = clock.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;

  // Zero degrees points toward 12 o'clock.
  const angle =
    Math.atan2(dx, -dy) * 180 / Math.PI;

  return (angle + 360) % 360;
}


/* ===========================
   === UPDATE TIME FROM CLOCK ===
   =========================== */

function updateClockFromPointer(event, hand) {
  const angle = angleFromPointer(event);

  if (hand === "minute") {
    // Each 6 degrees represents one minute.
    const minute = Math.round(angle / 6) % 60;

    // Preserve the selected hour.
    const hour =
      Math.floor(invitation.timeMinutes / 60);

    invitation.timeMinutes =
      hour * 60 + minute;
  }

  if (hand === "hour") {
    // Each 30 degrees represents one hour.
    const hourOnFace =
      Math.round(angle / 30) % 12;

    const currentHour24 =
      Math.floor(invitation.timeMinutes / 60);

    // Preserve AM/PM.
    const isPM = currentHour24 >= 12;

    let newHour = hourOnFace;

    if (isPM) {
      newHour += 12;
    }

    // Preserve the currently selected minutes.
    const currentMinutes =
      invitation.timeMinutes % 60;

    invitation.timeMinutes =
      newHour * 60 + currentMinutes;
  }

  // Update the displayed time and both hands.
  updateClockDisplay();
}


/* ===========================
   === CLOCK DRAGGING ===
   =========================== */

function startClockDrag(event, hand) {
  event.preventDefault();

  activeClockHand = hand;

  // Capture the pointer on the clock itself.
  // This matches the element listening for pointer movement.
  clock?.setPointerCapture?.(event.pointerId);

  updateClockFromPointer(event, hand);
}


function continueClockDrag(event) {
  if (!activeClockHand) return;

  updateClockFromPointer(event, activeClockHand);
}


function stopClockDrag() {
  activeClockHand = null;
}


// Begin dragging the hour hand.
hourHand?.addEventListener("pointerdown", (event) => {
  startClockDrag(event, "hour");
});


// Begin dragging the minute hand.
minuteHand?.addEventListener("pointerdown", (event) => {
  startClockDrag(event, "minute");
});


// Continue dragging while the pointer moves.
clock?.addEventListener("pointermove", continueClockDrag);


// Stop dragging when the pointer is released or cancelled.
clock?.addEventListener("pointerup", stopClockDrag);
clock?.addEventListener("pointercancel", stopClockDrag);


// Also stop dragging if pointer capture is lost.
clock?.addEventListener("lostpointercapture", stopClockDrag);


/* ===========================
   === SET TIME BUTTON ===
   =========================== */

confirmTimeButton?.addEventListener("click", () => {
  // Finish editing first if the input is open.
  if (manualTimeInput && !manualTimeInput.hidden) {
    const parsedTime =
      parseManualTime(manualTimeInput.value);

    if (parsedTime === null) {
      // Keep the existing valid time if input is invalid.
      updateClockDisplay();
    } else {
      invitation.timeMinutes = parsedTime;
      updateClockDisplay();
    }

    manualTimeInput.hidden = true;

    if (editTimeButton) {
      editTimeButton.hidden = false;
    }
  }

  // Update the reaction on the next scene.
  setReaction(
    "#place-reaction",
    `${formatTime(invitation.timeMinutes)} it is! Now, where to? ✨`
  );

  // Navigate to the place-selection scene.
  showScene("scene-place");
});


/* ===========================
   === INITIALIZE CLOCK ===
   =========================== */

updateClockDisplay();

