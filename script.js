let targetCoords = null;
let currentCoords = null;
let currentHeading = 0;

const button = document.getElementById("targetButton");
const arrow = document.getElementById("arrow");
const distanceDisplay = document.getElementById("distanceDisplay");

// Установка цели по текущей геолокации
button.addEventListener("click", () => {
    if (navigator.geolocation) {
        console.log("Нажата кнопка. Запрашиваем текущую позицию как цель...");
        navigator.geolocation.getCurrentPosition(
            pos => {
                targetCoords = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                console.log("Цель установлена:", targetCoords);
                button.style.display = "none";
                arrow.style.display = "flex";
                updateArrowRotation();
            },
            error => {
                console.error("Ошибка при установке цели:", error);
            }
        );
    } else {
        alert("Геолокация не поддерживается");
    }
});

// Расстояние в метрах
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// Направление в градусах от точки 1 к точке 2
function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Обновление поворота стрелки
function updateArrowRotation() {
    if (!targetCoords || !currentCoords) {
        console.log("Нет координат для расчета.");
        return;
    }

    const bearing = calculateBearing(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );

    const angle = (bearing - currentHeading + 360) % 360;
    arrow.style.transform = `rotate(${angle}deg)`;

    const distance = calculateDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );
    distanceDisplay.textContent = `${distance} м`;

    console.log(`Поворот: ${angle}°, Расстояние: ${distance} м`);
}

// Получение угла ориентации устройства
function handleOrientation(event) {
    if (event.webkitCompassHeading !== undefined) {
        currentHeading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        currentHeading = 360 - event.alpha; // для Android
    }
    updateArrowRotation();
}

// Разрешение на доступ к компасу (для iOS)
if (typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function") {
    button.addEventListener("click", () => {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    window.addEventListener("deviceorientation", handleOrientation);
                } else {
                    alert("Доступ к компасу отклонён.");
                }
            })
            .catch(console.error);
    });
} else {
    // Android и обычные браузеры
    window.addEventListener("deviceorientation", handleOrientation);
}

// Отслеживание геолокации
if (navigator.geolocation) {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            currentCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            updateArrowRotation();
        });
    }, 2000);
}
