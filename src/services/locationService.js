import * as Location from 'expo-location';

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Konum izni verilmedi. Namaz vakitlerini göstermek için konum iznine ihtiyacımız var.');
  }
  return true;
}

export async function getCurrentLocation() {
  try {
    await requestLocationPermission();
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    throw new Error('Konumunuz alınamadı: ' + error.message);
  }
}

export async function getLocationAddress(latitude, longitude) {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address) {
      return {
        city: address.city || address.subregion || 'Bilinmiyor',
        district: address.district || address.subregion || '',
        country: address.country || 'Türkiye',
        fullAddress: [address.district, address.city, address.country]
          .filter(Boolean)
          .join(', '),
      };
    }
    return { city: 'Konumunuz', district: '', country: '', fullAddress: 'Konumunuz' };
  } catch (error) {
    return { city: 'Konumunuz', district: '', country: '', fullAddress: 'Konumunuz' };
  }
}

export async function getNearbyMosques(latitude, longitude, radiusKm = 2) {
  // Using Overpass API (OpenStreetMap) to find nearby mosques
  const radiusM = radiusKm * 1000;
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${latitude},${longitude});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${latitude},${longitude});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error('API yanıt vermedi');

    const data = await response.json();
    const mosques = data.elements
      .filter(el => el.type === 'node' && el.lat && el.lon)
      .map(el => ({
        id: el.id,
        name: el.tags?.name || el.tags?.['name:tr'] || 'Cami',
        latitude: el.lat,
        longitude: el.lon,
        address: el.tags?.['addr:street'] || el.tags?.['addr:full'] || '',
        distance: calculateDistance(latitude, longitude, el.lat, el.lon),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    return mosques;
  } catch (error) {
    console.error('Mosque fetch error:', error);
    // Return empty array - let screen handle the error state
    return [];
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}
