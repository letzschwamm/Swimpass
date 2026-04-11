// All criteria for all FLNS Luxembourg swimming badge levels
// Multilingual: de, fr, lu, en

// Badge metadata: color, icon, order
export const BADGE_META = {
  bobby:        { color: '#F97316', bg: 'rgba(249,115,22,.15)', border: 'rgba(249,115,22,.35)', label: 'Bobby',        icon: '🟠', order: 1 },
  seepferdchen: { color: '#FB923C', bg: 'rgba(251,146,60,.15)', border: 'rgba(251,146,60,.35)', label: 'Seepferdchen', icon: '🐠', order: 2 },
  trixi:        { color: '#3B82F6', bg: 'rgba(59,130,246,.15)', border: 'rgba(59,130,246,.35)', label: 'Trixi',        icon: '🔵', order: 3 },
  bronze:       { color: '#CD7F32', bg: 'rgba(205,127,50,.15)', border: 'rgba(205,127,50,.35)', label: 'Bronze',       icon: '🥉', order: 4 },
  silber:       { color: '#9CA3AF', bg: 'rgba(156,163,175,.15)', border: 'rgba(156,163,175,.35)', label: 'Silber',     icon: '🥈', order: 5 },
  gold:         { color: '#F4A51A', bg: 'rgba(244,165,26,.15)', border: 'rgba(244,165,26,.35)', label: 'Gold',         icon: '🥇', order: 6 },
  // Legacy levels (kept for backward compatibility)
  junior:       { color: '#0096C7', bg: 'rgba(0,150,199,.15)', border: 'rgba(0,150,199,.35)', label: 'Junior Lifesaver', icon: '🏊', order: 7 },
  lifesaver:    { color: '#F4A51A', bg: 'rgba(244,165,26,.15)', border: 'rgba(244,165,26,.35)', label: 'Lifesaver',    icon: '🛟', order: 8 },
}

