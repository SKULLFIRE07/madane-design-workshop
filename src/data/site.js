// ============================================================
//  Single source of truth · distilled from the 84-page
//  Madane Design Workshop commercial interiors profile.
// ============================================================

const slide = (n) => `/assets/slides/p-${String(n).padStart(2, '0')}.jpg`
const hero = (n) => `/assets/hero/p-${String(n).padStart(2, '0')}.jpg`

export const brand = {
  name: 'madane',
  full: 'Madane Design Workshop LLP',
  tagline: 'we design & build bharat',
  rally: 'THINK TO INNOVATE',
  disciplines: ['architecture', 'interiors', 'turnkey', 'conceptualisers'],
  motto: 'ध्यानं कृत्वा सृजनशीलतायै',
  mottoRoman: 'Dhyānaṁ Kṛtvā Sṛjanaśīlatāyai',
  founded: 2008,
  website: 'www.madane.in',
}

// tightened to a punchy, design-forward excerpt (was the full poem)
export const manifesto = `here's to the dreamers who shape the land & the sky. who break the rules and make new laws. who see beyond the common form. no matter the scale, the time, the fate · we craft with passion. we think to innovate.`

export const values = [
  { dev: 'ज्ञान', en: 'knowledge', note: 'incorporating continuous education' },
  { dev: 'धैर्य', en: 'patience', note: 'creating through patience' },
  { dev: 'प्रेम', en: 'love', note: 'we love what we do' },
  { dev: 'न्याय', en: 'justice', note: 'our work does justice' },
  { dev: 'समर्पण', en: 'dedication', note: 'our team is dedicated to the cause' },
]

export const stats = [
  { value: 23, suffix: '+', label: 'years of experience' },
  { value: 2, suffix: 'm+', label: 'sq.ft delivered', decimals: 0 },
  { value: 52, suffix: '+', label: 'creative team members' },
  { value: 50, suffix: '%', label: 'mnc fortune 500 clients' },
  { value: 65, suffix: '%', label: 'repeat clients' },
  { value: 54, suffix: '+', label: 'contracting teams' },
  { value: 5, suffix: '+', label: 'countries · world exp.' },
  { value: 20, suffix: '+', label: 'states · india exp.' },
  { value: 38, suffix: '+', label: 'cities · india exp.' },
  { value: 22, suffix: '+', label: 'business districts · mumbai' },
]

export const services = [
  { n: '01', name: 'interior design', desc: 'Detailed interior design, 3D visualisation, finishes & specification management and quantification for commercial workplaces.' },
  { n: '02', name: 'interior turnkey', desc: 'Integrated design-and-build delivery from concept to occupancy · single point of accountability across design, procurement and execution.' },
  { n: '03', name: 'architecture', desc: 'Technical architecture, planning, FSI & municipal liaisoning, feasibility layouts, MEP coordination and construction documentation.' },
  { n: '04', name: 'project management', desc: 'BOQ finalisation, scheduling, vendor & contractor coordination, quality milestone audits, handover and post-handover AMC.' },
  { n: '05', name: 'conceptualisers', desc: 'Concept-stage design thinking and workplace strategy · giving the world things they haven’t imagined before.' },
  { n: '06', name: 'sustainability', desc: 'USGBC, IGBC & GRIHA implementation with advanced engineering partners · delivered IGBC Platinum & Gold workplaces.' },
]

export const edge = [
  { step: 'locate', tag: 'site intelligence', desc: 'Identify optimal commercial real estate opportunities.', details: ['Location strategy', 'Building benchmarking', 'Lease vs purchase evaluation', 'Market scanning'] },
  { step: 'evaluate', tag: 'due diligence', desc: 'Analyse the project from financial, legal and technical perspectives.', details: ['Techno-commercial feasibility', 'Space efficiency analysis', 'Legal due diligence', 'Lease negotiation support'] },
  { step: 'create', tag: 'design', desc: 'Transform workplace vision into reality.', details: ['Workplace strategy', 'Interior design', 'Engineering coordination', 'Procurement', 'Construction execution', 'Furniture planning'] },
  { step: 'design + build', tag: 'turnkey', desc: 'Integrated delivery from concept to occupancy.', details: ['Detailed project scheduling', 'Site mobilization planning', 'Contractor coordination', 'Cost monitoring & reporting', 'Quality audits at milestones'] },
  { step: 'operate', tag: 'lifecycle', desc: 'Managing workplaces beyond completion.', details: ['Facility management', 'Maintenance management', 'Refurbishment planning', 'Vendor management', 'Housekeeping systems'] },
  { step: 'lease', tag: 'furniture & IT', desc: 'Asset-light office infrastructure models to lease.', details: ['Office furniture', 'Workstations', 'Conference furniture', 'IT infrastructure', 'Office equipment'] },
]

export const sectors = [
  'banking & finance', 'insurance', 'wealth management', 'IT & ITes', 'corporate offices',
  'coworking', 'industrial & logistics', 'media', 'laboratories', 'textiles & apparel',
  'quick-commerce', 'hospitality',
]

