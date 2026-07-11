import type { StruPPIParsed, Programmdaten } from '../types/struppi'

/**
 * Complete StruPPI XML Parser
 * Maps XML elements and attributes to TypeScript domain model with full XSD coverage.
 * No data loss - all fields, attributes, and nested structures are preserved.
 */

// ============================================================================
// Helper Functions for XML Attribute & Element Extraction
// ============================================================================

function getAttr(el: Element, name: string): string | undefined {
  const val = el.getAttribute(name)
  return val ? val : undefined
}

function getAttrBool(el: Element, name: string): boolean | undefined {
  const val = el.getAttribute(name)
  if (val === null) return undefined
  return val === 'true' || val === '1'
}

function getAttrNumber(el: Element, name: string): number | undefined {
  const val = el.getAttribute(name)
  if (!val) return undefined
  const n = parseFloat(val)
  return Number.isNaN(n) ? undefined : n
}

function getAllChildren(el: Element, tagName: string): Element[] {
  return Array.from(el.querySelectorAll(`:scope > ${tagName}`))
}

// ============================================================================
// Core Parser Function
// ============================================================================

export function parseStruPPIXml(xml: string): StruPPIParsed {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')

  // Check for parse errors
  if (doc.documentElement.tagName === 'parsererror') {
    throw new Error('XML parse error: malformed XML document')
  }

  const root = doc.querySelector('programmdaten')
  if (!root) {
    throw new Error('Missing <programmdaten> root element')
  }

  const programmdaten = parseProgrammdaten(root)

  return {
    xml,
    programmdaten,
  }
}

// ============================================================================
// Programmdaten (Root)
// ============================================================================

function parseProgrammdaten(el: Element): Programmdaten {
  const generierungsdatum = getAttr(el, 'generierungsdatum') || new Date().toISOString()

  const lieferantEl = el.querySelector(':scope > lieferant')
  const lieferant = lieferantEl ? parseService(lieferantEl) : undefined

  const senderEls = getAllChildren(el, 'sender')
  const sender = senderEls.map((s) => parseSender(s))

  return {
    generierungsdatum,
    lieferant,
    sender: sender.length > 0 ? sender : undefined,
  }
}

// ============================================================================
// Service / Lieferant
// ============================================================================

function parseService(el: Element): any {
  return {
    id: getAttr(el, 'id'),
    name: getAttr(el, 'name') || '',
    kuerzel: getAttr(el, 'kuerzel'),
    sprache: getAttr(el, 'sprache'),
    copyright: getAttr(el, 'copyright'),
    kostenpflicht: getAttrBool(el, 'kostenpflicht'),
    kosteninfos: getAttr(el, 'kosteninfos'),
    kontaktdaten: getAttr(el, 'kontaktdaten'),
    sonstige_infos: getAttr(el, 'sonstige_infos'),
    url: getAllChildren(el, 'url').map((u) => parseLink(u)) || undefined,
    logo: getAllChildren(el, 'logo').map((l) => parseLink(l)) || undefined,
    presselounge: getAllChildren(el, 'presselounge').map((p) => parseLink(p)) || undefined,
  }
}

// ============================================================================
// Link
// ============================================================================

function parseLink(el: Element): any {
  return {
    link: getAttr(el, 'link') || '',
    streamformat: getAttr(el, 'streamformat'),
    titel: getAttr(el, 'titel'),
    beschreibung: getAttr(el, 'beschreibung'),
    verfuegbarkeit: getAttr(el, 'verfuegbarkeit'),
  }
}

// ============================================================================
// Sender
// ============================================================================

function parseSender(el: Element): any {
  const ablaufEls = getAllChildren(el, 'ablauf')
  const ablauf = ablaufEls.map((a) => parseAblauf(a))

  return {
    sender_ID: getAttr(el, 'sender_ID'),
    NIT: getAttr(el, 'NIT'),
    LCN: getAttr(el, 'LCN'),
    sendername: getAttr(el, 'sendername') || 'unknown',
    senderkuerzel: getAttr(el, 'senderkuerzel'),
    senderkategorie: getAttr(el, 'senderkategorie'),
    vps: getAttrBool(el, 'vps') || false,
    sprache: getAttr(el, 'sprache'),
    empfang: getAttr(el, 'empfang'),
    kontaktdaten: getAttr(el, 'kontaktdaten'),
    sonstige_senderinfos: getAttr(el, 'sonstige_senderinfos'),
    showview: getAllChildren(el, 'showview').map((s) => parseShowview(s)) || undefined,
    url: getAllChildren(el, 'url').map((u) => parseLink(u)) || undefined,
    senderlogo: getAllChildren(el, 'senderlogo').map((l) => parseLink(l)) || undefined,
    gruppe: getAllChildren(el, 'gruppe').map((g) => g.textContent || '') || undefined,
    presselounge: getAllChildren(el, 'presselounge').map((p) => parseLink(p)) || undefined,
    ablauf,
  }
}

