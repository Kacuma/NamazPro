// Daily Quran verses in Turkish and Arabic
export const DAILY_VERSES = [
  {
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    turkish: 'Rahman ve Rahim olan Allah\'ın adıyla.',
    surah: 'Fatiha',
    ayah: 1,
    surahNumber: 1,
    transliteration: 'Bismillahirrahmanirrahim',
  },
  {
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    turkish: 'Hamd, alemlerin Rabbi Allah\'a mahsustur.',
    surah: 'Fatiha',
    ayah: 2,
    surahNumber: 1,
    transliteration: 'Elhamdülillahi rabbil alemin',
  },
  {
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    turkish: 'Kim Allah\'tan korkarsa, Allah ona bir çıkış yolu açar.',
    surah: 'Talak',
    ayah: 2,
    surahNumber: 65,
    transliteration: 'Ve men yettekillâhe yec\'al lehu mahrecâ',
  },
  {
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    turkish: 'Şüphesiz güçlükle birlikte kolaylık vardır.',
    surah: 'İnşirah',
    ayah: 6,
    surahNumber: 94,
    transliteration: 'İnne mea\'l-usri yusrâ',
  },
  {
    arabic: 'وَاللَّهُ خَيْرُ الرَّازِقِينَ',
    turkish: 'Allah rızık verenlerin en hayırlısıdır.',
    surah: 'Cuma',
    ayah: 11,
    surahNumber: 62,
    transliteration: 'Vallahu hayrul rızıkın',
  },
  {
    arabic: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ',
    turkish: 'Hoşlanmadığınız bir şey hakkında, belki o sizin için hayırlıdır.',
    surah: 'Bakara',
    ayah: 216,
    surahNumber: 2,
    transliteration: 'Ve asâ en tekrehû şey\'en ve hüve hayrun leküm',
  },
  {
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    turkish: 'Gerçekten güçlükle birlikte kolaylık vardır.',
    surah: 'İnşirah',
    ayah: 5,
    surahNumber: 94,
    transliteration: 'Fe inne mea\'l-usri yüsrâ',
  },
  {
    arabic: 'وَتَوَكَّلْ عَلَى اللَّهِ وَكَفَىٰ بِاللَّهِ وَكِيلًا',
    turkish: 'Allah\'a tevekkül et; vekil olarak Allah yeter.',
    surah: 'Ahzab',
    ayah: 3,
    surahNumber: 33,
    transliteration: 'Ve tevekkül alallahi ve kefâ billahi vekîlâ',
  },
  {
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
    turkish: 'Rabbimiz, bize dünyada da ahirette de iyilik ver.',
    surah: 'Bakara',
    ayah: 201,
    surahNumber: 2,
    transliteration: 'Rabbena atina fid-dünya haseneten ve fil-ahireti haseneten',
  },
  {
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    turkish: 'Allah bize yeter, O ne güzel vekildir.',
    surah: 'Ali İmran',
    ayah: 173,
    surahNumber: 3,
    transliteration: 'Hasbunallahu ve ni\'mel vekil',
  },
  {
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ',
    turkish: 'Ey iman edenler! Sabır ve namazla yardım isteyin.',
    surah: 'Bakara',
    ayah: 153,
    surahNumber: 2,
    transliteration: 'Yâ eyyühellezîne amenüste\'inû bissabri vesselât',
  },
  {
    arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    turkish: 'Şüphesiz Allah sabredenlerle beraberdir.',
    surah: 'Bakara',
    ayah: 153,
    surahNumber: 2,
    transliteration: 'İnnallâhe mea\'s-sâbirîn',
  },
  {
    arabic: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ',
    turkish: 'Benim başarım ancak Allah\'ın yardımıyladır.',
    surah: 'Hud',
    ayah: 88,
    surahNumber: 11,
    transliteration: 'Ve mâ tevfîkî illâ billâh',
  },
  {
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    turkish: 'Dikkat edin! Kalpler ancak Allah\'ı zikrederek huzur bulur.',
    surah: 'Rad',
    ayah: 28,
    surahNumber: 13,
    transliteration: 'Elâ bizikrillâhi tatmeinnul kulûb',
  },
  {
    arabic: 'وَاللَّهُ وَلِيُّ الْمُؤْمِنِينَ',
    turkish: 'Allah müminlerin dostudur.',
    surah: 'Ali İmran',
    ayah: 68,
    surahNumber: 3,
    transliteration: 'Vallâhu veliyyul mu\'minîn',
  },
];

export function getDailyVerse() {
  const dayOfYear = getDayOfYear(new Date());
  const index = dayOfYear % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
