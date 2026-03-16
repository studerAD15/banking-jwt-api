const API = {
  health: "/api/health",
  login: "/api/auth/login",
  register: "/api/auth/register",
  account: "/api/account"
};

const storageKey = "banking_jwt_token";

const elements = {
  healthStatus: document.getElementById("healthStatus"),
  healthMessage: document.getElementById("healthMessage"),
  feedback: document.getElementById("feedback"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  logoutButton: document.getElementById("logoutButton"),
  accountEmpty: document.getElementById("accountEmpty"),
  accountCard: document.getElementById("accountCard"),
  accountName: document.getElementById("accountName"),
  accountEmail: document.getElementById("accountEmail"),
  accountId: document.getElementById("accountId"),
  accountCreatedAt: document.getElementById("accountCreatedAt"),
  accountBalance: document.getElementById("accountBalance")
};

const tabButtons = [...document.querySelectorAll(".tab-button")];
const forms = [...document.querySelectorAll(".form")];

const setFeedback = (message, type = "") => {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${type}`.trim();
};

const getToken = () => localStorage.getItem(storageKey);

const setToken = (token) => {
  if (token) {
    localStorage.setItem(storageKey, token);
    return;
  }

  localStorage.removeItem(storageKey);
};

const formatCurrency = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
}).format(value || 0);

const showAccountState = (user) => {
  if (!user) {
    elements.accountCard.classList.add("hidden");
    elements.accountEmpty.classList.remove("hidden");
    return;
  }

  elements.accountName.textContent = user.name || "-";
  elements.accountEmail.textContent = user.email || "-";
  elements.accountId.textContent = user._id || user.id || "-";
  elements.accountCreatedAt.textContent = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "-";
  elements.accountBalance.textContent = formatCurrency(user.balance);
  elements.accountEmpty.classList.add("hidden");
  elements.accountCard.classList.remove("hidden");
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const loadHealth = async () => {
  try {
    const data = await request(API.health);
    elements.healthStatus.textContent = "Online";
    elements.healthMessage.textContent = data.message;
  } catch (error) {
    elements.healthStatus.textContent = "Offline";
    elements.healthMessage.textContent = error.message;
  }
};

const loadAccount = async () => {
  const token = getToken();

  if (!token) {
    showAccountState(null);
    return;
  }

  try {
    const data = await request(API.account, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    showAccountState(data.user);
  } catch (error) {
    setToken("");
    showAccountState(null);
    setFeedback(error.message, "error");
  }
};

const handleAuthSuccess = async (data) => {
  setToken(data.token);
  setFeedback(data.message, "success");
  showAccountState(data.user);
  await loadAccount();
};

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFeedback("Signing in...");
  const form = event.currentTarget;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const data = await request(API.login, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    await handleAuthSuccess(data);
    form.reset();
  } catch (error) {
    setFeedback(error.message, "error");
  }
});

elements.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFeedback("Creating account...");
  const form = event.currentTarget;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const data = await request(API.register, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    await handleAuthSuccess(data);
    form.reset();
  } catch (error) {
    setFeedback(error.message, "error");
  }
});

elements.logoutButton.addEventListener("click", () => {
  setToken("");
  showAccountState(null);
  setFeedback("Session cleared", "success");
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((tabButton) => tabButton.classList.remove("active"));
    forms.forEach((form) => form.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`[data-form="${button.dataset.tab}"]`).classList.add("active");
    setFeedback("");
  });
});

loadHealth();
loadAccount();
