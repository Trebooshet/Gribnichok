let targetCoords = null;
let currentCoords = null;
let currentHeading = 0;

const button = document.getElementById("targetButton");
const arrow = document.getElementById("arrow");
const distanceDisplay = document.getElementById("distanceDisplay");

// Скрываем стрелку и расстояние до цели до нажатия
arrow.style.display = "none";
distanceDisplay.style.display = "none";

button.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                targetCoords = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                button.style.display = "none";
                arrow.style.display = "flex";
                distanceDisplay.style.display = "block";
            },
            error => {
                console.error("Ошибка при установке цели:", error);
            },
            {
                enableHighAccuracy: true
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
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
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

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", event => {
        if (event.absolute !== true && event.webkitCompassHeading !== undefined) {
            currentHeading = event.webkitCompassHeading;
        } else if (event.alpha !== null) {
            currentHeading = 360 - event.alpha;
        }
        updateArrow();
    }, true);
}

if (navigator.geolocation) {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            currentCoords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            updateArrow();
        }, null, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    }, 10); // обновление каждые 0.01 секунды
}