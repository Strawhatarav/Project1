
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
