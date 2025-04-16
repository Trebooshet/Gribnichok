let targetCoords = null;
let currentCoords = null;
let currentHeading = 0;

const button = document.getElementById("targetButton");
const arrow = document.getElementById("arrow");
const distanceDisplay = document.getElementById("distanceDisplay");

arrow.style.display = "none"; // скрыта до установки цели
distanceDisplay.style.display = "none"; // скрыта до установки цели

button.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                targetCoords = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                button.style.display = "none";
                arrow.style.display = "flex";
                distanceDisplay.style.display = "block";
            },
            (err) => {
                console.error("Ошибка получения цели:", err);
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert("Геолокация не поддерживается");
    }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x =
        Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function updateArrow() {
    if (!targetCoords || !currentCoords) return;

    const bearing = calculateBearing(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );

    const angle = bearing - currentHeading;
    arrow.style.transform = `rotate(${angle}deg)`;

    const distance = calculateDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );
    distanceDisplay.textContent = `${distance} м`;
}

// слушаем компас
if (window.DeviceOrientationEvent) {
    window.addEventListener(
        "deviceorientationabsolute",
        (event) => {
            if (event.alpha !== null) {
                currentHeading = event.alpha;
                updateArrow();
            }
        },
        true
    );

    // fallback для Safari
    window.addEventListener(
        "deviceorientation",
        (event) => {
            if (event.webkitCompassHeading !== undefined) {
                currentHeading = event.webkitCompassHeading;
                updateArrow();
            }
        },
        true
    );
}

// следим за геопозицией каждые 0.1 секунды
setInterval(() => {
    if (navigator.geolocation && targetCoords) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentCoords = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                updateArrow();
            },
            (err) => {
                console.error("Ошибка геопозиции:", err);
            },
            { enableHighAccuracy: true }
        );
    }
}, 100);