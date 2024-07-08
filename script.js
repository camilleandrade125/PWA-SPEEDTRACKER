const map = L.map('map').setView([-1.45502, -48.5024], 16);
const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

layer.addTo(map);

const localA = document.getElementById("position-A");
const localB = document.getElementById("position-B");
const checkout = document.getElementById("btn-verification");


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


function isCoordinates(input) {
    const regex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    return regex.test(input);
}

async function getCoordinates(input) {
    if (isCoordinates(input)) {
        const [lat, lon] = input.split(',').map(Number);
        return [lat, lon];
    } else {
        return await getCoordinatesFromAddress(input);
    }
}

function addDashedLine(map, pointA, pointB) {
    const latlngs = [pointA, pointB];
    const polyline = L.polyline(latlngs, { dashArray: '10, 10', color: 'red' }).addTo(map);
}

checkout.addEventListener('click', async () => {
    try {
        const posicaoA = await getCoordinates(localA.value);
        const posicaoB = await getCoordinates(localB.value);

        L.marker(posicaoA).addTo(map).bindPopup('Posição A').openPopup();
        L.marker(posicaoB).addTo(map).bindPopup('Posição B').openPopup();

        addDashedLine(map, posicaoA, posicaoB);

        const bounds = L.latLngBounds([posicaoA, posicaoB]);
        map.fitBounds(bounds);
    } catch (error) {
        Swal.fire({
            title: "Tente novamente!",
            text: "Endereço não encontrado :(",
            icon: "error"
        });
    }
});

// Função para obter informações de rota (tempo e distância)
async function getRouteInfo(pointA, pointB) {
    const url = `https://router.project-osrm.org/route/v1/driving/${pointA[1]},${pointA[0]};${pointB[1]},${pointB[0]}?geometries=geojson&overview=full`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const distance = (route.distance / 1000).toFixed(1); 
        const duration = Math.ceil(route.duration / 60); 
        
        return {
            distance: distance,
            duration: duration
        };
    } else {
        throw new Error('Não foi possível calcular a rota.');
    }
}

checkout.addEventListener('click', async () => {
    try {
        const posicaoA = await getCoordinates(localA.value);
        const posicaoB = await getCoordinates(localB.value);

        L.marker(posicaoA).addTo(map).bindPopup('Posição A').openPopup();
        L.marker(posicaoB).addTo(map).bindPopup('Posição B').openPopup();

        
        addDashedLine(map, posicaoA, posicaoB);

        
        const bounds = L.latLngBounds([posicaoA, posicaoB]);
        map.fitBounds(bounds);

        
        const routeInfo = await getRouteInfo(posicaoA, posicaoB);

        
        Swal.fire({
            title: "Informações da Rota",
            html: `Distância: ${routeInfo.distance} km<br>Tempo estimado: ${routeInfo.duration} minutos`,
            icon: "info"
        });

    } catch (error) {
        Swal.fire({
            title: "Tente novamente!",
            text: "Endereço não encontrado :(",
            icon: "error"
        });
    }
});



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registrado com sucesso: :)', registration);
        })
        .catch(function(error) {
            console.log('Falha ao registrar o Service Worker: :(', error);
        });
}