export const CRITERIA = {
  // ── BOBBY ────────────────────────────────────────────────
  bobby: {
    swim: [
      {
        key: 'bo_swim_1',
        de: { title: 'Abspringen ins Wasser', detail: 'Sprung vom Beckenrand, wieder auftauchen', tag: 'Technik' },
        fr: { title: 'Saut dans l\'eau', detail: 'Saut du bord du bassin, remonter à la surface', tag: 'Technique' },
        lu: { title: 'Absprong am Waasser', detail: 'Sprong vum Beckenrand, erëm opkommen', tag: 'Technik' },
        en: { title: 'Jump into water', detail: 'Jump from pool edge, resurface', tag: 'Technique' },
      },
      {
        key: 'bo_swim_2',
        de: { title: '25m schwimmen', detail: 'Beliebige Technik, ohne Unterbrechung', tag: 'Ausdauer' },
        fr: { title: '25m de natation', detail: 'Technique libre, sans interruption', tag: 'Endurance' },
        lu: { title: '25m schwammen', detail: 'Beliebeg Technik, ouni Ënnerbriechung', tag: 'Ausdauer' },
        en: { title: '25m swimming', detail: 'Any technique, without stopping', tag: 'Endurance' },
      },
      {
        key: 'bo_swim_3',
        de: { title: 'Rückenlage gleiten', detail: '5 Sekunden auf dem Rücken treiben', tag: 'Gleichgewicht' },
        fr: { title: 'Flotter sur le dos', detail: '5 secondes en position dorsale', tag: 'Équilibre' },
        lu: { title: 'Récklag schwammen', detail: '5 Sekonnen um Réck treiben', tag: 'Gläichgewiicht' },
        en: { title: 'Float on back', detail: 'Float on back for 5 seconds', tag: 'Balance' },
      },
      {
        key: 'bo_swim_4',
        de: { title: 'Gegenstand holen', detail: 'Objekt vom Beckenboden in schultertiefer Wassertiefe', tag: 'Tauchen' },
        fr: { title: 'Récupérer un objet', detail: 'Objet au fond du bassin (profondeur épaule)', tag: 'Plongée' },
        lu: { title: 'Géigestand huelen', detail: 'Objekt vum Beckengrond an schoulderdeifer Tieft', tag: 'Tauchen' },
        en: { title: 'Retrieve object', detail: 'Object from pool floor at shoulder depth', tag: 'Diving' },
      },
    ],
  },

  // ── SEEPFERDCHEN ─────────────────────────────────────────
  seepferdchen: {
    swim: [
      {
        key: 'se_swim_1',
        de: { title: 'Sprung & Auftauchen', detail: 'Sprung vom Beckenrand, unter Wasser auftauchen', tag: 'Technik' },
        fr: { title: 'Saut & remontée', detail: 'Saut du bord, remonter sous l\'eau', tag: 'Technique' },
        lu: { title: 'Sprong & Opkommen', detail: 'Sprong vum Rand, ënnert Waasser opkommen', tag: 'Technik' },
        en: { title: 'Jump & surface', detail: 'Jump from edge, surface underwater', tag: 'Technique' },
      },
      {
        key: 'se_swim_2',
        de: { title: '25m Brust oder Kraul', detail: 'Korrekte Technik, ohne Unterbrechung', tag: 'Ausdauer' },
        fr: { title: '25m brasse ou crawl', detail: 'Technique correcte, sans interruption', tag: 'Endurance' },
        lu: { title: '25m Brust oder Kraul', detail: 'Korrekt Technik, ouni Ënnerbriechung', tag: 'Ausdauer' },
        en: { title: '25m breaststroke or crawl', detail: 'Correct technique, without stopping', tag: 'Endurance' },
      },
      {
        key: 'se_swim_3',
        de: { title: '10m Rückenschwimmen', detail: 'Auf dem Rücken, ohne Unterbrechung', tag: 'Technik' },
        fr: { title: '10m dos crawlé', detail: 'Sur le dos, sans interruption', tag: 'Technique' },
        lu: { title: '10m Réckenschwammen', detail: 'Um Réck, ouni Ënnerbriechung', tag: 'Technik' },
        en: { title: '10m backstroke', detail: 'On back, without stopping', tag: 'Technique' },
      },
      {
        key: 'se_swim_4',
        de: { title: 'Gegenstand tauchen', detail: 'Objekt vom Beckenboden aus 0,5m Tiefe holen', tag: 'Tauchen' },
        fr: { title: 'Plonger un objet', detail: 'Récupérer objet du fond à 0,5m de profondeur', tag: 'Plongée' },
        lu: { title: 'Géigestand tauchen', detail: 'Objekt vum Grond aus 0,5m Tieft huelen', tag: 'Tauchen' },
        en: { title: 'Dive for object', detail: 'Retrieve object from 0.5m depth', tag: 'Diving' },
      },
      {
        key: 'se_swim_5',
        de: { title: 'Rettungsring werfen', detail: 'Rettungsring zu einer Person 3m entfernt werfen', tag: 'Rettung' },
        fr: { title: 'Lancer bouée', detail: 'Lancer une bouée à une personne à 3m', tag: 'Sauvetage' },
        lu: { title: 'Rettungsring werfen', detail: 'Rettungsring op eng Persoun 3m wäit werfen', tag: 'Rettung' },
        en: { title: 'Throw rescue ring', detail: 'Throw rescue ring to person 3m away', tag: 'Rescue' },
      },
    ],
  },

  // ── TRIXI ────────────────────────────────────────────────
  trixi: {
    swim: [
      {
        key: 'tr_swim_1',
        de: { title: '100m schwimmen (2 Lagen)', detail: 'Max. 5 Min · mind. 2 verschiedene Lagen', tag: 'Ausdauer' },
        fr: { title: '100m natation (2 nages)', detail: 'Max. 5 min · min. 2 nages différentes', tag: 'Endurance' },
        lu: { title: '100m schwammen (2 Laagen)', detail: 'Max. 5 Min · mind. 2 verschidde Laagen', tag: 'Ausdauer' },
        en: { title: '100m swimming (2 strokes)', detail: 'Max. 5 min · min. 2 different strokes', tag: 'Endurance' },
      },
      {
        key: 'tr_swim_2',
        de: { title: 'Startsprung', detail: 'Sprung vom Beckenrand, korrekte Eintauchposition', tag: 'Technik' },
        fr: { title: 'Plongeon de départ', detail: 'Du bord du bassin, position d\'entrée correcte', tag: 'Technique' },
        lu: { title: 'Startsprong', detail: 'Vum Beckenrand, korrekt Aantauchpositioun', tag: 'Technik' },
        en: { title: 'Starting dive', detail: 'From pool edge, correct entry position', tag: 'Technique' },
      },
      {
        key: 'tr_swim_3',
        de: { title: '25m Rückenschwimmen', detail: 'Durchgehend, korrekte Armtechnik', tag: 'Technik' },
        fr: { title: '25m dos', detail: 'Continu, technique de bras correcte', tag: 'Technique' },
        lu: { title: '25m Réckenschwammen', detail: 'Duerchgend, korrekt Armtechnik', tag: 'Technik' },
        en: { title: '25m backstroke', detail: 'Continuous, correct arm technique', tag: 'Technique' },
      },
      {
        key: 'tr_swim_4',
        de: { title: '10m Streckentauchen', detail: 'Start im Wasser · Tiefe mind. 0,8m', tag: 'Tauchen' },
        fr: { title: '10m en apnée', detail: 'Départ dans l\'eau · profondeur min. 0,8m', tag: 'Plongée' },
        lu: { title: '10m Streckentauchen', detail: 'Start am Waasser · Tieft mind. 0,8m', tag: 'Tauchen' },
        en: { title: '10m underwater swim', detail: 'Start in water · min. depth 0.8m', tag: 'Diving' },
      },
      {
        key: 'tr_swim_5',
        de: { title: 'Tieftauchen 2×', detail: 'Gegenstand aus 1,5m Tiefe holen (2 Versuche, 3 Min)', tag: 'Tauchen' },
        fr: { title: 'Plongée profonde 2×', detail: 'Récupérer objet à 1,5m (2 essais, 3 min)', tag: 'Plongée' },
        lu: { title: 'Déifstauchen 2×', detail: 'Géigestand aus 1,5m Tieft huelen (2 Versich, 3 Min)', tag: 'Tauchen' },
        en: { title: 'Deep dive 2×', detail: 'Retrieve object from 1.5m (2 tries, 3 min)', tag: 'Diving' },
      },
    ],
  },

  // ── BRONZE ───────────────────────────────────────────────
  bronze: {
    swim: [
      {
        key: 'br_swim_1',
        de: { title: '150m schwimmen', detail: 'Max. 8 Min · Brust + Kraul + Rücken (je 50m)', tag: 'Ausdauer' },
        fr: { title: '150m natation', detail: 'Max. 8 min · brasse + crawl + dos (50m chacun)', tag: 'Endurance' },
        lu: { title: '150m schwammen', detail: 'Max. 8 Min · Brust + Kraul + Réck (all 50m)', tag: 'Ausdauer' },
        en: { title: '150m swimming', detail: 'Max. 8 min · breast + crawl + back (50m each)', tag: 'Endurance' },
      },
      {
        key: 'br_swim_2',
        de: { title: 'Startsprung + 15m Tauchen', detail: 'Sprung, dann 15m Streckentauchen ohne Pause', tag: 'Technik' },
        fr: { title: 'Plongeon + 15m apnée', detail: 'Plongeon, puis 15m en apnée sans pause', tag: 'Technique' },
        lu: { title: 'Startsprong + 15m Tauchen', detail: 'Sprong, dann 15m Streckentauchen ouni Paus', tag: 'Technik' },
        en: { title: 'Start dive + 15m underwater', detail: 'Dive, then 15m underwater swim without pause', tag: 'Technique' },
      },
      {
        key: 'br_swim_3',
        de: { title: 'Tieftauchen 2×', detail: 'Gegenstand aus 2m · Kopf- und Fußtauchen · max. 3 Min', tag: 'Tauchen' },
        fr: { title: 'Plongée profonde 2×', detail: 'Objet à 2m · tête et pieds · max. 3 min', tag: 'Plongée' },
        lu: { title: 'Déifstauchen 2×', detail: 'Géigestand aus 2m · Kapp- a Fousssprong · max. 3 Min', tag: 'Tauchen' },
        en: { title: 'Deep dive 2×', detail: 'Object from 2m · head and feet · max. 3 min', tag: 'Diving' },
      },
    ],
    rescue: [
      {
        key: 'br_rescue_1',
        de: { title: '25m Schleppen', detail: 'Achselgriff · ohne Zeitlimit', tag: 'Rettung' },
        fr: { title: '25m remorquage', detail: 'Prise aisselle · sans limite de temps', tag: 'Sauvetage' },
        lu: { title: '25m Schleppen', detail: 'Achselgrëff · ouni Zäitlimit', tag: 'Rettung' },
        en: { title: '25m tow', detail: 'Armpit grip · no time limit', tag: 'Rescue' },
      },
    ],
    theory: [
      {
        key: 'br_theory_1',
        de: { title: 'Stabile Seitenlage', detail: 'Korrekte Demonstration der stabilen Seitenlage', tag: 'Erste Hilfe' },
        fr: { title: 'Position latérale de sécurité', detail: 'Démonstration correcte de la PLS', tag: 'Premiers secours' },
        lu: { title: 'Stabil Saitlag', detail: 'Korrekt Demonstratioun vun der stabiler Saitlag', tag: 'Éischt Hëllef' },
        en: { title: 'Recovery position', detail: 'Correct demonstration of recovery position', tag: 'First aid' },
      },
    ],
  },

  // ── SILBER ───────────────────────────────────────────────
  silber: {
    swim: [
      {
        key: 'si_swim_1',
        de: { title: '200m schwimmen', detail: 'Max. 10 Min · mind. 3 Lagen (je mind. 50m)', tag: 'Ausdauer' },
        fr: { title: '200m natation', detail: 'Max. 10 min · min. 3 nages (min. 50m chacune)', tag: 'Endurance' },
        lu: { title: '200m schwammen', detail: 'Max. 10 Min · mind. 3 Laagen (all mind. 50m)', tag: 'Ausdauer' },
        en: { title: '200m swimming', detail: 'Max. 10 min · min. 3 strokes (min. 50m each)', tag: 'Endurance' },
      },
      {
        key: 'si_swim_2',
        de: { title: 'Startsprung', detail: 'Vom Beckenrand oder 1m-Brett', tag: 'Technik' },
        fr: { title: 'Plongeon de départ', detail: 'Du bord ou plongeoir 1m', tag: 'Technique' },
        lu: { title: 'Startsprong', detail: 'Vum Beckenrand oder 1m-Brett', tag: 'Technik' },
        en: { title: 'Starting dive', detail: 'From pool edge or 1m board', tag: 'Technique' },
      },
      {
        key: 'si_swim_3',
        de: { title: '20m Streckentauchen', detail: 'Start im Wasser · Tiefe mind. 1m', tag: 'Tauchen' },
        fr: { title: '20m en apnée', detail: 'Départ dans l\'eau · profondeur min. 1m', tag: 'Plongée' },
        lu: { title: '20m Streckentauchen', detail: 'Start am Waasser · Tieft mind. 1m', tag: 'Tauchen' },
        en: { title: '20m underwater swim', detail: 'Start in water · min. depth 1m', tag: 'Diving' },
      },
      {
        key: 'si_swim_4',
        de: { title: 'Tieftauchen 2×', detail: 'Kopf & Fuß · 5kg Gegenstand · 2-3m · max. 3 Min', tag: 'Tauchen' },
        fr: { title: 'Plongée profonde 2×', detail: 'Tête & pieds · 5kg · 2-3m · max. 3 min', tag: 'Plongée' },
        lu: { title: 'Déifstauchen 2×', detail: 'Kapp & Fouss · 5kg · 2-3m · max. 3 Min', tag: 'Tauchen' },
        en: { title: 'Deep dive 2×', detail: 'Head & feet · 5kg · 2-3m · max. 3 min', tag: 'Diving' },
      },
    ],
    rescue: [
      {
        key: 'si_rescue_1',
        de: { title: '50m Schleppen', detail: 'Kopf- oder Achselgriff + Fesselschleppgriff', tag: 'Rettung' },
        fr: { title: '50m remorquage', detail: 'Prise tête/aisselle + entrave', tag: 'Sauvetage' },
        lu: { title: '50m Schleppen', detail: 'Kapp- oder Achselgrëff + Fesselschleppgrëff', tag: 'Rettung' },
        en: { title: '50m tow', detail: 'Head/armpit grip + restraint grip', tag: 'Rescue' },
      },
    ],
    theory: [
      {
        key: 'si_theory_1',
        de: { title: 'HLW 2 Minuten', detail: 'Korrekte Herz-Lungen-Wiederbelebung', tag: 'Erste Hilfe' },
        fr: { title: 'RCP 2 minutes', detail: 'Réanimation cardio-pulmonaire correcte', tag: 'Premiers secours' },
        lu: { title: 'HLW 2 Minutten', detail: 'Korrekt Häerz-Longen-Wiederbelebung', tag: 'Éischt Hëllef' },
        en: { title: 'CPR 2 minutes', detail: 'Correct cardiopulmonary resuscitation', tag: 'First aid' },
      },
    ],
  },

  // ── GOLD ─────────────────────────────────────────────────
  gold: {
    swim: [
      {
        key: 'go_swim_1',
        de: { title: '300m schwimmen', detail: 'Max. 14 Min · mind. 3 Lagen', tag: 'Ausdauer' },
        fr: { title: '300m natation', detail: 'Max. 14 min · min. 3 nages', tag: 'Endurance' },
        lu: { title: '300m schwammen', detail: 'Max. 14 Min · mind. 3 Laagen', tag: 'Ausdauer' },
        en: { title: '300m swimming', detail: 'Max. 14 min · min. 3 strokes', tag: 'Endurance' },
      },
      {
        key: 'go_swim_2',
        de: { title: 'Sprung aus 3m', detail: 'Oder 3 verschiedene Sprünge aus 1m Höhe', tag: 'Technik' },
        fr: { title: 'Saut depuis 3m', detail: 'Ou 3 sauts différents depuis 1m', tag: 'Technique' },
        lu: { title: 'Sprong vun 3m', detail: 'Oder 3 verschidde Sprong vun 1m', tag: 'Technik' },
        en: { title: 'Jump from 3m', detail: 'Or 3 different jumps from 1m', tag: 'Technique' },
      },
      {
        key: 'go_swim_3',
        de: { title: '25m Streckentauchen', detail: 'Start im Wasser · Tiefe mind. 1m', tag: 'Tauchen' },
        fr: { title: '25m en apnée', detail: 'Départ dans l\'eau · profondeur min. 1m', tag: 'Plongée' },
        lu: { title: '25m Streckentauchen', detail: 'Start am Waasser · Tieft mind. 1m', tag: 'Tauchen' },
        en: { title: '25m underwater swim', detail: 'Start in water · min. depth 1m', tag: 'Diving' },
      },
      {
        key: 'go_swim_4',
        de: { title: 'Tieftauchen 2×', detail: 'Kopf & Fuß · 5kg · 3-4m Tiefe · max. 2 Min', tag: 'Tauchen' },
        fr: { title: 'Plongée profonde 2×', detail: 'Tête & pieds · 5kg · 3-4m · max. 2 min', tag: 'Plongée' },
        lu: { title: 'Déifstauchen 2×', detail: 'Kapp & Fouss · 5kg · 3-4m · max. 2 Min', tag: 'Tauchen' },
        en: { title: 'Deep dive 2×', detail: 'Head & feet · 5kg · 3-4m · max. 2 min', tag: 'Diving' },
      },
    ],
    rescue: [
      {
        key: 'go_rescue_1',
        de: { title: 'Befreiungsgriffe (4×)', detail: 'Demonstration + Erklärung Land & Wasser', tag: 'Rettung' },
        fr: { title: 'Dégagements (4×)', detail: 'Démonstration + explication terre & eau', tag: 'Sauvetage' },
        lu: { title: 'Befreiungsgriffer (4×)', detail: 'Demonstratioun + Erklärung Land & Waasser', tag: 'Rettung' },
        en: { title: 'Release grips (4×)', detail: 'Demonstration + explanation land & water', tag: 'Rescue' },
      },
      {
        key: 'go_rescue_2',
        de: { title: '100m in Kleidern', detail: 'Max. 4 Min · Entkleiden im Wasser', tag: 'Ausdauer' },
        fr: { title: '100m en vêtements', detail: 'Max. 4 min · déshabillage dans l\'eau', tag: 'Endurance' },
        lu: { title: '100m a Kleeder', detail: 'Max. 4 Min · Kleeder am Waasser auszzéien', tag: 'Ausdauer' },
        en: { title: '100m in clothes', detail: 'Max. 4 min · undress in water', tag: 'Endurance' },
      },
      {
        key: 'go_rescue_3',
        de: { title: '50m Schleppen (bekleidet)', detail: 'Beide Partner in Kleidung · max. 4 Min', tag: 'Rettung' },
        fr: { title: '50m remorquage (habillé)', detail: 'Les deux habillés · max. 4 min', tag: 'Sauvetage' },
        lu: { title: '50m Schleppen (a Kleeder)', detail: 'Béid Partner a Kleeder · max. 4 Min', tag: 'Rettung' },
        en: { title: '50m tow in clothes', detail: 'Both in clothes · max. 4 min', tag: 'Rescue' },
      },
      {
        key: 'go_rescue_4',
        de: { title: 'Kombinierte Übung', detail: '20m Anschwimmen → Rettung → 20m Schleppen → Seitenlage', tag: 'Komplex' },
        fr: { title: 'Exercice combiné', detail: '20m nage → sauvetage → 20m remorquage → PLS', tag: 'Complexe' },
        lu: { title: 'Kombinéiert Übung', detail: '20m Anschwammen → Rettung → 20m Schleppen → Saitlag', tag: 'Komplex' },
        en: { title: 'Combined exercise', detail: '20m swim → rescue → 20m tow → recovery position', tag: 'Complex' },
      },
    ],
    theory: [
      {
        key: 'go_theory_1',
        de: { title: 'HLW 3 Minuten', detail: 'Korrekte Herz-Lungen-Wiederbelebung', tag: 'Erste Hilfe' },
        fr: { title: 'RCP 3 minutes', detail: 'Réanimation cardio-pulmonaire correcte', tag: 'Premiers secours' },
        lu: { title: 'HLW 3 Minutten', detail: 'Korrekt Häerz-Longen-Wiederbelebung', tag: 'Éischt Hëllef' },
        en: { title: 'CPR 3 minutes', detail: 'Correct cardiopulmonary resuscitation', tag: 'First aid' },
      },
      {
        key: 'go_theory_2',
        de: { title: 'Theoretische Prüfung', detail: 'Schriftlicher Fragebogen', tag: 'Theorie' },
        fr: { title: 'Examen théorique', detail: 'Questionnaire écrit', tag: 'Théorie' },
        lu: { title: 'Theoretesch Prüfung', detail: 'Schriftleche Fragebou', tag: 'Theorie' },
        en: { title: 'Theory exam', detail: 'Written questionnaire', tag: 'Theory' },
      },
    ],
  },

  // ── LEGACY: Junior Lifesaver ──────────────────────────────
  junior: {
    swim: [
      { key: 'jl_swim_1', de: { title: '200m Schwimmen', detail: 'Max. 10 Min · 100m Bauch + 100m Rücken (Grätsch)', tag: 'Ausdauer' }, fr: { title: '200m de natation', detail: 'Max. 10 min · 100m ventre + 100m dos (brasse)', tag: 'Endurance' }, lu: { title: '200m schwammen', detail: 'Max. 10 Min · 100m Bauch + 100m Réck (Grätschen)', tag: 'Ausdauer' }, en: { title: '200m swimming', detail: 'Max. 10 min · 100m front + 100m back (breaststroke kick)', tag: 'Endurance' } },
      { key: 'jl_swim_2', de: { title: 'Startsprung', detail: 'Sprung aus ~1m · Schritt, Fuß oder Kopfsprung', tag: 'Technik' }, fr: { title: 'Saut de départ', detail: 'Depuis ~1m · plongeon, pied ou tête', tag: 'Technique' }, lu: { title: 'Startsprong', detail: 'Vun ~1m · Schrëtt, Fouss oder Kapp', tag: 'Technik' }, en: { title: 'Starting jump', detail: 'Jump from ~1m · step, foot or head dive', tag: 'Technique' } },
      { key: 'jl_swim_3', de: { title: '15m Streckentauchen', detail: 'Start im Becken · Mindesttiefe ~1m', tag: 'Tauchen' }, fr: { title: '15m en apnée', detail: 'Départ dans le bassin · profondeur min. ~1m', tag: 'Plongée' }, lu: { title: '15m Streckentauchen', detail: 'Start am Becken · Mindesttieft ~1m', tag: 'Tauchen' }, en: { title: '15m underwater swim', detail: 'Start in pool · minimum depth ~1m', tag: 'Diving' } },
      { key: 'jl_swim_4', de: { title: 'Tieftauchen 2×', detail: 'Kopf & Fuß in 3 Min · 5kg Gegenstand · 2-3m Tiefe', tag: 'Tauchen' }, fr: { title: 'Plongée profonde 2×', detail: 'Tête & pieds en 3 min · objet 5kg · 2-3m', tag: 'Plongée' }, lu: { title: 'Déifstauchen 2×', detail: 'Kapp & Fouss a 3 Min · 5kg · 2-3m', tag: 'Tauchen' }, en: { title: 'Deep dive 2×', detail: 'Head & feet in 3 min · 5kg object · 2-3m depth', tag: 'Diving' } },
    ],
    rescue: [
      { key: 'jl_rescue_1', de: { title: 'Befreiungsgriffe', detail: 'Aus Umklammerungen & Würgegriffen (Land + Wasser)', tag: 'Rettung' }, fr: { title: 'Dégagements', detail: 'Étreintes & prises (terre + eau)', tag: 'Sauvetage' }, lu: { title: 'Befreiungsgriffer', detail: 'Ëmklammerongen & Würgegriffer (Land + Waasser)', tag: 'Rettung' }, en: { title: 'Release grips', detail: 'Release from holds & chokes (land + water)', tag: 'Rescue' } },
      { key: 'jl_rescue_2', de: { title: '50m Schleppen', detail: 'Kopf-/Achselgriff + Fesselschleppgriff', tag: 'Rettung' }, fr: { title: '50m remorquage', detail: 'Prise tête/aisselle + entrave', tag: 'Sauvetage' }, lu: { title: '50m Schleppen', detail: 'Kapp-/Achselgrëff + Fesselschleppgrëff', tag: 'Rettung' }, en: { title: '50m tow', detail: 'Head/armpit grip + restraint tow grip', tag: 'Rescue' } },
      { key: 'jl_rescue_3', de: { title: '100m in Kleidern', detail: 'Max. 4 Min · Entkleiden im Wasser', tag: 'Ausdauer' }, fr: { title: '100m en vêtements', detail: "Max. 4 min · déshabillage dans l'eau", tag: 'Endurance' }, lu: { title: '100m a Kleeder', detail: 'Max. 4 Min · Kleeder am Waasser auszzéien', tag: 'Ausdauer' }, en: { title: '100m in clothes', detail: 'Max. 4 min · undress in water', tag: 'Endurance' } },
      { key: 'jl_rescue_4', de: { title: 'Kombinierte Übung', detail: '20m Anschwimmen → Retten → 20m Schleppen → Seitenlage', tag: 'Komplex' }, fr: { title: 'Exercice combiné', detail: '20m nage → sauvetage → 20m remorquage → PLS', tag: 'Complexe' }, lu: { title: 'Kombinéiert Übung', detail: '20m Anschwammen → Rettung → 20m Schleppen → Saitlag', tag: 'Komplex' }, en: { title: 'Combined exercise', detail: '20m swim → rescue → 20m tow → recovery position', tag: 'Complex' } },
    ],
    theory: [
      { key: 'jl_theory_1', de: { title: 'Wiederbelebung 2 Min', detail: 'Korrekte Durchführung der Maßnahmen', tag: 'Erste Hilfe' }, fr: { title: 'RCP 2 minutes', detail: 'Réanimation cardio-pulmonaire correcte', tag: 'Premiers secours' }, lu: { title: 'Wiederbelebung 2 Min', detail: 'Korrekt Duerchféierung', tag: 'Éischt Hëllef' }, en: { title: 'Resuscitation 2 min', detail: 'Correct CPR execution', tag: 'First aid' } },
    ],
  },

  // ── LEGACY: Lifesaver ─────────────────────────────────────
  lifesaver: {
    swim: [
      { key: 'ls_swim_1', de: { title: '400m Schwimmen', detail: 'Max. 15 Min · 100m Kraul + 150m Brust + 150m Rücken', tag: 'Ausdauer' }, fr: { title: '400m de natation', detail: 'Max. 15 min · 100m crawl + 150m brasse + 150m dos', tag: 'Endurance' }, lu: { title: '400m schwammen', detail: 'Max. 15 Min · 100m Kraul + 150m Brust + 150m Réck', tag: 'Ausdauer' }, en: { title: '400m swimming', detail: 'Max. 15 min · 100m crawl + 150m breast + 150m back', tag: 'Endurance' } },
      { key: 'ls_swim_2', de: { title: 'Sprung aus 3m', detail: 'Oder 3 verschiedene Sprünge aus 1m Höhe', tag: 'Technik' }, fr: { title: 'Saut depuis 3m', detail: 'Ou 3 sauts différents depuis 1m', tag: 'Technique' }, lu: { title: 'Sprong vun 3m', detail: 'Oder 3 verschidde Sprong vun 1m', tag: 'Technik' }, en: { title: 'Jump from 3m', detail: 'Or 3 different jumps from 1m height', tag: 'Technique' } },
      { key: 'ls_swim_3', de: { title: '25m Streckentauchen', detail: 'Start im Becken · Mindesttiefe ~1m', tag: 'Tauchen' }, fr: { title: '25m en apnée', detail: 'Départ dans le bassin · profondeur min. ~1m', tag: 'Plongée' }, lu: { title: '25m Streckentauchen', detail: 'Start am Becken · Mindesttieft ~1m', tag: 'Tauchen' }, en: { title: '25m underwater swim', detail: 'Start in pool · minimum depth ~1m', tag: 'Diving' } },
      { key: 'ls_swim_4', de: { title: 'Tieftauchen 2×', detail: 'Kopf & Fuß in 2 Min · 5kg · 3,5-5m Tiefe · 3s halten', tag: 'Tauchen' }, fr: { title: 'Plongée profonde 2×', detail: 'En 2 min · 5kg · 3,5-5m · tenir 3s', tag: 'Plongée' }, lu: { title: 'Déifstauchen 2×', detail: 'A 2 Min · 5kg · 3,5-5m · 3s halen', tag: 'Tauchen' }, en: { title: 'Deep dive 2×', detail: 'In 2 min · 5kg · 3.5-5m · hold 3s', tag: 'Diving' } },
    ],
    rescue: [
      { key: 'ls_rescue_1', de: { title: '6 Befreiungstechniken', detail: 'Demonstration + Erklärung an Land & im Wasser', tag: 'Rettung' }, fr: { title: '6 techniques de dégagement', detail: 'Démonstration + explication terre & eau', tag: 'Sauvetage' }, lu: { title: '6 Befreiungstechniken', detail: 'Demonstratioun + Erklärung Land & Waasser', tag: 'Rettung' }, en: { title: '6 release techniques', detail: 'Demonstration + explanation on land & in water', tag: 'Rescue' } },
      { key: 'ls_rescue_2', de: { title: '50m Transportschwimmen', detail: 'Schieben oder Ziehen in max. 1:30 Min (Übungspuppe)', tag: 'Rettung' }, fr: { title: '50m transport', detail: 'Pousser ou tirer en max. 1:30 min (mannequin)', tag: 'Sauvetage' }, lu: { title: '50m Transportschwammen', detail: 'Schieben oder Zéien max. 1:30 Min', tag: 'Rettung' }, en: { title: '50m transport swim', detail: 'Push or pull max. 1:30 min (training dummy)', tag: 'Rescue' } },
      { key: 'ls_rescue_3', de: { title: '300m in Kleidern', detail: 'Max. 12 Min · Entkleiden im Wasser', tag: 'Ausdauer' }, fr: { title: '300m en vêtements', detail: "Max. 12 min · déshabillage dans l'eau", tag: 'Endurance' }, lu: { title: '300m a Kleeder', detail: 'Max. 12 Min · Kleeder am Waasser', tag: 'Ausdauer' }, en: { title: '300m in clothes', detail: 'Max. 12 min · undress in water', tag: 'Endurance' } },
      { key: 'ls_rescue_4', de: { title: '50m Schleppen bekleidet', detail: 'Max. 4 Min · beide Partner in Kleidung', tag: 'Rettung' }, fr: { title: '50m remorquage habillé', detail: 'Max. 4 min · les deux habillés', tag: 'Sauvetage' }, lu: { title: '50m Schleppen a Kleeder', detail: 'Max. 4 Min · béid Partner a Kleeder', tag: 'Rettung' }, en: { title: '50m tow in clothes', detail: 'Max. 4 min · both partners in clothes', tag: 'Rescue' } },
      { key: 'ls_rescue_5', de: { title: 'Kombinierte Übung', detail: 'Anschwimmen → Retten aus 3,5-5m → Befreiung → Schleppen → WB', tag: 'Komplex' }, fr: { title: 'Exercice combiné', detail: 'Nage → sauvetage → dégagement → remorquage → RCP', tag: 'Complexe' }, lu: { title: 'Kombinéiert Übung', detail: 'Schwammen → Rettung → Befreiung → Schleppen → WB', tag: 'Komplex' }, en: { title: 'Combined exercise', detail: 'Swim → rescue → release → tow → CPR', tag: 'Complex' } },
    ],
    theory: [
      { key: 'ls_theory_1', de: { title: 'Wiederbelebung 3 Min', detail: 'Korrekte Durchführung der Maßnahmen', tag: 'Erste Hilfe' }, fr: { title: 'RCP 3 minutes', detail: 'Réanimation cardio-pulmonaire correcte', tag: 'Premiers secours' }, lu: { title: 'Wiederbelebung 3 Min', detail: 'Korrekt Duerchféierung', tag: 'Éischt Hëllef' }, en: { title: 'Resuscitation 3 min', detail: 'Correct CPR execution', tag: 'First aid' } },
      { key: 'ls_theory_2', de: { title: 'Theoretische Prüfung', detail: 'Fragebogen schriftlich', tag: 'Theorie' }, fr: { title: 'Examen théorique', detail: 'Questionnaire écrit', tag: 'Théorie' }, lu: { title: 'Theoretesch Prüfung', detail: 'Schriftleche Fragebou', tag: 'Theorie' }, en: { title: 'Theory exam', detail: 'Written questionnaire', tag: 'Theory' } },
    ],
  },
}

export function getTotalCriteria(level) {
  const cat = CRITERIA[level]
  if (!cat) return 0
  return Object.values(cat).reduce((sum, arr) => sum + arr.length, 0)
}

export function getProgress(doneKeys, level) {
  const total = getTotalCriteria(level)
  if (!total) return 0
  return Math.round((doneKeys.length / total) * 100)
}

// All badge levels in display order
export const ALL_LEVELS = ['bobby', 'seepferdchen', 'trixi', 'bronze', 'silber', 'gold']
export const LEGACY_LEVELS = ['junior', 'lifesaver']
