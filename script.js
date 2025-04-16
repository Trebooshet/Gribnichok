let targetCoords = null;
let currentCoords = null;
let currentHeading = 0;

const button = document.getElementById("targetButton");
const arrow = document.getElementById("arrow");
const distanceDisplay = document.getElementById("distanceDisplay");

button.addEventListener("click", () => {
    if (navigator.geolocation) {
        console.log("Нажата кнопка. Запрашиваем текущую позицию как цель...");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                targetCoords = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                };
                console.log("Цель установлена:", targetCoords);
                button.style.display = "none"; // Скрываем кнопку
                arrow.style.display = "flex"; // Показываем стрелку
                distanceDisplay.style.display = "block"; // Показываем расстояние
                updateArrowRotation(); // Обновляем стрелку сразу
            },
            (error) => {
                console.error("Ошибка при установке цели:", error);
            }
        );
    } else {
        alert("Геолокация не поддерживается");
    }
});

// Функция для вычисления расстояния между двумя точками
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Радиус Земли в метрах
    const toRad = (deg) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // Расстояние в метрах
}

// Функция для вычисления угла (bearing) между двумя точками
function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => deg * Math.PI / 180;
    const toDeg = (rad) => rad * 180 / Math.PI;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x =
        Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360; // Возвращаем угол от 0 до 360
}

// Функция для обновления направления стрелки и расстояния
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

    const angle = bearing - currentHeading;
    arrow.style.transform = `rotate(${angle}deg)`; // Поворот стрелки

    const distance = calculateDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );

    if (distance < 1) {
        distanceDisplay.textContent = "Вы на месте"; // Если на месте, пишем "Вы на месте"
    } else {
        distanceDisplay.textContent = `${distance} м`; // Показываем расстояние
    }
}

// Слушаем изменение ориентации устройства для вычисления направления
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientationabsolute", (event) => {
        if (event.alpha !== null) {
            currentHeading = event.alpha; // Устанавливаем направление устройства
            updateArrowRotation(); // Обновляем стрелку
        }
    });
}

// Получаем координаты устройства и обновляем данные каждую секунду
if (navigator.geolocation) {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            currentCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            };
            console.log("Обновленные координаты:", currentCoords);
            updateArrowRotation(); // Обновляем стрелку и расстояние
        });
    }, 100); // Обновляем координаты каждые 0.1 секунды
}