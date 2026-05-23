/** Curated gallery — grouped by era and project. Paths are under /gallery/ in public. */
const G = (folder, file) => `${import.meta.env.BASE_URL}gallery/${folder}/${file}`;

export const GALLERY_GROUPS = [
  {
    id: 'buffer-team',
    label: 'Buffer · team off-sites',
    era: '2019–2023',
    tags: ['culture', 'buffer'],
    blurb: 'Remote-first culture in person — off-sites in Greece and Banff, and the road between.',
  },
  {
    id: 'buffer-product',
    label: 'Buffer · product work',
    era: '2019–2023',
    tags: ['buffer', 'product'],
    blurb: 'Growth PM work — journey mapping and mobile subscription flows.',
  },
  {
    id: 'worship-songsuggest',
    label: 'SongSuggest',
    era: '2010',
    tags: ['product'],
    blurb: 'Billboard-recognized worship music discovery — the original iOS app and share flows.',
  },
  {
    id: 'the-overflow',
    label: 'The Overflow',
    era: '2013–2019',
    tags: ['product'],
    blurb: 'First Christian subscription streaming service — genres, albums, and artist catalog UI.',
  },
  {
    id: 'already-loved',
    label: 'Already Loved',
    era: '2024',
    tags: ['product'],
    blurb: 'Personalized children\'s books — onboarding flows and delight-first UX.',
  },
  {
    id: 'ensurall-gvc',
    label: 'Ensurall · GVC',
    era: '2022–2026',
    tags: ['product'],
    blurb: 'Canadian extended warranty brands — landing pages, quote flows, and brand presence I designed and shipped.',
  },
  {
    id: 'cowriter',
    label: 'cowriter',
    era: '2023',
    tags: ['product'],
    blurb: 'AI-assisted writing — promo and in-product list UI.',
  },
  {
    id: 'quickstaff',
    label: 'Quickstaff Pro',
    era: '2012–2023',
    tags: ['product'],
    blurb: 'Event staffing — from the original QuickStaff shell to availability checks, schedules, and shift assignment.',
  },
  {
    id: 'ai-voice',
    label: 'AI voice tools',
    era: '2024',
    tags: ['product'],
    blurb: 'Voice generation UI — character selection and usage limits.',
  },
];

