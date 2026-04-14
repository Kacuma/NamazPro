import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  FlatList, Alert, Linking, Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCurrentLocation, getLocationAddress, getNearbyMosques } from '../services/locationService';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#FFD700',
  background: '#F1F8E9',
  white: '#FFFFFF',
  text: '#212121',
  textLight: '#757575',
  shadow: '#000',
  danger: '#B71C1C',
};

function MosqueListItem({ mosque, onPress, isSelected }) {
  const distText = mosque.distance < 1
    ? `${Math.round(mosque.distance * 1000)} m`
    : `${mosque.distance.toFixed(1)} km`;

  return (
    <TouchableOpacity
      style={[styles.mosqueItem, isSelected && styles.mosqueItemSelected]}
      onPress={() => onPress(mosque)}
      activeOpacity={0.85}
    >
      <View style={[styles.mosqueIconBox, isSelected && styles.mosqueIconBoxSelected]}>
        <Text style={styles.mosqueEmoji}>🕌</Text>
      </View>
      <View style={styles.mosqueInfo}>
        <Text style={[styles.mosqueName, isSelected && styles.mosqueNameSelected]} numberOfLines={1}>
          {mosque.name}
        </Text>
        {mosque.address ? (
          <Text style={styles.mosqueAddress} numberOfLines={1}>{mosque.address}</Text>
        ) : null}
      </View>
      <View style={styles.mosqueDistanceBox}>
        <Text style={[styles.mosqueDistance, isSelected && styles.mosqueDistanceSelected]}>
          {distText}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={COLORS.textLight} />
      </View>
    </TouchableOpacity>
  );
}