function parseShowview(el: Element): any {
  return {
    kanal: getAttrNumber(el, 'kanal') || 0,
    land: el.querySelector(':scope > land') ? parseLand(el.querySelector(':scope > land')!) : undefined,
  }
}

// ============================================================================
// Land
// ============================================================================

function parseLand(el: Element): any {
  return {
    laendername: getAttr(el, 'laendername') || '',
    laenderabkuerzung: getAttr(el, 'laenderabkuerzung'),
    laender_id: getAttr(el, 'laender_id'),
    laenderschema: getAttr(el, 'laenderschema'),
    laenderreihenfolge: getAttrNumber(el, 'laenderreihenfolge'),
  }
}

// ============================================================================
// Ablauf
// ============================================================================

function parseAblauf(el: Element): any {
  const sendungEls = getAllChildren(el, 'sendung')
  const sendung = sendungEls.map((s) => parseSendung(s))

  return {
    ablauftyp: getAttr(el, 'ablauftyp') || 'ablauf',
    ablaufstart: getAttr(el, 'ablaufstart') || '',
    ablaufende: getAttr(el, 'ablaufende') || '',
    plattform: getAllChildren(el, 'plattform').map((p) => parseService(p)) || undefined,
    stream: getAllChildren(el, 'stream').map((s) => parseLink(s)) || undefined,
    sendung,
  }
}

// ============================================================================
// Sendung (Main Content Element)
// ============================================================================

function parseSendung(el: Element): any {
  const terminEl = el.querySelector(':scope > termin')
  const titelEl = el.querySelector(':scope > titel')
  const infosEl = el.querySelector(':scope > infos')
  const mitwirkendeEl = el.querySelector(':scope > mitwirkende')

  return {
    sendung_id: getAttr(el, 'sendung_id') || '',
    externe_id: getAllChildren(el, 'externe_id').map((e) => parseExterneId(e)) || undefined,
    termin: terminEl ? parseTermin(terminEl) : { termintyp: '', termin_id: '', reihenfolge: 0, start: '', ende: '' },
    titel: titelEl ? parseTitel(titelEl) : { termintitel: '' },
    infos: infosEl ? parseInfos(infosEl) : { klassifizierung: { formatgruppe: '' } },
    auszeichnung: getAllChildren(el, 'auszeichnung').map((a) => parseAuszeichnung(a)) || undefined,
    mitwirkende: mitwirkendeEl ? parseMitwirkung(mitwirkendeEl) : undefined,
    text: getAllChildren(el, 'text').map((t) => parseText(t)) || undefined,
    medium: getAllChildren(el, 'medium').map((m) => parseMedium(m)) || undefined,
  }
}

function parseExterneId(el: Element): any {
  return {
    externe_id: getAttr(el, 'externe_id') || '',
    quelle: getAttr(el, 'quelle'),
  }
}

// ============================================================================
// Termin
// ============================================================================

function parseTermin(el: Element): any {
  return {
    termintyp: getAttr(el, 'termintyp') || '',
    termin_id: getAttr(el, 'termin_id') || '',
    reihenfolge: getAttrNumber(el, 'reihenfolge') || 0,
    start: getAttr(el, 'start') || '',
    exakt: getAttr(el, 'exakt'),
    exaktende: getAttr(el, 'exaktende'),
    circa: getAttrBool(el, 'circa'),
    ende: getAttr(el, 'ende') || '',
    programmtag: getAttr(el, 'programmtag'),
    nettolaenge: getAttrNumber(el, 'nettolaenge'),
    showview: getAttr(el, 'showview'),
    vorprogramm: getAttrBool(el, 'vorprogramm'),
    ersatzprogramm: getAttrBool(el, 'ersatzprogramm'),
    bestellnummer: getAttr(el, 'bestellnummer'),
    externe_id: getAllChildren(el, 'externe_id').map((e) => parseExterneId(e)) || undefined,
    vps: (() => {
      const v = el.querySelector(':scope > vps')
      return v ? { datum_zeit: getAttr(v, 'datum_zeit') || '', showview_vps: getAttr(v, 'showview_vps') } : undefined
    })(),
    terminrechte: getAllChildren(el, 'terminrechte').map((t) => parseTerminrechte(t)) || undefined,
    terminart: (() => {
      const ta = el.querySelector(':scope > terminart')
      return ta ? parseTerminart(ta) : undefined
    })(),
    wiederholung: getAllChildren(el, 'wiederholung').map((w) => parseWiederholung(w)) || undefined,
  }
}

