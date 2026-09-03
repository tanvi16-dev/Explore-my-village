/* =========================================================
   ExploreMyVillage — Interactions
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Mobile hamburger menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  // close mobile menu after tapping a link
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      mobileMenu.classList.remove("open");
    });
  });

  /* ---------- Smooth scroll for in-page nav links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- Highlight active nav link on scroll ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  });

  /* ---------- Animated stat counters ---------- */
  const stats = document.querySelectorAll(".stat__num");
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    stats.forEach((stat) => {
      const target = parseInt(stat.dataset.count, 10);
      const duration = 1200;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        stat.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(tick);
        else stat.textContent = target;
      }
      requestAnimationFrame(tick);
    });
  }

  const impactSection = document.querySelector(".impact");
  if (impactSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) animateStats();
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(impactSection);
  }

  /* ---------- Toast helper ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  /* ---------- Search box ---------- */
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document.getElementById("searchInput").value.trim();
    if (query) {
      showToast(`Searching villages for "${query}"...`);
    } else {
      showToast("Type a place or region to search.");
    }
    document.querySelector("#villages").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Hero buttons ---------- */
  document.getElementById("exploreVillagesBtn").addEventListener("click", () => {
    document.querySelector("#villages").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("planTripBtn").addEventListener("click", () => {
    document.querySelector("#planner").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- "Explore Village" / "View Experience" / "View Product" buttons ---------- */
  document.querySelectorAll(".village-card__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.closest(".village-card").querySelector("h3").textContent;
      showToast(`Opening ${name}'s village page...`);
    });
  });

  document.querySelectorAll(".exp-card__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.closest(".exp-card").querySelector("h3").textContent;
      showToast(`Opening "${name}"...`);
    });
  });

  document.querySelectorAll(".product-card button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.closest(".product-card").querySelector("h3").textContent;
      showToast(`Opening "${name}"...`);
    });
  });

  document.querySelector(".section__more .btn")?.addEventListener("click", () => {
    showToast("More villages coming soon!");
  });

  /* ---------- AI Trip Planner demo ---------- */
  const plannerForm = document.getElementById("plannerForm");
  const plannerResult = document.getElementById("plannerResult");
  const resultTitle = document.getElementById("resultTitle");
  const itineraryDays = document.getElementById("itineraryDays");
  const closeResult = document.getElementById("closeResult");

  const samplePlans = {
    short: [
      { day: "Day 1", text: "Arrive in the village, settle into a homestay, and join a sunset nature walk with a local guide." },
      { day: "Day 2", text: "Morning farm experience followed by a hands-on traditional cooking session with your host family." },
      { day: "Day 3", text: "Visit the local craft workshop, pick up a handmade souvenir, and depart in the afternoon." },
    ],
    medium: [
      { day: "Day 1", text: "Arrive and settle into your homestay. Evening welcome dinner cooked by your host family." },
      { day: "Day 2", text: "Sunrise farm experience, followed by a village nature walk through nearby trails." },
      { day: "Day 3", text: "Hands-on traditional cooking class, then free time to explore the local marketplace." },
      { day: "Day 4", text: "Handicraft workshop with a local artisan, followed by a folk music and dance evening." },
      { day: "Day 5", text: "Visit a neighbouring hamlet, shop for local products, and depart with new memories." },
    ],
    long: [
      { day: "Day 1", text: "Arrive, settle in, and enjoy a welcome dinner with your host family." },
      { day: "Day 2", text: "Sunrise farm experience and a guided nature walk through village trails." },
      { day: "Day 3", text: "Traditional cooking class followed by free time at the local marketplace." },
      { day: "Day 4", text: "Handicraft workshop with a local artisan and an evening cultural performance." },
      { day: "Day 5", text: "Day trip to a neighbouring village to meet another host community." },
      { day: "Day 6", text: "Relaxed morning, optional farming activity, and a farewell feast with the village." },
      { day: "Day 7", text: "Final souvenir shopping at the marketplace before departure." },
    ],
  };

  plannerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const budget = document.getElementById("budgetInput").value || "flexible";
    const days = parseInt(document.getElementById("daysInput").value, 10) || 3;
    const interests = document.getElementById("interestsInput").value || "a mix of village experiences";

    let plan;
    if (days <= 3) plan = samplePlans.short;
    else if (days <= 5) plan = samplePlans.medium;
    else plan = samplePlans.long;

    resultTitle.textContent = `A ${days}-Day Rural Escape`;

    itineraryDays.innerHTML = "";
    plan.forEach((item) => {
      const div = document.createElement("div");
      div.className = "itinerary__day";
      div.innerHTML = `<h4>${item.day}</h4><p>${item.text}</p>`;
      itineraryDays.appendChild(div);
    });

    const noteEl = document.querySelector(".planner__note");
    noteEl.textContent = `Built around a budget of ₹${budget} and an interest in ${interests}. This is a sample preview — full AI-personalized planning connects once our backend is live.`;

    plannerResult.hidden = false;
    document.body.style.overflow = "hidden";
  });

  closeResult.addEventListener("click", () => {
    plannerResult.hidden = true;
    document.body.style.overflow = "";
  });

  plannerResult.addEventListener("click", (e) => {
    if (e.target === plannerResult) {
      plannerResult.hidden = true;
      document.body.style.overflow = "";
    }
  });

  /* ---------- Modals: Login & Become a Host ---------- */
  const loginModal = document.getElementById("loginModal");
  const hostModal = document.getElementById("hostModal");

  function openModal(modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal(modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.getElementById("loginBtn").addEventListener("click", () => openModal(loginModal));
  document.getElementById("loginBtnMobile").addEventListener("click", () => openModal(loginModal));

  [document.getElementById("hostBtn"), document.getElementById("hostBtnMobile"), document.getElementById("ctaHostBtn")]
    .forEach((btn) => btn.addEventListener("click", () => openModal(hostModal)));

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.closest(".modal-overlay")));
  });

  [loginModal, hostModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(loginModal);
      closeModal(hostModal);
      plannerResult.hidden = true;
      document.body.style.overflow = "";
    }
  });

  document.getElementById("switchToHost").addEventListener("click", () => {
    closeModal(loginModal);
    openModal(hostModal);
  });

  /* ---------- Modal form submissions (demo only) ---------- */
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    closeModal(loginModal);
    showToast("Logged in! (demo only — backend not connected yet)");
    e.target.reset();
  });

  document.getElementById("hostForm").addEventListener("submit", (e) => {
    e.preventDefault();
    closeModal(hostModal);
    showToast("Application received! We'll be in touch soon.");
    e.target.reset();
  });

});