export default function MosquesScreen() {
  const [location, setLocation] = useState(null);
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMosques, setLoadingMosques] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [error, setError] = useState(null);
  const [mapView, setMapView] = useState('map'); // 'map' | 'list'
  const [radius, setRadius] = useState(2);
  const mapRef = useRef(null);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      setError(null);
      setLoading(true);
      const loc = await getCurrentLocation();
      setLocation(loc);
      await loadMosques(loc, radius);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMosques = async (loc, r) => {
    try {
      setLoadingMosques(true);
      const results = await getNearbyMosques(loc.latitude, loc.longitude, r);
      setMosques(results);
      if (results.length === 0) {
        // Try wider radius
        if (r < 5) {
          const wider = await getNearbyMosques(loc.latitude, loc.longitude, 5);
          setMosques(wider);
        }
      }
    } catch (err) {
      console.error('Mosque load error:', err);
    } finally {
      setLoadingMosques(false);
    }
  };

  const handleMosquePress = useCallback((mosque) => {
    setSelectedMosque(mosque);
    if (mapRef.current && mapView === 'map') {
      mapRef.current.animateToRegion({
        latitude: mosque.latitude,
        longitude: mosque.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 600);
    }
    setMapView('map');
  }, [mapView]);

  const handleNavigate = (mosque) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.OS === 'ios'
      ? `maps:?daddr=${mosque.latitude},${mosque.longitude}&q=${encodeURIComponent(mosque.name)}`
      : `geo:${mosque.latitude},${mosque.longitude}?q=${encodeURIComponent(mosque.name)}`;

    Alert.alert(
      mosque.name,
      `${mosque.name} camiyine yol tarifi almak ister misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Harita Aç',
          onPress: () => Linking.openURL(url).catch(() => {
            const googleMaps = `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`;
            Linking.openURL(googleMaps);
          }),
        },
      ]
    );
  };

  const changeRadius = async (newRadius) => {
    setRadius(newRadius);
    if (location) {
      await loadMosques(location, newRadius);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Konum alınıyor...</Text>
      </View>
    );
  }

  const region = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Yakındaki Camiler</Text>
              <Text style={styles.headerSubtitle}>
                {loadingMosques
                  ? 'Camiler aranıyor...'
                  : `${mosques.length} cami bulundu (${radius} km)`}
              </Text>
            </View>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, mapView === 'map' && styles.toggleBtnActive]}
                onPress={() => setMapView('map')}
              >
                <Ionicons name="map" size={18} color={mapView === 'map' ? COLORS.primary : COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, mapView === 'list' && styles.toggleBtnActive]}
                onPress={() => setMapView('list')}
              >
                <Ionicons name="list" size={18} color={mapView === 'list' ? COLORS.primary : COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Radius Filter */}
          <View style={styles.radiusRow}>
            <Text style={styles.radiusLabel}>Yarıçap:</Text>
            {[1, 2, 5, 10].map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
                onPress={() => changeRadius(r)}
              >
                <Text style={[styles.radiusBtnText, radius === r && styles.radiusBtnTextActive]}>
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={16} color="#FFFFFF" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadLocation}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Map View */}
        {mapView === 'map' && location && region && (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={region}
              showsUserLocation
              showsMyLocationButton
              showsCompass
            >
              {mosques.map(mosque => (
                <Marker
                  key={mosque.id}
                  coordinate={{ latitude: mosque.latitude, longitude: mosque.longitude }}
                  title={mosque.name}
                  description={mosque.address || `${mosque.distance.toFixed(2)} km uzaklıkta`}
                  onPress={() => setSelectedMosque(mosque)}
                  pinColor={selectedMosque?.id === mosque.id ? '#FFD700' : '#1B5E20'}
                />
              ))}
            </MapView>

            {loadingMosques && (
              <View style={styles.mapLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}

            {/* Selected Mosque Card */}
            {selectedMosque && (
              <View style={styles.selectedCard}>
                <View style={styles.selectedCardLeft}>
                  <Text style={styles.selectedMosqueName}>{selectedMosque.name}</Text>
                  {selectedMosque.address ? (
                    <Text style={styles.selectedMosqueAddr} numberOfLines={1}>
                      {selectedMosque.address}
                    </Text>
                  ) : null}
                  <Text style={styles.selectedMosqueDist}>
                    {selectedMosque.distance < 1
                      ? `${Math.round(selectedMosque.distance * 1000)} m uzaklıkta`
                      : `${selectedMosque.distance.toFixed(1)} km uzaklıkta`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.navigateBtn}
                  onPress={() => handleNavigate(selectedMosque)}
                >
                  <Ionicons name="navigate" size={18} color={COLORS.white} />
                  <Text style={styles.navigateBtnText}>Yol Tarifi</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Mosque count badge */}
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>🕌 {mosques.length} Cami</Text>
            </View>
          </View>
        )}

        {/* List View */}
        {mapView === 'list' && (
          <FlatList
            data={mosques}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <MosqueListItem
                mosque={item}
                onPress={handleMosquePress}
                isSelected={selectedMosque?.id === item.id}
              />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🕌</Text>
                <Text style={styles.emptyTitle}>
                  {loadingMosques ? 'Camiler aranıyor...' : 'Yakında cami bulunamadı'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  Arama yarıçapını artırmayı deneyin
                </Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1B5E20' },
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: { marginTop: 12, color: COLORS.textLight, fontSize: 15 },

  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },

  viewToggle: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8, overflow: 'hidden',
  },
  toggleBtn: { padding: 8 },
  toggleBtnActive: { backgroundColor: COLORS.white },

  radiusRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6,
  },
  radiusLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  radiusBtn: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  radiusBtnActive: { backgroundColor: COLORS.white },
  radiusBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  radiusBtnTextActive: { color: COLORS.primary },

  errorBanner: {
    backgroundColor: '#C62828', flexDirection: 'row',
    alignItems: 'center', padding: 12, gap: 8,
  },
  errorText: { color: COLORS.white, flex: 1, fontSize: 13 },
  retryText: { color: COLORS.accent, fontWeight: 'bold' },

  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  mapLoading: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: COLORS.white, borderRadius: 20, padding: 8,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  countBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: COLORS.white, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  countBadgeText: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  selectedCard: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 16, flexDirection: 'row', alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  selectedCardLeft: { flex: 1 },
  selectedMosqueName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  selectedMosqueAddr: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  selectedMosqueDist: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  navigateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  navigateBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },

  listContent: { padding: 16, paddingTop: 8 },
  mosqueItem: {
    backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 8,
    padding: 14, flexDirection: 'row', alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  mosqueItemSelected: { borderWidth: 2, borderColor: COLORS.primary },
  mosqueIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center',
  },
  mosqueIconBoxSelected: { backgroundColor: COLORS.primary },
  mosqueEmoji: { fontSize: 22 },
  mosqueInfo: { flex: 1, marginLeft: 12 },
  mosqueName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  mosqueNameSelected: { color: COLORS.primary },
  mosqueAddress: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  mosqueDistanceBox: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  mosqueDistance: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  mosqueDistanceSelected: { color: COLORS.primary },

  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 6 },
});
