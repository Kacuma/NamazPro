import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Switch, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCurrentLocation, getLocationAddress } from '../services/locationService';
import {
  getPrayerTimes, getPrayerName, getPrayerIcon, getNextPrayer,
} from '../services/prayerTimesService';
import {
  requestNotificationPermissions, schedulePrayerNotifications,
  scheduleTestNotification,
} from '../services/notificationService';
import { getHijriMonthName } from '../utils/islamicCalendar';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#FFD700',
  background: '#F1F8E9',
  white: '#FFFFFF',
  text: '#212121',
  textLight: '#757575',
  card: '#FFFFFF',
  shadow: '#000',
  active: '#1B5E20',
  sunrise: '#FF8F00',
};

const PRAYER_ORDER = [
  { key: 'fajr', label: 'İmsak', desc: 'Sabah namazı vakti' },
  { key: 'sunrise', label: 'Güneş', desc: 'Güneşin doğuşu' },
  { key: 'dhuhr', label: 'Öğle', desc: 'Öğle namazı vakti' },
  { key: 'asr', label: 'İkindi', desc: 'İkindi namazı vakti' },
  { key: 'maghrib', label: 'Akşam', desc: 'Akşam namazı vakti' },
  { key: 'isha', label: 'Yatsı', desc: 'Yatsı namazı vakti' },
];

export default function PrayerTimesScreen() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState({
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  });
  const [notifPermission, setNotifPermission] = useState(false);

  useEffect(() => {
    loadData();
    checkNotifPermission();
  }, []);

  const checkNotifPermission = async () => {
    const granted = await requestNotificationPermissions();
    setNotifPermission(granted);
  };

  const loadData = async () => {
    try {
      setError(null);
      const loc = await getCurrentLocation();
      const [address, times] = await Promise.all([
        getLocationAddress(loc.latitude, loc.longitude),
        getPrayerTimes(loc.latitude, loc.longitude),
      ]);
      setLocationName(address.fullAddress || address.city);
      setPrayerTimes(times);
      setNextPrayer(getNextPrayer(times));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const toggleNotification = async (key, value) => {
    const updated = { ...notificationsEnabled, [key]: value };
    setNotificationsEnabled(updated);

    if (!notifPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Bildirim İzni',
          'Namaz vakti bildirimlerini alabilmek için bildirim iznini açmanız gerekmektedir.',
          [{ text: 'Tamam' }]
        );
        return;
      }
      setNotifPermission(true);
    }

    if (prayerTimes) {
      await schedulePrayerNotifications(prayerTimes, updated);
    }
  };

  const handleTestNotification = async () => {
    await scheduleTestNotification();
    Alert.alert('Test Bildirimi', '2 saniye sonra bir test bildirimi alacaksınız.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Namaz vakitleri yükleniyor...</Text>
      </View>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.header}>
          <Text style={styles.headerTitle}>Namaz Vakitleri</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={COLORS.accent} />
            <Text style={styles.locationText}>{locationName || 'Konumunuz'}</Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
          {prayerTimes?.hijriDate && (
            <Text style={styles.hijriText}>
              {prayerTimes.hijriDate.day} {prayerTimes.hijriDate.month?.en} {prayerTimes.hijriDate.year} H
            </Text>
          )}
        </LinearGradient>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={16} color="#FFFFFF" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadData}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Prayer Times List */}
        {prayerTimes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vakitler & Bildirimler</Text>
            {PRAYER_ORDER.map(({ key, label, desc }, index) => {
              const isNext = nextPrayer?.name === label;
              const isSunrise = key === 'sunrise';

              return (
                <View
                  key={key}
                  style={[
                    styles.prayerRow,
                    isNext && styles.prayerRowActive,
                    index === 0 && styles.prayerRowFirst,
                    index === PRAYER_ORDER.length - 1 && styles.prayerRowLast,
                  ]}
                >
                  <View style={[styles.prayerIconBox, isNext && styles.prayerIconBoxActive, isSunrise && styles.prayerIconBoxSunrise]}>
                    <Ionicons
                      name={getPrayerIcon(key)}
                      size={22}
                      color={COLORS.white}
                    />
                  </View>
                  <View style={styles.prayerInfo}>
                    <View style={styles.prayerNameRow}>
                      <Text style={[styles.prayerName, isNext && styles.prayerNameActive]}>
                        {label}
                      </Text>
                      {isNext && (
                        <View style={styles.nextBadge}>
                          <Text style={styles.nextBadgeText}>Sıradaki</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.prayerDesc}>{desc}</Text>
                  </View>
                  <Text style={[styles.prayerTime, isNext && styles.prayerTimeActive]}>
                    {prayerTimes[key]}
                  </Text>
                  {key !== 'sunrise' && (
                    <Switch
                      value={notificationsEnabled[key]}
                      onValueChange={(val) => toggleNotification(key, val)}
                      trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                      thumbColor={notificationsEnabled[key] ? COLORS.primary : '#BDBDBD'}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Notification Info */}
        <View style={styles.section}>
          <View style={styles.notifInfoCard}>
            <View style={styles.notifInfoHeader}>
              <Ionicons name="notifications" size={20} color={COLORS.primary} />
              <Text style={styles.notifInfoTitle}>Bildirim Ayarları</Text>
            </View>
            <Text style={styles.notifInfoText}>
              Her namaz vakti için ayrı ayrı bildirim alabilirsiniz.
              Güneş vakti için bildirim gönderilmez.
            </Text>
            <TouchableOpacity style={styles.testNotifButton} onPress={handleTestNotification}>
              <Ionicons name="notifications-outline" size={16} color={COLORS.white} />
              <Text style={styles.testNotifText}>Test Bildirimi Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Method Info */}
        <View style={styles.section}>
          <View style={styles.methodCard}>
            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
            <Text style={styles.methodText}>
              Hesaplama Yöntemi: Diyanet İşleri Başkanlığı
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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

  header: { padding: 20, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  locationText: { color: COLORS.accent, fontSize: 13 },
  dateText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 },
  hijriText: { color: COLORS.accent, fontSize: 12, marginTop: 2 },

  errorBanner: {
    backgroundColor: '#C62828', flexDirection: 'row',
    alignItems: 'center', padding: 12, gap: 8,
  },
  errorText: { color: COLORS.white, flex: 1, fontSize: 13 },
  retryText: { color: COLORS.accent, fontWeight: 'bold' },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },

  prayerRow: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  prayerRowFirst: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  prayerRowLast: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderBottomWidth: 0 },
  prayerRowActive: { backgroundColor: '#E8F5E9' },
  prayerIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  prayerIconBoxActive: { backgroundColor: COLORS.primary },
  prayerIconBoxSunrise: { backgroundColor: COLORS.sunrise },
  prayerInfo: { flex: 1, marginLeft: 12 },
  prayerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prayerName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  prayerNameActive: { color: COLORS.primary },
  prayerDesc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  nextBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  nextBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  prayerTime: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  prayerTimeActive: { color: COLORS.primary },

  notifInfoCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  notifInfoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  notifInfoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  notifInfoText: { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },
  testNotifButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingVertical: 10, paddingHorizontal: 16,
    marginTop: 12, alignSelf: 'flex-start',
  },
  testNotifText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },

  methodCard: {
    backgroundColor: COLORS.white, borderRadius: 10,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  methodText: { fontSize: 13, color: COLORS.textLight, flex: 1 },
});
