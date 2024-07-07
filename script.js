const map = L.map('map').setView([-1.45502, -48.5024], 16);
const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

layer.addTo(map);

const localA = document.getElementById("position-A");
const localB = document.getElementById("position-B");
const checkout = document.getElementById("btn-verification");

// Função para obter coordenadas a partir de um endereço
function getCoordinatesFromAddress(address) {
    return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            } else {
                throw new Error('Endereço não encontrado');
            }
        });
}

// Função para verificar se a entrada é coordenadas
function isCoordinates(input) {
    const regex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    return regex.test(input);
}

// Função para obter coordenadas a partir da entrada (endereço ou coordenadas)
async function getCoordinates(input) {
    if (isCoordinates(input)) {
        const [lat, lon] = input.split(',').map(Number);
        return [lat, lon];
    } else {
        return await getCoordinatesFromAddress(input);
    }
}

checkout.addEventListener('click', async () => {
    try {
        const posicaoA = await getCoordinates(localA.value);
        const posicaoB = await getCoordinates(localB.value);

        L.marker(posicaoA).addTo(map).bindPopup('Posição A').openPopup();
        L.marker(posicaoB).addTo(map).bindPopup('Posição B').openPopup();

        // Ajustar os limites do mapa para cobrir as duas posições
        const bounds = L.latLngBounds([posicaoA, posicaoB]);
        map.fitBounds(bounds);
    } catch (error) {
        alert(error.message);
    }
});


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(function(error) {
            console.log('Falha ao registrar o Service Worker:', error);
        });
}
