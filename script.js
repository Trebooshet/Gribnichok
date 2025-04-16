let targetCoords = null;
let currentCoords = null;
let currentHeading = 0;

const button = document.getElementById("targetButton");
const arrow = document.getElementById("arrow");
const distanceDisplay = document.getElementById("distanceDisplay");

// Скрываем стрелку и расстояние до старта
arrow.style.display = "none";
distanceDisplay.style.display = "none";

// Вспомогательные функции
function toRadians(deg) {
    return deg * Math.PI / 180;
}

function toDegrees(rad) {
    return rad * 180 / Math.PI;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
        Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
    return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

function updateArrow() {
    if (!targetCoords || !currentCoords) return;

    const bearing = calculateBearing(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );

    const distance = calculateDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );

    // Учитываем текущую ориентацию устройства
    const rotation = bearing - currentHeading;
    arrow.style.transform = `rotate(${rotation}deg)`;
    distanceDisplay.textContent = `${distance} м`;
}

function requestOrientationAccess() {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().then(response => {
            if (response === "granted") {
                window.addEventListener("deviceorientation", handleOrientation, true);
            }
        }).catch(console.error);
    } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
    }
}

function handleOrientation(event) {
    if (event.webkitCompassHeading !== undefined) {
        currentHeading = event.webkitCompassHeading; // Safari
    } else if (event.alpha !== null) {
        currentHeading = 360 - event.alpha; // fallback
    }
    updateArrow();
}

function startTracking() {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            currentCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            updateArrow();
        });
    }, 10); // обновляем каждую 0.01 секунды
}

button.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(pos => {
        targetCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        };

        button.style.display = "none";
        arrow.style.display = "flex";
        distanceDisplay.style.display = "block";

        requestOrientationAccess();
        startTracking();
    }, err => {
        alert("Не удалось получить текущие координаты.");
        console.error(err);
    });
});