function parseTerminrechte(el: Element): any {
  return {
    rechteart: getAttr(el, 'rechteart'),
    provider: getAttr(el, 'provider'),
    erlaubt: getAttrBool(el, 'erlaubt'),
    wert: getAttrNumber(el, 'wert'),
    einheit: getAttr(el, 'einheit'),
    wertElements: getAllChildren(el, 'wert').map((w) => w.textContent || '') || undefined,
    bedingung: getAllChildren(el, 'bedingung').map((b) => parseTerminrechteBedingung(b)) || undefined,
  }
}

function parseTerminrechteBedingung(el: Element): any {
  return {
    operator: getAttr(el, 'operator'),
    name: getAttr(el, 'name') || '',
    reihenfolge: getAttrNumber(el, 'reihenfolge') || 0,
    erlaubt: getAttrBool(el, 'erlaubt'),
    wert: getAttrNumber(el, 'wert'),
    einheit: getAttr(el, 'einheit'),
    wertElements: getAllChildren(el, 'wert').map((w) => w.textContent || '') || undefined,
  }
}

function parseTerminart(el: Element): any {
  const klammer = el.querySelector(':scope > klammer')
  const sonderzeit = el.querySelector(':scope > sonderzeit')
  const alternativ = el.querySelector(':scope > alternativ')

  return {
    klammer_id: getAttr(el, 'klammer_id'),
    regional: getAttr(el, 'regional'),
    klammer: klammer
      ? {
          inhalt: getAttrBool(klammer, 'inhalt') || false,
          anzahl: getAttrNumber(klammer, 'anzahl') || 0,
          unter_id: getAllChildren(klammer, 'unter_id').map((u) => u.textContent || ''),
        }
      : undefined,
    sonderzeit: sonderzeit
      ? {
          zeitbezug: getAttr(sonderzeit, 'zeitbezug') || '',
          bezugid: getAttr(sonderzeit, 'bezugid') || '',
        }
      : undefined,
    alternativ: alternativ
      ? {
          alternativ: getAttrBool(alternativ, 'alternativ') || false,
          alternativ_id: getAllChildren(alternativ, 'alternativ_id').map((a) => a.textContent || ''),
        }
      : undefined,
  }
}

function parseWiederholung(el: Element): any {
  return {
    datum: getAttr(el, 'datum'),
    zeit: getAttr(el, 'zeit'),
    sender: getAttr(el, 'sender'),
    bezugID: getAttr(el, 'bezugID'),
    erstausstrahlung: getAttrBool(el, 'erstausstrahlung'),
    infotext: getAttr(el, 'infotext'),
  }
}

// ============================================================================
// Titel
// ============================================================================

function parseTitel(el: Element): any {
  return {
    termintitel: getAttr(el, 'termintitel') || '',
    titelzusatz: getAttr(el, 'titelzusatz'),
    sprache: getAttr(el, 'sprache'),
    alias: getAllChildren(el, 'alias').map((a) => parseAlias(a)) || undefined,
    themen: getAllChildren(el, 'themen').map((t) => parseThemen(t)) || undefined,
    episoden: getAllChildren(el, 'episoden').map((e) => parseEpisode(e)) || undefined,
  }
}

function parseAlias(el: Element): any {
  return {
    aliastitel: getAttr(el, 'aliastitel') || '',
    titelzusatz: getAttr(el, 'titelzusatz'),
    titelart: getAttr(el, 'titelart') || '',
    sprache: getAttr(el, 'sprache'),
    titelreihenfolge: getAttrNumber(el, 'titelreihenfolge'),
  }
}

