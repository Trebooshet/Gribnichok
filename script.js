let targetCoords = null;  // Координаты цели
let currentCoords = null;  // Текущие координаты пользователя
let currentHeading = 0;  // Направление устройства (угол)
let targetSet = false;  // Флаг, установлена ли цель

const button = document.getElementById("targetButton");
const arrow = document.getElementById("arrow");
const distanceDisplay = document.getElementById("distanceDisplay");

// При нажатии на кнопку "Поставить цель"
button.addEventListener("click", () => {
    if (navigator.geolocation) {
        console.log("Запрашиваем текущую позицию как цель...");
        navigator.geolocation.getCurrentPosition(
            pos => {
                targetCoords = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                console.log("Цель установлена:", targetCoords);
                button.style.display = "none";  // Скрыть кнопку
                distanceDisplay.style.display = "block";  // Показать расстояние
                targetSet = true;  // Цель установлена
                arrow.style.display = "block";  // Показать стрелку
                updateArrowRotation();  // Сразу обновить стрелку и расстояние
            },
            error => {
                console.error("Ошибка при установке цели:", error);
            }
        );
    } else {
        alert("Геолокация не поддерживается");
    }
});

// Функция для расчета расстояния между двумя точками на Земле (в метрах)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;  // Радиус Земли в метрах
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);  // Возвращаем расстояние в метрах
}

// Функция для расчета угла (направления) от одной точки к другой
function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;  // Возвращаем угол в градусах
}

// Функция для обновления стрелки и расстояния
function updateArrowRotation() {
    if (!targetCoords || !currentCoords || !targetSet) {
        return;  // Если нет цели или координат — ничего не делать
    }

    // Вычисляем угол для стрелки
    const bearing = calculateBearing(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );
    const angle = bearing - currentHeading;  // Разница между углом устройства и углом на цель
    arrow.style.transform = `rotate(${angle}deg)`;  // Обновляем направление стрелки

    // Вычисляем расстояние до цели
    const distance = calculateDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        targetCoords.latitude,
        targetCoords.longitude
    );
    distanceDisplay.textContent = distance === 0 ? "Вы на месте!" : `${distance} м`;  // Отображаем расстояние
}

// Обработчик устройства для получения угла поворота
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientationabsolute", event => {
        if (event.alpha !== null) {
            currentHeading = event.alpha;  // Направление устройства
            updateArrowRotation();  // Обновляем стрелку при изменении угла
        }
    });
}

// Регулярное обновление координат пользователя
if (navigator.geolocation) {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            currentCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            updateArrowRotation();  // Обновляем стрелку и расстояние
        });
    }, 2000);  // Каждые 2 секунды обновляются координаты
}