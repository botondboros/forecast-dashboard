import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LabelList, ReferenceLine,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Star, Users, Moon, Banknote, X, Calendar, MapPin,
  Sparkles, Globe, Sun, AlertTriangle, CalendarDays, GraduationCap, Megaphone,
  LayoutDashboard, BarChart3, Thermometer, Waves, Flag, Droplets, Ticket, ShoppingBag, PlusCircle,
  UtensilsCrossed, CreditCard, Wallet, Receipt, Wine, Coffee, Cookie,
  ChevronRight, Filter, PartyPopper,
} from 'lucide-react';

// ======================================================================
// 🔑 GOOGLE MAPS API KEY — paste your own key here
// ======================================================================
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

// ---------- BRAND COLORS ----------
const B = {
  navy: '#0B2545',
  navyDark: '#061A33',
  navyLight: '#13315C',
  blue: '#1E5FB4',
  blueBright: '#2B7CE9',
  blueLight: '#E6EFFA',
  lake: '#3B7EA1',
  lakeDeep: '#1E4A66',
  lakeShallow: '#7FA9C2',
  red: '#C8102E',
  purple: '#7C3AED',
  gold: '#D4A017',
  green: '#1F8A5D',
  orange: '#D97706',
  bg: '#F4F6FA',
  paper: '#FFFFFF',
  ink: '#0F172A',
  inkSoft: '#475569',
  muted: '#94A3B8',
  hair: '#E2E8F0',
  hairStrong: '#CBD5E1',
};
const STATUS = {
  green:  '#1F8A5D',
  yellow: '#D4A017',
  orange: '#D97706',
  red:    '#C8102E',
};

const FONT = "'DM Sans', system-ui, -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

// ---------- CITIES (with real lat/lng for Google Maps) ----------
const CITIES = [
  { name: 'Sárvár',         guestLow: 3200, guestHigh: 8500, status: 'green',  size: 0.85, baseAdr: 28000, yoyV: 1.078, yoyA: 1.085, district: 'Sárvári',     lat: 47.2517, lng: 16.9367 },
  { name: 'Siófok',         guestLow: 3500, guestHigh: 5000, status: 'green',  size: 1.00, baseAdr: 33000, yoyV: 1.072, yoyA: 1.085, district: 'Siófoki',     lat: 46.9078, lng: 18.0472 },
  { name: 'Keszthely',      guestLow: 2600, guestHigh: 3500, status: 'green',  size: 0.72, baseAdr: 29000, yoyV: 1.058, yoyA: 1.080, district: 'Keszthelyi',  lat: 46.7686, lng: 17.2428 },
  { name: 'Veszprém',       guestLow: 2100, guestHigh: 2100, status: 'green',  size: 0.55, baseAdr: 26500, yoyV: 1.065, yoyA: 1.075, district: 'Veszprémi',   lat: 47.0933, lng: 17.9080 },
  { name: 'Hévíz',          guestLow: 5400, guestHigh: 5400, status: 'green',  size: 1.10, baseAdr: 38000, yoyV: 1.080, yoyA: 1.095, district: 'Keszthelyi',  lat: 46.7894, lng: 17.1900 },
  { name: 'Balatonföldvár', guestLow: 850,  guestHigh: 1700, status: 'yellow', size: 0.38, baseAdr: 22500, yoyV: 1.048, yoyA: 1.070, district: 'Siófoki',     lat: 46.8500, lng: 17.8833 },
  { name: 'Révfülöp',       guestLow: 600,  guestHigh: 1100, status: 'yellow', size: 0.28, baseAdr: 19500, yoyV: 1.035, yoyA: 1.060, district: 'Tapolcai',    lat: 46.8225, lng: 17.6208 },
  { name: 'Szántód',        guestLow: 400,  guestHigh: 1000, status: 'yellow', size: 0.24, baseAdr: 20500, yoyV: 1.040, yoyA: 1.065, district: 'Siófoki',     lat: 46.8694, lng: 17.9125 },
  { name: 'Vonyarcvashegy', guestLow: 400,  guestHigh: 850,  status: 'orange', size: 0.22, baseAdr: 18500, yoyV: 1.028, yoyA: 1.050, district: 'Keszthelyi',  lat: 46.7867, lng: 17.3094 },
  { name: 'Balatonberény',  guestLow: 300,  guestHigh: 600,  status: 'orange', size: 0.18, baseAdr: 17500, yoyV: 1.025, yoyA: 1.045, district: 'Marcali',     lat: 46.7114, lng: 17.3406 },
  { name: 'Zalacsány',      guestLow: 1000, guestHigh: 1000, status: 'red',    size: 0.30, baseAdr: 21000, yoyV: 1.015, yoyA: 1.055, district: 'Keszthelyi',  lat: 46.8333, lng: 17.1500 },
];

// Per-city nationality profile — foreign share always < 18%
// Top 5 foreign markets: Németország, Lengyelország, Csehország, Ausztria, Olaszország
const CITY_NAT_PROFILES = {
  'Sárvár':         { pct: { Magyar: 60,   Osztrák: 15, Német: 9,   Cseh: 4.5, Lengyel: 3.5, Olasz: 2.8, Szlovák: 2.5, Holland: 1.0, Brit: 0.7, Egyéb: 1.0 } },
  'Siófok':         { pct: { Magyar: 83,   Német: 6.0, Lengyel: 4.0, Cseh: 3.0, Osztrák: 2.0, Olasz: 1.0, Szlovák: 0.5, Holland: 0.3, Brit: 0.1, Egyéb: 0.1 } },
  'Keszthely':      { pct: { Magyar: 85,   Német: 7.0, Lengyel: 3.0, Cseh: 2.0, Osztrák: 1.5, Olasz: 0.8, Szlovák: 0.3, Holland: 0.2, Brit: 0.1, Egyéb: 0.1 } },
  'Veszprém':       { pct: { Magyar: 87,   Német: 5.0, Lengyel: 3.0, Cseh: 2.0, Osztrák: 1.3, Olasz: 0.8, Szlovák: 0.3, Holland: 0.2, Brit: 0.2, Egyéb: 0.2 } },
  'Hévíz':          { pct: { Magyar: 82,   Német: 8.0, Lengyel: 2.0, Cseh: 3.0, Osztrák: 3.0, Olasz: 1.0, Szlovák: 0.4, Holland: 0.3, Brit: 0.2, Egyéb: 0.1 } },
  'Balatonföldvár': { pct: { Magyar: 86,   Német: 5.0, Lengyel: 4.0, Cseh: 2.0, Osztrák: 1.5, Olasz: 0.8, Szlovák: 0.3, Holland: 0.2, Brit: 0.1, Egyéb: 0.1 } },
  'Révfülöp':       { pct: { Magyar: 85,   Német: 6.0, Lengyel: 3.0, Cseh: 2.5, Osztrák: 1.5, Olasz: 1.0, Szlovák: 0.4, Holland: 0.3, Brit: 0.2, Egyéb: 0.1 } },
  'Szántód':        { pct: { Magyar: 88,   Német: 5.0, Lengyel: 3.0, Cseh: 2.0, Osztrák: 1.0, Olasz: 0.5, Szlovák: 0.2, Holland: 0.1, Brit: 0.1, Egyéb: 0.1 } },
  'Vonyarcvashegy': { pct: { Magyar: 83,   Német: 8.0, Lengyel: 3.0, Cseh: 2.0, Osztrák: 2.5, Olasz: 0.8, Szlovák: 0.3, Holland: 0.2, Brit: 0.1, Egyéb: 0.1 } },
  'Balatonberény':  { pct: { Magyar: 89,   Német: 4.0, Lengyel: 3.0, Cseh: 2.0, Osztrák: 1.0, Olasz: 0.6, Szlovák: 0.2, Holland: 0.1, Brit: 0.05, Egyéb: 0.05 } },
  'Zalacsány':      { pct: { Magyar: 91,   Német: 4.0, Lengyel: 1.5, Cseh: 1.5, Osztrák: 1.0, Olasz: 0.5, Szlovák: 0.2, Holland: 0.1, Brit: 0.1, Egyéb: 0.1 } },
};

const DISTRICTS = ['Összes járás', 'Keszthelyi', 'Siófoki', 'Tapolcai', 'Veszprémi', 'Marcali'];

// ---------- TOP 15 HUNGARIAN SPAS ----------
const BATHS = [
  { name: 'Hévízi Tófürdő',              city: 'Hévíz',            region: 'Nyugat-Dunántúl',      weeklyTickets: 28500, avgTicket: 6800, addonPerTicket: 0.42, addonValue: 4200, yoyTickets: 4.8, yoyAddon: 7.2, nearbyCities: [{name:'Hévíz',w:5400},{name:'Keszthely',w:3100},{name:'Zalacsány',w:850},{name:'Cserszegtomaj',w:420}] },
  { name: 'Hajdúszoboszló Aqua-Palace',  city: 'Hajdúszoboszló',   region: 'Észak-Alföld',         weeklyTickets: 32800, avgTicket: 5400, addonPerTicket: 0.38, addonValue: 3600, yoyTickets: 5.6, yoyAddon: 8.4, nearbyCities: [{name:'Hajdúszoboszló',w:6200},{name:'Debrecen',w:2800},{name:'Nádudvar',w:380},{name:'Ebes',w:260}] },
  { name: 'Gyulai Várfürdő',             city: 'Gyula',            region: 'Dél-Alföld',           weeklyTickets: 24600, avgTicket: 5200, addonPerTicket: 0.34, addonValue: 3400, yoyTickets: 3.9, yoyAddon: 5.8, nearbyCities: [{name:'Gyula',w:4800},{name:'Békéscsaba',w:1600},{name:'Sarkad',w:420},{name:'Kétegyháza',w:280}] },
  { name: 'Zalakaros Fürdő',             city: 'Zalakaros',        region: 'Nyugat-Dunántúl',      weeklyTickets: 22400, avgTicket: 5800, addonPerTicket: 0.40, addonValue: 3900, yoyTickets: 4.2, yoyAddon: 6.4, nearbyCities: [{name:'Zalakaros',w:3900},{name:'Nagykanizsa',w:1400},{name:'Galambok',w:380},{name:'Zalakomár',w:220}] },
  { name: 'Bükfürdő',                    city: 'Bük',              region: 'Nyugat-Dunántúl',      weeklyTickets: 21200, avgTicket: 6400, addonPerTicket: 0.45, addonValue: 4400, yoyTickets: 4.5, yoyAddon: 7.8, nearbyCities: [{name:'Bük',w:3600},{name:'Sárvár',w:1200},{name:'Szombathely',w:920},{name:'Répcelak',w:280}] },
  { name: 'Sárvári Gyógyfürdő',          city: 'Sárvár',           region: 'Nyugat-Dunántúl',      weeklyTickets: 13500, avgTicket: 6800, addonPerTicket: 0.45, addonValue: 4400, yoyTickets: 5.2, yoyAddon: 7.4, nearbyCities: [{name:'Sárvár',w:5000},{name:'Szombathely',w:1400},{name:'Celldömölk',w:380},{name:'Ikervár',w:220}] },
  { name: 'Harkányi Gyógyfürdő',         city: 'Harkány',          region: 'Dél-Dunántúl',         weeklyTickets: 16400, avgTicket: 4800, addonPerTicket: 0.32, addonValue: 3200, yoyTickets: 3.2, yoyAddon: 5.1, nearbyCities: [{name:'Harkány',w:2400},{name:'Pécs',w:1800},{name:'Siklós',w:640},{name:'Villány',w:380}] },
  { name: 'Egri Termálfürdő',            city: 'Eger',             region: 'Észak-Magyarország',   weeklyTickets: 18200, avgTicket: 4600, addonPerTicket: 0.30, addonValue: 2900, yoyTickets: 4.1, yoyAddon: 5.5, nearbyCities: [{name:'Eger',w:3200},{name:'Egerszalók',w:980},{name:'Andornaktálya',w:320},{name:'Noszvaj',w:240}] },
  { name: 'Saliris Resort Egerszalók',   city: 'Egerszalók',       region: 'Észak-Magyarország',   weeklyTickets: 14600, avgTicket: 7200, addonPerTicket: 0.52, addonValue: 5400, yoyTickets: 5.8, yoyAddon: 9.2, nearbyCities: [{name:'Egerszalók',w:1800},{name:'Eger',w:2800},{name:'Demjén',w:460},{name:'Verpelét',w:220}] },
  { name: 'Miskolctapolcai Barlangfürdő', city: 'Miskolctapolca',  region: 'Észak-Magyarország',   weeklyTickets: 17400, avgTicket: 4400, addonPerTicket: 0.28, addonValue: 2600, yoyTickets: 3.4, yoyAddon: 4.8, nearbyCities: [{name:'Miskolc',w:2900},{name:'Miskolctapolca',w:1600},{name:'Kistokaj',w:280},{name:'Bükkszentkereszt',w:180}] },
  { name: 'Debreceni Aquaticum',         city: 'Debrecen',         region: 'Észak-Alföld',         weeklyTickets: 15800, avgTicket: 5600, addonPerTicket: 0.36, addonValue: 3800, yoyTickets: 4.3, yoyAddon: 6.2, nearbyCities: [{name:'Debrecen',w:3800},{name:'Hajdúszoboszló',w:1400},{name:'Hajdúböszörmény',w:420},{name:'Vámospércs',w:180}] },
  { name: 'Szegedi Anna-fürdő',          city: 'Szeged',           region: 'Dél-Alföld',           weeklyTickets: 12400, avgTicket: 4200, addonPerTicket: 0.24, addonValue: 2400, yoyTickets: 2.8, yoyAddon: 3.9, nearbyCities: [{name:'Szeged',w:2600},{name:'Makó',w:620},{name:'Mórahalom',w:340},{name:'Hódmezővásárhely',w:480}] },
  { name: 'Mórahalmi Erzsébet-fürdő',    city: 'Mórahalom',        region: 'Dél-Alföld',           weeklyTickets: 11200, avgTicket: 4400, addonPerTicket: 0.30, addonValue: 2800, yoyTickets: 3.7, yoyAddon: 5.3, nearbyCities: [{name:'Mórahalom',w:1800},{name:'Szeged',w:1400},{name:'Ásotthalom',w:260},{name:'Üllés',w:140}] },
  { name: 'Demjén Cascade',              city: 'Demjén',           region: 'Észak-Magyarország',   weeklyTickets: 10800, avgTicket: 6600, addonPerTicket: 0.44, addonValue: 4800, yoyTickets: 6.4, yoyAddon: 10.1, nearbyCities: [{name:'Demjén',w:1200},{name:'Eger',w:2400},{name:'Egerszalók',w:680},{name:'Kerecsend',w:160}] },
  { name: 'Szentesi Üdülőközpont',       city: 'Szentes',          region: 'Dél-Alföld',           weeklyTickets: 9400,  avgTicket: 4000, addonPerTicket: 0.22, addonValue: 2200, yoyTickets: 2.4, yoyAddon: 3.2, nearbyCities: [{name:'Szentes',w:1400},{name:'Csongrád',w:480},{name:'Szegvár',w:220},{name:'Mindszent',w:180}] },
];

