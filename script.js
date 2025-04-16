let targetCoords = null;
let currentCoords = null;
let currentHeading = 0;
let targetSet = false;  // Для отслеживания, была ли установлена цель

const button = document.getElementById("targetButton");
const arrow = document.getElementById("arrow");
const distanceDisplay = document.getElementById("distanceDisplay");

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
                distanceDisplay.style.display = "block"; // Показываем метки расстояния
                targetSet = true;  // Цель установлена
                updateArrowRotation(); // Сразу обновляем стрелку
            },
            error => {
                console.error("Ошибка при установке цели:", error);
            }
        );
    } else {
        alert("Геолокация не поддерживается");
    }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function updateArrowRotation() {
    if (!targetCoords || !currentCoords || !targetSet) {
        console.log("Нет координат для расчета.");
        return;
    }

    const bearing = calculateBearing(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );

    const angle = bearing - currentHeading;
    arrow.style.transform = `rotate(${angle}deg)`;  // Поворот стрелки

    const distance = calculateDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );

    if (distance === 0) {
        distanceDisplay.textContent = `Вы на месте!`;
    } else {
        distanceDisplay.textContent = `${distance} м`;
    }
}

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientationabsolute", event => {
        if (event.alpha !== null) {
            currentHeading = event.alpha;  // Направление устройства
            updateArrowRotation();
        }
    });
}

if (navigator.geolocation) {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            currentCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            console.log("Обновленные координаты:", currentCoords);  // Лог обновления координат
            updateArrowRotation();
        });
    }, 2000);
}