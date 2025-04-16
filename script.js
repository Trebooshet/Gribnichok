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
    const R = 6371000; // Радиус Земли в метрах
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // Расстояние в метрах
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
        Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
    let bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360; // Направление в градусах
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

    // Обработка перехода через 360 градусов
    let rotation = bearing - currentHeading;
    if (rotation < -180) {
        rotation += 360;
    } else if (rotation > 180) {
        rotation -= 360;
    }

    arrow.style.transform = `rotate(${rotation}deg)`;
    distanceDisplay.textContent = `${distance} м`;
}

function requestPermissions() {
    // Запрос на доступ к геолокации
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            // Разрешение на геолокацию получено, продолжаем
            targetCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            startTracking();
        }, (err) => {
            alert("Ошибка получения геолокации: " + err.message);
        });
    } else {
        alert("Геолокация не поддерживается этим браузером.");
    }

    // Запрос на доступ к ориентации устройства
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
        // Для мобильных браузеров iOS 13+ (Safari)
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    window.addEventListener("deviceorientation", handleOrientation, true);
                } else {
                    alert("Доступ к компасу не получен.");
                }
            })
            .catch(err => {
                alert("Ошибка при запросе доступа к компасу.");
                console.error(err);
            });
    } else {
        // Для других браузеров, поддерживающих компас
        window.addEventListener("deviceorientation", handleOrientation, true);
    }
}

function handleOrientation(event) {
    // Обработка ориентации устройства (компас)
    if (event.webkitCompassHeading !== undefined) {
        currentHeading = event.webkitCompassHeading; // Safari
    } else if (event.alpha !== null) {
        currentHeading = 360 - event.alpha; // fallback для других браузеров
    }
    updateArrow();
}

function startTracking() {
    // Отслеживание координат в реальном времени
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((pos) => {
            currentCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            updateArrow();
        }, (err) => {
            console.error("Ошибка при отслеживании геолокации: ", err);
        }, {
            enableHighAccuracy: true, // Использовать более точные данные
            maximumAge: 0,            // Не использовать устаревшие данные
            timeout: 10000            // Время ожидания получения данных
        });
    }
}

button.addEventListener("click", () => {
    // При нажатии кнопки "Поставить цель"
    requestPermissions();

    button.style.display = "none";
    arrow.style.display = "flex";
    distanceDisplay.style.display = "block";
});