// Per-bath nationality profiles (foreign share 12-35% — spas are more international than lake towns)
const BATH_NAT_PROFILES = {
  'Hévízi Tófürdő':               { pct: { Magyar: 58, Német: 18,  Osztrák: 9,  Cseh: 6,  Olasz: 3,  Lengyel: 3,  Szlovák: 1.5, Holland: 0.8, Brit: 0.4, Egyéb: 0.3 } },
  'Hajdúszoboszló Aqua-Palace':   { pct: { Magyar: 78, Német: 6,   Lengyel: 5,  Cseh: 4,  Osztrák: 2,  Olasz: 1.5, Szlovák: 2,   Holland: 0.7, Brit: 0.5, Egyéb: 0.3 } },
  'Gyulai Várfürdő':              { pct: { Magyar: 82, Német: 4,   Lengyel: 3,  Cseh: 3,  Olasz: 2,  Osztrák: 2,  Szlovák: 2.5, Holland: 0.8, Brit: 0.4, Egyéb: 0.3 } },
  'Zalakaros Fürdő':              { pct: { Magyar: 65, Német: 14,  Osztrák: 7,  Cseh: 5,  Olasz: 3,  Lengyel: 3,  Szlovák: 2,   Holland: 0.6, Brit: 0.3, Egyéb: 0.1 } },
  'Bükfürdő':                     { pct: { Magyar: 62, Német: 15,  Osztrák: 10, Cseh: 5,  Olasz: 2.5, Lengyel: 2,  Szlovák: 2.4, Holland: 0.6, Brit: 0.3, Egyéb: 0.2 } },
  'Sárvári Gyógyfürdő':           { pct: { Magyar: 55,   Osztrák: 18, Német: 11,  Cseh: 5,    Lengyel: 4,  Olasz: 3,    Szlovák: 2.5, Holland: 0.8, Brit: 0.5, Egyéb: 0.2 } },
  'Harkányi Gyógyfürdő':          { pct: { Magyar: 70, Német: 11,  Osztrák: 4,  Cseh: 4,  Olasz: 3,  Lengyel: 3,  Szlovák: 3,   Holland: 1.2, Brit: 0.6, Egyéb: 0.2 } },
  'Egri Termálfürdő':             { pct: { Magyar: 80, Német: 5,   Lengyel: 4,  Cseh: 3,  Osztrák: 2,  Olasz: 2,  Szlovák: 2.5, Holland: 0.7, Brit: 0.5, Egyéb: 0.3 } },
  'Saliris Resort Egerszalók':    { pct: { Magyar: 74, Német: 8,   Lengyel: 5,  Cseh: 4,  Osztrák: 3,  Olasz: 2.4, Szlovák: 2.2, Holland: 0.8, Brit: 0.4, Egyéb: 0.2 } },
  'Miskolctapolcai Barlangfürdő': { pct: { Magyar: 84, Német: 4,   Lengyel: 4,  Cseh: 2.5, Osztrák: 1.5, Olasz: 1, Szlovák: 2.5, Holland: 0.3, Brit: 0.1, Egyéb: 0.1 } },
  'Debreceni Aquaticum':          { pct: { Magyar: 80, Német: 5,   Lengyel: 4,  Cseh: 3,  Osztrák: 2,  Olasz: 2,  Szlovák: 3,   Holland: 0.6, Brit: 0.3, Egyéb: 0.1 } },
  'Szegedi Anna-fürdő':           { pct: { Magyar: 81, Német: 4,   Lengyel: 3,  Cseh: 3,  Olasz: 3,  Osztrák: 2,  Szlovák: 2.8, Holland: 0.7, Brit: 0.4, Egyéb: 0.1 } },
  'Mórahalmi Erzsébet-fürdő':     { pct: { Magyar: 85, Német: 3,   Lengyel: 2.5, Cseh: 2, Olasz: 2,  Osztrák: 1.5, Szlovák: 3,  Holland: 0.5, Brit: 0.3, Egyéb: 0.2 } },
  'Demjén Cascade':               { pct: { Magyar: 72, Német: 8,   Lengyel: 6,  Cseh: 5,  Olasz: 3,  Osztrák: 3,  Szlovák: 2.4, Holland: 0.4, Brit: 0.2, Egyéb: 0 } },
  'Szentesi Üdülőközpont':        { pct: { Magyar: 88, Német: 3,   Lengyel: 2,  Cseh: 2,  Olasz: 1.5, Osztrák: 1, Szlovák: 2,   Holland: 0.3, Brit: 0.1, Egyéb: 0.1 } },
};

const ACC_CATEGORIES = [
  { name: 'Panzió',                short: 'Panzió',    mult: 0.48 },
  { name: 'Magán / egyéb',         short: 'Magán',     mult: 0.32 },
  { name: 'Hotel 1★',              short: '1★',        mult: 0.42 },
  { name: 'Hotel 2★',              short: '2★',        mult: 0.58 },
  { name: 'Hotel 3★',              short: '3★',        mult: 0.80 },
  { name: 'Hotel 4★',              short: '4★',        mult: 1.12 },
  { name: 'Hotel 5★',              short: '5★',        mult: 1.60 },
  { name: 'Kemping',               short: 'Kemping',   mult: 0.22 },
  { name: 'Közösségi szálláshely', short: 'Közösségi', mult: 0.38 },
];

// ---------- HOLIDAYS + EVENTS ----------
const HOLIDAYS = {
  '2026-05-24': 'Pünkösdvasárnap',
  '2026-05-25': 'Pünkösdhétfő',
  '2026-08-20': 'Államalapítás',
};
const EVENTS = [
  { name: 'Sárvári Pünkösdi Várjátékok',          location: 'Sárvár',         start: '2026-05-23', end: '2026-05-25', uplift: 4.45, boost: 2.65 },
  { name: 'Bükfürdő Pünkösdi Wellness Hétvége',   location: 'Bük (15 km)',    start: '2026-05-22', end: '2026-05-25', uplift: 3.85, boost: 2.20 },
  { name: 'Csepregi Pünkösdi Királyválasztás',    location: 'Csepreg (25 km)', start: '2026-05-24', end: '2026-05-24', uplift: 2.10, boost: 1.45 },
  { name: 'Celldömölki Mária-kegyhely Búcsúja',   location: 'Celldömölk (25 km)', start: '2026-05-23', end: '2026-05-25', uplift: 2.40, boost: 1.55 },
  { name: 'Kőszegi Várfesztivál',                 location: 'Kőszeg (40 km)', start: '2026-05-23', end: '2026-05-25', uplift: 2.95, boost: 1.80 },
];
const EVENT_DAYS = new Set();
EVENTS.forEach(ev => {
  for (let d = new Date(ev.start); d <= new Date(ev.end); d.setDate(d.getDate() + 1)) {
    EVENT_DAYS.add(d.toISOString().slice(0, 10));
  }
});
const PRE_EVENT_DAYS = new Set();
EVENTS.forEach(ev => {
  const start = new Date(ev.start);
  for (let i = 7; i >= 1; i--) {
    const d = new Date(start); d.setDate(start.getDate() - i);
    PRE_EVENT_DAYS.add(d.toISOString().slice(0, 10));
  }
});

// ---------- INTERNATIONAL TRENDS ----------
const INTL_TRENDS = [
  { name: 'Időjárás',                                      value: 5.4,    icon: Sun },
  { name: 'Geopolitika',                                   value: 0.1,    icon: Globe },
  { name: 'Országos forgalomélénkítő kampány',            value: 0.021, icon: Megaphone },
  { name: 'Nemzetközi ünnepek',                            value: 0.01,   icon: Flag },
  { name: 'Iskolaszünet',                                  value: 0.01,   icon: GraduationCap },
  { name: 'Szabadnapok és naptárhatás',                    value: -0.011, icon: CalendarDays },
  { name: 'Közlekedési fennakadások',                      value: -0.06,  icon: AlertTriangle },
  { name: 'Események',                                     value: -0.2,   icon: Sparkles },
];

// ---------- HELPERS ----------
function isoDate(d) { return d.toISOString().slice(0, 10); }

function generateDays(cityName) {
  const city = CITIES.find(c => c.name === cityName);
  // Per-city seasonality & noise seed, so every city behaves distinctly
  const charCodeSum = [...cityName].reduce((s, c) => s + c.charCodeAt(0), 0);
  const peakShift = (charCodeSum % 15) - 7;  // Each city peaks at slightly different week
  const weekendBoost = 1.25 + ((charCodeSum % 11) / 100);  // 1.25-1.35
  const noiseSeed = charCodeSum;

  // Spa towns have flatter seasonality (year-round wellness tourism)
  // and don't need the 0.7 dampening that lake towns use
  const isSpaTown = ['Sárvár', 'Hévíz', 'Bük'].includes(cityName);
  const baseMult = isSpaTown ? 1.00 : 0.7;

  const days = [];
  const start = new Date('2026-05-01');
  const end = new Date('2026-09-15');
  let idx = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1), idx++) {
    const date = new Date(d);
    const iso = isoDate(date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dow = date.getDay();
    // Spa towns: flat seasonality (0.85-1.0), lake towns: sharp summer peak
    const seasonal = isSpaTown
      ? 0.85 + 0.15 * Math.exp(-Math.pow(idx - (52 + peakShift), 2) / (2 * 50 * 50))
      : Math.exp(-Math.pow(idx - (52 + peakShift), 2) / (2 * 28 * 28));
    const dowMult = [1.10, 0.78, 0.80, 0.85, 1.05, weekendBoost, weekendBoost + 0.05][dow];
    const holidayName = HOLIDAYS[iso];
    const isEvent = EVENT_DAYS.has(iso);
    const isPreEvent = PRE_EVENT_DAYS.has(iso);
    const holMult = holidayName ? 1.38 : 1.0;
    const evMult = isEvent ? 1.18 : 1.0;
    const h = Math.sin(idx * 1.731 + city.size * 100 + noiseSeed) * 0.5 + 0.5;
    const noise = 0.88 + 0.22 * h;
    const guestAvg = (city.guestLow + city.guestHigh) / 2 / 7;
    const guests = Math.round(guestAvg * baseMult * seasonal * dowMult * holMult * evMult * noise);
    const los = 2.3 + seasonal * 1.3 + (dow === 5 || dow === 6 ? 0.25 : 0) + (holidayName ? 0.4 : 0);
    const adr = Math.round(
      city.baseAdr * (0.72 + 0.38 * seasonal)
      * (holidayName ? 1.14 : 1)
      * (isPreEvent ? 1.05 : 1)
      * (dow === 5 || dow === 6 ? 1.05 : 1)
    );
    days.push({ date: iso, month, day, dow, guests, los: Number(los.toFixed(2)), adr, holidayName, isEvent, isPreEvent });
  }
  return days;
}

function getNationalities(cityName) {
  const profile = CITY_NAT_PROFILES[cityName] || CITY_NAT_PROFILES['Siófok'];
  const entries = Object.entries(profile.pct);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  return entries.map(([name, v]) => ({ name, pct: Number((v / total * 100).toFixed(1)) }));
}

function getCompetitorData(district) {
  const seed = (district || 'x').length * 13;
  return ACC_CATEGORIES.map((cat, i) => {
    const variation = 0.85 + ((seed + i * 7) % 30) / 100;
    const occ = 0.62 + ((seed + i * 3) % 25) / 100;
    const adr = Math.round(14000 * cat.mult * variation);
    const revpar = Math.round(adr * occ);
    const guests = Math.round(380 * cat.mult * variation * (district === 'Összes járás' ? 4.5 : 1));
    const nights = Math.round(guests * (2.6 + cat.mult * 0.2));
    const los = Number(((nights / guests) || 2.8).toFixed(2));
    const spend = Math.round(18000 * cat.mult * variation);
    return { category: cat.short, fullName: cat.name, adr, revpar, guests, nights, los, spend };
  });
}