function parseThemen(el: Element): any {
  return {
    thementitel: getAttr(el, 'thementitel') || '',
    sprache_thementitel: getAttr(el, 'sprache_thementitel'),
    themenreihenfolge: getAttrNumber(el, 'themenreihenfolge') || 0,
    thementext: getAttr(el, 'thementext'),
    sprache_thementext: getAttr(el, 'sprache_thementext'),
  }
}

function parseEpisode(el: Element): any {
  return {
    episodentitel: getAttr(el, 'episodentitel') || '',
    sprache_episodentitel: getAttr(el, 'sprache_episodentitel'),
    episodenreihenfolge: getAttrNumber(el, 'episodenreihenfolge') || 0,
    episodenoriginaltitel: getAttr(el, 'episodenoriginaltitel'),
    sprache_episodenoriginaltitel: getAttr(el, 'sprache_episodenoriginaltitel'),
    episodentext: getAttr(el, 'episodentext'),
    sprache_episodentext: getAttr(el, 'sprache_episodentext'),
  }
}

// ============================================================================
// Infos
// ============================================================================

function parseInfos(el: Element): any {
  return {
    kinostart: getAttr(el, 'kinostart'),
    DVD_veroeffentlichung: getAttr(el, 'DVD_veroeffentlichung'),
    zusatzinfo: getAttr(el, 'zusatzinfo'),
    altersangaben: (() => {
      const aa = el.querySelector(':scope > altersangaben')
      return aa ? parseAltersangaben(aa) : undefined
    })(),
    produktion: getAllChildren(el, 'produktion').map((p) => parseProduktion(p)) || undefined,
    erstausstrahlung: getAllChildren(el, 'erstausstrahlung').map((e) => parseErstausstrahlung(e)) || undefined,
    klassifizierung: (() => {
      const k = el.querySelector(':scope > klassifizierung')
      return k ? parseKlassifizierung(k) : { formatgruppe: '' }
    })(),
    originallaenge: (() => {
      const ol = el.querySelector(':scope > originallaenge')
      return ol ? parseOriginallaenge(ol) : undefined
    })(),
    veranstaltung: (() => {
      const v = el.querySelector(':scope > veranstaltung')
      return v ? parseOrt(v) : undefined
    })(),
    sonderzeichen: (() => {
      const sz = el.querySelector(':scope > sonderzeichen')
      return sz ? parseSonderzeichen(sz) : undefined
    })(),
    sprache: getAllChildren(el, 'sprache').map((s) => s.textContent || '') || undefined,
    untertitelung: getAllChildren(el, 'untertitelung').map((u) => u.textContent || '') || undefined,
    teletext: getAllChildren(el, 'teletext').map((t) => parseTeletext(t)) || undefined,
    tipp: getAllChildren(el, 'tipp').map((t) => parseTipp(t)) || undefined,
    bewertung: getAllChildren(el, 'bewertung').map((b) => parseBewertung(b)) || undefined,
    folge: (() => {
      const f = el.querySelector(':scope > folge')
      return f ? parseFolgenangaben(f) : undefined
    })(),
    url: getAllChildren(el, 'url').map((u) => parseLink(u)) || undefined,
    download: getAllChildren(el, 'download').map((d) => parseLink(d)) || undefined,
    onlinearchiv: (() => {
      const oa = el.querySelector(':scope > onlinearchiv')
      return oa ? parseOnlinearchiv(oa) : undefined
    })(),
  }
}

function parseAltersangaben(el: Element): any {
  return {
    fsk: getAttr(el, 'fsk'),
    fsf: getAttr(el, 'fsf'),
    JK: getAttrBool(el, 'JK'),
    empfehlung: getAttr(el, 'empfehlung'),
  }
}

function parseProduktion(el: Element): any {
  return {
    gueltigkeit: getAttr(el, 'gueltigkeit') || 'sendung',
    europaeischeproduktion: getAttrBool(el, 'europaeischeproduktion'),
    produktionsland: getAllChildren(el, 'produktionsland').map((p) => parseLand(p)) || undefined,
    produktionszeitraum: (() => {
      const pz = el.querySelector(':scope > produktionszeitraum')
      return pz ? parseZeitraum(pz) : undefined
    })(),
    produktionsort: getAllChildren(el, 'produktionsort').map((p) => parseOrt(p)) || undefined,
  }
}

function parseErstausstrahlung(el: Element): any {
  return {
    gueltigkeit: getAttr(el, 'gueltigkeit') || 'sendung',
    erstausstrahlungzeitraum: (() => {
      const ez = el.querySelector(':scope > erstausstrahlungzeitraum')
      return ez ? parseZeitraum(ez) : undefined
    })(),
  }
}

