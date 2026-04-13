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

  // ── Junior Lifesaver (FLNS, Stand 15.03.2026) ─────────────
  junior: {
    admin: [
      { key: 'jl_admin_1', de: { title: 'Mindestalter 12 Jahre', detail: 'Geburtsdatum prüfen', tag: 'Admin' }, fr: { title: 'Âge minimum 12 ans', detail: 'Vérifier la date de naissance', tag: 'Admin' }, lu: { title: 'Mindestalter 12 Joer', detail: 'Gebuertsdag iwwerpréiwen', tag: 'Admin' }, en: { title: 'Minimum age 12 years', detail: 'Verify date of birth', tag: 'Admin' } },
      { key: 'jl_admin_2', de: { title: 'Einverständniserklärung Eltern', detail: 'Bei Minderjährigen zwingend erforderlich', tag: 'Admin' }, fr: { title: 'Accord parental', detail: 'Obligatoire pour les mineurs', tag: 'Admin' }, lu: { title: 'Elterlek Aversteesnes', detail: 'Bei Mannerjähregen obligatoresch', tag: 'Admin' }, en: { title: 'Parental consent', detail: 'Mandatory for minors', tag: 'Admin' } },
      { key: 'jl_admin_3', de: { title: 'Ärztliches Attest oder Sportlizenz', detail: 'Freigabe für Rettungsschwimmen bestätigt', tag: 'Admin' }, fr: { title: 'Certificat médical ou licence sportive', detail: 'Autorisation pour la natation de sauvetage', tag: 'Admin' }, lu: { title: 'Ärztleche Schäin oder Sportlizenz', detail: 'Fräigab fir Rettungsschwammen bestätegt', tag: 'Admin' }, en: { title: 'Medical certificate or sports licence', detail: 'Clearance for lifesaving swimming confirmed', tag: 'Admin' } },
      { key: 'jl_admin_4', de: { title: 'B1 Formular gesendet', detail: 'Mindestens 1 Woche vor Kursbeginn', tag: 'Admin' }, fr: { title: 'Formulaire B1 envoyé', detail: 'Au moins 1 semaine avant le cours', tag: 'Admin' }, lu: { title: 'B1 Formulaire geschéckt', detail: 'Mindestens 1 Woch virun Kursbeginn', tag: 'Admin' }, en: { title: 'B1 form sent', detail: 'At least 1 week before course start', tag: 'Admin' } },
      { key: 'jl_admin_5', de: { title: 'B2 Formular gesendet', detail: 'Spätestens 1 Woche nach der Prüfung', tag: 'Admin' }, fr: { title: 'Formulaire B2 envoyé', detail: 'Au plus tard 1 semaine après l\'examen', tag: 'Admin' }, lu: { title: 'B2 Formulaire geschéckt', detail: 'Spéitstens 1 Woch no der Prüfung', tag: 'Admin' }, en: { title: 'B2 form sent', detail: 'No later than 1 week after the exam', tag: 'Admin' } },
      { key: 'jl_admin_6', de: { title: 'Zahlungsnachweis vorhanden', detail: 'Nach erfolgreichem Bestehen', tag: 'Admin' }, fr: { title: 'Preuve de paiement disponible', detail: 'Après réussite de l\'examen', tag: 'Admin' }, lu: { title: 'Zahlungsbeleg disponibel', detail: 'No erfolgräichem Bestoen', tag: 'Admin' }, en: { title: 'Proof of payment available', detail: 'After passing the exam', tag: 'Admin' } },
    ],
    prereq: [
      { key: 'jl_pre_1', de: { title: '400m Schwimmen (max 25 Min)', detail: '300m Bauchlage + 100m Rückenlage', tag: 'Optional' }, fr: { title: '400m natation (max 25 min)', detail: '300m ventral + 100m dorsal', tag: 'Optionnel' }, lu: { title: '400m schwammen (max 25 Min)', detail: '300m Bauch + 100m Réck', tag: 'Optional' }, en: { title: '400m swimming (max 25 min)', detail: '300m front + 100m backstroke', tag: 'Optional' } },
      { key: 'jl_pre_2', de: { title: '2 Tauchgänge ~2m Tiefe', detail: 'Mit Objektbergung von der Wasseroberfläche', tag: 'Optional' }, fr: { title: '2 plongées ~2m', detail: 'Avec récupération d\'objet depuis la surface', tag: 'Optionnel' }, lu: { title: '2 Taucher ~2m Tieft', detail: 'Mat Objektbierung vun der Uewerfläch', tag: 'Optional' }, en: { title: '2 dives ~2m depth', detail: 'With object retrieval from the surface', tag: 'Optional' } },
      { key: 'jl_pre_3', de: { title: 'Sprung aus 1m Höhe', detail: '', tag: 'Optional' }, fr: { title: 'Saut depuis 1m', detail: '', tag: 'Optionnel' }, lu: { title: 'Sprong vun 1m', detail: '', tag: 'Optional' }, en: { title: 'Jump from 1m', detail: '', tag: 'Optional' } },
      { key: 'jl_pre_4', de: { title: '10m Apnoe (~1m Tiefe)', detail: '', tag: 'Optional' }, fr: { title: '10m apnée (~1m)', detail: '', tag: 'Optionnel' }, lu: { title: '10m Apnoe (~1m Tieft)', detail: '', tag: 'Optional' }, en: { title: '10m apnoea (~1m depth)', detail: '', tag: 'Optional' } },
    ],
    swim: [
      { key: 'jl_swim_1', de: { title: '200m Schwimmen (max 10 Min)', detail: '100m Bauchlage + 100m Rückenlage Beinschlag (keine Arme) · keine Brille/Maske', tag: 'Ausdauer' }, fr: { title: '200m natation (max 10 min)', detail: '100m ventral + 100m dorsal battement pieds (sans bras) · sans lunettes/masque', tag: 'Endurance' }, lu: { title: '200m schwammen (max 10 Min)', detail: '100m Bauchlage + 100m Réckenlage Beinschlag (ouni Arme) · keng Brëll/Mask', tag: 'Ausdauer' }, en: { title: '200m swimming (max 10 min)', detail: '100m front + 100m backstroke legs only (no arms) · no goggles/mask', tag: 'Endurance' } },
      { key: 'jl_swim_2', de: { title: '3 Sprünge aus ~1m Höhe', detail: 'Nach Wahl: Paket-, Schritt-/Stand-, Start-, Fuß- od. Kopfsprung', tag: 'Technik' }, fr: { title: '3 sauts depuis ~1m', detail: 'Au choix : groupé, pas, de départ, pieds ou tête', tag: 'Technique' }, lu: { title: '3 Sprong vun ~1m', detail: 'No Wiel: Pakéit-, Schrëtt-/Stand-, Start-, Fouss- oder Kappsprong', tag: 'Technik' }, en: { title: '3 jumps from ~1m', detail: 'Choice of: tuck, step/standing, racing start, feet-first or head-first', tag: 'Technique' } },
      { key: 'jl_swim_3', de: { title: '15m Apnoe', detail: 'Tiefe 80–100cm · Sicherheitsprotokoll · Handzeichen nach Auftauchen', tag: 'Tauchen' }, fr: { title: '15m apnée', detail: 'Profondeur 80–100cm · protocole de sécurité · signal main après remontée', tag: 'Plongée' }, lu: { title: '15m Apnoe', detail: 'Tieft 80–100cm · Sécherheetsprotokoll · Handzeechen no Opkommen', tag: 'Tauchen' }, en: { title: '15m apnoea', detail: 'Depth 80–100cm · safety protocol · hand signal after surfacing', tag: 'Diving' } },
      { key: 'jl_swim_4', de: { title: 'Tieftauchen 2× (vertikal + füßwärts)', detail: 'Objekt aus 2–3m bergem · max 3 Min', tag: 'Tauchen' }, fr: { title: 'Plongée profonde 2× (vertical + pieds)', detail: 'Remonter objet 2–3m · max 3 min', tag: 'Plongée' }, lu: { title: 'Déifstauchen 2× (vertikal + Féiss)', detail: 'Objekt aus 2–3m huelen · max 3 Min', tag: 'Tauchen' }, en: { title: 'Deep dive 2× (vertical + feet-first)', detail: 'Retrieve object 2–3m · max 3 min', tag: 'Diving' } },
    ],
    rescue: [
      { key: 'jl_rescue_1', de: { title: 'Befreiungsgriffe (4 Techniken)', detail: 'Hals vorne & hinten + Taille vorne & hinten — an Land und im Wasser', tag: 'Rettung' }, fr: { title: 'Dégagements (4 techniques)', detail: 'Gorge devant & derrière + taille devant & derrière — à terre et dans l\'eau', tag: 'Sauvetage' }, lu: { title: 'Befreiungsgriffer (4 Techniken)', detail: 'Hals virun & hannendrun + Taille virun & hannendrun — Land a Waasser', tag: 'Rettung' }, en: { title: 'Release grips (4 techniques)', detail: 'Neck front & back + waist front & back — on land and in water', tag: 'Rescue' } },
      { key: 'jl_rescue_2', de: { title: 'Schleppgriffe (3 Techniken)', detail: 'Kopfgriff + Achselgriff + Fixationsgriff (schwierige Situationen)', tag: 'Rettung' }, fr: { title: 'Prises de remorquage (3 techniques)', detail: 'Tête + aisselle + fixation (situations difficiles)', tag: 'Sauvetage' }, lu: { title: 'Schleppgriffer (3 Techniken)', detail: 'Kappgrëff + Achselgrëff + Fixatiounsgrëff (schwiereg Situatiounen)', tag: 'Rettung' }, en: { title: 'Tow grips (3 techniques)', detail: 'Head grip + armpit grip + fixation grip (difficult situations)', tag: 'Rescue' } },
      { key: 'jl_rescue_3', de: { title: '50m Rettung einer Person', detail: 'Kombination aller Techniken · keine Wandhilfe erlaubt', tag: 'Rettung' }, fr: { title: '50m sauvetage d\'une personne', detail: 'Combinaison de toutes les techniques · sans aide des parois', tag: 'Sauvetage' }, lu: { title: '50m Rettung vun enger Persoun', detail: 'Kombinatioun vun alle Techniken · keng Wandhëllef', tag: 'Rettung' }, en: { title: '50m rescue of a person', detail: 'Combination of all techniques · no wall support permitted', tag: 'Rescue' } },
      { key: 'jl_rescue_4', de: { title: '100m in Kleidern (max 4 Min)', detail: 'Lange Kleidung (Baumwolle, kein Lycra) · im Wasser ausziehen & rauswerfen', tag: 'Ausdauer' }, fr: { title: '100m en vêtements (max 4 min)', detail: 'Vêtements longs (coton, pas lycra) · se déshabiller et jeter dans l\'eau', tag: 'Endurance' }, lu: { title: '100m a Kleeder (max 4 Min)', detail: 'Laang Kleeder (Baumwoll, kee Lycra) · am Waasser auszzéien & ewechwerfen', tag: 'Ausdauer' }, en: { title: '100m in clothes (max 4 min)', detail: 'Long clothes (cotton, no lycra) · undress and discard in water', tag: 'Endurance' } },
      { key: 'jl_rescue_5', de: { title: 'Kombinierte Übung (ohne Unterbrechung)', detail: '20m Annäherung (Water-Polo) → Sicherheitssprung → Rettung 2–3m → 20m Schleppen → An Land → Atemkontrolle → Stabile Seitenlage → HLW', tag: 'Komplex' }, fr: { title: 'Exercice combiné (sans interruption)', detail: '20m approche (water-polo) → saut sécurisé → sauvetage 2–3m → 20m remorquage → à terre → contrôle resp. → PLS → RCP', tag: 'Complexe' }, lu: { title: 'Kombinéiert Übung (ouni Ënnerbriechung)', detail: '20m Annäherung (Water-Polo) → Sécherheetssprong → Rettung 2–3m → 20m Schleppen → Op Land → Atemkontrolle → Saitlag → HLW', tag: 'Komplex' }, en: { title: 'Combined exercise (no break)', detail: '20m approach (water polo) → safety jump → rescue 2–3m → 20m tow → ashore → breathing check → recovery position → CPR', tag: 'Complex' } },
    ],
    theory: [
      { key: 'jl_theory_1', de: { title: 'Erste Hilfe Pflicht (CGDIS)', detail: 'Selbstschutz · Atemkontrolle · Stabile Seitenlage · Herzdruckmassage · Ertrinken/Erstickung', tag: 'Erste Hilfe' }, fr: { title: 'Premiers secours obligatoires (CGDIS)', detail: 'Auto-protection · contrôle resp. · PLS · massage cardiaque · noyade/asphyxie', tag: 'Premiers secours' }, lu: { title: 'Éischt Hëllef Pflicht (CGDIS)', detail: 'Selwerschutz · Atemkontrolle · Saitlag · Häerzmassage · Erdrénken/Erstickung', tag: 'Éischt Hëllef' }, en: { title: 'Mandatory first aid (CGDIS)', detail: 'Self-protection · breathing check · recovery position · chest compressions · drowning/suffocation', tag: 'First aid' } },
      { key: 'jl_theory_2', de: { title: 'Erste Hilfe Erweitert', detail: 'Epilepsie · Diabetes · Nasenbluten · Zahnverlust · Defibrillator · Rettungsgeräte', tag: 'Erste Hilfe' }, fr: { title: 'Premiers secours avancés', detail: 'Épilepsie · diabète · saignement de nez · perte de dent · défibrillateur · matériel de secours', tag: 'Premiers secours' }, lu: { title: 'Éischt Hëllef Erweidert', detail: 'Epilepsie · Diabetis · Nasenbluten · Zahnverlust · Defibrillator · Rettungsgerät', tag: 'Éischt Hëllef' }, en: { title: 'Advanced first aid', detail: 'Epilepsy · diabetes · nosebleed · tooth loss · defibrillator · rescue equipment', tag: 'First aid' } },
    ],
  },

  // ── Lifesaver (FLNS, Stand 15.03.2026) ────────────────────
  lifesaver: {
    admin: [
      { key: 'ls_admin_1', de: { title: 'Mindestalter 16 Jahre', detail: 'Ab 18 Jahren direkt ohne JLS-Voraussetzung möglich', tag: 'Admin' }, fr: { title: 'Âge minimum 16 ans', detail: 'Dès 18 ans, entrée directe sans JLS obligatoire', tag: 'Admin' }, lu: { title: 'Mindestalter 16 Joer', detail: 'Ab 18 Joer direkt ouni JLS-Viraussetzung méiglech', tag: 'Admin' }, en: { title: 'Minimum age 16 years', detail: 'From age 18, direct entry without JLS prerequisite', tag: 'Admin' } },
      { key: 'ls_admin_2', de: { title: 'Einverständniserklärung Eltern', detail: 'Falls minderjährig', tag: 'Admin' }, fr: { title: 'Accord parental', detail: 'Si mineur', tag: 'Admin' }, lu: { title: 'Elterlek Aversteesnes', detail: 'Falls mannerjährig', tag: 'Admin' }, en: { title: 'Parental consent', detail: 'If minor', tag: 'Admin' } },
      { key: 'ls_admin_3', de: { title: 'Ärztliches Attest oder Sportlizenz', detail: 'Freigabe für Rettungsschwimmen bestätigt', tag: 'Admin' }, fr: { title: 'Certificat médical ou licence sportive', detail: 'Autorisation pour la natation de sauvetage', tag: 'Admin' }, lu: { title: 'Ärztleche Schäin oder Sportlizenz', detail: 'Fräigab fir Rettungsschwammen bestätegt', tag: 'Admin' }, en: { title: 'Medical certificate or sports licence', detail: 'Clearance for lifesaving swimming confirmed', tag: 'Admin' } },
      { key: 'ls_admin_4', de: { title: 'B1 Formular gesendet', detail: 'Mindestens 1 Woche vor Kursbeginn', tag: 'Admin' }, fr: { title: 'Formulaire B1 envoyé', detail: 'Au moins 1 semaine avant le cours', tag: 'Admin' }, lu: { title: 'B1 Formulaire geschéckt', detail: 'Mindestens 1 Woch virun Kursbeginn', tag: 'Admin' }, en: { title: 'B1 form sent', detail: 'At least 1 week before course start', tag: 'Admin' } },
      { key: 'ls_admin_5', de: { title: 'B2 Formular gesendet', detail: 'Spätestens 1 Woche nach dem Examen', tag: 'Admin' }, fr: { title: 'Formulaire B2 envoyé', detail: 'Au plus tard 1 semaine après l\'examen', tag: 'Admin' }, lu: { title: 'B2 Formulaire geschéckt', detail: 'Spéitstens 1 Woch no dem Examen', tag: 'Admin' }, en: { title: 'B2 form sent', detail: 'No later than 1 week after the exam', tag: 'Admin' } },
      { key: 'ls_admin_6', de: { title: 'Zahlungsnachweis vorhanden', detail: 'Nach erfolgreichem Bestehen', tag: 'Admin' }, fr: { title: 'Preuve de paiement disponible', detail: 'Après réussite de l\'examen', tag: 'Admin' }, lu: { title: 'Zahlungsbeleg disponibel', detail: 'No erfolgräichem Bestoen', tag: 'Admin' }, en: { title: 'Proof of payment available', detail: 'After passing the exam', tag: 'Admin' } },
      { key: 'ls_admin_7', de: { title: 'Junior Lifesaver Brevet vorhanden', detail: 'Entfällt bei Direkteinstieg ab 18 Jahren', tag: 'Admin' }, fr: { title: 'Brevet Junior Lifesaver valide', detail: 'Non requis pour entrée directe dès 18 ans', tag: 'Admin' }, lu: { title: 'Junior Lifesaver Brevet disponibel', detail: 'Entfällt bei Direktaanstieg ab 18 Joer', tag: 'Admin' }, en: { title: 'Junior Lifesaver brevet valid', detail: 'Waived for direct entry from age 18', tag: 'Admin' } },
    ],
    swim: [
      { key: 'ls_swim_1', de: { title: '400m Schwimmen (max 15 Min, keine Pause)', detail: '100m Kraul + 150m Brust + 150m Rückenlage Beinschlag (keine Arme) · keine Brille/Maske', tag: 'Ausdauer' }, fr: { title: '400m natation (max 15 min, sans pause)', detail: '100m crawl + 150m brasse + 150m dos battement pieds (sans bras) · sans lunettes/masque', tag: 'Endurance' }, lu: { title: '400m schwammen (max 15 Min, keng Paus)', detail: '100m Kraul + 150m Brust + 150m Réckenlage Beinschlag (ouni Arme) · keng Brëll/Mask', tag: 'Ausdauer' }, en: { title: '400m swimming (max 15 min, no break)', detail: '100m crawl + 150m breast + 150m backstroke legs only (no arms) · no goggles/mask', tag: 'Endurance' } },
      { key: 'ls_swim_2', de: { title: 'Sprung aus 3m Höhe', detail: 'Fußsprung oder Kopfsprung · gesicherte Zone obligatorisch', tag: 'Technik' }, fr: { title: 'Saut depuis 3m', detail: 'Pieds joints ou tête première · zone sécurisée obligatoire', tag: 'Technique' }, lu: { title: 'Sprong vun 3m', detail: 'Fousssprong oder Kappsprong · séchert Zone obligatoresch', tag: 'Technik' }, en: { title: 'Jump from 3m', detail: 'Feet-first or head-first · secured zone mandatory', tag: 'Technique' } },
      { key: 'ls_swim_3', de: { title: '25m Streckentauchen', detail: 'Tiefe 80–100cm · OK-Signal nach Auftauchen', tag: 'Tauchen' }, fr: { title: '25m apnée', detail: 'Profondeur 80–100cm · signal OK après remontée', tag: 'Plongée' }, lu: { title: '25m Streckentauchen', detail: 'Tieft 80–100cm · OK-Signal no Opkommen', tag: 'Tauchen' }, en: { title: '25m apnoea', detail: 'Depth 80–100cm · OK signal after surfacing', tag: 'Diving' } },
      { key: 'ls_swim_4', de: { title: 'Tieftauchen 2× (vertikal + füßwärts)', detail: 'Objekt aus 2–3m bergen · max 3 Min', tag: 'Tauchen' }, fr: { title: 'Plongée profonde 2× (vertical + pieds)', detail: 'Remonter objet 2–3m · max 3 min', tag: 'Plongée' }, lu: { title: 'Déifstauchen 2× (vertikal + Féiss)', detail: 'Objekt aus 2–3m huelen · max 3 Min', tag: 'Tauchen' }, en: { title: 'Deep dive 2× (vertical + feet-first)', detail: 'Retrieve object 2–3m · max 3 min', tag: 'Diving' } },
    ],
    rescue: [
      { key: 'ls_rescue_1', de: { title: 'Befreiungsgriffe', detail: 'Würgegriff vorne & hinten + Umklammerung vorne & hinten', tag: 'Rettung' }, fr: { title: 'Dégagements', detail: 'Étranglement devant & derrière + étreinte devant & derrière', tag: 'Sauvetage' }, lu: { title: 'Befreiungsgriffer', detail: 'Würgegrëff virun & hannendrun + Ëmklammerung virun & hannendrun', tag: 'Rettung' }, en: { title: 'Release grips', detail: 'Choke hold front & back + bear hug front & back', tag: 'Rescue' } },
      { key: 'ls_rescue_2', de: { title: 'Schleppgriffe (3 Techniken)', detail: 'Kopfgriff (bewusstlose Person) + Achselgriff + Fesselgriff (aufgeregte Person)', tag: 'Rettung' }, fr: { title: 'Prises de remorquage (3 techniques)', detail: 'Tête (inconscient) + aisselle + entrave (personne agitée)', tag: 'Sauvetage' }, lu: { title: 'Schleppgriffer (3 Techniken)', detail: 'Kappgrëff (bewosslosst) + Achselgrëff + Fesselgrëff (opgerégt)', tag: 'Rettung' }, en: { title: 'Tow grips (3 techniques)', detail: 'Head grip (unconscious) + armpit grip + restraint grip (agitated)', tag: 'Rescue' } },
      { key: 'ls_rescue_3', de: { title: '50m Transportschwimmen Übungspuppe (max 1:30 Min)', detail: 'Kopf der Puppe über Wasser halten', tag: 'Rettung' }, fr: { title: '50m transport mannequin (max 1:30 min)', detail: 'Maintenir la tête du mannequin hors de l\'eau', tag: 'Sauvetage' }, lu: { title: '50m Transportschwammen Übungspupp (max 1:30 Min)', detail: 'Kapp vun der Pupp iwwer Waasser halen', tag: 'Rettung' }, en: { title: '50m transport swimming dummy (max 1:30 min)', detail: 'Keep dummy\'s head above water', tag: 'Rescue' } },
      { key: 'ls_rescue_4', de: { title: '300m in Kleidern (max 12 Min)', detail: 'Kleidung im Wasser ausziehen', tag: 'Ausdauer' }, fr: { title: '300m en vêtements (max 12 min)', detail: 'Se déshabiller dans l\'eau', tag: 'Endurance' }, lu: { title: '300m a Kleeder (max 12 Min)', detail: 'Kleeder am Waasser auszzéien', tag: 'Ausdauer' }, en: { title: '300m in clothes (max 12 min)', detail: 'Undress in water', tag: 'Endurance' } },
      { key: 'ls_rescue_5', de: { title: '50m Schleppen in Kleidern (max 4 Min)', detail: '', tag: 'Rettung' }, fr: { title: '50m remorquage habillé (max 4 min)', detail: '', tag: 'Sauvetage' }, lu: { title: '50m Schleppen a Kleeder (max 4 Min)', detail: '', tag: 'Rettung' }, en: { title: '50m tow in clothes (max 4 min)', detail: '', tag: 'Rescue' } },
      { key: 'ls_rescue_6', de: { title: 'Kombinierte Übung (ohne Pause)', detail: '20m Anschwimmen → Rettung 2–3m → 20m Schleppen → An Land → Atemkontrolle → Stabile Seitenlage → 3 Min HLW', tag: 'Komplex' }, fr: { title: 'Exercice combiné (sans pause)', detail: '20m nage → sauvetage 2–3m → 20m remorquage → à terre → contrôle resp. → PLS → 3 min RCP', tag: 'Complexe' }, lu: { title: 'Kombinéiert Übung (ouni Paus)', detail: '20m Anschwammen → Rettung 2–3m → 20m Schleppen → Op Land → Atemkontrolle → Saitlag → 3 Min HLW', tag: 'Komplex' }, en: { title: 'Combined exercise (no break)', detail: '20m swim → rescue 2–3m → 20m tow → ashore → breathing check → recovery position → 3 min CPR', tag: 'Complex' } },
    ],
    theory: [
      { key: 'ls_theory_1', de: { title: 'Erste Hilfe CGDIS', detail: 'Selbstschutz · Atmung · Herzdruckmassage · Ertrinken/Erstickung · Defibrillator · Rettungsmaterial', tag: 'Erste Hilfe' }, fr: { title: 'Premiers secours CGDIS', detail: 'Auto-protection · respiration · massage cardiaque · noyade/asphyxie · défibrillateur · matériel de secours', tag: 'Premiers secours' }, lu: { title: 'Éischt Hëllef CGDIS', detail: 'Selwerschutz · Atmung · Häerzmassage · Erdrénken/Erstickung · Defibrillator · Rettungsmaterial', tag: 'Éischt Hëllef' }, en: { title: 'First aid CGDIS', detail: 'Self-protection · breathing · chest compressions · drowning/suffocation · defibrillator · rescue equipment', tag: 'First aid' } },
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
