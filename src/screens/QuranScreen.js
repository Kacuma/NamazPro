import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Share, Platform, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DAILY_VERSES, getDailyVerse } from '../utils/quranVerses';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#FFD700',
  background: '#F1F8E9',
  white: '#FFFFFF',
  text: '#212121',
  textLight: '#757575',
  shadow: '#000',
  card: '#FFFFFF',
};

const DHIKR_LIST = [
  { arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Sübhanallah', meaning: 'Allah\'ı tesbih ederim', count: 33 },
  { arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Elhamdülillah', meaning: 'Allah\'a hamdolsun', count: 33 },
  { arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Ekber', meaning: 'Allah en büyüktür', count: 34 },
  { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', transliteration: 'La ilahe illallah', meaning: 'Allah\'tan başka ilah yoktur', count: 100 },
  { arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Estağfirullah', meaning: 'Allah\'tan bağışlanma dilerim', count: 100 },
  { arabic: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ', transliteration: 'Sallallahu Aleyhi Vesellem', meaning: 'Hz. Peygamber\'e salat', count: 100 },
];

const DUAS = [
  {
    name: 'Sabah Duası',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا',
    transliteration: 'Allahümme bike asbahna ve bike emseyna',
    meaning: 'Allah\'ım! Senin kudretinle sabahladık, Senin kudretinle akşamladık.',
    icon: 'sunny',
  },
  {
    name: 'Akşam Duası',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا',
    transliteration: 'Allahümme bike emseyna ve bike asbahna',
    meaning: 'Allah\'ım! Senin kudretinle akşamladık, Senin kudretinle sabahladık.',
    icon: 'moon',
  },
  {
    name: 'Yemek Duası',
    arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    transliteration: 'Bismillahi ve ala bereketillah',
    meaning: 'Allah\'ın adıyla ve Allah\'ın bereketi üzere (yiyorum).',
    icon: 'restaurant',
  },
  {
    name: 'Uyku Duası',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismikellahümme emutü ve ahya',
    meaning: 'Allahım! Senin adınla ölür (uyur) ve yine Senin adınla dirilirim.',
    icon: 'bed',
  },
  {
    name: 'Seyahat Duası',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا',
    transliteration: 'Sübhanellezi sahhara lena haza',
    meaning: 'Bunu bizim için boyun eğdireni tesbih ederim.',
    icon: 'car',
  },
];

function DhikrCard({ item }) {
  const [count, setCount] = useState(0);
  const isComplete = count >= item.count;

  return (
    <View style={[styles.dhikrCard, isComplete && styles.dhikrCardComplete]}>
      <Text style={styles.dhikrArabic}>{item.arabic}</Text>
      <Text style={styles.dhikrTranslit}>{item.transliteration}</Text>
      <Text style={styles.dhikrMeaning}>{item.meaning}</Text>
      <View style={styles.dhikrCounter}>
        <TouchableOpacity
          style={styles.dhikrResetBtn}
          onPress={() => setCount(0)}
        >
          <Ionicons name="refresh" size={16} color={COLORS.textLight} />
        </TouchableOpacity>
        <View style={styles.dhikrCountBox}>
          <Text style={[styles.dhikrCount, isComplete && styles.dhikrCountComplete]}>
            {count}
          </Text>
          <Text style={styles.dhikrTarget}>/ {item.count}</Text>
        </View>
        <TouchableOpacity
          style={[styles.dhikrBtn, isComplete && styles.dhikrBtnComplete]}
          onPress={() => !isComplete && setCount(c => c + 1)}
          activeOpacity={0.7}
        >
          {isComplete
            ? <Ionicons name="checkmark" size={22} color={COLORS.white} />
            : <Text style={styles.dhikrBtnText}>+1</Text>
          }
        </TouchableOpacity>
      </View>
      {isComplete && (
        <Text style={styles.dhikrDoneText}>Tamamlandı! Maşallah 🤲</Text>
      )}
    </View>
  );
}

function DuaCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.name}\n\n${item.arabic}\n\n${item.transliteration}\n\n"${item.meaning}"\n\n- NamazPro`,
      });
    } catch (e) {}
  };

  return (
    <TouchableOpacity
      style={styles.duaCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
    >
      <View style={styles.duaHeader}>
        <View style={styles.duaIconBox}>
          <Ionicons name={item.icon} size={20} color={COLORS.white} />
        </View>
        <Text style={styles.duaName}>{item.name}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.textLight}
        />
      </View>
      {expanded && (
        <View style={styles.duaExpanded}>
          <Text style={styles.duaArabic}>{item.arabic}</Text>
          <Text style={styles.duaTranslit}>{item.transliteration}</Text>
          <View style={styles.duaDivider} />
          <Text style={styles.duaMeaning}>{item.meaning}</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={16} color={COLORS.primary} />
            <Text style={styles.shareBtnText}>Paylaş</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const TABS = [
  { key: 'verses', label: 'Ayetler', icon: 'book' },
  { key: 'dhikr', label: 'Zikir', icon: 'ellipse' },
  { key: 'duas', label: 'Dualar', icon: 'hand-right' },
];

export default function QuranScreen() {
  const [activeTab, setActiveTab] = useState('verses');
  const [selectedVerse, setSelectedVerse] = useState(getDailyVerse());

  const dailyVerse = getDailyVerse();

  const handleShareVerse = async (verse) => {
    try {
      await Share.share({
        message: `${verse.arabic}\n\n"${verse.turkish}"\n(${verse.surah} Suresi, ${verse.ayah}. Ayet)\n\n- NamazPro`,
      });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.header}>
          <Text style={styles.headerTitle}>Kuran & İbadet</Text>
          <Text style={styles.headerSubtitle}>Ayetler, Zikir ve Dualar</Text>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color={activeTab === tab.key ? COLORS.primary : COLORS.white}
                />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Verses Tab */}
          {activeTab === 'verses' && (
            <View style={styles.section}>
              {/* Daily Verse Highlight */}
              <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.dailyVerseHighlight}>
                <View style={styles.dailyVerseBadge}>
                  <Ionicons name="star" size={12} color={COLORS.accent} />
                  <Text style={styles.dailyVerseBadgeText}>Günün Ayeti</Text>
                </View>
                <Text style={styles.dailyVerseArabic}>{dailyVerse.arabic}</Text>
                <Text style={styles.dailyVerseTranslit}>{dailyVerse.transliteration}</Text>
                <Text style={styles.dailyVerseText}>{dailyVerse.turkish}</Text>
                <Text style={styles.dailyVerseSource}>
                  {dailyVerse.surah} - {dailyVerse.ayah}. Ayet
                </Text>
                <TouchableOpacity
                  style={styles.shareVerseBtn}
                  onPress={() => handleShareVerse(dailyVerse)}
                >
                  <Ionicons name="share-social" size={16} color={COLORS.primary} />
                  <Text style={styles.shareVerseBtnText}>Paylaş</Text>
                </TouchableOpacity>
              </LinearGradient>

              <Text style={styles.sectionTitle}>Tüm Ayetler</Text>
              {DAILY_VERSES.map((verse, index) => {
                const isSelected = selectedVerse === verse;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.verseCard, isSelected && styles.verseCardSelected]}
                    onPress={() => setSelectedVerse(isSelected ? null : verse)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.verseCardHeader}>
                      <View style={styles.verseCardBadge}>
                        <Text style={styles.verseCardBadgeText}>{index + 1}</Text>
                      </View>
                      <View style={styles.verseCardMeta}>
                        <Text style={styles.verseCardSurah}>{verse.surah} - {verse.ayah}. Ayet</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleShareVerse(verse)} style={{ padding: 4 }}>
                        <Ionicons name="share-social-outline" size={18} color={COLORS.textLight} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.verseCardArabic}>{verse.arabic}</Text>
                    {isSelected && (
                      <>
                        <Text style={styles.verseCardTranslit}>{verse.transliteration}</Text>
                        <View style={styles.verseCardDivider} />
                        <Text style={styles.verseCardTurkish}>{verse.turkish}</Text>
                      </>
                    )}
                    {!isSelected && (
                      <Text style={styles.verseCardPreview} numberOfLines={1}>
                        {verse.turkish}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Dhikr Tab */}
          {activeTab === 'dhikr' && (
            <View style={styles.section}>
              <View style={styles.dhikrInfo}>
                <Ionicons name="information-circle" size={18} color={COLORS.primary} />
                <Text style={styles.dhikrInfoText}>
                  Her zikri belirlenen sayıda tamamlamak için sayacı kullanın.
                </Text>
              </View>
              {DHIKR_LIST.map((dhikr, index) => (
                <DhikrCard key={index} item={dhikr} />
              ))}
            </View>
          )}

          {/* Duas Tab */}
          {activeTab === 'duas' && (
            <View style={styles.section}>
              {DUAS.map((dua, index) => (
                <DuaCard key={index} item={dua} />
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1B5E20' },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },

  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },

  tabsRow: {
    flexDirection: 'row', marginTop: 14, gap: 8,
    paddingBottom: 0,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 0,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.accent },
  tabText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.white },

  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, marginTop: 8 },

  dailyVerseHighlight: {
    borderRadius: 16, padding: 20, marginBottom: 16,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  dailyVerseBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: 12,
  },
  dailyVerseBadgeText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  dailyVerseArabic: {
    fontSize: 24, color: COLORS.white, textAlign: 'right',
    lineHeight: 40, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  dailyVerseTranslit: {
    fontSize: 13, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic',
    textAlign: 'center', marginTop: 8,
  },
  dailyVerseText: {
    fontSize: 15, color: COLORS.white, textAlign: 'center',
    marginTop: 10, lineHeight: 22,
  },
  dailyVerseSource: {
    fontSize: 12, color: COLORS.accent, textAlign: 'center', marginTop: 8,
  },
  shareVerseBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.white, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    alignSelf: 'center', marginTop: 12,
  },
  shareVerseBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  verseCard: {
    backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 10, padding: 14,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  verseCardSelected: { borderWidth: 1.5, borderColor: COLORS.primary },
  verseCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  verseCardBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center',
  },
  verseCardBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  verseCardMeta: { flex: 1, marginLeft: 8 },
  verseCardSurah: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  verseCardArabic: {
    fontSize: 20, color: COLORS.text, textAlign: 'right',
    lineHeight: 34, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  verseCardTranslit: {
    fontSize: 12, color: COLORS.textLight, fontStyle: 'italic',
    textAlign: 'center', marginTop: 6,
  },
  verseCardDivider: { height: 1, backgroundColor: '#E8F5E9', marginVertical: 8 },
  verseCardTurkish: { fontSize: 14, color: COLORS.text, lineHeight: 20, textAlign: 'center' },
  verseCardPreview: { fontSize: 13, color: COLORS.textLight, marginTop: 6 },

  dhikrInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#E8F5E9', borderRadius: 10, padding: 12, marginBottom: 12,
  },
  dhikrInfoText: { fontSize: 13, color: COLORS.textLight, flex: 1 },

  dhikrCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 10,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  dhikrCardComplete: { borderWidth: 1.5, borderColor: '#4CAF50' },
  dhikrArabic: {
    fontSize: 22, color: COLORS.text, textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 36,
  },
  dhikrTranslit: {
    fontSize: 14, color: COLORS.primary, fontWeight: '600',
    textAlign: 'center', marginTop: 4,
  },
  dhikrMeaning: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', marginTop: 2 },
  dhikrCounter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 14, gap: 12,
  },
  dhikrResetBtn: {
    padding: 8, borderRadius: 20, backgroundColor: '#F5F5F5',
  },
  dhikrCountBox: {
    flexDirection: 'row', alignItems: 'baseline', gap: 4,
  },
  dhikrCount: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, minWidth: 40, textAlign: 'center' },
  dhikrCountComplete: { color: '#4CAF50' },
  dhikrTarget: { fontSize: 14, color: COLORS.textLight },
  dhikrBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3,
  },
  dhikrBtnComplete: { backgroundColor: '#4CAF50' },
  dhikrBtnText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  dhikrDoneText: { color: '#4CAF50', textAlign: 'center', marginTop: 8, fontWeight: '600', fontSize: 13 },

  duaCard: {
    backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 10,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  duaHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10,
  },
  duaIconBox: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  duaName: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text },
  duaExpanded: { paddingHorizontal: 14, paddingBottom: 14 },
  duaArabic: {
    fontSize: 20, color: COLORS.text, textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', lineHeight: 34,
  },
  duaTranslit: {
    fontSize: 13, color: COLORS.primary, fontStyle: 'italic',
    textAlign: 'center', marginTop: 6,
  },
  duaDivider: { height: 1, backgroundColor: '#E8F5E9', marginVertical: 10 },
  duaMeaning: { fontSize: 14, color: COLORS.text, lineHeight: 20, textAlign: 'center' },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: 10, alignSelf: 'center',
  },
  shareBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
});