function parseZeitraum(el: Element): any {
  const jahr = el.querySelector(':scope > jahr')
  const jahrspezial = el.querySelector(':scope > jahrspezial')

  if (jahr) {
    return {
      jahr: {
        von: getAttr(jahr, 'von') || '',
        bis: getAttr(jahr, 'bis'),
      },
    }
  }

  if (jahrspezial) {
    return {
      jahrspezial: jahrspezial.textContent || '',
    }
  }

  return undefined
}

function parseKlassifizierung(el: Element): any {
  return {
    formatgruppe: getAttr(el, 'formatgruppe') || '',
    kategorie: getAttr(el, 'kategorie'),
    hauptgenre: getAttr(el, 'hauptgenre'),
    genre: getAllChildren(el, 'genre').map((g) => g.textContent || '') || undefined,
    schlagwort: getAllChildren(el, 'schlagwort').map((s) => s.textContent || '') || undefined,
    dvbsigenre: (() => {
      const ds = el.querySelector(':scope > dvbsigenre')
      return ds ? { dvbsi_Content_nibble_level1: getAttr(ds, 'dvbsi_Content_nibble_level1'), dvbsi_Content_nibble_level2: getAttr(ds, 'dvbsi_Content_nibble_level2') } : undefined
    })(),
  }
}

function parseOriginallaenge(el: Element): any {
  return {
    kino: getAttrNumber(el, 'kino'),
    vhs: getAttrNumber(el, 'vhs'),
    dvd: getAttrNumber(el, 'dvd'),
    tv_premiere: getAttrNumber(el, 'tv-premiere'),
  }
}

function parseOrt(el: Element): any {
  return {
    ort: getAttr(el, 'ort'),
    stadt: getAttr(el, 'stadt'),
    info: getAttr(el, 'info'),
    land: getAllChildren(el, 'land').map((l) => parseLand(l)) || undefined,
  }
}

function parseSonderzeichen(el: Element): any {
  return {
    ton: getAllChildren(el, 'ton').map((t) => parseSdzTon(t)) || undefined,
    dolby: (() => {
      const d = el.querySelector(':scope > dolby')
      return d ? { vorhanden: getAttrBool(d, 'vorhanden') || false, version: getAttr(d, 'version') } : undefined
    })(),
    bild: getAllChildren(el, 'bild').map((b) => parseSdzBild(b)) || undefined,
    hd: (() => {
      const h = el.querySelector(':scope > hd')
      return h ? { vorhanden: getAttrBool(h, 'vorhanden') || false, aufloesung: getAttr(h, 'aufloesung') } : undefined
    })(),
    uhd: (() => {
      const u = el.querySelector(':scope > uhd')
      return u ? { vorhanden: getAttrBool(u, 'vorhanden') || false, aufloesung: getAttr(u, 'aufloesung') } : undefined
    })(),
    bildverhaeltnis: (() => {
      const bv = el.querySelector(':scope > bildverhaeltnis')
      return bv ? { vorhanden: getAttrBool(bv, 'vorhanden') || false, verhaeltnis: getAttr(bv, 'verhaeltnis') || '', anamorph: getAttrBool(bv, 'anamorph') } : undefined
    })(),
    premiere: (() => {
      const p = el.querySelector(':scope > premiere')
      return p ? { vorhanden: getAttrBool(p, 'vorhanden') || false, art: getAttr(p, 'art') || '' } : undefined
    })(),
    termin: getAllChildren(el, 'termin').map((t) => ({ vorhanden: getAttrBool(t, 'vorhanden') || false, art: getAttr(t, 'art') || '' })) || undefined,
    sonstige: getAllChildren(el, 'sonstige').map((s) => ({ vorhanden: getAttrBool(s, 'vorhanden') || false, art: getAttr(s, 'art') || '' })) || undefined,
  }
}

function parseSdzTon(el: Element): any {
  return {
    vorhanden: getAttrBool(el, 'vorhanden') || false,
    art: getAttr(el, 'art') || '',
  }
}

function parseSdzBild(el: Element): any {
  return {
    vorhanden: getAttrBool(el, 'vorhanden') || false,
    art: getAttr(el, 'art') || '',
  }
}

