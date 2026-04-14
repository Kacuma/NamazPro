// Islamic holidays and countdowns utility
// Dates are approximate and should be confirmed with official sources each year

export const ISLAMIC_EVENTS_2026 = [
  {
    id: 'ramadan_2026',
    name: 'Ramazan Bayramı',
    arabicName: 'عيد الفطر',
    description: 'Ramazan ayının sona erdiğini ve şükranı kutlayan mübarek bayram',
    startDate: new Date('2026-03-20'),
    endDate: new Date('2026-03-22'),
    icon: 'moon',
    color: '#1B5E20',
    type: 'bayram',
  },
  {
    id: 'kurban_2026',
    name: 'Kurban Bayramı',
    arabicName: 'عيد الأضحى',
    description: 'Hz. İbrahim\'in kurban etme niyetini ve Allah\'ın lütfunu anma',
    startDate: new Date('2026-05-27'),
    endDate: new Date('2026-05-30'),
    icon: 'star',
    color: '#B71C1C',
    type: 'bayram',
  },
  {
    id: 'mevlid_2026',
    name: 'Mevlid Kandili',
    arabicName: 'المولد النبوي',
    description: 'Hz. Muhammed (s.a.v.)\'in doğum günü kutlaması',
    startDate: new Date('2026-09-15'),
    endDate: new Date('2026-09-15'),
    icon: 'star',
    color: '#E65100',
    type: 'kandil',
  },
  {
    id: 'regaib_2026',
    name: 'Regaib Kandili',
    arabicName: 'ليلة الرغائب',
    description: 'Mübarek üç ayların başlangıcı',
    startDate: new Date('2026-01-22'),
    endDate: new Date('2026-01-22'),
    icon: 'moon',
    color: '#4A148C',
    type: 'kandil',
  },
  {
    id: 'mirac_2026',
    name: 'Miraç Kandili',
    arabicName: 'ليلة المعراج',
    description: 'Hz. Peygamber\'in miraca yükseltildiği gece',
    startDate: new Date('2026-03-08'),
    endDate: new Date('2026-03-08'),
    icon: 'star',
    color: '#006064',
    type: 'kandil',
  },
  {
    id: 'berat_2026',
    name: 'Berat Kandili',
    arabicName: 'ليلة البراءة',
    description: 'Şaban ayının 15. gecesi, af ve beraat gecesi',
    startDate: new Date('2026-03-12'),
    endDate: new Date('2026-03-12'),
    icon: 'moon',
    color: '#1A237E',
    type: 'kandil',
  },
  {
    id: 'kadir_2026',
    name: 'Kadir Gecesi',
    arabicName: 'ليلة القدر',
    description: 'Bin aydan hayırlı olan mübarek gece',
    startDate: new Date('2026-04-16'),
    endDate: new Date('2026-04-16'),
    icon: 'star',
    color: '#1B5E20',
    type: 'kandil',
  },
  {
    id: 'ramazan_start_2026',
    name: 'Ramazan Başlangıcı',
    arabicName: 'بداية رمضان',
    description: 'Mübarek Ramazan ayının başlangıcı',
    startDate: new Date('2026-03-19'),
    endDate: new Date('2026-03-19'),
    icon: 'moon',
    color: '#1B5E20',
    type: 'ramazan',
  },
];

export function getUpcomingEvents(count = 5) {
  const now = new Date();
  const upcoming = ISLAMIC_EVENTS_2026
    .filter(event => event.startDate >= now || event.endDate >= now)
    .sort((a, b) => a.startDate - b.startDate)
    .slice(0, count);

  return upcoming.map(event => ({
    ...event,
    daysLeft: getDaysLeft(event.startDate),
  }));
}

export function getDaysLeft(targetDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getCountdownText(daysLeft) {
  if (daysLeft < 0) return 'Geçti';
  if (daysLeft === 0) return 'Bugün!';
  if (daysLeft === 1) return 'Yarın!';
  return `${daysLeft} gün kaldı`;
}

export function getRamadanInfo() {
  const ramadanStart = new Date('2026-03-19');
  const ramadanEnd = new Date('2026-04-17');
  const now = new Date();

  const daysLeft = getDaysLeft(ramadanStart);

  if (now >= ramadanStart && now <= ramadanEnd) {
    const dayOfRamadan = getDaysLeft(ramadanStart);
    return {
      status: 'active',
      day: Math.abs(dayOfRamadan) + 1,
      daysLeft: 0,
      text: `Ramazan'ın ${Math.abs(dayOfRamadan) + 1}. günü`,
    };
  }

  return {
    status: 'upcoming',
    daysLeft,
    text: getCountdownText(daysLeft),
  };
}

export function getKurbanInfo() {
  const kurbanStart = new Date('2026-05-27');
  const kurbanEnd = new Date('2026-05-30');
  const now = new Date();
  const daysLeft = getDaysLeft(kurbanStart);

  if (now >= kurbanStart && now <= kurbanEnd) {
    return {
      status: 'active',
      daysLeft: 0,
      text: 'Kurban Bayramı Mübarek Olsun!',
    };
  }

  return {
    status: 'upcoming',
    daysLeft,
    text: getCountdownText(daysLeft),
  };
}

export function getHijriMonthName(month) {
  const months = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
    'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
    'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
  ];
  return months[month - 1] || '';
}
