let targetCoords = null;
let currentCoords = null;
let currentHeading = 0;

const button = document.getElementById("targetButton");
const arrow = document.getElementById("arrow");
const distanceDisplay = document.getElementById("distanceDisplay");

arrow.style.display = "none";
distanceDisplay.style.display = "none";

// Перевод градусов в радианы и обратно
const toRad = deg => deg * Math.PI / 180;
const toDeg = rad => rad * 180 / Math.PI;

// Вычисление расстояния между двумя точками
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// Вычисление азимута (угла) на цель
function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Обновление стрелки и расстояния
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

    const rotation = (bearing - currentHeading + 360) % 360;
    arrow.style.transform = `rotate(${rotation}deg)`;
    distanceDisplay.textContent = `${distance} м`;
}

// Получение разрешения на ориентацию (для Safari)
function requestOrientationAccess() {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().then(response => {
            if (response === "granted") {
                window.addEventListener("deviceorientationabsolute", handleOrientation, true);
            } else {
                alert("Доступ к компасу запрещён.");
            }
        }).catch(console.error);
    } else {
        window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    }
}

// Обработка данных компаса
function handleOrientation(event) {
    if (event.webkitCompassHeading !== undefined) {
        currentHeading = event.webkitCompassHeading; // Safari
    } else if (event.alpha !== null) {
        currentHeading = 360 - event.alpha; // fallback
    }
    updateArrow();
}

// Постоянное отслеживание геопозиции
function startTracking() {
    navigator.geolocation.watchPosition(pos => {
        currentCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        };
        updateArrow();
    }, err => {
        console.error("Ошибка геолокации:", err);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    });
}

// Кнопка "Поставить цель"
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
    }, {
        enableHighAccuracy: true,
        timeout: 5000
    });
});