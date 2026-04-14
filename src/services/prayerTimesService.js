import axios from 'axios';

const BASE_URL = 'https://api.aladhan.com/v1';

// Method 13 = Diyanet İşleri Başkanlığı (Turkey)
const DEFAULT_METHOD = 13;

export async function getPrayerTimes(latitude, longitude, date = null) {
  const dateStr = date || formatDate(new Date());
  const url = `${BASE_URL}/timings/${dateStr}`;

  try {
    const response = await axios.get(url, {
      params: {
        latitude,
        longitude,
        method: DEFAULT_METHOD,
      },
      timeout: 10000,
    });

    const timings = response.data.data.timings;
    const meta = response.data.data.meta;
    const dateInfo = response.data.data.date;

    return {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      timezone: meta.timezone,
      date: dateInfo.readable,
      hijriDate: dateInfo.hijri,
      gregorianDate: dateInfo.gregorian,
    };
  } catch (error) {
    console.error('Prayer times fetch error:', error.message);
    throw new Error('Namaz vakitleri alınamadı. İnternet bağlantınızı kontrol edin.');
  }
}

export async function getMonthlyPrayerTimes(latitude, longitude, month, year) {
  const url = `${BASE_URL}/calendar/${year}/${month}`;

  try {
    const response = await axios.get(url, {
      params: {
        latitude,
        longitude,
        method: DEFAULT_METHOD,
      },
      timeout: 15000,
    });
    return response.data.data;
  } catch (error) {
    console.error('Monthly prayer times error:', error.message);
    throw new Error('Aylık namaz vakitleri alınamadı.');
  }
}

export function getPrayerName(key) {
  const names = {
    fajr: 'İmsak',
    sunrise: 'Güneş',
    dhuhr: 'Öğle',
    asr: 'İkindi',
    maghrib: 'Akşam',
    isha: 'Yatsı',
  };
  return names[key] || key;
}

export function getPrayerIcon(key) {
  const icons = {
    fajr: 'moon',
    sunrise: 'sunny',
    dhuhr: 'sunny',
    asr: 'partly-sunny',
    maghrib: 'sunset',
    isha: 'moon',
  };
  return icons[key] || 'time';
}

export function getNextPrayer(prayerTimes) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { key: 'fajr', time: prayerTimes.fajr },
    { key: 'sunrise', time: prayerTimes.sunrise },
    { key: 'dhuhr', time: prayerTimes.dhuhr },
    { key: 'asr', time: prayerTimes.asr },
    { key: 'maghrib', time: prayerTimes.maghrib },
    { key: 'isha', time: prayerTimes.isha },
  ];

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;
    if (prayerMinutes > currentTime) {
      const diff = prayerMinutes - currentTime;
      return {
        name: getPrayerName(prayer.key),
        time: prayer.time,
        minutesLeft: diff,
        hoursLeft: Math.floor(diff / 60),
        minsLeft: diff % 60,
      };
    }
  }

  // Next day fajr
  const [hours, minutes] = prayerTimes.fajr.split(':').map(Number);
  const fajrMinutes = hours * 60 + minutes;
  const diff = 24 * 60 - currentTime + fajrMinutes;
  return {
    name: 'İmsak',
    time: prayerTimes.fajr,
    minutesLeft: diff,
    hoursLeft: Math.floor(diff / 60),
    minsLeft: diff % 60,
  };
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
