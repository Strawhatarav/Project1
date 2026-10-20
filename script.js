// ======================================================
// ANIME INVITATION WEBSITE
// Complete JavaScript controller
// ======================================================

"use strict";

// ======================================================
// 1. HELPER FUNCTIONS
// ======================================================

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


// ======================================================
// 2. SHARED INVITATION STATE
// Stores the visitor's selections.
// ======================================================

const invitation = {
  date: null,
  timeMinutes: 19 * 60,
  place: "",
  customPlace: "",
  company: "",
  customCompany: ""
};


// ======================================================
// 3. SCENE NAVIGATION
// ======================================================

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


/* ================================= SCENE 1: envelope animation ================================= */

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

/* ================================= SCENE 2: Missed buttons ================================= */

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

/* ================================= SCENE 2: Missed buttons ================================= */

document.addEventListener("DOMContentLoaded", () => {
  const yesButton = document.querySelector("#missed-yes");
  const noButton = document.querySelector("#missed-no");

  if (!yesButton || !noButton) return;

  const buttonGroup = noButton.closest(".button-group");
  if (!buttonGroup) return;

  let attempts = 0;
  const maxAttempts = 4;

  // How much space each button receives.
  const yesGrowth = [1.25, 1.7, 2.5, 4];
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

  // Uncomment this line if you also want No to dodge on hover.
  // noButton.addEventListener("pointerenter", dodgeNo);
});