function parseTeletext(el: Element): any {
  return {
    tafel: getAttrNumber(el, 'tafel'),
    beschreibung: getAttr(el, 'beschreibung'),
  }
}

function parseTipp(el: Element): any {
  return {
    art: getAttr(el, 'art') || '',
    quelle: getAttr(el, 'quelle') || '',
    genre: getAttr(el, 'genre'),
    text: getAllChildren(el, 'text').map((t) => parseText(t)) || undefined,
  }
}

function parseBewertung(el: Element): any {
  return {
    kategorie: getAttr(el, 'kategorie') || '',
    hoehe: getAttr(el, 'hoehe') || '',
    quelle: getAttr(el, 'quelle') || '',
    highlight: getAttr(el, 'highlight'),
  }
}

function parseFolgenangaben(el: Element): any {
  return {
    folgennummer: getAttrNumber(el, 'folgennummer'),
    teil: getAttrNumber(el, 'teil'),
    folgenanzahl: getAttrNumber(el, 'folgenanzahl'),
    folgengesamtanzahl: getAttrNumber(el, 'folgengesamtanzahl'),
    staffelfolgennummer: getAttrNumber(el, 'staffelfolgennummer'),
    staffel: getAttrNumber(el, 'staffel'),
    staffelanzahl: getAttrNumber(el, 'staffelanzahl'),
    staffel_ID: getAttr(el, 'staffel_ID'),
    ausstrahlungsinfo: getAttr(el, 'ausstrahlungsinfo'),
    serien_ID: getAttr(el, 'serien_ID'),
    start: getAttrBool(el, 'start'),
    letzte_folge: getAttrBool(el, 'letzte_folge'),
  }
}

function parseOnlinearchiv(el: Element): any {
  return {
    verfuegbar: getAttrBool(el, 'verfuegbar') || false,
    verfuegbar_von: getAttr(el, 'verfuegbar_von'),
    verfuegbar_bis: getAttr(el, 'verfuegbar_bis'),
    info: getAttr(el, 'info'),
    url: getAllChildren(el, 'url').map((u) => parseLink(u)) || undefined,
  }
}

// ============================================================================
// Auszeichnung
// ============================================================================

function parseAuszeichnung(el: Element): any {
  return {
    jahr: getAttr(el, 'jahr'),
    veranstalter: getAttr(el, 'veranstalter'),
    bezeichnung: getAttr(el, 'bezeichnung'),
    kategorie: getAttr(el, 'kategorie'),
    nominiert: getAttrBool(el, 'nominierung'),
    hinweis: getAttr(el, 'hinweis'),
  }
}

// ============================================================================
// Mitwirkende
// ============================================================================

function parseMitwirkung(el: Element): any {
  return {
    mitwirkender: getAllChildren(el, 'mitwirkender').map((m) => parseMitwirkender(m)),
  }
}

function parseMitwirkender(el: Element): any {
  const typEl = el.querySelector(':scope > mitwirkendentyp')

  return {
    funktion: getAttr(el, 'funktion') || '',
    reihenfolge: getAttrNumber(el, 'reihenfolge') || 0,
    rolle: getAttr(el, 'rolle'),
    themenreihenfolge: getAttrNumber(el, 'themenreihenfolge'),
    episodenreihenfolge: getAttrNumber(el, 'episodenreihenfolge'),
    gueltigkeit: getAttr(el, 'gueltigkeit'),
    mitwirkendentyp: typEl ? parseMitwirkendertyp(typEl) : {},
    texte: getAllChildren(el, 'texte').map((t) => parseText(t)) || undefined,
    auszeichnung: getAllChildren(el, 'auszeichnung').map((a) => parseAuszeichnung(a)) || undefined,
    medium: getAllChildren(el, 'medium').map((m) => parseMedium(m)) || undefined,
    url: getAllChildren(el, 'url').map((u) => parseLink(u)) || undefined,
  }
}

function parseMitwirkendertyp(el: Element): any {
  const person = el.querySelector(':scope > person')
  const gruppe = el.querySelector(':scope > gruppe')

  return {
    person: person ? parsePerson(person) : undefined,
    gruppe: gruppe ? parseGruppe(gruppe) : undefined,
  }
}