export const projects = [
  { id: 'icici', name: 'ICICI Bank', client: 'ICICI Bank Ltd.', sector: 'banking', location: 'Arihant Aura-16, Navi Mumbai', area: '1,03,000 sq.ft', rating: 'IGBC Platinum', year: '4 floors', cover: hero(17), slides: [17, 18, 19, 20, 21].map(slide), tone: '#c8531e' },
  { id: 'fedbank', name: 'Fedbank Financial', client: 'Fedbank Financial Services', sector: 'NBFC', location: 'Kanakia Wallstreet, Mumbai', area: '30,000 sq.ft', rating: '', year: 'HQ', cover: hero(22), slides: [22, 23, 24, 25].map(slide), tone: '#d6622a' },
  { id: 'shriram', name: 'Shriram Wealth', client: 'Shriram Wealth × Sanlam', sector: 'wealth', location: 'The Capital, BKC, Mumbai', area: '', rating: 'IGBC Gold', year: '', cover: hero(26), slides: [26, 27, 28].map(slide), tone: '#b08850' },
  { id: 'moneyboxx', name: 'Moneyboxx Finance', client: 'Moneyboxx Finance Ltd.', sector: 'NBFC', location: 'Kanakia Wall Street, Mumbai', area: '', rating: '', year: 'Head Office', cover: hero(30), slides: [29, 30, 31].map(slide), tone: '#c0392b' },
  { id: 'policybazaar', name: 'Policy Bazaar', client: 'policybazaar.com', sector: 'insurance', location: 'Infinity Tower, Malad-E, Mumbai', area: '50,000 sq.ft', rating: '', year: '', cover: hero(32), slides: [32, 33].map(slide), tone: '#2e6bd6' },
  { id: 'dcb', name: 'DCB Bank', client: 'DCB Bank', sector: 'banking', location: 'Hubtown Solaris, Andheri-E, Mumbai', area: '10,000 sq.ft', rating: '', year: '2025', cover: hero(34), slides: [34, 35].map(slide), tone: '#1f5fd0' },
  { id: 'seclore', name: 'Seclore', client: 'Seclore', sector: 'IT / software', location: 'R Square, Andheri-E, Mumbai', area: '20,000 sq.ft', rating: 'Design & Build', year: '2025', cover: hero(38), slides: [38, 39, 40, 41, 42].map(slide), tone: '#7b2fbe' },
  { id: 'planetcast', name: 'Planetcast Media', client: 'Planetcast Media', sector: 'media', location: 'Raheja Interface, Malad-E, Mumbai', area: '', rating: '', year: '2024', cover: hero(44), slides: [43, 44, 45, 46].map(slide), tone: '#c0392b' },
  { id: 'tata', name: 'Tata Digital', client: 'Tata Digital', sector: 'IT', location: 'One International Centre, Dadar', area: '', rating: 'Proposal', year: '', cover: hero(47), slides: [47, 48, 49].map(slide), tone: '#c8531e' },
  { id: 'rush', name: 'Rush Co-Works', client: 'Rush Co Works', sector: 'coworking', location: 'Plutonium, Turbhe, Navi Mumbai', area: '', rating: 'Working stage', year: '', cover: hero(52), slides: [50, 51, 52, 53].map(slide), tone: '#e0533a' },
  { id: 'sun', name: 'Sunpetro Chemicals', client: 'Sunpetro Chemicals Pvt. Ltd.', sector: 'industrial', location: 'ATL Corp. Park, Mumbai', area: '12,000 sq.ft', rating: 'India HO', year: '', cover: hero(56), slides: [55, 56].map(slide), tone: '#caa05a' },
  { id: 'odyssey', name: 'Odyssey Logistics', client: 'Odyssey Logistics', sector: 'logistics', location: 'Gundecha Onclave, Mumbai', area: '12,000 sq.ft', rating: '', year: '', cover: hero(59), slides: [57, 58, 59, 60, 61].map(slide), tone: '#1f8a8a' },
  { id: 'arcelor', name: 'ArcelorMittal', client: 'ArcelorMittal Construction', sector: 'construction', location: 'L&T Seawoods, Navi Mumbai', area: '9,000 sq.ft', rating: 'IGBC Platinum', year: '', cover: hero(62), slides: [62, 63].map(slide), tone: '#e08a1e' },
  { id: 'akasa', name: 'AKASA Business Center', client: 'Akasa Business Center', sector: 'coworking', location: 'Saltlake City, Kolkata', area: '15,000 sq.ft', rating: 'Design & Build', year: '', cover: hero(67), slides: [66, 67, 68, 69].map(slide), tone: '#2e6bd6' },
  { id: 'sgl', name: 'SGL Laboratory', client: 'Solitaire Geological Laboratory', sector: 'laboratory', location: 'Capital, BKC, Mumbai', area: '3,500 sq.ft', rating: '', year: '', cover: hero(70), slides: [70, 71, 72].map(slide), tone: '#6b7280' },
  { id: 'raymond', name: 'Raymond Ltd', client: 'Raymond Ltd', sector: 'textiles', location: 'Kolshet Road, Thane, Mumbai', area: '21,000 sq.ft', rating: '', year: '', cover: hero(73), slides: [73, 74, 75, 76].map(slide), tone: '#c0392b' },
  { id: 'semac', name: 'Semac Consultant', client: 'Semac Consultant Pvt. Ltd.', sector: 'consultancy', location: 'L&T Seawoods Grand Central', area: '', rating: 'West India HO', year: '', cover: hero(77), slides: [77, 78, 79, 80].map(slide), tone: '#1f6e4a' },
  { id: 'zepto', name: 'Zepto', client: 'Kirana Kart', sector: 'quick-commerce', location: '7 cities · Mumbai to Delhi', area: '55+ dark stores', rating: 'Complete', year: '', cover: hero(81), slides: [81].map(slide), tone: '#5b1eaf' },
]