function getWeatherData() {
  const days = ['Hé', 'Ke', 'Sze', 'Cs', 'Pé', 'Szo', 'Va'];
  const dates = [];
  const base = new Date('2026-05-16');
  for (let i = 0; i < 7; i++) {
    const d = new Date(base); d.setDate(base.getDate() + i);
    dates.push({
      day: days[(d.getDay() + 6) % 7],
      date: `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`,
      temp: Math.round(18 + Math.sin(i * 0.8) * 4 + (i % 3)),
      tempMin: Math.round(9 + Math.sin(i * 0.6) * 2),
      water: Number((14.5 + i * 0.35 + Math.sin(i / 2) * 0.4).toFixed(1)),
    });
  }
  return dates;
}

// ---------- LOCATION FILTER BAR (Országos > Térség > Megye > Járás > Város) ----------
function LocationFilterBar({ activeCity = 'Sárvár' }) {
  // For mockup: only Sárvár is wired up. Rest are placeholders.
  const [country] = useState('Magyarország');
  const [region, setRegion]   = useState('Nyugat-Dunántúl');
  const [county, setCounty]   = useState('Vas');
  const [district, setDistrict] = useState('Sárvári');
  const [city, setCity]       = useState(activeCity);

  // Sárvár hierarchy is the only fully wired one
  const REGIONS = ['Országos', 'Nyugat-Dunántúl', 'Balaton', 'Budapest', 'Észak-Magyarország', 'Dél-Alföld'];
  const COUNTIES_BY_REGION = {
    'Nyugat-Dunántúl': ['Vas', 'Zala', 'Győr-Moson-Sopron'],
    'Balaton': ['Somogy', 'Veszprém', 'Zala'],
    'Budapest': ['Budapest'],
    'Észak-Magyarország': ['Heves', 'Borsod-Abaúj-Zemplén', 'Nógrád'],
    'Dél-Alföld': ['Bács-Kiskun', 'Békés', 'Csongrád-Csanád'],
    'Országos': ['(összes)'],
  };
  const DISTRICTS_BY_COUNTY = {
    'Vas': ['Sárvári', 'Szombathelyi', 'Kőszegi', 'Körmendi'],
    'Zala': ['Keszthelyi', 'Zalaegerszegi', 'Nagykanizsai'],
    'Veszprém': ['Veszprémi', 'Tapolcai', 'Balatonalmádi'],
    'Somogy': ['Siófoki', 'Marcali', 'Fonyódi'],
    'Győr-Moson-Sopron': ['Győri', 'Soproni', 'Mosonmagyaróvári'],
    '(összes)': ['(összes)'],
  };
  const CITIES_BY_DISTRICT = {
    'Sárvári': ['Sárvár', 'Bük', 'Répcelak', 'Ikervár'],
    'Szombathelyi': ['Szombathely', 'Vasvár'],
    'Kőszegi': ['Kőszeg'],
    'Körmendi': ['Körmend'],
    'Keszthelyi': ['Keszthely', 'Hévíz', 'Vonyarcvashegy'],
    'Siófoki': ['Siófok', 'Balatonföldvár', 'Szántód'],
    '(összes)': ['(összes)'],
  };

  const counties   = COUNTIES_BY_REGION[region] || ['(összes)'];
  const districts  = DISTRICTS_BY_COUNTY[county] || ['(összes)'];
  const cities     = CITIES_BY_DISTRICT[district] || ['(összes)'];

  const onRegionChange = v => {
    setRegion(v);
    const c = (COUNTIES_BY_REGION[v] || ['(összes)'])[0];
    setCounty(c);
    const d = (DISTRICTS_BY_COUNTY[c] || ['(összes)'])[0];
    setDistrict(d);
    const ci = (CITIES_BY_DISTRICT[d] || ['(összes)'])[0];
    setCity(ci);
  };
  const onCountyChange = v => {
    setCounty(v);
    const d = (DISTRICTS_BY_COUNTY[v] || ['(összes)'])[0];
    setDistrict(d);
    const ci = (CITIES_BY_DISTRICT[d] || ['(összes)'])[0];
    setCity(ci);
  };
  const onDistrictChange = v => {
    setDistrict(v);
    const ci = (CITIES_BY_DISTRICT[v] || ['(összes)'])[0];
    setCity(ci);
  };

  const Sel = ({ label, value, options, onChange, disabled }) => (
    <div style={{ flex: 1, minWidth: 110 }}>
      <div style={{ fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: B.muted, fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <select value={value} disabled={disabled}
        onChange={e => onChange && onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 10px', borderRadius: 3,
          border: `1px solid ${B.hairStrong}`,
          fontFamily: FONT, fontSize: 13, fontWeight: 600,
          color: disabled ? B.muted : B.ink,
          background: disabled ? B.bg : B.paper,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{
      background: B.paper, borderRadius: 4, padding: '14px 18px',
      border: `1px solid ${B.hair}`, marginBottom: 16,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: B.muted, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MapPin size={11} strokeWidth={2.2} />
        Földrajzi szűrés
        <span style={{ color: B.gold, fontWeight: 600, letterSpacing: 0, fontSize: 10, textTransform: 'none', marginLeft: 6 }}>
          (mockup: csak Sárvár hierarchiája él)
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Sel label="Ország" value={country} options={['Magyarország']} disabled />
        <span style={{ color: B.muted, fontSize: 14, paddingBottom: 8 }}>›</span>
        <Sel label="Térség" value={region} options={REGIONS} onChange={onRegionChange} />
        <span style={{ color: B.muted, fontSize: 14, paddingBottom: 8 }}>›</span>
        <Sel label="Megye" value={county} options={counties} onChange={onCountyChange} />
        <span style={{ color: B.muted, fontSize: 14, paddingBottom: 8 }}>›</span>
        <Sel label="Járás" value={district} options={districts} onChange={onDistrictChange} />
        <span style={{ color: B.muted, fontSize: 14, paddingBottom: 8 }}>›</span>
        <Sel label="Város / település" value={city} options={cities} onChange={setCity} />
      </div>
    </div>
  );
}

// ---------- WHITSUN WEEKEND FORECAST ----------
function WhitsunForecast({ scope = 'accommodation', cityName, bathName }) {
  // Whitsun weekend: 2026 May 23-25 (Sat-Sun-Mon)
  // Forecast = 3-day period figures
  let label, baseGuests, baseNights, yoyGuests, yoyNights, baseTickets, yoyTickets;
  let foodTransactions, foodRevenue, foodBasket, yoyFoodTx, yoyFoodRev, yoyFoodBasket;

  if (scope === 'accommodation') {
    if (cityName === 'Sárvár') {
      // Sárvár-specific realistic figures based on KSH data
      // ~280k annual guests (commercial + private), ~900k annual nights
      // Pentecost long weekend: peak demand, avg stay 2.9 nights
      baseGuests = 4280;
      baseNights = 12410;
      yoyGuests = 7.8;
      yoyNights = 8.6;
    } else {
      const c = CITIES.find(x => x.name === cityName) || CITIES[0];
      const dailyAvg = (c.guestLow + c.guestHigh) / 2 / 7;
      // Whitsun is a long weekend — multiplier ~2.4× normal weekend
      baseGuests = Math.round(dailyAvg * 3 * 1.85);
      baseNights = Math.round(baseGuests * 2.6);
      yoyGuests = Number(((c.yoyV - 1) * 100 + 1.4).toFixed(1));
      yoyNights = Number(((c.yoyV - 1) * 100 + 2.1).toFixed(1));
    }
  } else if (scope === 'baths') {
    if (bathName === 'Sárvári Gyógyfürdő') {
      // Realistic Pentecost weekend figures for Sárvári Gyógyfürdő
      // ~700k annual tickets, peak weekend with high day-tripper share (~50%)
      baseTickets = 9200;   // 3-day ticket sales (peak demand, ~110% of avg week)
      baseGuests = 4850;    // unique overnight guests (~55% of tickets, rest are day-trippers)
      baseNights = 12320;   // overnight nights (avg 2.5 nights for long weekend)
      yoyTickets = 7.6;
      yoyGuests = 7.2;
      yoyNights = 8.4;
    } else {
      const b = BATHS.find(x => x.name === bathName) || BATHS[0];
      baseTickets = Math.round(b.weeklyTickets * 0.62); // 3-day weekend share
      baseGuests = Math.round(baseTickets * 0.82);
      baseNights = Math.round(baseGuests * 2.1);
      yoyGuests = Number((b.yoyTickets + 1.2).toFixed(1));
      yoyNights = Number((b.yoyTickets + 1.8).toFixed(1));
      yoyTickets = Number((b.yoyTickets + 2.4).toFixed(1));
    }
  } else {
    // food / hospitality
    foodTransactions = 1_240_000; // 3-day national hospitality transactions
    foodRevenue = 9.4; // billion Ft (gross)
    foodBasket = 7560;
    yoyFoodTx = 7.2;
    yoyFoodRev = 9.8;
    yoyFoodBasket = 2.4;
  }

  return (
    <div style={{
      background: B.paper, borderRadius: 4, border: `1px solid ${B.hair}`,
      marginBottom: 20, overflow: 'hidden',
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${B.gold} 0%, #B8860B 100%)`,
        padding: '8px 20px', color: '#FFFFFF',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700,
        borderBottomRightRadius: 4,
      }}>
        ⭐ Pünkösdi hétvége előrejelzés
      </div>
      <div style={{ padding: '20px 26px 22px' }}>
        <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: -0.3 }}>
          Pünkösdi hétvége (2026. május 23. – május 25.) előrejelzés
        </h2>
        <div style={{ fontSize: 12, color: B.muted, marginTop: 4, marginBottom: 18 }}>
          {scope === 'accommodation' ? `${cityName} szálláshelyek` : scope === 'baths' ? bathName : 'Magyarországi vendéglátás'} · 3 napos időszak · YoY összehasonlítás 2025 pünkösdjével
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: scope === 'accommodation' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: 12,
        }}>
          {scope === 'baths' && (
            <div style={{ padding: '16px 18px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.blue}` }}>
              <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Várható jegyértékesítés
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, marginTop: 6, color: B.ink }}>
                {baseTickets.toLocaleString('hu-HU')}<span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft, marginLeft: 4 }}>db</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: B.green, fontSize: 12, fontWeight: 700 }}>
                <TrendingUp size={12} strokeWidth={2.5} />
                +{yoyTickets}% <span style={{ color: B.muted, fontWeight: 500 }}>YoY</span>
              </div>
            </div>
          )}

          {scope !== 'food' && (
            <div style={{ padding: '16px 18px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.navy}` }}>
              <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Várható vendégszám
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, marginTop: 6, color: B.ink }}>
                {baseGuests.toLocaleString('hu-HU')}<span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft, marginLeft: 4 }}>fő</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: B.green, fontSize: 12, fontWeight: 700 }}>
                <TrendingUp size={12} strokeWidth={2.5} />
                +{yoyGuests}% <span style={{ color: B.muted, fontWeight: 500 }}>YoY</span>
              </div>
            </div>
          )}

          {scope !== 'food' && (
            <div style={{ padding: '16px 18px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.lake}` }}>
              <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Várható vendégéjszaka
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, marginTop: 6, color: B.ink }}>
                {baseNights.toLocaleString('hu-HU')}<span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft, marginLeft: 4 }}>éj</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: B.green, fontSize: 12, fontWeight: 700 }}>
                <TrendingUp size={12} strokeWidth={2.5} />
                +{yoyNights}% <span style={{ color: B.muted, fontWeight: 500 }}>YoY</span>
              </div>
            </div>
          )}

          {scope === 'food' && (
            <>
              <div style={{ padding: '16px 18px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.navy}` }}>
                <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                  Várható tranzakciószám
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, marginTop: 6, color: B.ink }}>
                  {(foodTransactions / 1e6).toFixed(2)}<span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft, marginLeft: 4 }}>M db</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: B.green, fontSize: 12, fontWeight: 700 }}>
                  <TrendingUp size={12} strokeWidth={2.5} />
                  +{yoyFoodTx}% <span style={{ color: B.muted, fontWeight: 500 }}>YoY</span>
                </div>
              </div>
              <div style={{ padding: '16px 18px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.lake}` }}>
                <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                  Várható bruttó árbevétel
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, marginTop: 6, color: B.ink }}>
                  {foodRevenue.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft, marginLeft: 4 }}>Mrd Ft</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: B.green, fontSize: 12, fontWeight: 700 }}>
                  <TrendingUp size={12} strokeWidth={2.5} />
                  +{yoyFoodRev}% <span style={{ color: B.muted, fontWeight: 500 }}>YoY</span>
                </div>
              </div>
              <div style={{ padding: '16px 18px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.gold}` }}>
                <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                  Átl. kosárérték (bruttó)
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, marginTop: 6, color: B.ink }}>
                  {foodBasket.toLocaleString('hu-HU')}<span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft, marginLeft: 4 }}>Ft</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: B.green, fontSize: 12, fontWeight: 700 }}>
                  <TrendingUp size={12} strokeWidth={2.5} />
                  +{yoyFoodBasket}% <span style={{ color: B.muted, fontWeight: 500 }}>YoY</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{
          marginTop: 14, padding: '10px 14px', background: `${B.gold}15`,
          borderRadius: 3, fontSize: 11, color: B.inkSoft, borderLeft: `2px solid ${B.gold}`,
        }}>
          <strong style={{ color: B.gold }}>Kiemelt időszak:</strong> a hosszú hétvége miatt a foglalási görbe a múlt heti csúcson is felül teljesít. A modell javasolja a kapacitás és személyzet előzetes felkészítését.
        </div>
      </div>
    </div>
  );
}

