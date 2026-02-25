import type { Launch } from '../types';

const STORAGE_KEY = 'creative-launch-tracker';
const DARK_MODE_KEY = 'creative-launch-tracker-dark';

export function loadLaunches(): Launch[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    console.error('Errore nel caricamento dei dati');
  }
  return getDefaultLaunches();
}

export function saveLaunches(launches: Launch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(launches));
  } catch {
    console.error('Errore nel salvataggio dei dati');
  }
}

export function loadDarkMode(): boolean {
  return localStorage.getItem(DARK_MODE_KEY) === 'true';
}

export function saveDarkMode(dark: boolean): void {
  localStorage.setItem(DARK_MODE_KEY, String(dark));
}

export function generateId(): string {
  return `launch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateSubTaskId(): string {
  return `subtask-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function exportToCSV(launches: Launch[]): void {
  const headers = ['Nome', 'Shop', 'Stato', 'Priorita\'', 'Data Inizio', 'Data Fine', 'Note'];
  const rows = launches.map(l => [
    l.name, l.shop, l.status, l.priority, l.startDate, l.endDate, l.notes,
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  downloadFile(csv, 'lanci-creativi.csv', 'text/csv');
}

export function exportToJSON(launches: Launch[]): void {
  const json = JSON.stringify(launches, null, 2);
  downloadFile(json, 'lanci-creativi.json', 'application/json');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getDefaultLaunches(): Launch[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      name: 'Campagna Primavera 2026',
      shop: 'shop-italia',
      status: 'in-corso',
      priority: 'alta',
      startDate: '2026-02-20',
      endDate: '2026-03-15',
      notes: 'Campagna stagionale con focus su nuova collezione primavera/estate. Coinvolge tutti i canali digitali.',
      attachments: ['brief-primavera.pdf', 'moodboard-v2.png', 'palette-colori.ai'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Briefing creativo con il team', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Moodboard e palette colori', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Bozza banner hero', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Adattamenti formati social', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Revisione finale con cliente', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Promo Soldes Hiver',
      shop: 'shop-francia',
      status: 'completato',
      priority: 'media',
      startDate: '2025-12-20',
      endDate: '2026-01-10',
      notes: 'Promozione saldi invernali per mercato francese. Creativita\' adattata al tone of voice locale.',
      attachments: ['banner-soldes.psd', 'report-performance.pdf'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Traduzione copy in francese', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Creazione banner promo', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Setup campagna ads', completed: true, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Lancio Prodotto Premium',
      shop: 'shop-germania',
      status: 'in-revisione',
      priority: 'alta',
      startDate: '2026-03-01',
      endDate: '2026-04-01',
      notes: 'Lancio nuova linea premium per il mercato tedesco. Richieste creative di alto livello con shooting fotografico.',
      attachments: ['concept-premium.pdf', 'assets-v1.zip', 'shooting-brief.docx'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Concept creativo', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Shooting prodotto', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Post-produzione foto', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Landing page design', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Approvazione cliente finale', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Summer Vibes Campaign',
      shop: 'shop-uk',
      status: 'da-fare',
      priority: 'bassa',
      startDate: '2026-05-15',
      endDate: '2026-06-01',
      notes: 'Campagna estiva per il mercato UK. Tono fresco e giovane, target Gen Z.',
      attachments: [],
      subtasks: [
        { id: generateSubTaskId(), name: 'Ricerca trend estivi', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Selezione influencer UK', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Rebranding Social Media',
      shop: 'shop-spagna',
      status: 'in-corso',
      priority: 'media',
      startDate: '2026-02-15',
      endDate: '2026-03-20',
      notes: 'Aggiornamento visual identity per tutti i canali social del mercato spagnolo. Nuovo logo e guidelines.',
      attachments: ['guidelines-social.pdf', 'logo-new-v3.svg'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Audit canali attuali', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Nuova palette e tipografia', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Template post Instagram', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Template stories', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Guida stile per il team', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Black Friday Anticipato',
      shop: 'shop-italia',
      status: 'in-pausa',
      priority: 'alta',
      startDate: '2026-11-01',
      endDate: '2026-11-20',
      notes: 'Preparazione anticipata materiali Black Friday. In attesa approvazione budget dal marketing.',
      attachments: ['bf-strategy.pdf', 'creative-deck.pptx', 'budget-proposal.xlsx'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Strategia sconti e offerte', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Bozza email marketing', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Creativita\' banner sito', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Piano ads Facebook/Google', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Newsletter Pasqua',
      shop: 'shop-francia',
      status: 'da-fare',
      priority: 'bassa',
      startDate: '2026-03-20',
      endDate: '2026-04-05',
      notes: 'Template newsletter per promozioni pasquali. Design minimal ed elegante, tema floreale.',
      attachments: [],
      subtasks: [
        { id: generateSubTaskId(), name: 'Selezione template base', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Copywriting promo', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Test A/B subject lines', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Video Lancio Collezione Autunno',
      shop: 'shop-italia',
      status: 'in-corso',
      priority: 'alta',
      startDate: '2026-02-10',
      endDate: '2026-03-05',
      notes: 'Video hero 30s + 6 cutdown per social. Produzione interna con agenzia esterna per post-produzione.',
      attachments: ['script-video-v2.pdf', 'storyboard.pdf', 'shot-list.xlsx'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Scrittura script', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Storyboard', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Giornata di shooting', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Montaggio bozza', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Color grading e sound design', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Cutdown per social', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Catalogo Digitale Estate',
      shop: 'shop-germania',
      status: 'da-fare',
      priority: 'media',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      notes: 'Catalogo digitale interattivo per la collezione estiva. Formato PDF sfogliabile + versione web.',
      attachments: ['catalogo-brief.pdf'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Raccolta prodotti e foto', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Layout impaginazione', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Copywriting descrizioni DE', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Versione interattiva web', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Restyling Homepage UK',
      shop: 'shop-uk',
      status: 'in-revisione',
      priority: 'media',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      notes: 'Redesign completo homepage per il mercato UK. A/B test con versione attuale previsto a fine mese.',
      attachments: ['wireframe-hp.fig', 'mockup-desktop.png', 'mockup-mobile.png'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Wireframe UX', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Mockup desktop', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Mockup mobile responsive', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Review con stakeholder UK', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Implementazione dev', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Campagna San Valentino',
      shop: 'shop-spagna',
      status: 'completato',
      priority: 'alta',
      startDate: '2026-01-20',
      endDate: '2026-02-14',
      notes: 'Campagna speciale San Valentino per il mercato spagnolo. Focus su gioielli e accessori regalo.',
      attachments: ['creativita-sv.psd', 'risultati-campagna.pdf'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Concept "Love Edition"', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Shooting prodotti regalo', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Email marketing sequence', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Social ads setup', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Report performance', completed: true, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Packaging Edizione Limitata',
      shop: 'shop-francia',
      status: 'in-corso',
      priority: 'alta',
      startDate: '2026-02-18',
      endDate: '2026-03-10',
      notes: 'Design packaging per edizione limitata primavera. Materiali eco-sostenibili, stampa a caldo oro.',
      attachments: ['packaging-concept.ai', 'materiali-eco.pdf', 'preventivo-stampa.pdf'],
      subtasks: [
        { id: generateSubTaskId(), name: 'Concept design packaging', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Selezione materiali eco', completed: true, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Prototipo 3D', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Test stampa campione', completed: false, dueDate: '', createdAt: now, fields: {} },
        { id: generateSubTaskId(), name: 'Ordine produzione finale', completed: false, dueDate: '', createdAt: now, fields: {} },
      ],
      customFields: {},
      createdAt: now,
      updatedAt: now,
    },
  ];
}
