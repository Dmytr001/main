const API_KEY = "fd506010d65a0ed45fcd72f81b07b4c4";

const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const cityInput = document.getElementById("cityInput");
const checkBtn = document.getElementById("checkBtn");
const currentBox = document.getElementById("currentBox");
const forecastBox = document.getElementById("forecastBox");

checkBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", e => e.key === "Enter" && handleSearch());
cityInput.addEventListener("input", clearInputError);

function handleSearch() {
  const city = cityInput.value.trim();
  clearUI();
  if (!city) return setInputError("Nie wprowadzono nazwy miasta.");
  getCurrentXHR(city);
  getForecastFetch(city);
}

function getCurrentXHR(city) {
  const url = buildUrl(CURRENT_URL, city);
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const data = JSON.parse(xhr.responseText);
      console.log("CURRENT RESPONSE:", data);
      renderCurrent(data);
      clearInputError();
    } else {
      setInputError("Nie znaleziono miasta lub błąd API.");
    }
  };

  xhr.onerror = () => setInputError("Błąd sieci.");
  xhr.send();
}

function getForecastFetch(city) {
  const url = buildUrl(FORECAST_URL, city);
  fetch(url)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      console.log("FORECAST RESPONSE:", data);
      renderForecast(data);
      clearInputError();
    })
    .catch(() => setInputError("Nie udało się pobrać prognozy."));
}

function renderCurrent(d) {
  currentBox.innerHTML = `
    ${weatherCard({
      dt: d.dt,
      icon: d.weather?.[0]?.icon,
      desc: d.weather?.[0]?.description,
      temp: d.main?.temp,
      feels: d.main?.feels_like,
      isCurrent: true
    })}
  `;
}

function renderForecast(d) {
  const cards = d.list.map(item => weatherCard({
    dt: item.dt,
    icon: item.weather?.[0]?.icon,
    desc: item.weather?.[0]?.description,
    temp: item.main?.temp,
    feels: item.main?.feels_like,
    isCurrent: false
  })).join("");

  forecastBox.innerHTML = `
    ${cards || `<div class="blad">Brak danych prognozy.</div>`}
  `;
}

function weatherCard({ dt, icon, desc, temp, feels, isCurrent = false }) {
  const timeStr = isCurrent ? "Teraz" : formatDateTime(dt * 1000);
  const safeDesc = desc ?? "-";

  return `
    <article class="karta">
      <div class="ikona">
        ${icon ? `<img alt="${safeDesc}" src="https://openweathermap.org/img/wn/${icon}@2x.png" />` : ""}
      </div>
      <div class="info">
        <div class="czas">${timeStr}</div>
        <div class="opis">${safeDesc}</div>
      </div>
      <div class="temperatura">
        <div class="wartosc">${round(temp)}°C</div>
        <div class="odczuwalna">Odczuwalna: ${round(feels)}°C</div>
      </div>
    </article>
  `;
}

function setInputError(message) {
  cityInput.classList.add("input-error");
  currentBox.innerHTML = `<div class="blad">${message}</div>`;
  forecastBox.innerHTML = "";
  cityInput.focus();
}

function clearInputError() {
  cityInput.classList.remove("input-error");
}

function clearUI() {
  clearInputError();
  currentBox.innerHTML = "";
  forecastBox.innerHTML = "";
}

function buildUrl(base, city) {
  return `${base}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;
}

function round(x) {
  return (typeof x === "number") ? x.toFixed(1) : "-";
}

function formatDateTime(ms) {
  return new Date(ms).toLocaleString("pl-PL", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}