export const growth = [
  { year: '16-17', clients: 20, cr: 1.5 },
  { year: '17-18', clients: 22, cr: 1.89 },
  { year: '18-19', clients: 25, cr: 2.2 },
  { year: '19-20', clients: 32, cr: 7.9 },
  { year: '20-21', clients: 16, cr: 4.1, covid: true },
  { year: '21-22', clients: 32, cr: 18.14 },
  { year: '22-23', clients: 45, cr: 27.63 },
  { year: '23-24', clients: 51, cr: 39.36 },
  { year: '24-25', clients: 58, cr: 51.14 },
]

export const why = [
  { key: 'FAST', title: 'fast, buildable design', desc: 'Design tuned for speed of execution · detailed, costed and ready to build without surprises.' },
  { key: 'BIM', title: 'clash-free execution', desc: 'BIM-integrated coordination across architecture, MEP and interiors for clash-free sites.' },
  { key: 'AI', title: 'advanced 3D & AI planning', desc: 'Advanced 3D and AI-enabled space planning and photoreal visualisation before a wall is built.' },
  { key: 'ERP', title: 'live project ERP', desc: 'Rdash, Zoho & Microsoft 365 keep budgets, schedules and quality transparent in real time.' },
  { key: 'AMC', title: 'beyond handover', desc: 'Project management with vendor coordination and post-handover AMC · we stay accountable.' },
]

export const team = [
  { name: 'Hrishikesh Madane', role: 'architecture & interiors', cred: 'M.Arch, IIT Chicago · ex-Adrian Smith + Gordon Gill', img: hero(70) },
  { name: 'Rasika Madane', role: 'design studio head', cred: 'President of India Gold Medalist · ex-Hafeez Contractor', img: hero(77) },
  { name: 'Akshay Madane', role: 'contracts & compliance', cred: 'Intl. Hospitality Mgmt · ex-Taj Lands End', img: hero(47) },
]

export const orgTeam = [
  { name: 'Priyanka M.', role: 'Director of Marketing' },
  { name: 'Madhuri S.', role: 'Accounts & Admin' },
  { name: 'Govinder S.', role: 'Interiors Projects Head' },
  { name: 'Priyanka G.', role: 'Architecture Head' },
  { name: 'Aasawari S.', role: 'Interior Associate' },
]

export const clients = [
  'ICICI Bank', 'DCB Bank', 'RBL Bank', 'IIFL', 'Fedbank', 'Shriram', 'Moneyboxx', 'Policy Bazaar',
  'Tata Digital', 'Mahindra', 'Birla', 'RICOH', 'Seclore', 'Accionlabs', 'Planetcast', 'ArcelorMittal',
  'Raymond', 'Semac', 'Zepto', 'Odyssey', 'Akasa', 'SGL', 'Sunpetro', 'PB Partners',
  'Finulent', 'Boomlet', 'Osource', 'Insecticides India', 'BNI', 'Aurum',
]

// pulled from the live site's "news & updates" · recent commissions
export const recent = [
  { client: 'PB Partners', note: 'multi-city rollout · jaipur · chandigarh · indore · raipur · kolkata' },
  { client: 'Finulent Solutions', note: 'corporate identity office, mumbai' },
  { client: 'Boomlet Media', note: 'india headquarters, mumbai' },
  { client: 'Osource Global', note: 'navi mumbai office · design & build' },
  { client: 'Insecticides India', note: 'penthouse corporate office, andheri' },
]

export const worldwide = ['india', 'south korea', 'uae', 'usa']

export const accreditations = ['COA', 'IGBC AP', 'USGBC', 'GRIHA', 'IIID']

export const contact = {
  line: 'tell us about the space you want to build.',
  email: 'info@madane.in',
  phone: '+91 70213 91759',
  address: '708, Signature Business Park, Postal Colony, Chembur East, Mumbai 400071',
  cities: 'studios in mumbai & pune',
  social: '@madanedesignworkshop',
  website: 'www.madane.in',
}

export const montage = [17, 38, 47, 70, 77, 59].map(hero)

export const nav = [
  { label: 'manifesto', id: 'manifesto' },
  { label: 'edge', id: 'edge' },
  { label: 'works', id: 'works' },
  { label: 'studio', id: 'studio' },
  { label: 'contact', id: 'contact' },
]
