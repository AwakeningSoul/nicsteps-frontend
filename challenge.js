
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

const API_BASE = LOCAL_HOSTS.includes(window.location.hostname)
  ? "http://localhost:3000"
  : "https://nicsteps-backend-production.up.railway.app";

async function loadLeaderboard() {
  const container = document.getElementById("leaderboard");

  try {
    const response = await fetch(
      `${API_BASE}/api/challenge/leaderboard`
    );

    if (!response.ok) {
      throw new Error("Unable to load leaderboard.");
    }

    const data = await response.json();

    container.replaceChildren();

    if (!data.success || !data.leaderboard.length) {
      container.textContent = "No verified leaderboard entries yet. Be the first to take part!";
      return;
    }

    const table = document.createElement("table");
    table.className = "leaderboard-table";

    const headings = [
      "Nickname",
      "Daily Target",
      "Verified Steps",
      "Points"
    ];

    const headerRow = document.createElement("tr");

    headings.forEach(heading => {
      const th = document.createElement("th");
      th.textContent = heading;
      headerRow.appendChild(th);
    });

    const thead = document.createElement("thead");
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    let currentRank = 0;
let previousPoints = null;

data.leaderboard.forEach((participant, index) => {
  const points = Number(participant.points);

  if (points !== previousPoints) {
    currentRank = index + 1;
  }

  previousPoints = points;
      const row = document.createElement("tr");

      const values = [
        `${currentRank}. ${participant.nickname}`,
        participant.dailyTarget,
        Number(participant.verifiedSteps).toLocaleString("en-GB"),
        Number(participant.points).toLocaleString("en-GB")
      ];

      values.forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

  } catch (error) {
    console.error("Leaderboard error:", error);
    container.textContent =
      "The leaderboard is temporarily unavailable. Please try again later.";
  }
}

loadLeaderboard();

// NICSTEPS 28 Day Challenge Countdown

const challengeLaunch = new Date("2026-11-09T00:00:00Z");
const challengeEnd = new Date("2026-12-07T00:00:00Z");
const reportingDeadline = new Date("2026-12-14T00:00:00Z");

function updateChallengeCountdown() {
  const countdown = document.getElementById("challenge-countdown");
  const label = document.querySelector(".countdown-label");
  const message = document.getElementById("countdown-message");

  if (!countdown || !label || !message) return;

  const now = new Date();

  let target;
  let currentMessage;

  if (now < challengeLaunch) {
    target = challengeLaunch;
    label.textContent = "THE CHALLENGE BEGINS IN";
    currentMessage = "Get ready to take your first step.";
  } else if (now < challengeEnd) {
    target = challengeEnd;
    label.textContent = "TIME LEFT IN THE CHALLENGE";
    currentMessage = "Keep moving. Every step counts!";
  } else if (now < reportingDeadline) {
    target = reportingDeadline;
    label.textContent = "TIME LEFT TO SUBMIT YOUR REPORTS";
    currentMessage = "The challenge has ended, but you can still submit missed reports.";
  } else {
    label.textContent = "CHALLENGE COMPLETE";
    countdown.textContent = "28 days. One step at a time.";
    message.textContent = "Reporting is now closed. Thank you for taking part!";
    return;
  }

  const difference = Math.max(0, target - now);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  countdown.innerHTML = `
    <div class="countdown-unit">${days}<span>Days</span></div>
    <div class="countdown-unit">${hours}<span>Hours</span></div>
    <div class="countdown-unit">${minutes}<span>Minutes</span></div>
    <div class="countdown-unit">${seconds}<span>Seconds</span></div>
  `;

  message.textContent = currentMessage;
}

updateChallengeCountdown();
setInterval(updateChallengeCountdown, 1000);

// NICSTEPS registration and weekly report access

function updateChallengeAccess() {
  const registrationLink = document.getElementById("registration-link");
  const weeklyReportLink = document.getElementById("weekly-report-link");

  const now = new Date();

  const registrationOpens = new Date("2026-11-09T00:00:00Z");
  const reportsOpen = new Date("2026-11-16T00:00:00Z");
  const reportingCloses = new Date("2026-12-14T00:00:00Z");

  function setLinkAccess(link, isOpen, closedMessage) {
    if (!link) return;

    if (isOpen) {
      link.style.display = "";
      link.style.pointerEvents = "";
      link.style.opacity = "";
      link.removeAttribute("aria-disabled");
      link.removeAttribute("title");
    } else {
      link.style.pointerEvents = "none";
      link.style.opacity = "0.45";
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("title", closedMessage);
    }
  }

  setLinkAccess(
    registrationLink,
    now >= registrationOpens,
    "Registration opens on 9 November 2026."
  );

  setLinkAccess(
    weeklyReportLink,
    now >= reportsOpen && now < reportingCloses,
    "Weekly reports open on 16 November 2026 and close on 14 December 2026."
  );
}

updateChallengeAccess();
setInterval(updateChallengeAccess, 1000);