function parsePerson(el: Element): any {
  const nameEl = el.querySelector(':scope > name')

  return {
    person_id: getAttr(el, 'person_id'),
    geschlecht: getAttr(el, 'geschlecht') || '',
    geburtsdatum: getAttr(el, 'geburtsdatum'),
    geburtsstadt: getAttr(el, 'geburtsstadt'),
    todesdatum: getAttr(el, 'todesdatum'),
    name: nameEl ? parsePersonenname(nameEl) : { name: '' },
    aliasname: getAllChildren(el, 'aliasname').map((a) => parsePersonenname(a)) || undefined,
    geburtsname: (() => {
      const gn = el.querySelector(':scope > geburtsname')
      return gn ? parsePersonenname(gn) : undefined
    })(),
    geburtsland: (() => {
      const gl = el.querySelector(':scope > geburtsland')
      return gl ? parseLand(gl) : undefined
    })(),
    gruppenmitglied: getAllChildren(el, 'gruppenmitglied').map((g) => parseGruppenmitglied(g)) || undefined,
  }
}

function parsePersonenname(el: Element): any {
  return {
    titel: getAttr(el, 'titel'),
    vorname: getAttr(el, 'vorname'),
    name: getAttr(el, 'name') || '',
    namensanhang: getAttr(el, 'namensanhang'),
  }
}

function parseGruppenmitglied(el: Element): any {
  return {
    name: getAttr(el, 'name') || '',
    von: getAttr(el, 'von'),
    bis: getAttr(el, 'bis'),
    gruppen_id: getAttr(el, 'gruppen_id'),
    funktion: getAttr(el, 'funktion'),
  }
}

function parseGruppe(el: Element): any {
  return {
    name: getAttr(el, 'name') || '',
    gruppen_id: getAttr(el, 'gruppen_id'),
    gruendung: getAttr(el, 'gruendung'),
    aufloesung: getAttr(el, 'aufloesung'),
    aliasname: getAllChildren(el, 'aliasname').map((a) => a.textContent || '') || undefined,
    mitglieder: getAllChildren(el, 'mitglieder').map((m) => parseMitglieder(m)) || undefined,
  }
}

function parseMitglieder(el: Element): any {
  const nameEl = el.querySelector(':scope > name')

  return {
    person_id: getAttr(el, 'person_id'),
    von: getAttr(el, 'von'),
    bis: getAttr(el, 'bis'),
    name: nameEl ? parsePersonenname(nameEl) : { name: '' },
  }
}

// ============================================================================
// Text
// ============================================================================

function parseText(el: Element): any {
  return {
    _text: el.textContent || undefined,
    textart: getAttr(el, 'textart') || '',
    quelle: getAttr(el, 'quelle'),
    laenge: getAttrNumber(el, 'laenge'),
    sprache: getAttr(el, 'sprache'),
    erstellung: getAttr(el, 'erstellung'),
    letzte_aenderung: getAttr(el, 'letzte_aenderung'),
  }
}

// ============================================================================
// Medium
// ============================================================================

function parseMedium(el: Element): any {
  const typEl = el.querySelector(':scope > mediumtyp')

  return {
    dateiname: getAttr(el, 'dateiname') || '',
    medium_id: getAttr(el, 'medium_id'),
    dateigroesse: getAttrNumber(el, 'dateigroesse'),
    reihenfolge: getAttrNumber(el, 'reihenfolge'),
    titel: getAttr(el, 'titel'),
    beschreibung: getAttr(el, 'beschreibung'),
    sprache: getAttr(el, 'sprache'),
    gueltigkeit: getAttr(el, 'gueltigkeit'),
    letzte_aenderung: getAttr(el, 'letzte_aenderung'),
    quelle: getAllChildren(el, 'quelle').map((q) => parseQuelle(q)),
    schlagwort: getAllChildren(el, 'schlagwort').map((s) => s.textContent || '') || undefined,
    freigabe: getAllChildren(el, 'freigabe').map((f) => parseFreigabe(f)) || undefined,
    url: getAllChildren(el, 'url').map((u) => parseLink(u)) || undefined,
    altersangabe: (() => {
      const aa = el.querySelector(':scope > altersangabe')
      return aa ? parseAltersangaben(aa) : undefined
    })(),
    untertitelung: getAllChildren(el, 'untertitelung').map((u) => u.textContent || '') || undefined,
    mediumtyp: typEl ? parseMediumtyp(typEl) : {},
  }
}

function parseQuelle(el: Element): any {
  return {
    quelle: getAttr(el, 'quelle') || '',
    copyright: getAttr(el, 'copyright'),
    quelltext: getAttr(el, 'quelltext'),
  }
}