// ---------- GOOGLE MAP ----------
const GMAPS_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#F4F6FA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#CBD5E1' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#0B2545' }, { weight: 600 }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E8EDDD' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#E2E8F0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#D4A017' }, { weight: 0.8 }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#7FA9C2' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1E4A66' }] },
];

function GoogleBalatonMap({ selectedCity, onSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(null);

  // Load Google Maps script once
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setErr('missing_key'); return;
    }
    if (window.google?.maps) { setLoaded(true); return; }
    const existing = document.getElementById('gmaps-script');
    if (existing) {
      const t = setInterval(() => {
        if (window.google?.maps) { clearInterval(t); setLoaded(true); }
      }, 120);
      return () => clearInterval(t);
    }
    const s = document.createElement('script');
    s.id = 'gmaps-script';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&language=hu`;
    s.async = true; s.defer = true;
    s.onload = () => setLoaded(true);
    s.onerror = () => setErr('load_failed');
    document.head.appendChild(s);
  }, []);

  // Initialize map + markers after script loads
  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google?.maps) return;
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 46.85, lng: 17.72 },
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: GMAPS_STYLES,
        gestureHandling: 'cooperative',
      });
    }
    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.setMap(null));
    markersRef.current = {};
    // Add fresh markers
    CITIES.forEach(city => {
      const isSel = city.name === selectedCity;
      const rMax = Math.max(city.guestLow, city.guestHigh);
      const scale = rMax >= 3000 ? 11 : rMax >= 1500 ? 9 : rMax >= 700 ? 7.5 : 6;
      const marker = new window.google.maps.Marker({
        position: { lat: city.lat, lng: city.lng },
        map: mapInstance.current,
        title: city.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: STATUS[city.status],
          fillOpacity: 1,
          strokeColor: isSel ? B.navy : '#FFFFFF',
          strokeWeight: isSel ? 3.5 : 2,
          scale: isSel ? scale + 2 : scale,
        },
        label: {
          text: city.name,
          fontSize: isSel ? '13px' : '11px',
          fontWeight: isSel ? '700' : '600',
          color: B.navy,
          className: 'gmap-city-label',
        },
        zIndex: isSel ? 999 : 10,
      });
      marker.addListener('click', () => onSelect(city.name));
      markersRef.current[city.name] = marker;
    });
  }, [loaded, selectedCity, onSelect]);

  if (err === 'missing_key') {
    return (
      <div style={{
        padding: '28px 24px', background: `${B.gold}15`, border: `1px dashed ${B.gold}`,
        borderRadius: 4, textAlign: 'center', color: B.inkSoft,
      }}>
        <MapPin size={28} color={B.gold} style={{ margin: '0 auto 10px', display: 'block' }} />
        <div style={{ fontWeight: 700, color: B.navy, fontSize: 15, marginBottom: 6 }}>
          Google Maps API kulcs szükséges
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
          Illeszd be a saját API kulcsodat a fájl tetején (<code style={{ background: B.bg, padding: '2px 6px', borderRadius: 2 }}>GOOGLE_MAPS_API_KEY</code> konstans).<br />
          Amíg nincs beállítva, a térkép nem jelenik meg.
        </div>
      </div>
    );
  }
  if (err === 'load_failed') {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: B.red, background: `${B.red}10`, borderRadius: 4 }}>
        A Google Maps script betöltése nem sikerült. Ellenőrizd az API kulcsot és a hálózati kapcsolatot.
      </div>
    );
  }

  return (
    <>
      <style>{`.gmap-city-label { text-shadow: 0 0 6px #FFFFFF, 0 0 3px #FFFFFF; }`}</style>
      {!loaded && (
        <div style={{ padding: 20, textAlign: 'center', color: B.muted, fontSize: 13 }}>
          Térkép betöltése…
        </div>
      )}
      <div ref={mapRef} style={{
        width: '100%', height: 460, borderRadius: 4,
        border: `1px solid ${B.hair}`, background: B.bg,
        display: loaded ? 'block' : 'none',
      }} />
    </>
  );
}

// ---------- TOP CITY SELECTOR (name + status dot only) ----------
function TopCitySelector({ selectedCity, onSelect }) {
  return (
    <div style={{
      background: B.paper, borderRadius: 4, padding: '16px 20px',
      border: `1px solid ${B.hair}`, marginBottom: 20,
    }}>
      <div style={{
        fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase',
        color: B.muted, fontWeight: 700, marginBottom: 10,
      }}>
        Gyors városválasztás
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CITIES.map(c => {
          const active = c.name === selectedCity;
          return (
            <button key={c.name} onClick={() => onSelect(c.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 3, cursor: 'pointer',
                border: active ? `2px solid ${B.navy}` : `1px solid ${B.hairStrong}`,
                background: active ? B.navy : B.paper,
                color: active ? B.paper : B.ink,
                fontFamily: FONT, fontSize: 13, fontWeight: active ? 700 : 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = B.bg; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = B.paper; }}>
              <span style={{
                width: 9, height: 9, borderRadius: '50%',
                background: STATUS[c.status],
                border: active ? `1.5px solid ${B.paper}` : 'none',
              }} />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- CITY OVERVIEW TILE (guests + nights per city) ----------
function CityOverviewTile({ selectedCity, onSelect }) {
  // Expected weekly guests = average of low/high range; nights = guests × 2.3
  const rows = CITIES.map(c => {
    const weekly = Math.round((c.guestLow + c.guestHigh) / 2);
    const nights = Math.round(weekly * 2.3);
    return { ...c, weekly, nights };
  }).sort((a, b) => b.weekly - a.weekly);
  const totalWeekly = rows.reduce((s, r) => s + r.weekly, 0);
  const totalNights = rows.reduce((s, r) => s + r.nights, 0);

  return (
    <div style={{
      background: B.paper, borderRadius: 4, border: `1px solid ${B.hair}`,
      marginBottom: 20, overflow: 'hidden',
    }}>
      <div style={{
        padding: '18px 24px 14px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'flex-end',
        flexWrap: 'wrap', gap: 12, borderBottom: `1px solid ${B.hair}`,
      }}>
        <div>
          <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: -0.3 }}>
            Városok teljesítménye
          </h2>
          <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>
            Várható heti vendégszám és vendégéjszaka városonként · kattints a részletes nézethez
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 11, color: B.inkSoft }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>Összesen</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: B.navy }}>
              {totalWeekly.toLocaleString('hu-HU')} fő · {totalNights.toLocaleString('hu-HU')} éj
            </div>
          </div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: B.bg }}>
              <th style={{ textAlign: 'left', padding: '10px 24px', fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Város
              </th>
              <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Várható heti vendégszám
              </th>
              <th style={{ textAlign: 'right', padding: '10px 24px', fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Vendégéjszaka
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const active = r.name === selectedCity;
              return (
                <tr key={r.name}
                  onClick={() => onSelect(r.name)}
                  style={{
                    borderTop: `1px solid ${B.hair}`,
                    background: active ? `${B.blue}10` : B.paper,
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = B.bg; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = B.paper; }}>
                  <td style={{ padding: '12px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS[r.status] }} />
                      <span style={{ fontWeight: active ? 700 : 600, color: B.ink }}>{r.name}</span>
                      {active && (
                        <span style={{
                          fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                          color: B.blue, fontWeight: 700, background: `${B.blue}15`,
                          padding: '2px 6px', borderRadius: 2
                        }}>kiválasztva</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 600, color: B.navy }}>
                    {r.weekly.toLocaleString('hu-HU')}
                  </td>
                  <td style={{ padding: '12px 24px', textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 600, color: B.inkSoft }}>
                    {r.nights.toLocaleString('hu-HU')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '10px 24px', fontSize: 10, color: B.muted, background: B.bg, borderTop: `1px solid ${B.hair}` }}>
        Vendégéjszaka = várható heti vendégszám × 2.3 (átlagos tartózkodási idő alapján)
      </div>
    </div>
  );
}

// ---------- KPI CARD ----------
function KpiCard({ label, value, unit, delta, deltaUnit = '%', deltaSuffix = 'év/év', icon: Icon, accent }) {
  const positive = delta >= 0;
  return (
    <div style={{ background: B.paper, borderRadius: 4, padding: '20px 22px', border: `1px solid ${B.hair}`, position: 'relative', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: B.muted, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700 }}>
        <Icon size={13} strokeWidth={2} />
        {label}
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: B.ink, letterSpacing: -0.5, lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, color: B.inkSoft, fontWeight: 500 }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: positive ? B.green : B.red, fontWeight: 700 }}>
        {positive ? <TrendingUp size={12} strokeWidth={2.3} /> : <TrendingDown size={12} strokeWidth={2.3} />}
        <span>{positive ? '+' : ''}{delta}{deltaUnit}</span>
        <span style={{ color: B.muted, fontWeight: 500 }}>{deltaSuffix}</span>
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: accent }} />
    </div>
  );
}

