/* data.js — add, edit or remove events here; the page re-renders itself.
   date: Gregorian ISO (shown to users as Jalali). price: Toman, 0 = free.
   left: remaining tickets. featured: true on ONE event (hero ticket + countdown). */
window.EVENTS = [
  { id: "ai-conf", featured: true, category: "همایش", title: "همایش ملی هوش مصنوعی و آینده آموزش",
    date: "2026-11-19T09:00", venue: "سالن همایش‌های دانشگاه", price: 150000, left: 38 },
  { id: "concert", category: "کنسرت", title: "شب موسیقی سنتی خراسان",
    date: "2026-11-26T20:00", venue: "سالن اجتماعات مرکزی", price: 250000, left: 120 },
  { id: "photo", category: "کارگاه", title: "کارگاه عکاسی مستند با مدرس مهمان",
    date: "2026-12-03T10:00", venue: "دانشکده هنر", price: 100000, left: 12 },
  { id: "theatre", category: "تئاتر", title: "نمایش «شب‌های کویر»",
    date: "2026-12-10T19:00", venue: "تالار نمایش دانشگاه", price: 120000, left: 64 },
  { id: "futsal", category: "ورزشی", title: "فینال مسابقات فوتسال جام دانشگاه",
    date: "2026-12-17T16:00", venue: "سالن ورزشی دانشگاه", price: 0, left: 200 },
  { id: "book-fair", category: "نمایشگاه", title: "نمایشگاه کتاب و دست‌سازه‌های دانشجویی",
    date: "2026-12-24T09:00", venue: "محوطه مرکزی دانشگاه", price: 30000, left: 0 }
];