function parseFreigabe(el: Element): any {
  return {
    freigabeart: getAttr(el, 'freigabeart'),
    nutzung_von: getAttr(el, 'nutzung_von'),
    nutzung_bis: getAttr(el, 'nutzung_bis'),
    veroeffentlichungshinweis: getAttr(el, 'veroeffentlichungshinweis'),
  }
}

function parseMediumtyp(el: Element): any {
  const textEl = el.querySelector(':scope > textmaterial')
  const bildEl = el.querySelector(':scope > bildmaterial')
  const filmEl = el.querySelector(':scope > filmmaterial')
  const tonEl = el.querySelector(':scope > tonmaterial')

  if (textEl) {
    return {
      textmaterial: {
        dateiformat: getAttr(textEl, 'dateiformat'),
        textmaterialtyp: getAttr(textEl, 'textmaterialtyp'),
      },
    }
  }

  if (bildEl) {
    return {
      bildmaterial: {
        dateiformat: getAttr(bildEl, 'dateiformat'),
        hoehe: getAttrNumber(bildEl, 'hoehe'),
        breite: getAttrNumber(bildEl, 'breite'),
        aufloesung: getAttrNumber(bildEl, 'aufloesung'),
        bildmaterialtyp: getAttr(bildEl, 'bildmaterialtyp'),
        bildunterschrift: getAttr(bildEl, 'bildunterschrift'),
        fotograf: getAttr(bildEl, 'fotograf'),
        person_id: getAllChildren(bildEl, 'person_id').map((p) => p.textContent || '') || undefined,
        gruppe_id: getAllChildren(bildEl, 'gruppe_id').map((g) => g.textContent || '') || undefined,
      },
    }
  }

  if (filmEl) {
    return {
      filmmaterial: {
        dateiformat: getAttr(filmEl, 'dateiformat'),
        filmmaterialtyp: getAttr(filmEl, 'filmmaterialtyp'),
        laenge: getAttrNumber(filmEl, 'laenge'),
        hoehe: getAttrNumber(filmEl, 'hoehe'),
        breite: getAttrNumber(filmEl, 'breite'),
        fps: getAttrNumber(filmEl, 'fps'),
        person_id: getAllChildren(filmEl, 'person_id').map((p) => p.textContent || '') || undefined,
        gruppe_id: getAllChildren(filmEl, 'gruppe_id').map((g) => g.textContent || '') || undefined,
        ton: getAllChildren(filmEl, 'ton').map((t) => parseSdzTon(t)) || undefined,
        dolby: (() => {
          const d = filmEl.querySelector(':scope > dolby')
          return d ? { vorhanden: getAttrBool(d, 'vorhanden') || false, version: getAttr(d, 'version') } : undefined
        })(),
        bild: getAllChildren(filmEl, 'bild').map((b) => parseSdzBild(b)) || undefined,
        hd: (() => {
          const h = filmEl.querySelector(':scope > hd')
          return h ? { vorhanden: getAttrBool(h, 'vorhanden') || false, aufloesung: getAttr(h, 'aufloesung') } : undefined
        })(),
        uhd: (() => {
          const u = filmEl.querySelector(':scope > uhd')
          return u ? { vorhanden: getAttrBool(u, 'vorhanden') || false, aufloesung: getAttr(u, 'aufloesung') } : undefined
        })(),
        bildverhaeltnis: (() => {
          const bv = filmEl.querySelector(':scope > bildverhaeltnis')
          return bv ? { vorhanden: getAttrBool(bv, 'vorhanden') || false, verhaeltnis: getAttr(bv, 'verhaeltnis') || '', anamorph: getAttrBool(bv, 'anamorph') } : undefined
        })(),
        sonstige: getAllChildren(filmEl, 'sonstige').map((s) => ({ vorhanden: getAttrBool(s, 'vorhanden') || false, art: getAttr(s, 'art') || '' })) || undefined,
      },
    }
  }

  if (tonEl) {
    return {
      tonmaterial: {
        dateiformat: getAttr(tonEl, 'dateiformat'),
        tonmaterialtyp: getAttr(tonEl, 'tonmaterialtyp'),
        ton: (() => {
          const t = tonEl.querySelector(':scope > ton')
          return t ? parseSdzTon(t) : { vorhanden: false, art: '' }
        })(),
      },
    }
  }

  return {}
}