// ---------- MONTH CALENDAR ----------
function MonthCalendar({ month, monthName, days, maxGuests, onDayClick }) {
  const monthDays = days.filter(d => d.month === month);
  if (monthDays.length === 0) return null;
  const first = new Date(`2026-${String(month).padStart(2, '0')}-01`);
  const firstDow = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  monthDays.forEach(d => cells.push(d));
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div style={{ flex: '1 1 0', minWidth: 0 }}>
      <div style={{ fontSize: 17, color: B.ink, marginBottom: 10, fontWeight: 700, letterSpacing: -0.2 }}>
        {monthName}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, fontSize: 10, color: B.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
        {['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontWeight: 700 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const intensity = d.guests / maxGuests;
          const bg = intensity === 0
            ? B.paper
            : `color-mix(in srgb, ${B.blue} ${Math.round(intensity * 88)}%, ${B.blueLight})`;
          const isPeak = intensity > 0.78;
          const isWeekend = d.dow === 0 || d.dow === 6;
          return (
            <div key={i}
              onClick={() => onDayClick(d)}
              title="Kattints a napi nézetért"
              style={{
                aspectRatio: '1', background: bg, borderRadius: 2,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '4px 5px',
                border: isPeak ? `1.5px solid ${B.navy}` : `1px solid ${isWeekend ? B.hair : 'transparent'}`,
                cursor: 'pointer', transition: 'transform 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <span style={{
                  fontSize: 11, fontWeight: d.holidayName || isPeak ? 700 : 500,
                  color: intensity > 0.5 ? '#FFFFFF' : B.ink,
                }}>{d.day}</span>
                {d.holidayName && <span style={{ fontSize: 10, color: intensity > 0.5 ? '#FFE08A' : B.gold, lineHeight: 1 }}>★</span>}
                {!d.holidayName && d.isEvent && <span style={{ fontSize: 9, color: intensity > 0.5 ? '#FFE08A' : B.gold, lineHeight: 1 }}>♪</span>}
              </div>
              <div style={{
                fontSize: 9, fontFamily: FONT_MONO,
                color: intensity > 0.5 ? 'rgba(255,255,255,0.9)' : B.inkSoft,
                letterSpacing: -0.3, fontWeight: 500
              }}>
                {d.guests >= 1000 ? (d.guests / 1000).toFixed(1) + 'k' : d.guests}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- DAY DETAIL MODAL ----------
function DayDetailModal({ day, city, nats, onClose }) {
  if (!day) return null;
  const dt = new Date(day.date);
  const dayNames = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
  const monthNames = ['január', 'február', 'március', 'április', 'május', 'június',
                      'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
  const occupancy = Math.min(95, Math.round(45 + (day.guests / 250) * 5));
  const domestic = nats.find(n => n.name === 'Magyar').pct;
  const foreign = Number((100 - domestic).toFixed(1));
  const top5 = nats.filter(n => ['Német', 'Lengyel', 'Cseh', 'Osztrák', 'Olasz'].includes(n.name))
                   .sort((a, b) => b.pct - a.pct);
  const eventOfDay = EVENTS.find(e => day.date >= e.start && day.date <= e.end);
  const natLabelMap = { 'Német': 'Németország', 'Lengyel': 'Lengyelország', 'Cseh': 'Csehország', 'Osztrák': 'Ausztria', 'Olasz': 'Olaszország' };

  return (
    <div onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(11,37,69,0.55)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        backdropFilter: 'blur(3px)'
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: B.paper, borderRadius: 4, maxWidth: 580, width: '100%',
          padding: '28px 32px', position: 'relative',
          boxShadow: '0 24px 60px rgba(11,37,69,0.35)', border: `1px solid ${B.hair}`,
        }}>
        <button onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14, background: 'transparent',
            border: 'none', cursor: 'pointer', color: B.inkSoft, padding: 6,
          }}>
          <X size={20} />
        </button>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
          Napi részletes nézet · {city}
        </div>
        <h2 style={{ fontSize: 30, margin: '6px 0 2px', fontWeight: 700, letterSpacing: -0.8 }}>
          {dt.getDate()}. {monthNames[dt.getMonth()]}
        </h2>
        <div style={{ fontSize: 13, color: B.inkSoft }}>
          {dayNames[dt.getDay()]}
          {day.holidayName && <span style={{ marginLeft: 8, color: B.gold, fontWeight: 700 }}>★ {day.holidayName}</span>}
          {eventOfDay && <span style={{ marginLeft: 8, color: B.blue, fontWeight: 700 }}>♪ {eventOfDay.name} (ár <span style={{ color: B.purple }}>+{eventOfDay.uplift}%</span> / forg <span style={{ color: B.green }}>+{eventOfDay.boost}%</span>)</span>}
          {day.isPreEvent && !eventOfDay && <span style={{ marginLeft: 8, color: B.purple, fontStyle: 'italic' }}>+5% árfelhajtás</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 22 }}>
          {[
            { l: 'Vendég', v: day.guests.toLocaleString('hu-HU'), u: 'fő' },
            { l: 'Kihasználtság', v: occupancy + '%', u: 'szobakapacitás' },
            { l: 'Ajánlott ár', v: day.adr.toLocaleString('hu-HU'), u: 'Ft / szoba' },
          ].map(k => (
            <div key={k.l} style={{ padding: '12px 14px', background: B.bg, borderRadius: 3 }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>{k.l}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 10, color: B.muted, marginTop: 2 }}>{k.u}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: B.muted, fontWeight: 700, marginBottom: 10 }}>
            Vendégösszetétel – napi becslés
          </div>
          <div style={{ display: 'flex', height: 28, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ flex: domestic, background: B.navy, display: 'flex', alignItems: 'center', paddingLeft: 10, color: B.paper, fontSize: 12, fontWeight: 700 }}>
              Magyar {domestic}%
            </div>
            <div style={{ flex: foreign, background: B.red, display: 'flex', alignItems: 'center', paddingLeft: 10, color: B.paper, fontSize: 12, fontWeight: 700 }}>
              Külföldi {foreign}%
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {top5.map((n, i) => (
              <div key={n.name} style={{ padding: '8px 8px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${[B.blue, B.blueBright, B.lake, B.lakeShallow, B.lakeDeep][i]}` }}>
                <div style={{ fontSize: 9, color: B.muted, fontWeight: 600 }}>#{i + 1}</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 1, lineHeight: 1.2 }}>{natLabelMap[n.name] || n.name}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: B.inkSoft, marginTop: 2 }}>
                  {n.pct}% · {Math.round(day.guests * n.pct / 100)} fő
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18, padding: '10px 12px', background: `${B.gold}20`, borderRadius: 3, fontSize: 11, color: B.inkSoft }}>
          <strong style={{ color: B.gold }}>Mockup:</strong> minden érték placeholder – a napi nézet UI-ját mutatja.
        </div>
      </div>
    </div>
  );
}

// ---------- EVENTS BOX ----------
function EventsBox() {
  const fmt = d => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}.${String(dt.getDate()).padStart(2, '0')}`;
  };
  return (
    <div style={{ background: B.paper, borderRadius: 4, padding: '22px 26px', border: `1px solid ${B.hair}`, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color={B.gold} strokeWidth={2} />
            <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: -0.3 }}>
              Várható események
            </h2>
          </div>
          <div style={{ fontSize: 12, color: B.muted, marginTop: 2, paddingLeft: 24 }}>
            2026 nyár · eseményenkénti árfelhajtó és forgalomélénkítő hatás
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: B.inkSoft }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, background: B.purple, borderRadius: 2 }} />
            árfelhajtó (ADR)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, background: B.green, borderRadius: 2 }} />
            forgalomélénkítő (vendég)
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        {EVENTS.map(ev => (
          <div key={ev.name} style={{
            padding: '14px 16px', background: B.bg, borderRadius: 3,
            borderLeft: `3px solid ${B.gold}`,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: B.ink, lineHeight: 1.25 }}>
              {ev.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, color: B.muted }}>
              <MapPin size={10} strokeWidth={2} /> {ev.location}
              <span style={{ margin: '0 4px' }}>·</span>
              <Calendar size={10} strokeWidth={2} />
              <span style={{ fontFamily: FONT_MONO }}>{fmt(ev.start)} – {fmt(ev.end)}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <div style={{ flex: 1, background: `${B.purple}10`, padding: '6px 9px', borderRadius: 3, borderLeft: `2px solid ${B.purple}` }}>
                <div style={{ fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>ár</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: B.purple, fontWeight: 700, marginTop: 1 }}>+{ev.uplift}%</div>
              </div>
              <div style={{ flex: 1, background: `${B.green}10`, padding: '6px 9px', borderRadius: 3, borderLeft: `2px solid ${B.green}` }}>
                <div style={{ fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>forgalom</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: B.green, fontWeight: 700, marginTop: 1 }}>+{ev.boost}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- INTERNATIONAL TRENDS BOX ----------
function IntlTrendsBox() {
  return (
    <div style={{
      background: B.paper, borderRadius: 4, border: `1px solid ${B.hair}`,
      marginBottom: 20, overflow: 'hidden'
    }}>
      <div style={{
        background: B.navy, padding: '8px 20px', color: B.paper,
        display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11,
        letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700,
        borderBottomRightRadius: 4
      }}>
        <Globe size={13} strokeWidth={2.2} />
        Hatások
      </div>
      <div style={{ padding: '20px 26px 24px' }}>
        <h2 style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 700, letterSpacing: -0.3 }}>
          A modell által figyelembe vett hatások
        </h2>
        <div style={{ fontSize: 12, color: B.muted, marginBottom: 18 }}>
          Az egyes tényezők becsült hatása az időszak vendégforgalmára · nagyság szerint rendezve
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {INTL_TRENDS.map(t => {
            const positive = t.value >= 0;
            const Icon = t.icon;
            return (
              <div key={t.name} style={{
                padding: '14px 16px', background: B.bg, borderRadius: 3,
                borderLeft: `3px solid ${positive ? B.green : B.red}`,
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: positive ? `${B.green}15` : `${B.red}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: positive ? B.green : B.red, flexShrink: 0
                }}>
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: B.ink, lineHeight: 1.25 }}>
                    {t.name}
                  </div>
                  <div style={{
                    fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700,
                    color: positive ? B.green : B.red, marginTop: 3,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {positive ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
                    {positive ? '+' : ''}{t.value}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- COMPETITORS VIEW ----------
function CompetitorsView() {
  const [district, setDistrict] = useState('Összes járás');
  const [metric, setMetric] = useState('adr');
  const data = useMemo(() => getCompetitorData(district), [district]);
  const weather = useMemo(() => getWeatherData(), []);

  const METRICS = [
    { key: 'adr',     label: 'ADR',                 unit: 'Ft', format: v => v.toLocaleString('hu-HU') },
    { key: 'revpar',  label: 'RevPAR',              unit: 'Ft', format: v => v.toLocaleString('hu-HU') },
    { key: 'guests',  label: 'Vendég',              unit: 'fő', format: v => v.toLocaleString('hu-HU') },
    { key: 'nights',  label: 'Vendégéjszaka',       unit: 'éj', format: v => v.toLocaleString('hu-HU') },
    { key: 'spend',   label: 'Átl. szálláshelyi költés', unit: 'Ft', format: v => v.toLocaleString('hu-HU') },
  ];
  const currentMetric = METRICS.find(m => m.key === metric);

  return (
    <>
      <div style={{ background: B.paper, borderRadius: 4, padding: '22px 26px', border: `1px solid ${B.hair}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={16} color={B.navy} strokeWidth={2} />
              <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: -0.3 }}>
                Kategória szerinti összehasonlítás
              </h2>
            </div>
            <div style={{ fontSize: 12, color: B.muted, marginTop: 2, paddingLeft: 24 }}>
              Szálláshelytípusok teljesítménye az adott járásban
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: B.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Járás:</span>
            <select value={district} onChange={e => setDistrict(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 3, border: `1px solid ${B.hairStrong}`,
                fontFamily: FONT, fontSize: 13, fontWeight: 600, color: B.ink,
                background: B.paper, cursor: 'pointer'
              }}>
              {DISTRICTS.map(d => <option key={d} value={d}>{d} {d !== 'Összes járás' && 'járás'}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
          {METRICS.map(m => (
            <button key={m.key} onClick={() => setMetric(m.key)}
              style={{
                padding: '8px 14px', borderRadius: 3,
                border: metric === m.key ? 'none' : `1px solid ${B.hairStrong}`,
                background: metric === m.key ? B.navy : B.paper,
                color: metric === m.key ? B.paper : B.inkSoft,
                fontFamily: FONT, fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
              }}>
              {m.label}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 12, right: 20, left: 8, bottom: 5 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={B.blueBright} />
                <stop offset="100%" stopColor={B.navy} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={B.hair} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: B.inkSoft, fontWeight: 600 }} axisLine={{ stroke: B.hair }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: B.muted }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v} />
            <Tooltip
              contentStyle={{ background: B.paper, border: `1px solid ${B.hair}`, borderRadius: 3, fontSize: 12, fontFamily: FONT }}
              formatter={v => [currentMetric.format(v) + ' ' + currentMetric.unit, currentMetric.label]}
              labelFormatter={l => `Kategória: ${data.find(d => d.category === l)?.fullName || l}`}
            />
            <Bar dataKey={metric} fill="url(#barGrad)" radius={[3, 3, 0, 0]}>
              <LabelList dataKey={metric} position="top"
                style={{ fontSize: 10, fontFamily: FONT_MONO, fill: B.inkSoft, fontWeight: 600 }}
                formatter={v => currentMetric.format(v)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: B.paper, borderRadius: 4, padding: '22px 26px', border: `1px solid ${B.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Thermometer size={16} color={B.orange} strokeWidth={2} />
            <h2 style={{ fontSize: 17, margin: 0, fontWeight: 700, letterSpacing: -0.2 }}>Időjárás · 7 napos</h2>
          </div>
          <div style={{ fontSize: 11, color: B.muted, marginBottom: 12, paddingLeft: 24 }}>
            Levegő hőmérséklet (max / min) °C
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weather} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={B.hair} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: B.inkSoft, fontWeight: 600 }} axisLine={{ stroke: B.hair }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: B.muted }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: B.paper, border: `1px solid ${B.hair}`, borderRadius: 3, fontSize: 12, fontFamily: FONT }}
                formatter={(v, n) => [v + ' °C', n === 'temp' ? 'Max' : 'Min']}
              />
              <Line type="monotone" dataKey="temp" stroke={B.orange} strokeWidth={2.2} dot={{ r: 4, fill: B.orange }} />
              <Line type="monotone" dataKey="tempMin" stroke={B.blueBright} strokeWidth={1.8} dot={{ r: 3, fill: B.blueBright }} strokeDasharray="4 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: B.paper, borderRadius: 4, padding: '22px 26px', border: `1px solid ${B.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Waves size={16} color={B.lake} strokeWidth={2} />
            <h2 style={{ fontSize: 17, margin: 0, fontWeight: 700, letterSpacing: -0.2 }}>Vízhőmérséklet · Balaton</h2>
          </div>
          <div style={{ fontSize: 11, color: B.muted, marginBottom: 12, paddingLeft: 24 }}>
            7 napos előrejelzés · Siófok mérőállomás
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weather} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={B.lake} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={B.lake} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={B.hair} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: B.inkSoft, fontWeight: 600 }} axisLine={{ stroke: B.hair }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: B.muted }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip
                contentStyle={{ background: B.paper, border: `1px solid ${B.hair}`, borderRadius: 3, fontSize: 12, fontFamily: FONT }}
                formatter={v => [v + ' °C', 'Víz']}
              />
              <Area type="monotone" dataKey="water" stroke={B.lake} strokeWidth={2.2} fill="url(#waterGrad)" dot={{ r: 4, fill: B.lake }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

// ---------- HOSPITALITY VIEW ----------
function HospitalityView() {
  const [horizon, setHorizon] = useState('week');
  const [region, setRegion] = useState('Összes régió');

  const REGIONS = ['Összes régió', 'Balaton', 'Budapest', 'Észak-Magyarország', 'Dél-Alföld', 'Nyugat-Dunántúl'];
  const REGION_MULT = {
    'Összes régió': 1.00,
    'Balaton': 0.42,
    'Budapest': 0.78,
    'Észak-Magyarország': 0.34,
    'Dél-Alföld': 0.28,
    'Nyugat-Dunántúl': 0.36,
  };

  const horizonScale = { day: 1/7, week: 1, month: 4.2 }[horizon];
  const horizonLabel = { day: '1 napos', week: '1 hetes', month: '1 hónapos' }[horizon];
  const regMult = REGION_MULT[region];

  // KPIs (base: total industry weekly, scaled by region & horizon)
  const baseTransactions = 2_840_000; // weekly nationwide
  const transactions = Math.round(baseTransactions * regMult * horizonScale);
  const avgBasketGross = 6840; // Ft
  const grossRevenue = Math.round(transactions * avgBasketGross);
  const netRevenue = Math.round(grossRevenue / 1.27); // 27% ÁFA
  const avgBasketNet = Math.round(avgBasketGross / 1.27);

  // Time series — 12 weeks for chart
  const weeks = [];
  for (let i = 0; i < 12; i++) {
    const seasonal = 0.78 + 0.42 * Math.sin((i - 2) * 0.45);
    const noise = 0.92 + ((i * 13) % 17) / 100;
    const w = Math.round(baseTransactions * regMult * seasonal * noise * avgBasketGross / 1e6);
    weeks.push({
      week: `W${30 + i}`,
      bruttó: w,
      nettó: Math.round(w / 1.27),
      tranzakció: Math.round(baseTransactions * regMult * seasonal * noise / 1000),
    });
  }

  // Payment method breakdown
  const payments = [
    { name: 'Bankkártya',              pct: 48.2, color: B.blue,        icon: CreditCard, yoy: 4.2 },
    { name: 'Készpénz',                pct: 22.4, color: B.gold,        icon: Wallet,     yoy: -3.8 },
    { name: 'SZÉP-kártya',             pct: 19.6, color: B.green,       icon: Receipt,    yoy: 5.6 },
    { name: 'Egyéb elektronikus',      pct: 9.8,  color: B.lake,        icon: Sparkles,   yoy: 11.4 },
  ];

  // Product category breakdown
  const products = [
    { name: 'Étel',                     pct: 56.8, color: B.navy,        icon: UtensilsCrossed, avgItem: 4250 },
    { name: 'Alkoholmentes ital',       pct: 16.4, color: B.blueBright,  icon: Coffee,          avgItem: 980 },
    { name: 'Alkoholos ital',           pct: 18.2, color: B.red,         icon: Wine,            avgItem: 1840 },
    { name: 'Egyéb tételek',            pct: 8.6,  color: B.muted,       icon: Cookie,          avgItem: 620 },
  ];

  // Vat-distinct sub-totals (driven by basket composition)
  const dailyAvgGross = Math.round(grossRevenue / (horizonDays => ({ day: 1, week: 7, month: 30 }[horizon]))(horizon));
  const horizonDaysCount = { day: 1, week: 7, month: 30 }[horizon];
  const dailyGross = Math.round(grossRevenue / horizonDaysCount);
  const dailyNet = Math.round(netRevenue / horizonDaysCount);

  return (
    <>
      {/* LOCATION FILTER */}
      <LocationFilterBar activeCity="Sárvár" />

      {/* WHITSUN FORECAST */}
      <WhitsunForecast scope="food" />

      {/* SELECTOR */}
      <div style={{ background: B.paper, borderRadius: 4, padding: '20px 24px', border: `1px solid ${B.hair}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: '1 1 280px' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: B.muted, fontWeight: 700, marginBottom: 8 }}>
              Régió
            </div>
            <select value={region} onChange={e => setRegion(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 3,
                border: `1px solid ${B.hairStrong}`,
                fontFamily: FONT, fontSize: 15, fontWeight: 700, color: B.navy,
                background: B.paper, cursor: 'pointer',
              }}>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 12, color: B.inkSoft }}>
              <UtensilsCrossed size={13} color={B.red} strokeWidth={2} />
              Vendéglátóhelyek és éttermek forgalmi mutatói
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
              Időszak
            </div>
            <div style={{ display: 'flex', background: B.bg, borderRadius: 3, padding: 3, border: `1px solid ${B.hair}` }}>
              {[{v:'day',l:'1 nap'},{v:'week',l:'1 hét'},{v:'month',l:'1 hónap'}].map(h => (
                <button key={h.v} onClick={() => setHorizon(h.v)}
                  style={{
                    padding: '7px 14px', border: 'none', borderRadius: 2,
                    background: horizon === h.v ? B.navy : 'transparent',
                    color: horizon === h.v ? B.paper : B.inkSoft,
                    fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                  {h.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: FORGALMI ADATOK */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Banknote size={16} color={B.navy} strokeWidth={2.2} />
        <h2 style={{ fontSize: 17, margin: 0, fontWeight: 700, letterSpacing: -0.2, color: B.navy }}>
          Forgalmi adatok
        </h2>
        <span style={{ fontSize: 11, color: B.muted, fontWeight: 500 }}>· {horizonLabel} kitekintés · {region}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
        <KpiCard label={`Bruttó árbevétel`} value={(grossRevenue / 1e9).toFixed(2)} unit="Mrd Ft" delta={6.4} icon={Banknote} accent={B.navy} />
        <KpiCard label={`Nettó árbevétel`} value={(netRevenue / 1e9).toFixed(2)} unit="Mrd Ft" delta={6.4} icon={Banknote} accent={B.blue} />
        <KpiCard label={`Tranzakciók száma`} value={(transactions / 1e6).toFixed(2)} unit="M db" delta={4.8} icon={Receipt} accent={B.lake} />
        <KpiCard label={`Átl. kosárérték (bruttó)`} value={avgBasketGross.toLocaleString('hu-HU')} unit="Ft" delta={1.5} icon={ShoppingBag} accent={B.gold} />
      </div>

      {/* Daily averages strip */}
      <div style={{ background: B.paper, borderRadius: 4, padding: '14px 22px', border: `1px solid ${B.hair}`, marginBottom: 20, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>Átl. napi bruttó</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700, color: B.navy, marginTop: 2 }}>
            {(dailyGross / 1e6).toFixed(1)} M Ft
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>Átl. napi nettó</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700, color: B.blue, marginTop: 2 }}>
            {(dailyNet / 1e6).toFixed(1)} M Ft
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>Átl. kosárérték (nettó)</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700, color: B.lake, marginTop: 2 }}>
            {avgBasketNet.toLocaleString('hu-HU')} Ft
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>Tranzakció / nap</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700, color: B.gold, marginTop: 2 }}>
            {Math.round(transactions / horizonDaysCount).toLocaleString('hu-HU')} db
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>ÁFA hatás</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700, color: B.red, marginTop: 2 }}>
            27%
          </div>
        </div>
      </div>

      {/* TIME SERIES CHART */}
      <div style={{ background: B.paper, borderRadius: 4, padding: '24px 28px 16px', border: `1px solid ${B.hair}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700, letterSpacing: -0.2 }}>
              Idősoros bontás · heti
            </h2>
            <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>
              Bruttó és nettó árbevétel + tranzakciószám · 12 hetes szezon
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: B.inkSoft }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 3, background: B.navy, borderRadius: 2 }} /> Bruttó (M Ft)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 3, background: B.blueBright, borderRadius: 2 }} /> Nettó (M Ft)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 3, background: B.gold, borderRadius: 2 }} /> Tranzakció (ezer db)
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={weeks} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
            <CartesianGrid stroke={B.hair} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: B.muted }} axisLine={{ stroke: B.hair }} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: B.muted }} axisLine={false} tickLine={false} width={50} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: B.muted }} axisLine={false} tickLine={false} width={50} />
            <Tooltip contentStyle={{ background: B.paper, border: `1px solid ${B.hair}`, borderRadius: 3, fontSize: 12, fontFamily: FONT }} />
            <Line yAxisId="left" type="monotone" dataKey="bruttó" stroke={B.navy} strokeWidth={2.4} dot={{ r: 3, fill: B.navy }} />
            <Line yAxisId="left" type="monotone" dataKey="nettó" stroke={B.blueBright} strokeWidth={2} dot={{ r: 3, fill: B.blueBright }} strokeDasharray="4 3" />
            <Line yAxisId="right" type="monotone" dataKey="tranzakció" stroke={B.gold} strokeWidth={2} dot={{ r: 3, fill: B.gold }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SECTION 2 + 3: PAYMENTS + PRODUCTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* PAYMENTS */}
        <div style={{ background: B.paper, borderRadius: 4, padding: '22px 26px', border: `1px solid ${B.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CreditCard size={16} color={B.blue} strokeWidth={2} />
            <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700, letterSpacing: -0.2 }}>
              Fizetési mód szerinti bontás
            </h2>
          </div>
          <div style={{ fontSize: 12, color: B.muted, marginBottom: 18 }}>
            %-arány az összes tranzakcióból · YoY trend
          </div>

          {/* Stacked bar */}
          <div style={{ display: 'flex', height: 36, borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
            {payments.map(p => (
              <div key={p.name} style={{
                flex: p.pct, background: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF', fontSize: 11, fontWeight: 700,
              }}>
                {p.pct >= 12 ? `${p.pct}%` : ''}
              </div>
            ))}
          </div>

          {/* Detail rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {payments.map(p => {
              const Icon = p.icon;
              const positive = p.yoy >= 0;
              const value = Math.round(transactions * p.pct / 100);
              const revenue = Math.round(grossRevenue * p.pct / 100);
              return (
                <div key={p.name} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: B.bg, borderRadius: 3,
                  borderLeft: `3px solid ${p.color}`,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: `${p.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: p.color, flexShrink: 0,
                  }}>
                    <Icon size={15} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.ink }}>{p.name}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: B.inkSoft, marginTop: 2 }}>
                      {value.toLocaleString('hu-HU')} db · {(revenue / 1e6).toFixed(1)} M Ft
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: p.color }}>
                      {p.pct}%
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', fontSize: 10, color: positive ? B.green : B.red, fontWeight: 700, marginTop: 2 }}>
                      {positive ? <TrendingUp size={10} strokeWidth={2.5} /> : <TrendingDown size={10} strokeWidth={2.5} />}
                      {positive ? '+' : ''}{p.yoy}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRODUCTS */}
        <div style={{ background: B.paper, borderRadius: 4, padding: '22px 26px', border: `1px solid ${B.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <UtensilsCrossed size={16} color={B.red} strokeWidth={2} />
            <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700, letterSpacing: -0.2 }}>
              Termékkategória szerinti bontás
            </h2>
          </div>
          <div style={{ fontSize: 12, color: B.muted, marginBottom: 18 }}>
            Étel / Ital / Egyéb · árbevétel megoszlása
          </div>

          {/* Donut chart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 160, height: 160, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={products} dataKey="pct" innerRadius={50} outerRadius={76}
                    startAngle={90} endAngle={-270} stroke="none">
                    {products.map((p, i) => <Cell key={i} fill={p.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.3, color: B.muted, fontWeight: 700 }}>Bruttó</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: B.navy }}>
                  {(grossRevenue / 1e9).toFixed(1)}
                </div>
                <div style={{ fontSize: 10, color: B.muted }}>Mrd Ft</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {products.map(p => {
                const Icon = p.icon;
                const revenue = Math.round(grossRevenue * p.pct / 100);
                return (
                  <div key={p.name} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', background: B.bg, borderRadius: 3,
                    borderLeft: `3px solid ${p.color}`,
                  }}>
                    <Icon size={14} color={p.color} strokeWidth={2} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: B.ink }}>{p.name}</div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: B.muted, marginTop: 1 }}>
                        átl. {p.avgItem.toLocaleString('hu-HU')} Ft / tétel
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: p.color }}>
                        {p.pct}%
                      </div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: B.inkSoft }}>
                        {(revenue / 1e6).toFixed(0)} M Ft
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insight footer */}
          <div style={{
            marginTop: 16, padding: '10px 12px', background: `${B.red}10`,
            borderRadius: 3, fontSize: 11, color: B.inkSoft, borderLeft: `2px solid ${B.red}`,
          }}>
            <strong style={{ color: B.red }}>Megjegyzés:</strong> az alkoholos italok aránya nyári szezonban
            jellemzően 2–4 százalékponttal magasabb, mint az éves átlag.
          </div>
        </div>
      </div>

      <div style={{
        padding: '14px 18px', background: `${B.gold}15`,
        border: `1px dashed ${B.gold}70`, borderRadius: 3,
        fontSize: 12, color: B.inkSoft, marginBottom: 20,
      }}>
        <strong style={{ color: B.gold }}>Mockup:</strong> a bemutatott vendéglátóipari mutatók placeholder
        adatok. Éles üzemben az NTAK vendéglátás-modul, a NAV online pénztárgép adatszolgáltatás és a
        szakmai szövetségi adatok kerülnének a helyükre.
      </div>
    </>
  );
}

// ---------- BATHS VIEW ----------
function BathsView() {
  const [bathName, setBathName] = useState('Sárvári Gyógyfürdő');
  const [horizon, setHorizon] = useState('week');
  const bath = BATHS.find(b => b.name === bathName);
  const profile = BATH_NAT_PROFILES[bathName];

  const horizonDays = { day: 1, week: 7, month: 30 }[horizon];
  const horizonLabel = { day: '1 napos', week: '1 hetes', month: '1 hónapos' }[horizon];

  // Scale weekly figures to horizon (day = /7, week = ×1, month = ×4.3 with some damping)
  const horizonScale = { day: 1/7, week: 1, month: 4.1 }[horizon];
  const tickets = Math.round(bath.weeklyTickets * horizonScale);
  const revenue = Math.round(tickets * bath.avgTicket);
  const addonCount = Math.round(tickets * bath.addonPerTicket);
  const addonRevenue = Math.round(addonCount * bath.addonValue);
  const guests = Math.round(tickets * 0.82); // some tickets are repeat visits or locals
  const nights = Math.round(guests * 2.1);

  // Nearby cities scaled to horizon
  const nearbyRows = bath.nearbyCities.map(c => ({
    ...c,
    weekly: Math.round(c.w * horizonScale),
    nights: Math.round(c.w * horizonScale * 2.3),
  })).sort((a, b) => b.weekly - a.weekly);
  const totalNearbyWeekly = nearbyRows.reduce((s, r) => s + r.weekly, 0);
  const totalNearbyNights = nearbyRows.reduce((s, r) => s + r.nights, 0);

  // Nationality profile with YoY growth
  const nats = Object.entries(profile.pct).map(([name, v]) => ({ name, pct: v }));
  const domestic = nats.find(n => n.name === 'Magyar').pct;
  const foreign = Number((100 - domestic).toFixed(1));
  const natLabelMap = { 'Német': 'Németország', 'Lengyel': 'Lengyelország', 'Cseh': 'Csehország', 'Osztrák': 'Ausztria', 'Olasz': 'Olaszország' };
  // YoY growth varies by bath — derive per country-per-bath from bath code
  const bathCode = [...bathName].reduce((s, c) => s + c.charCodeAt(0), 0);
  const yoyPerNat = {
    'Német':   Number((3.2 + ((bathCode % 13) / 10)).toFixed(1)),
    'Lengyel': Number((4.8 + ((bathCode % 11) / 10)).toFixed(1)),
    'Cseh':    Number((2.6 + ((bathCode % 9) / 10)).toFixed(1)),
    'Osztrák': Number((5.4 + ((bathCode % 7) / 10)).toFixed(1)),
    'Olasz':   Number((6.1 + ((bathCode % 15) / 10)).toFixed(1)),
  };
  const top5 = nats
    .filter(n => ['Német', 'Lengyel', 'Cseh', 'Osztrák', 'Olasz'].includes(n.name))
    .sort((a, b) => b.pct - a.pct)
    .map((n, i) => ({
      ...n,
      displayName: natLabelMap[n.name],
      count: Math.round(guests * n.pct / 100),
      shareOfForeign: Number((n.pct / foreign * 100).toFixed(1)),
      yoy: yoyPerNat[n.name] || 0,
    }));

  return (
    <>
      {/* LOCATION FILTER */}
      <LocationFilterBar activeCity={bath.city} />

      {/* WHITSUN FORECAST */}
      <WhitsunForecast scope="baths" bathName={bathName} />

      {/* BATH SELECTOR */}
      <div style={{ background: B.paper, borderRadius: 4, padding: '20px 24px', border: `1px solid ${B.hair}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: '1 1 340px', minWidth: 260 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: B.muted, fontWeight: 700, marginBottom: 8 }}>
              Fürdő kiválasztása
            </div>
            <select value={bathName} onChange={e => setBathName(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 3,
                border: `1px solid ${B.hairStrong}`,
                fontFamily: FONT, fontSize: 15, fontWeight: 700, color: B.navy,
                background: B.paper, cursor: 'pointer',
              }}>
              {BATHS.map(b => <option key={b.name} value={b.name}>{b.name} · {b.city}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 12, color: B.inkSoft }}>
              <MapPin size={13} color={B.lake} strokeWidth={2} />
              <strong>{bath.city}</strong>
              <span style={{ color: B.muted }}>·</span>
              <span>{bath.region}</span>
              <span style={{ color: B.muted }}>·</span>
              <span>átlagos jegyár: <strong style={{ fontFamily: FONT_MONO, color: B.navy }}>{bath.avgTicket.toLocaleString('hu-HU')} Ft</strong></span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
              Előrejelzési horizont
            </div>
            <div style={{ display: 'flex', background: B.bg, borderRadius: 3, padding: 3, border: `1px solid ${B.hair}` }}>
              {[{v:'day',l:'1 nap'},{v:'week',l:'1 hét'},{v:'month',l:'1 hónap'}].map(h => (
                <button key={h.v} onClick={() => setHorizon(h.v)}
                  style={{
                    padding: '7px 14px', border: 'none', borderRadius: 2,
                    background: horizon === h.v ? B.navy : 'transparent',
                    color: horizon === h.v ? B.paper : B.inkSoft,
                    fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                  {h.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FORECAST KPIs */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 10, marginTop: 4,
      }}>
        <TrendingUp size={16} color={B.navy} strokeWidth={2.2} />
        <h2 style={{ fontSize: 17, margin: 0, fontWeight: 700, letterSpacing: -0.2, color: B.navy }}>
          Előrejelzés
        </h2>
        <span style={{ fontSize: 11, color: B.muted, fontWeight: 500 }}>
          · {horizonLabel} kitekintés
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <KpiCard label={`Értékesített jegyek · ${horizonLabel}`}
          value={tickets.toLocaleString('hu-HU')} unit="db" delta={bath.yoyTickets}
          icon={Ticket} accent={B.blue} />
        <KpiCard label={`Jegybevétel · ${horizonLabel}`}
          value={(revenue / 1e6).toFixed(1)} unit="M Ft" delta={Number((bath.yoyTickets + 2).toFixed(1))}
          icon={Banknote} accent={B.navy} />
        <KpiCard label={`Kiegészítő szolg. darabszám`}
          value={addonCount.toLocaleString('hu-HU')} unit="db" delta={bath.yoyAddon}
          icon={ShoppingBag} accent={B.gold} />
        <KpiCard label={`Kiegészítő szolg. értéke`}
          value={(addonRevenue / 1e6).toFixed(1)} unit="M Ft" delta={Number((bath.yoyAddon + 1.5).toFixed(1))}
          icon={PlusCircle} accent={B.green} />
      </div>

      {/* SECONDARY KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
        <KpiCard label={`Vendég · ${horizonLabel}`}
          value={guests.toLocaleString('hu-HU')} unit="fő" delta={Number((bath.yoyTickets - 0.4).toFixed(1))}
          icon={Users} accent={B.lake} />
        <KpiCard label={`Vendégéjszaka · ${horizonLabel}`}
          value={nights.toLocaleString('hu-HU')} unit="éj" delta={Number((bath.yoyTickets + 0.3).toFixed(1))}
          icon={Moon} accent={B.lakeDeep} />
      </div>

      {/* BATH + CITY ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* BATH INFO */}
        <div style={{ background: B.paper, borderRadius: 4, padding: '22px 26px', border: `1px solid ${B.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Droplets size={16} color={B.lake} strokeWidth={2} />
            <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: -0.3 }}>{bath.name}</h2>
          </div>
          <div style={{ fontSize: 12, color: B.muted, marginBottom: 18 }}>
            Fürdőspecifikus mutatók · {horizonLabel} horizont
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '14px 16px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.blue}` }}>
              <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Átlag jegyár
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, marginTop: 3 }}>
                {bath.avgTicket.toLocaleString('hu-HU')} <span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft }}>Ft</span>
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.gold}` }}>
              <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Kieg. szolg. / jegy
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, marginTop: 3 }}>
                {(bath.addonPerTicket * 100).toFixed(0)}<span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft }}>%</span>
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.green}` }}>
              <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Átl. kieg. érték
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, marginTop: 3 }}>
                {bath.addonValue.toLocaleString('hu-HU')} <span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft }}>Ft</span>
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: B.bg, borderRadius: 3, borderLeft: `3px solid ${B.red}` }}>
              <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Külföldi arány
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, marginTop: 3 }}>
                {foreign.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 500, color: B.inkSoft }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* NEARBY CITIES */}
        <div style={{ background: B.paper, borderRadius: 4, border: `1px solid ${B.hair}`, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px 14px', borderBottom: `1px solid ${B.hair}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} color={B.navy} strokeWidth={2} />
              <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: -0.3 }}>
                Fürdő környéki városok
              </h2>
            </div>
            <div style={{ fontSize: 12, color: B.muted, marginTop: 2, paddingLeft: 24 }}>
              Várható vendégszám és vendégéjszaka · {horizonLabel}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: B.bg }}>
                  <th style={{ textAlign: 'left', padding: '10px 24px', fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>Város</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>Vendégszám</th>
                  <th style={{ textAlign: 'right', padding: '10px 24px', fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>Vendégéjszaka</th>
                </tr>
              </thead>
              <tbody>
                {nearbyRows.map((r, i) => (
                  <tr key={r.name} style={{ borderTop: `1px solid ${B.hair}` }}>
                    <td style={{ padding: '12px 24px', fontWeight: 600, color: B.ink }}>
                      {i === 0 && <span style={{
                        fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                        color: B.lake, fontWeight: 700, background: `${B.lake}15`,
                        padding: '2px 6px', borderRadius: 2, marginRight: 8
                      }}>fürdőváros</span>}
                      {r.name}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 600, color: B.navy }}>
                      {r.weekly.toLocaleString('hu-HU')}
                    </td>
                    <td style={{ padding: '12px 24px', textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 600, color: B.inkSoft }}>
                      {r.nights.toLocaleString('hu-HU')}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${B.hair}`, background: B.bg }}>
                  <td style={{ padding: '12px 24px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                    Összesen
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 700, color: B.navy }}>
                    {totalNearbyWeekly.toLocaleString('hu-HU')}
                  </td>
                  <td style={{ padding: '12px 24px', textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 700, color: B.navy }}>
                    {totalNearbyNights.toLocaleString('hu-HU')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 24px', fontSize: 10, color: B.muted, background: B.bg, borderTop: `1px solid ${B.hair}` }}>
            Vendégéjszaka = várható vendégszám × 2.3
          </div>
        </div>
      </div>

      {/* HATÁSOK - reuse IntlTrendsBox */}
      <IntlTrendsBox />

      {/* TOP 5 WITH YoY */}
      <div style={{ background: B.paper, borderRadius: 4, padding: '24px 28px', border: `1px solid ${B.hair}`, marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 700, letterSpacing: -0.3 }}>
          Top 5 külföldi küldőpiac · várható növekedés (éves összehasonlításban)
        </h2>
        <div style={{ fontSize: 12, color: B.muted, marginBottom: 18 }}>
          %-arány az összes külföldi vendégből · YoY tendencia országonként
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {top5.map((n, i) => (
            <div key={n.name} style={{
              padding: '16px 18px', background: B.bg, borderRadius: 3,
              borderLeft: `3px solid ${[B.blue, B.blueBright, B.lake, B.lakeShallow, B.lakeDeep][i]}`,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                #{String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: B.ink, marginTop: 3, lineHeight: 1.2 }}>
                {n.displayName}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: B.inkSoft, marginTop: 4 }}>
                {n.count.toLocaleString('hu-HU')} fő · {n.pct}%
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${B.hair}` }}>
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                  éves növekedés
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <TrendingUp size={13} color={B.green} strokeWidth={2.5} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700, color: B.green }}>
                    +{n.yoy}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ---------- MAIN ----------
export default function BalatonDashboard() {
  const [city, setCity] = useState('Sárvár');
  const [selectedDay, setSelectedDay] = useState(null);
  const [horizon, setHorizon] = useState('month');
  const [tab, setTab] = useState('main');

  const days = useMemo(() => generateDays(city), [city]);
  const nats = useMemo(() => getNationalities(city), [city]);
  const cityMeta = CITIES.find(c => c.name === city);

  const horizonDays = { day: 1, week: 7, month: 30 }[horizon];
  const horizonLabel = { day: '1 napos', week: '1 hetes', month: '1 hónapos' }[horizon];
  // Forecast window: from today (May 15 – one week before Whitsun weekend May 23–25) forward
  const todayIdx = days.findIndex(d => d.date === '2026-05-15');
  const windowStart = todayIdx >= 0 ? todayIdx : 0;
  const forecastWindow = days.slice(windowStart, windowStart + horizonDays);
  const totalGuests = forecastWindow.reduce((s, d) => s + d.guests, 0);
  const totalNights = Math.round(forecastWindow.reduce((s, d) => s + d.guests * d.los, 0));
  const avgLos = totalGuests > 0 ? (totalNights / totalGuests).toFixed(2) : '0.00';
  const maxDaily = Math.max(...days.map(d => d.guests));

  const guestsYoY = ((cityMeta.yoyV - 1) * 100).toFixed(1);
  const nightsYoY = ((cityMeta.yoyV * 1.015 - 1) * 100).toFixed(1);
  const losYoY = 0.08;
  // Room price varies by city to match varied data
  const roomPrice = Math.round(cityMeta.baseAdr * 1.01);
  const roomPriceDelta = 5.0;

  const hungarian = nats.find(n => n.name === 'Magyar').pct;
  const foreign = Number((100 - hungarian).toFixed(1));
  const top5Foreign = nats.filter(n => ['Német', 'Lengyel', 'Cseh', 'Osztrák', 'Olasz'].includes(n.name))
                          .sort((a, b) => b.pct - a.pct);
  const foreignGuests = Math.round(totalGuests * foreign / 100);
  const natLabelMap = { 'Német': 'Németország', 'Lengyel': 'Lengyelország', 'Cseh': 'Csehország', 'Osztrák': 'Ausztria', 'Olasz': 'Olaszország' };
  const top5WithCounts = top5Foreign.map(n => ({
    ...n,
    displayName: natLabelMap[n.name] || n.name,
    count: Math.round(totalGuests * n.pct / 100),
    shareOfForeign: Number((n.pct / foreign * 100).toFixed(1))
  }));

  const weekly = useMemo(() => {
    const buckets = {};
    days.forEach(d => {
      const dt = new Date(d.date);
      const mon = new Date(dt);
      mon.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
      const key = isoDate(mon);
      if (!buckets[key]) buckets[key] = { week: key, guests: 0, prev: 0 };
      buckets[key].guests += d.guests;
      buckets[key].prev += Math.round(d.guests / cityMeta.yoyV * (0.94 + ((d.day * 7) % 12) / 100));
    });
    return Object.values(buckets)
      .sort((a, b) => a.week.localeCompare(b.week))
      .map(w => ({ ...w, label: new Date(w.week).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }) }));
  }, [days, cityMeta]);

  const today = new Date('2026-05-16');
  const todayIso = '2026-05-15';
  const todayStr = today.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  // Today's week bucket label (the Monday of the week containing today)
  const todayMonday = new Date(today);
  todayMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const todayWeekLabel = todayMonday.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });

  return (
    <div style={{
      background: B.bg, minHeight: '100vh',
      fontFamily: FONT, color: B.ink,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { font-family: ${FONT}; }
      `}</style>

      {/* HEADER */}
      <div style={{
        background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyLight} 100%)`,
        color: '#FFFFFF', padding: '22px 40px 24px',
        position: 'relative', overflow: 'hidden',
        borderBottom: `3px solid ${B.red}`
      }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle, ${B.blue}30 0%, transparent 70%)` }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', opacity: 0.65, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: B.gold, color: B.navy, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 2, letterSpacing: 1.5 }}>MOCKUP</span>
            </div>
            <h1 style={{ fontSize: 30, margin: '4px 0 2px', fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15, color: '#FFFFFF' }}>
              Vendégforgalmi előrejelző rendszer
            </h1>
            <div style={{ fontSize: 13, opacity: 0.88, fontWeight: 400, maxWidth: 720, lineHeight: 1.45 }}>
              Szűrjön le a kívánt településre vagy fürdőre és tekintse meg a várható vendégszámok előrejelzését.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>
              Előrejelzési horizont
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: 3, border: '1px solid rgba(255,255,255,0.18)' }}>
              {[{v:'day',l:'1 nap'},{v:'week',l:'1 hét'},{v:'month',l:'1 hónap'}].map(h => (
                <button key={h.v} onClick={() => setHorizon(h.v)}
                  style={{
                    padding: '7px 16px', border: 'none', borderRadius: 2,
                    background: horizon === h.v ? B.paper : 'transparent',
                    color: horizon === h.v ? B.navy : '#FFFFFF',
                    fontFamily: FONT, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                  }}>
                  {h.l} <span style={{ opacity: 0.6, fontWeight: 400 }}>előre</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.75, fontFamily: FONT_MONO }}>
              <Calendar size={12} strokeWidth={2} />
              {todayStr}
            </div>
          </div>
        </div>
      </div>

      {/* TAB BAR (sticky - visible on all pages + while scrolling) */}
      <div style={{
        background: B.paper, borderBottom: `1px solid ${B.hair}`,
        padding: '0 40px', display: 'flex', alignItems: 'center', gap: 4,
        position: 'sticky', top: 0, zIndex: 5,
        boxShadow: '0 2px 6px rgba(11,37,69,0.04)',
      }}>
        {[
          { v: 'main', l: 'Szálláshely előrejelzés', icon: LayoutDashboard },
          { v: 'baths', l: 'Fürdők előrejelzés', icon: Droplets },
          { v: 'food', l: 'Vendéglátás előrejelzés', icon: UtensilsCrossed },
        ].map(t => {
          const Ic = t.icon;
          const active = tab === t.v;
          return (
            <button key={t.v} onClick={() => setTab(t.v)}
              style={{
                background: 'transparent', border: 'none',
                padding: '14px 18px', fontSize: 13, fontWeight: 600,
                color: active ? B.navy : B.muted,
                borderBottom: active ? `3px solid ${B.red}` : '3px solid transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                fontFamily: FONT,
              }}>
              <Ic size={15} strokeWidth={active ? 2.4 : 2} />
              {t.l}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '24px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 13, color: B.inkSoft }}>
            {tab !== 'baths' && tab !== 'food' && (
              <>
                Kiválasztva: <strong style={{ color: B.navy, fontSize: 17, marginLeft: 4, fontWeight: 700 }}>{city}</strong>
                {tab === 'main' && <span style={{ marginLeft: 14, color: B.muted }}>· horizont: <strong style={{ color: B.blue }}>{horizonLabel}</strong></span>}
              </>
            )}
            {tab === 'baths' && (
              <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Fürdők előrejelzés · Top 15 elemzés
              </span>
            )}
            {tab === 'food' && (
              <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: B.muted, fontWeight: 700 }}>
                Vendéglátóipar · forgalmi és fizetési adatok
              </span>
            )}
          </div>
        </div>

        {tab === 'main' && (
          <>
            {/* LOCATION FILTER */}
            <LocationFilterBar activeCity={city} />

            {/* WHITSUN FORECAST */}
            <WhitsunForecast scope="accommodation" cityName={city} />

            {/* TOP CITY SELECTOR */}
            <TopCitySelector selectedCity={city} onSelect={setCity} />

            {/* CITY OVERVIEW TILE — cities with expected weekly guests + nights */}
            <CityOverviewTile selectedCity={city} onSelect={setCity} />

            {/* GOOGLE MAP */}
            <div style={{ background: B.paper, borderRadius: 4, padding: '20px 24px 20px', border: `1px solid ${B.hair}`, marginBottom: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: -0.3 }}>
                  Balaton térkép
                </h2>
                <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>
                  Kattints egy marker-re a település kiválasztásához · Pötty mérete és színe = heti forgalom
                </div>
              </div>
              <GoogleBalatonMap selectedCity={city} onSelect={setCity} />
            </div>

            {/* EVENTS */}
            <EventsBox />

            {/* INTERNATIONAL TRENDS */}
            <IntlTrendsBox />

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              <KpiCard label={`Vendég · ${horizonLabel}`} value={totalGuests.toLocaleString('hu-HU')} unit="fő" delta={guestsYoY} icon={Users} accent={B.blue} />
              <KpiCard label="Vendégéjszaka" value={totalNights.toLocaleString('hu-HU')} unit="éj" delta={nightsYoY} icon={Moon} accent={B.lake} />
              <KpiCard label="Átl. tartózkodás" value={avgLos} unit="nap" delta={losYoY} deltaUnit=" nap" icon={Star} accent={B.gold} />
              <KpiCard label="Javasolt szobaár" value={roomPrice.toLocaleString('hu-HU')} unit="Ft" delta={roomPriceDelta} deltaSuffix="tegnaphoz képest" icon={Banknote} accent={B.red} />
            </div>

            {/* WEEKLY CHART */}
            <div style={{ background: B.paper, borderRadius: 4, padding: '24px 28px 16px', border: `1px solid ${B.hair}`, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: -0.3 }}>
                    Heti vendégforgalom <span style={{ fontSize: 14, color: B.muted, fontWeight: 400, letterSpacing: 0 }}>(éves növekedés YoY)</span>
                  </h2>
                  <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>
                    {city} · 2026 előrejelzés vs. 2025 tény
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 18, fontSize: 11, color: B.inkSoft }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 14, height: 3, background: B.blue, borderRadius: 2 }} /> 2026
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 14, height: 2, background: B.muted, borderRadius: 2 }} /> 2025
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={weekly} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
                  <defs>
                    <linearGradient id="cur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={B.blue} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={B.blue} stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={B.hair} strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: B.muted }} axisLine={{ stroke: B.hair }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: B.muted }} axisLine={false} tickLine={false} width={56}
                    tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v} />
                  <Tooltip contentStyle={{ background: B.paper, border: `1px solid ${B.hair}`, borderRadius: 3, fontSize: 12, fontFamily: FONT }}
                    formatter={(v, n) => [v.toLocaleString('hu-HU') + ' fő', n === 'guests' ? '2026' : '2025']}
                    labelFormatter={l => `Hét: ${l}`} />
                  <Area type="monotone" dataKey="guests" stroke={B.blue} strokeWidth={2.2} fill="url(#cur)" />
                  <Area type="monotone" dataKey="prev" stroke={B.muted} strokeWidth={1.2} strokeDasharray="4 3" fill="none" />
                  <ReferenceLine x={todayWeekLabel} stroke={B.red} strokeWidth={2} strokeDasharray="4 3"
                    label={{ value: 'Ma · máj. 15.', position: 'top', fill: B.red, fontSize: 11, fontWeight: 700, fontFamily: FONT }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* DAILY CALENDAR */}
            <div style={{ background: B.paper, borderRadius: 4, padding: '24px 28px', border: `1px solid ${B.hair}`, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: -0.3 }}>
                    Napi előrejelzés
                  </h2>
                  <div style={{ fontSize: 12, color: B.muted, marginTop: 2 }}>
                    Szín = várható vendégszám · <span style={{ color: B.gold }}>★</span> ünnep · <span style={{ color: B.gold }}>♪</span> esemény · vastag keret = csúcsnap · kattints egy napra
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: B.inkSoft }}>
                  <span>csendesebb</span>
                  <div style={{ display: 'flex', gap: 0 }}>
                    {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((i, k) => (
                      <div key={k} style={{
                        width: 20, height: 14,
                        background: `color-mix(in srgb, ${B.blue} ${Math.round(i * 88)}%, ${B.blueLight})`
                      }} />
                    ))}
                  </div>
                  <span>csúcs</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <MonthCalendar month={5} monthName="Május" days={days} maxGuests={maxDaily} onDayClick={setSelectedDay} />
                <MonthCalendar month={6} monthName="Június" days={days} maxGuests={maxDaily} onDayClick={setSelectedDay} />
                <MonthCalendar month={7} monthName="Július" days={days} maxGuests={maxDaily} onDayClick={setSelectedDay} />
                <MonthCalendar month={8} monthName="Augusztus" days={days} maxGuests={maxDaily} onDayClick={setSelectedDay} />
              </div>
            </div>

            {/* NATIONALITY ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20, marginBottom: 20 }}>
              <div style={{ background: B.paper, borderRadius: 4, padding: '24px 28px', border: `1px solid ${B.hair}` }}>
                <h2 style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 700, letterSpacing: -0.3 }}>
                  Vendégösszetétel
                </h2>
                <div style={{ fontSize: 12, color: B.muted, marginBottom: 16 }}>
                  Magyar vs. külföldi · <span style={{ color: B.red, fontWeight: 700 }}>külföldi arány {foreign}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ width: 170, height: 170, position: 'relative', flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ name: 'Magyar', value: hungarian }, { name: 'Külföldi', value: foreign }]}
                          innerRadius={54} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                          <Cell fill={B.navy} />
                          <Cell fill={B.red} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: B.muted, fontWeight: 700 }}>Összes</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{(totalGuests / 1000).toFixed(1)}k</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ padding: '10px 0', borderBottom: `1px solid ${B.hair}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 10, height: 10, background: B.navy, borderRadius: '50%' }} />
                          <span style={{ fontWeight: 700 }}>Magyar</span>
                        </div>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 700 }}>{hungarian}%</span>
                      </div>
                      <div style={{ fontSize: 11, color: B.muted, marginTop: 2 }}>
                        {Math.round(totalGuests * hungarian / 100).toLocaleString('hu-HU')} fő
                      </div>
                    </div>
                    <div style={{ padding: '10px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 10, height: 10, background: B.red, borderRadius: '50%' }} />
                          <span style={{ fontWeight: 700 }}>Külföldi</span>
                        </div>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 700 }}>{foreign}%</span>
                      </div>
                      <div style={{ fontSize: 11, color: B.muted, marginTop: 2 }}>
                        {foreignGuests.toLocaleString('hu-HU')} fő
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: B.paper, borderRadius: 4, padding: '24px 28px', border: `1px solid ${B.hair}` }}>
                <h2 style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 700, letterSpacing: -0.3 }}>
                  Top 5 külföldi küldőpiac
                </h2>
                <div style={{ fontSize: 12, color: B.muted, marginBottom: 18 }}>
                  %-arány az összes külföldi vendégből
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {top5WithCounts.map((n, i) => (
                    <div key={n.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5, gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 }}>
                          <span style={{ fontSize: 20, color: B.muted, fontWeight: 500 }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: B.ink }}>{n.displayName}</span>
                          <span style={{ fontSize: 11, color: B.muted }}>
                            {n.count.toLocaleString('hu-HU')} fő · {n.pct}%
                          </span>
                        </div>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700, color: B.blue }}>
                          {n.shareOfForeign}%
                        </span>
                      </div>
                      <div style={{ background: B.bg, height: 5, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${n.shareOfForeign}%`, height: '100%', background: [B.blue, B.blueBright, B.lake, B.lakeShallow, B.lakeDeep][i] }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${B.hair}`, fontSize: 11, color: B.muted, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Top 5 együtt</span>
                  <span style={{ fontFamily: FONT_MONO, color: B.ink, fontWeight: 700 }}>
                    {top5WithCounts.reduce((s, n) => s + n.shareOfForeign, 0).toFixed(1)}% · {top5WithCounts.reduce((s, n) => s + n.count, 0).toLocaleString('hu-HU')} fő
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'baths' && <BathsView />}

        {tab === 'food' && <HospitalityView />}

        <div style={{
          marginTop: 28, padding: '14px 18px', background: `${B.gold}15`,
          border: `1px dashed ${B.gold}70`, borderRadius: 3,
          fontSize: 12, color: B.inkSoft,
        }}>
          <strong style={{ color: B.gold }}>Mockup:</strong> a települések, események és arányok valódi balatoni referenciák, de minden számérték placeholder. Éles üzemben a modell kimenete és a valós NTAK + Google Maps adatok kerülnek a helyükre.
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${B.hair}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 11, color: B.muted }}>
          <div>© BI & Digital Solutions · Demo felület</div>
          <div>Adatforrás: NTAK · OMSZ · MNB · Google Maps (mockup)</div>
        </div>
      </div>

      <DayDetailModal day={selectedDay} city={city} nats={nats} onClose={() => setSelectedDay(null)} />
    </div>
  );
}
