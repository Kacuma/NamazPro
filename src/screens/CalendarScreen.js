import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ISLAMIC_EVENTS_2026, getUpcomingEvents, getDaysLeft,
  getCountdownText, getRamadanInfo, getKurbanInfo,
} from '../utils/islamicCalendar';

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
  bayram: '#C62828',
  kandil: '#4A148C',
  ramazan: '#1B5E20',
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'Tümü' },
  { key: 'bayram', label: 'Bayramlar' },
  { key: 'kandil', label: 'Kandiller' },
  { key: 'ramazan', label: 'Ramazan' },
];

function CountdownDisplay({ daysLeft, color, title }) {
  const isToday = daysLeft === 0;
  const isNegative = daysLeft < 0;

  return (
    <View style={[styles.mainCountdownCard, { borderColor: color }]}>
      <LinearGradient colors={[color, color + 'CC']} style={styles.mainCountdownGradient}>
        <Text style={styles.mainCountdownTitle}>{title}</Text>
        {isToday ? (
          <Text style={styles.mainCountdownToday}>BUGÜN!</Text>
        ) : isNegative ? (
          <Text style={styles.mainCountdownPassed}>Geçti</Text>
        ) : (
          <View style={styles.mainCountdownNumbers}>
            <Text style={styles.mainCountdownDays}>{daysLeft}</Text>
            <Text style={styles.mainCountdownUnit}>GÜN</Text>
            <Text style={styles.mainCountdownKaldi}>KALDI</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const daysLeft = getDaysLeft(event.startDate);
  const isPassed = daysLeft < 0;
  const isToday = daysLeft === 0;
  const isSoon = daysLeft > 0 && daysLeft <= 7;

  const typeColors = {
    bayram: '#B71C1C',
    kandil: '#4A148C',
    ramazan: '#1B5E20',
  };
  const cardColor = typeColors[event.type] || COLORS.primary;

  return (
    <TouchableOpacity
      style={[styles.eventCard, isPassed && styles.eventCardPassed]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
    >
      <View style={styles.eventCardHeader}>
        <View style={[styles.eventIconCircle, { backgroundColor: cardColor }]}>
          <Ionicons name={event.icon} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.eventCardInfo}>
          <Text style={[styles.eventCardName, isPassed && styles.eventCardNamePassed]}>
            {event.name}
          </Text>
          <Text style={styles.eventCardArabic}>{event.arabicName}</Text>
          <Text style={styles.eventCardDate}>
            {event.startDate.toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
            {event.endDate > event.startDate && (
              ` - ${event.endDate.toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long',
              })}`
            )}
          </Text>
        </View>
        <View style={styles.eventCardCountdown}>
          {isToday ? (
            <View style={[styles.todayBadge, { backgroundColor: cardColor }]}>
              <Text style={styles.todayBadgeText}>Bugün!</Text>
            </View>
          ) : isPassed ? (
            <Text style={styles.passedText}>Geçti</Text>
          ) : (
            <>
              <Text style={[
                styles.countdownNumber,
                { color: isSoon ? '#B71C1C' : cardColor }
              ]}>
                {daysLeft}
              </Text>
              <Text style={styles.countdownGun}>gün</Text>
            </>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.textLight}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>

      {expanded && (
        <View style={styles.eventCardExpanded}>
          <View style={styles.expandedDivider} />
          <Text style={styles.eventDescription}>{event.description}</Text>
          <View style={styles.typeTag}>
            <View style={[styles.typeTagDot, { backgroundColor: cardColor }]} />
            <Text style={[styles.typeTagText, { color: cardColor }]}>
              {event.type === 'bayram' ? 'Bayram' :
               event.type === 'kandil' ? 'Kandil' : 'Ramazan'}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function CalendarScreen() {
  const [activeFilter, setActiveFilter] = useState('all');

  const ramadan = getRamadanInfo();
  const kurban = getKurbanInfo();

  const filteredEvents = ISLAMIC_EVENTS_2026
    .filter(e => activeFilter === 'all' || e.type === activeFilter)
    .sort((a, b) => {
      const dA = getDaysLeft(a.startDate);
      const dB = getDaysLeft(b.startDate);
      if (dA < 0 && dB >= 0) return 1;
      if (dB < 0 && dA >= 0) return -1;
      return a.startDate - b.startDate;
    });

  const upcomingCount = ISLAMIC_EVENTS_2026.filter(
    e => getDaysLeft(e.startDate) >= 0
  ).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.header}>
          <Text style={styles.headerTitle}>Dini Takvim</Text>
          <Text style={styles.headerSubtitle}>
            {upcomingCount} yaklaşan dini gün
          </Text>
        </LinearGradient>

        {/* Main Countdown Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geri Sayım</Text>
          <View style={styles.mainCountdownRow}>
            <CountdownDisplay
              daysLeft={ramadan.status === 'active' ? 0 : ramadan.daysLeft}
              color="#1B5E20"
              title={ramadan.status === 'active' ? 'Ramazan' : 'Ramazana'}
            />
            <CountdownDisplay
              daysLeft={kurban.status === 'active' ? 0 : kurban.daysLeft}
              color="#B71C1C"
              title={kurban.status === 'active' ? 'Kurban Bayramı' : 'Kurban Bayramına'}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="star" size={22} color="#FFD700" />
              <Text style={styles.statNumber}>
                {ISLAMIC_EVENTS_2026.filter(e => e.type === 'bayram').length}
              </Text>
              <Text style={styles.statLabel}>Bayram</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="moon" size={22} color="#4A148C" />
              <Text style={styles.statNumber}>
                {ISLAMIC_EVENTS_2026.filter(e => e.type === 'kandil').length}
              </Text>
              <Text style={styles.statLabel}>Kandil</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={22} color="#1B5E20" />
              <Text style={styles.statNumber}>{ISLAMIC_EVENTS_2026.length}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dini Günler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {FILTER_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.filterTab, activeFilter === opt.key && styles.filterTabActive]}
                onPress={() => setActiveFilter(opt.key)}
              >
                <Text style={[styles.filterTabText, activeFilter === opt.key && styles.filterTabTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Events List */}
        <View style={[styles.section, { marginTop: 8 }]}>
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>

        {/* Ramazan Info Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.infoCard}
          >
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoCardTitle}>Not</Text>
              <Text style={styles.infoCardText}>
                Dini günlerin tarihleri, hilal görülmesine bağlı olarak 1-2 gün farklılık gösterebilir.
                Kesin tarihler için Diyanet İşleri Başkanlığı'nın açıklamalarını takip ediniz.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1B5E20' },
  container: { flex: 1, backgroundColor: COLORS.background },

  header: { padding: 20, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },

  mainCountdownRow: { flexDirection: 'row', gap: 12 },
  mainCountdownCard: {
    flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 2,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  mainCountdownGradient: { padding: 16, alignItems: 'center', minHeight: 110 },
  mainCountdownTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  mainCountdownNumbers: { alignItems: 'center', marginTop: 4 },
  mainCountdownDays: { color: COLORS.white, fontSize: 42, fontWeight: 'bold', lineHeight: 48 },
  mainCountdownUnit: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  mainCountdownKaldi: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  mainCountdownToday: { color: COLORS.accent, fontSize: 26, fontWeight: 'bold', marginTop: 8 },
  mainCountdownPassed: { color: 'rgba(255,255,255,0.6)', fontSize: 18, marginTop: 12 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 12,
    padding: 14, alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  statLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },

  filterScroll: { marginBottom: 0 },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.white, marginRight: 8,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabText: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
  filterTabTextActive: { color: COLORS.white },

  eventCard: {
    backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 10,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  eventCardPassed: { opacity: 0.6 },
  eventCardHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
  },
  eventIconCircle: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center',
  },
  eventCardInfo: { flex: 1, marginLeft: 12 },
  eventCardName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  eventCardNamePassed: { color: COLORS.textLight },
  eventCardArabic: { fontSize: 12, color: COLORS.textLight },
  eventCardDate: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  eventCardCountdown: { alignItems: 'center', minWidth: 50 },
  todayBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  todayBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  passedText: { fontSize: 12, color: COLORS.textLight },
  countdownNumber: { fontSize: 24, fontWeight: 'bold' },
  countdownGun: { fontSize: 11, color: COLORS.textLight },

  eventCardExpanded: { paddingHorizontal: 14, paddingBottom: 14 },
  expandedDivider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 10 },
  eventDescription: { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },
  typeTag: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  typeTagDot: { width: 8, height: 8, borderRadius: 4 },
  typeTagText: { fontSize: 12, fontWeight: '600' },

  infoCard: {
    borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'flex-start',
  },
  infoCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  infoCardText: { fontSize: 12, color: COLORS.textLight, lineHeight: 18, marginTop: 4 },
});