export const GALLERY_ITEMS = [
  // Buffer team
  { id: 'bt-moraine', group: 'buffer-team', src: G('buffer-team', 'moraine-lake.jpg'), title: 'Moraine Lake off-site', year: 2022, span: 2 },
  { id: 'bt-lunch', group: 'buffer-team', src: G('buffer-team', 'team-lunch.jpg'), title: 'Team lunch', year: 2022 },
  { id: 'bt-banff', group: 'buffer-team', src: G('buffer-team', 'banff-street.jpg'), title: 'Banff retreat', year: 2022 },
  { id: 'bt-car', group: 'buffer-team', src: G('buffer-team', 'road-trip-car.jpg'), title: 'Road trip crew', year: 2022 },
  { id: 'bt-selfie', group: 'buffer-team', src: G('buffer-team', 'road-trip-selfie.jpg'), title: 'Car selfie', year: 2022 },
  { id: 'bt-parthenon', group: 'buffer-team', src: G('buffer-team', 'athens-parthenon.jpg'), title: 'Athens · Parthenon', year: 2023 },
  { id: 'bt-odeon', group: 'buffer-team', src: G('buffer-team', 'athens-odeon.jpg'), title: 'Athens · Odeon', year: 2023 },

  // Buffer product
  { id: 'bp-journey', group: 'buffer-product', src: G('buffer-product', 'journey-map.png'), title: 'Setup → Aha → Habit journey map', year: 2022, span: 2 },
  { id: 'bp-pricing', group: 'buffer-product', src: G('buffer-product', 'mobile-pricing.png'), title: 'Mobile pricing & subscribe', year: 2023 },

  // SongSuggest (2010)
  { id: 'ss-found', group: 'worship-songsuggest', src: G('worship-songsuggest', 'songs-found.png'), title: 'Songs found', year: 2010 },
  { id: 'ss-ideas', group: 'worship-songsuggest', src: G('worship-songsuggest', 'song-ideas.png'), title: 'Song ideas', year: 2010 },
  { id: 'ss-share-u', group: 'worship-songsuggest', src: G('worship-songsuggest', 'share-upper.png'), title: 'Share flow (upper)', year: 2010 },
  { id: 'ss-share-l', group: 'worship-songsuggest', src: G('worship-songsuggest', 'share-lower.png'), title: 'Share flow (lower)', year: 2010 },
  { id: 'ss-press', group: 'worship-songsuggest', src: G('worship-songsuggest', 'press-photo.jpg'), title: 'Press photo', year: 2010 },
  { id: 'ss-0966', group: 'worship-songsuggest', src: G('worship-songsuggest', 'app-screen-0966.png'), title: 'In-app screen', year: 2010 },

  // The Overflow
  { id: 'ov-genres', group: 'the-overflow', src: G('theoverflow', 'genres.png'), title: 'Genres', year: 2013 },
  { id: 'ov-feat', group: 'the-overflow', src: G('theoverflow', 'featured-genres.png'), title: 'Featured genres', year: 2013 },
  { id: 'ov-album', group: 'the-overflow', src: G('theoverflow', 'album-view.png'), title: 'Album view', year: 2013 },
  { id: 'ov-feat2', group: 'the-overflow', src: G('theoverflow', 'featured-genres-alt.png'), title: 'Featured genres', year: 2013 },
  { id: 'ov-art-alb', group: 'the-overflow', src: G('theoverflow', 'artist-albums.png'), title: 'Artist · albums', year: 2013 },
  { id: 'ov-art-song', group: 'the-overflow', src: G('theoverflow', 'artist-songs.png'), title: 'Artist · songs', year: 2013 },

  // Already Loved
  { id: 'al-birth', group: 'already-loved', src: G('already-loved', 'onboarding-birth.jpg'), title: 'Birth year & month', year: 2024 },
  { id: 'al-places', group: 'already-loved', src: G('already-loved', 'onboarding-places.jpg'), title: 'Favorite places', year: 2024 },
  { id: 'al-3042', group: 'already-loved', src: G('already-loved', 'onboarding-3042.jpg'), title: 'Onboarding screen', year: 2024 },
  { id: 'al-3052', group: 'already-loved', src: G('already-loved', 'onboarding-3052.jpg'), title: 'Onboarding screen', year: 2024 },
  { id: 'al-3053', group: 'already-loved', src: G('already-loved', 'onboarding-3053.jpg'), title: 'Onboarding screen', year: 2024 },

  // Ensurall · GVC
  { id: 'eg-home', group: 'ensurall-gvc', src: G('ensurall-gvc', 'homepage-hero.png'), title: 'Ensurall homepage', year: 2026, span: 2 },
  { id: 'eg-a', group: 'ensurall-gvc', src: G('ensurall-gvc', 'landing-hero-a.jpg'), title: 'Landing hero A', year: 2023, span: 2 },
  { id: 'eg-b', group: 'ensurall-gvc', src: G('ensurall-gvc', 'landing-hero-b.jpg'), title: 'Landing hero B', year: 2023, span: 2 },
  { id: 'eg-c', group: 'ensurall-gvc', src: G('ensurall-gvc', 'landing-hero-c.jpg'), title: 'Landing hero C', year: 2023, span: 2 },
  { id: 'eg-sign', group: 'ensurall-gvc', src: G('ensurall-gvc', 'office-sign.jpg'), title: 'GVC office signage', year: 2022, span: 2 },

  // cowriter
  { id: 'cw-promo', group: 'cowriter', src: G('cowriter', 'promo-card.png'), title: 'Promo card', year: 2023 },
  { id: 'cw-list', group: 'cowriter', src: G('cowriter', 'monitor-list.jpg'), title: 'Document list UI', year: 2023, span: 2 },

  // Quickstaff
  { id: 'qs-container', group: 'quickstaff', src: G('quickstaff', 'container.png'), title: 'App shell · events dashboard', year: 2012, span: 2 },
  { id: 'qs-schedule', group: 'quickstaff', src: G('quickstaff', 'event-schedule.png'), title: 'Event schedule', year: 2020, span: 2 },
  { id: 'qs-avail', group: 'quickstaff', src: G('quickstaff', 'availability-check.png'), title: 'Availability check', year: 2021, span: 2 },
  { id: 'qs-local', group: 'quickstaff', src: G('quickstaff', 'localization-settings.png'), title: 'Localization settings', year: 2021 },
  { id: 'qs-notify', group: 'quickstaff', src: G('quickstaff', 'notification-settings.png'), title: 'Notification settings', year: 2021 },
  { id: 'qs-form', group: 'quickstaff', src: G('quickstaff', 'profile-form.png'), title: 'Profile form · UX notes', year: 2023 },
  { id: 'qs-shift', group: 'quickstaff', src: G('quickstaff', 'add-staff-shift.jpg'), title: 'Add staff to shift', year: 2023, span: 2 },

  // AI voice
  { id: 'av-gen', group: 'ai-voice', src: G('ai-voice', 'generator-ui.jpg'), title: 'AI voice generator', year: 2024, span: 2 },
];

export const GALLERY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'culture', label: 'Team culture' },
  { id: 'buffer', label: 'Buffer' },
  { id: 'product', label: 'Product UI' },
];

function parseEraBounds(era) {
  const text = String(era);
  const start = parseInt(text.slice(0, 4), 10) || 0;
  const endPart = text.split(/[–-]/).pop()?.trim() ?? text;
  const end = parseInt(endPart.slice(0, 4), 10) || start;
  return { start, end };
}

/** Newest era first; tie-break on end year, then label. */
export function compareGalleryGroups(a, b) {
  const ea = parseEraBounds(a.era);
  const eb = parseEraBounds(b.era);
  if (ea.start !== eb.start) return eb.start - ea.start;
  if (ea.end !== eb.end) return eb.end - ea.end;
  return a.label.localeCompare(b.label);
}
