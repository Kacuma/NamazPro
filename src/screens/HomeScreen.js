import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCurrentLocation, getLocationAddress } from '../services/locationService';
import { getPrayerTimes, getNextPrayer, getPrayerName, getPrayerIcon } from '../services/prayerTimesService';
import { getRamadanInfo, getKurbanInfo, getUpcomingEvents, getCountdownText } from '../utils/islamicCalendar';
import { getDailyVerse } from '../utils/quranVerses';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#FFD700',
  accentDark: '#F9A825',
  background: '#F1F8E9',
  white: '#FFFFFF',
  text: '#212121',
  textLight: '#757575',
  card: '#FFFFFF',
  shadow: '#000000',
  danger: '#B71C1C',
  orange: '#E65100',
};

const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function HomeScreen({ navigation }) {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('Konum alınıyor...');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dailyVerse = getDailyVerse();

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (prayerTimes) {
        setNextPrayer(getNextPrayer(prayerTimes));
      }
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const loc = await getCurrentLocation();
      setLocation(loc);

      const [address, times] = await Promise.all([
        getLocationAddress(loc.latitude, loc.longitude),
        getPrayerTimes(loc.latitude, loc.longitude),
      ]);

      setLocationName(address.city || 'Konumunuz');
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const ramadan = getRamadanInfo();
  const kurban = getKurbanInfo();
  const upcomingEvents = getUpcomingEvents(3);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.loadingGradient}>
          <Text style={styles.appTitle}>NamazPro</Text>
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>Namaz vakitleri yükleniyor...</Text>
        </LinearGradient>
      </View>
    );
  }

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
        <LinearGradient colors={['#1B5E20', '#2E7D32', '#388E3C']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.appName}>NamazPro</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color={COLORS.accent} />
                <Text style={styles.locationText}>{locationName}</Text>
              </View>
            </View>
            <View style={styles.clockContainer}>
              <Text style={styles.clockTime}>{formatTime(currentTime)}</Text>
              <Text style={styles.clockDate}>{formatDate(currentTime)}</Text>
            </View>
          </View>

          {/* Next Prayer Banner */}
          {nextPrayer && (
            <View style={styles.nextPrayerBanner}>
              <View style={styles.nextPrayerLeft}>
                <Ionicons name="notifications" size={18} color={COLORS.accent} />
                <Text style={styles.nextPrayerLabel}>Sıradaki Namaz</Text>
              </View>
              <View style={styles.nextPrayerRight}>
                <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
                <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
                <Text style={styles.nextPrayerCountdown}>
                  {nextPrayer.hoursLeft > 0
                    ? `${nextPrayer.hoursLeft} sa ${nextPrayer.minsLeft} dk`
                    : `${nextPrayer.minsLeft} dakika`} sonra
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={16} color="#FFFFFF" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadData}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Prayer Times Grid */}
        {prayerTimes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bugünün Namaz Vakitleri</Text>
            <View style={styles.prayerGrid}>
              {PRAYER_ORDER.map((key) => {
                const isNext = nextPrayer?.name === getPrayerName(key);
                return (
                  <View key={key} style={[styles.prayerCard, isNext && styles.prayerCardActive]}>
                    <Ionicons
                      name={getPrayerIcon(key)}
                      size={22}
                      color={isNext ? COLORS.white : COLORS.primary}
                    />
                    <Text style={[styles.prayerCardName, isNext && styles.prayerCardTextActive]}>
                      {getPrayerName(key)}
                    </Text>
                    <Text style={[styles.prayerCardTime, isNext && styles.prayerCardTextActive]}>
                      {prayerTimes[key]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Countdown Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dini Günler</Text>
          <View style={styles.countdownRow}>
            {/* Ramadan */}
            <LinearGradient
              colors={['#1B5E20', '#2E7D32']}
              style={styles.countdownCard}
            >
              <Ionicons name="moon" size={28} color={COLORS.accent} />
              <Text style={styles.countdownTitle}>
                {ramadan.status === 'active' ? 'Ramazan' : 'Ramazana'}
              </Text>
              <Text style={styles.countdownDays}>
                {ramadan.status === 'active' ? ramadan.day : ramadan.daysLeft}
              </Text>
              <Text style={styles.countdownUnit}>
                {ramadan.status === 'active' ? '. Gün' : 'Gün Kaldı'}
              </Text>
            </LinearGradient>

            {/* Kurban */}
            <LinearGradient
              colors={['#B71C1C', '#C62828']}
              style={styles.countdownCard}
            >
              <Ionicons name="star" size={28} color={COLORS.accent} />
              <Text style={styles.countdownTitle}>
                {kurban.status === 'active' ? 'Kurban' : 'Kurbana'}
              </Text>
              <Text style={styles.countdownDays}>
                {kurban.status === 'active' ? '🎉' : kurban.daysLeft}
              </Text>
              <Text style={styles.countdownUnit}>
                {kurban.status === 'active' ? 'Bayramınız!' : 'Gün Kaldı'}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yaklaşan Dini Günler</Text>
          {upcomingEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={[styles.eventIconContainer, { backgroundColor: event.color }]}>
                <Ionicons name={event.icon} size={20} color="#FFFFFF" />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventArabic}>{event.arabicName}</Text>
                <Text style={styles.eventDate}>
                  {event.startDate.toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.eventCountdown}>
                <Text style={[styles.eventDaysLeft, event.daysLeft <= 7 && styles.eventDaysLeftSoon]}>
                  {event.daysLeft === 0 ? 'Bugün!' : event.daysLeft < 0 ? 'Geçti' : event.daysLeft}
                </Text>
                {event.daysLeft > 0 && (
                  <Text style={styles.eventDaysUnit}>gün</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Daily Verse */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Günün Ayeti</Text>
          <LinearGradient
            colors={['#E8F5E9', '#F1F8E9']}
            style={styles.verseCard}
          >
            <View style={styles.verseHeader}>
              <Ionicons name="book" size={20} color={COLORS.primary} />
              <Text style={styles.verseSource}>
                {dailyVerse.surah} Suresi - {dailyVerse.ayah}. Ayet
              </Text>
            </View>
            <Text style={styles.verseArabic}>{dailyVerse.arabic}</Text>
            <Text style={styles.verseTransliteration}>{dailyVerse.transliteration}</Text>
            <View style={styles.verseDivider} />
            <Text style={styles.verseTurkish}>{dailyVerse.turkish}</Text>
          </LinearGradient>
        </View>

        {/* Hijri Date */}
        {prayerTimes?.hijriDate && (
          <View style={styles.section}>
            <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.hijriCard}>
              <Ionicons name="calendar" size={22} color={COLORS.primary} />
              <View style={styles.hijriInfo}>
                <Text style={styles.hijriLabel}>Hicri Tarih</Text>
                <Text style={styles.hijriDate}>
                  {prayerTimes.hijriDate.day}{' '}
                  {prayerTimes.hijriDate.month?.en}{' '}
                  {prayerTimes.hijriDate.year} H
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1B5E20' },
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1 },
  loadingGradient: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  appTitle: {
    fontSize: 36, fontWeight: 'bold', color: COLORS.white, letterSpacing: 2,
  },
  loadingText: { color: COLORS.accent, marginTop: 12, fontSize: 16 },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appName: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { color: COLORS.accent, marginLeft: 4, fontSize: 13 },
  clockContainer: { alignItems: 'flex-end' },
  clockTime: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  clockDate: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, textAlign: 'right' },

  nextPrayerBanner: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextPrayerLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  nextPrayerRight: { alignItems: 'flex-end' },
  nextPrayerName: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  nextPrayerTime: { color: COLORS.accent, fontSize: 16, fontWeight: '600' },
  nextPrayerCountdown: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

  errorBanner: {
    backgroundColor: '#C62828',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  errorText: { color: COLORS.white, flex: 1, fontSize: 13 },
  retryText: { color: COLORS.accent, fontWeight: 'bold', fontSize: 13 },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.text,
    marginBottom: 12, letterSpacing: 0.3,
  },

  prayerGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  prayerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    flexGrow: 1,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  prayerCardActive: { backgroundColor: COLORS.primary },
  prayerCardName: { color: COLORS.textLight, fontSize: 12, marginTop: 4 },
  prayerCardTime: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginTop: 2 },
  prayerCardTextActive: { color: COLORS.white },

  countdownRow: { flexDirection: 'row', gap: 12 },
  countdownCard: {
    flex: 1, borderRadius: 16, padding: 16, alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  countdownTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 8 },
  countdownDays: { color: COLORS.white, fontSize: 36, fontWeight: 'bold', marginTop: 4 },
  countdownUnit: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },

  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  eventIconContainer: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  eventInfo: { flex: 1, marginLeft: 12 },
  eventName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  eventArabic: { fontSize: 12, color: COLORS.textLight, marginTop: 1 },
  eventDate: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  eventCountdown: { alignItems: 'center' },
  eventDaysLeft: {
    fontSize: 22, fontWeight: 'bold', color: COLORS.primary,
  },
  eventDaysLeftSoon: { color: COLORS.danger },
  eventDaysUnit: { fontSize: 11, color: COLORS.textLight },

  verseCard: {
    borderRadius: 16, padding: 18,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verseHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  verseSource: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  verseArabic: {
    fontSize: 22, color: COLORS.text, textAlign: 'right',
    lineHeight: 38, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  verseTransliteration: {
    fontSize: 13, color: COLORS.textLight, fontStyle: 'italic',
    textAlign: 'center', marginBottom: 8,
  },
  verseDivider: { height: 1, backgroundColor: '#C8E6C9', marginVertical: 8 },
  verseTurkish: { fontSize: 15, color: COLORS.text, lineHeight: 22, textAlign: 'center' },

  hijriCard: {
    borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  hijriInfo: {},
  hijriLabel: { fontSize: 12, color: COLORS.textLight },
  hijriDate: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
});
