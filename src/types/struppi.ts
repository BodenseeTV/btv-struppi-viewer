// Auto-generated from public/StruPPI_1.0.13.xsd (manual mapping)
// Comprehensive TypeScript domain model for StruPPI
// Uses 'as const' + type unions instead of enums (compatible with erasableSyntaxOnly)

// Primitive aliases for XSD built-ins
export type XsdDateTime = string // xsd:dateTime
export type XsdDate = string // xsd:date
export type XsdTime = string // xsd:time
export type XsdGYear = string // xsd:gYear
export type XsdAnyUri = string

// Constants using as const for enums (erasableSyntaxOnly compatible)
const ABLAUFTYP_VALUES = {
    ablauf: 'ablauf',
    tvondemand: 'tvondemand',
    videoondemand: 'videoondemand',
} as const

export type Ablauftyp = (typeof ABLAUFTYP_VALUES)[keyof typeof ABLAUFTYP_VALUES]
export {ABLAUFTYP_VALUES}

export type Termintyp = 'neu'
    | 'loeschen'
    | 'wiederherstellen'
    | 'ergaenzen'
    | 'zeitaenderung'
    | 'zeitaenderung_ergaenzen'
    | 'wie geplant'

export type Senderkategorie =
    | 'Vollprogramm'
    | 'Filme'
    | 'Serie'
    | 'Dokumentation/Reportage'
    | 'News'
    | 'Sport'
    | 'Musik'
    | 'Sonstiges'


export type Formatgruppe =
    | 'Film'
    | 'Serie'
    | 'Buehne'
    | 'Dokumentation/Reportage'
    | 'Veranstaltung'
    | 'Show/Unterhaltung'
    | 'Magazin/Ratgeber'
    | 'Information'
    | 'Gespraech/Vortrag'
    | 'Werbung'
    | 'Sonstiges'


export type Laenderschema =
    | 'pid'
    | 'iso'
    | 'kfz'
    | 'andere'


export type Titelart =
    | 'titel'
    | 'untertitel'
    | 'originaltitel'
    | 'originaluntertitel'
    | 'reihentitel'
    | 'sendeplatztitel'
    | 'sonstiger_titel'
    | 'thementitel'


export type Textart =
    | 'Kurztext'
    | 'Vorspann'
    | 'Beschreibung'
    | 'Allgemein'
    | 'Hintergrund'
    | 'Auszeichnung'
    | 'Kritik'
    | 'Highlight'
    | 'Biographie'
    | 'Werk'


export type Geschlecht =
    | 'm'
    | 'w'
    | 'n'
    | 'unbekannt'


export type Altersfreigabe =
    | 'Ohne Altersbeschränkung'
    | 'ab 0'
    | 'ab 6'
    | 'ab 12'
    | 'ab 16'
    | 'ab 18'
    | 'Keine Jugendfreigabe'
    | 'Beantragt: Ohne Altersbeschränkung'
    | 'Beantragt: ab 0'
    | 'Beantragt: ab 6'
    | 'Beantragt: ab 12'
    | 'Beantragt: ab 16'
    | 'Beantragt: ab 18'
    | 'Unbekannt'
    | 'Nicht vergeben'


export type Gueltigkeit =
    | 'sendung'
    | 'staffel'
    | 'gesamt'

export type Textmaterialtyp =
    | 'Presseheft'
    | 'Sonstiges'


export type Bildmaterialtyp =
    | 'Logo'
    | 'Titelschriftzug'
    | 'Szenenbild'
    | 'Gruppenbild'
    | 'Standfoto'
    | 'Plakatmotiv'
    | 'Artwork'
    | 'Aushangfoto'
    | 'Making of'
    | 'Doppelportrait'
    | 'Portrait'
    | 'Animationsportrait'
    | 'MAZ-Bild'
    | 'DVD Cover'
    | 'Sonstiges'


export type Filmmaterialtyp =
    | 'Ausschnitte'
    | 'Trailer'
    | 'Teaser'
    | 'Feature'
    | 'Sonstiges'


export type Tonmaterialtyp =
    | 'O-Ton'
    | 'Interview'
    | 'Sonstiges'


export type Streamformat =
    | 'ogg'
    | 'avi'
    | 'mpg'
    | 'xvid'
    | 'flv'
    | 'rm'
    | 'wmv'
    | 'xap'
    | 'mov'


export type DateiformatText =
    | 'ods'
    | 'xml'
    | 'txt'
    | 'rtf'
    | 'pdf'
    | 'doc'


export type DateiformatBild =
    | 'jpg'
    | 'png'
    | 'gif'
    | 'tiff'
    | 'eps'


export type DateiformatBewegtbild =
    | 'ogg'
    | 'avi'
    | 'mpg'
    | 'xvid'
    | 'flv'
    | 'rm'
    | 'wmv'
    | 'xap'
    | 'mov'


export type DateiformatTon =
    | 'ogg'
    | 'mp3'
    | 'wav'
    | 'acc'
    | 'flac'


export type Zeitbezug =
    | 'dazwischen'
    | 'anschließend'


// Root
export interface Programmdaten {
    generierungsdatum: XsdDateTime;
    lieferant?: Service;
    erweiterungen?: Erweiterung[];
    sender?: Sender[];
}

export interface Erweiterung {
    // planned for VOD, DVDs, downloads - XSD does not specify elements
    // keep as flexible object to preserve unknown extension content
    [key: string]: any;
}

// Service / Lieferant
export interface Service {
    id?: string;
    name: string;
    kuerzel?: string;
    sprache?: string;
    copyright?: string;
    kostenpflicht?: boolean;
    kosteninfos?: string;
    kontaktdaten?: string;
    sonstige_infos?: string;
    url?: Link[];
    logo?: Link[];
    presselounge?: Link[];
}

// Sender
export interface Sender {
    sender_ID?: string;
    NIT?: string;
    LCN?: string;
    sendername: string;
    senderkuerzel?: string;
    senderkategorie?: Senderkategorie | string;
    vps: boolean;
    sprache?: string; // xsd:language
    empfang?: string;
    kontaktdaten?: string;
    sonstige_senderinfos?: string;
    showview?: Showview[];
    url?: Link[];
    senderlogo?: Link[];
    gruppe?: string[];
    presselounge?: Link[];
    ablauf: Ablauf[];
}

export interface Showview {
    kanal: number; // xsd:unsignedShort
    land?: Land;
}

export interface Ablauf {
    ablauftyp: Ablauftyp | string;
    ablaufstart: XsdDateTime;
    ablaufende: XsdDateTime;
    plattform?: Service[];
    stream?: Link[];
    sendung: Sendung[];
}

export interface Sendung {
    sendung_id: string;
    externe_id?: ExterneId[];
    termin: Termin;
    titel: Titel;
    infos: Infos;
    auszeichnung?: Auszeichnung[];
    mitwirkende?: Mitwirkung;
    text?: Text[];
    medium?: Medium[];
}

export interface ExterneId {
    externe_id: string;
    quelle?: string;
}

export interface Termin {
    termintyp: Termintyp | string;
    termin_id: string;
    reihenfolge: number; // unsignedShort
    start: XsdDateTime;
    exakt?: XsdDateTime;
    exaktende?: XsdDateTime;
    circa?: boolean;
    ende: XsdDateTime;
    programmtag?: XsdDate;
    nettolaenge?: number;
    showview?: string;
    vorprogramm?: boolean;
    ersatzprogramm?: boolean;
    bestellnummer?: string;
    externe_id?: ExterneId[];
    vps?: Vps;
    terminrechte?: Terminrechte[];
    terminart?: Terminart;
    wiederholung?: Wiederholung[];
}

export interface Vps {
    datum_zeit: XsdDateTime;
    showview_vps?: string;
}

export interface Terminrechte {
    rechteart?: string;
    provider?: string;
    erlaubt?: boolean;
    wert?: number;
    einheit?: string;
    wertElements?: string[]; // element <wert>
    bedingung?: TerminrechteBedingung[];
}

export interface TerminrechteBedingung {
    operator?: string;
    name: string;
    reihenfolge: number;
    erlaubt?: boolean;
    wert?: number;
    einheit?: string;
    wertElements?: string[];
}

export interface Terminart {
    klammer_id?: string;
    regional?: string;
    klammer?: Klammer;
    sonderzeit?: Sonderzeit;
    alternativ?: Alternativ;
}

export interface Klammer {
    inhalt: boolean;
    anzahl: number;
    unter_id: string[];
}

export interface Sonderzeit {
    zeitbezug: Zeitbezug | string;
    bezugid: string;
}

export interface Alternativ {
    alternativ: boolean;
    alternativ_id?: string[];
}

export interface Wiederholung {
    datum?: XsdDate;
    zeit?: XsdTime;
    sender?: string;
    bezugID?: string;
    erstausstrahlung?: boolean;
    infotext?: string;
}

export interface Titel {
    termintitel: string;
    titelzusatz?: string;
    sprache?: string;
    alias?: Alias[];
    themen?: Themen[];
    episoden?: Episode[];
}

export interface Alias {
    aliastitel: string;
    titelzusatz?: string;
    titelart: Titelart | string;
    sprache?: string;
    titelreihenfolge?: number;
}

export interface Themen {
    thementitel: string;
    sprache_thementitel?: string;
    themenreihenfolge: number;
    thementext?: string;
    sprache_thementext?: string;
}

export interface Episode {
    episodentitel: string;
    sprache_episodentitel?: string;
    episodenreihenfolge: number;
    episodenoriginaltitel?: string;
    sprache_episodenoriginaltitel?: string;
    episodentext?: string;
    sprache_episodentext?: string;
}

export interface Infos {
    kinostart?: XsdDate;
    DVD_veroeffentlichung?: XsdDate;
    zusatzinfo?: string;
    altersangaben?: Altersangaben;
    produktion?: Produktion[];
    erstausstrahlung?: Erstausstrahlung[];
    klassifizierung: Klassifizierung;
    originallaenge?: Originallaenge;
    veranstaltung?: Ort;
    sonderzeichen?: Sonderzeichen;
    sprache?: string[];
    untertitelung?: string[];
    teletext?: Teletext[];
    tipp?: Tipp[];
    bewertung?: Bewertung[];
    folge?: Folgenangaben;
    url?: Link[];
    download?: Link[];
    onlinearchiv?: Onlinearchiv;
}

export interface Produktion {
    gueltigkeit?: Gueltigkeit | string;
    europaeischeproduktion?: boolean;
    produktionsland?: Land[];
    produktionszeitraum?: Zeitraum;
    produktionsort?: Ort[];
}

export interface Erstausstrahlung {
    gueltigkeit?: Gueltigkeit | string;
    erstausstrahlungzeitraum?: Zeitraum;
}

export interface Zeitraum {
    jahr?: { von: XsdGYear; bis?: XsdGYear };
    jahrspezial?: string;
}

export interface Klassifizierung {
    formatgruppe: Formatgruppe | string;
    kategorie?: string;
    hauptgenre?: string;
    genre?: string[];
    schlagwort?: string[];
    dvbsigenre?: DvbsiGenre;
}

export interface DvbsiGenre {
    dvbsi_Content_nibble_level1?: string;
    dvbsi_Content_nibble_level2?: string;
}

export interface Originallaenge {
    kino?: number;
    vhs?: number;
    dvd?: number;
    tv_premiere?: number; // attribute name "tv-premiere"
}

export interface Sonderzeichen {
    ton?: SdzTon[];
    dolby?: SdzDolby;
    bild?: SdzBild[];
    hd?: SdzHd;
    uhd?: SdzUhd;
    bildverhaeltnis?: SdzBildverhaeltnis;
    premiere?: SdzPremiere;
    termin?: SdzTermin[];
    sonstige?: SdzSonstige[];
}

export interface SdzTon {
    vorhanden: boolean;
    art: string; // restricted enum in XSD, keep string to accept all values
}

export interface SdzDolby {
    vorhanden: boolean;
    version?: string;
}

export interface SdzBild {
    vorhanden: boolean;
    art: string;
}

export interface SdzHd {
    vorhanden: boolean;
    aufloesung?: string;
}

export interface SdzUhd {
    vorhanden: boolean;
    aufloesung?: string;
}

export interface SdzBildverhaeltnis {
    vorhanden: boolean;
    verhaeltnis: string;
    anamorph?: boolean;
}

export interface SdzPremiere {
    vorhanden: boolean;
    art: string;
}

export interface SdzTermin {
    vorhanden: boolean;
    art: string;
}

export interface SdzSonstige {
    vorhanden: boolean;
    art: string;
}

export interface Teletext {
    tafel?: number;
    beschreibung?: string;
}

export interface Tipp {
    art: string;
    quelle: string;
    genre?: string;
    text?: Text[];
}

export interface Bewertung {
    kategorie: string;
    hoehe: string; // pattern [0-9]{1}
    quelle: string;
    highlight?: string;
}

export interface Folgenangaben {
    folgennummer?: number;
    teil?: number;
    folgenanzahl?: number;
    folgengesamtanzahl?: number;
    staffelfolgennummer?: number;
    staffel?: number;
    staffelanzahl?: number;
    staffel_ID?: string;
    ausstrahlungsinfo?: string;
    serien_ID?: string;
    start?: boolean;
    letzte_folge?: boolean;
}

export interface Onlinearchiv {
    verfuegbar: boolean;
    verfuegbar_von?: XsdDateTime;
    verfuegbar_bis?: XsdDateTime;
    info?: string;
    url?: Link[];
}

export interface Auszeichnung {
    jahr?: XsdGYear;
    veranstalter?: string;
    bezeichnung?: string;
    kategorie?: string;
    nominiert?: boolean; // "nominierung"
    hinweis?: string;
}

export interface Mitwirkung {
    mitwirkender: Mitwirkender[];
}

export interface Mitwirkender {
    funktion: string; // mitwirkende_funktionSimpleType (huge list) - keep string
    reihenfolge: number;
    rolle?: string;
    themenreihenfolge?: number;
    episodenreihenfolge?: number;
    gueltigkeit?: Gueltigkeit | string;
    mitwirkendentyp: Mitwirkendertyp;
    texte?: Text[];
    auszeichnung?: Auszeichnung[];
    medium?: Medium[];
    url?: Link[];
}

export interface Mitwirkendertyp {
    person?: Person;
    gruppe?: Gruppe;
}

export interface Person {
    person_id?: string;
    geschlecht: Geschlecht | string;
    geburtsdatum?: string; // datum_oder_jahrSimpleType
    geburtsstadt?: string;
    todesdatum?: string; // datum_oder_jahrSimpleType
    name: Personenname;
    aliasname?: Personenname[];
    geburtsname?: Personenname;
    geburtsland?: Land;
    gruppenmitglied?: Gruppenmitglied[];
}

export interface Gruppe {
    name: string;
    gruppen_id?: string;
    gruendung?: string; // datum_oder_jahrSimpleType
    aufloesung?: string; // datum_oder_jahrSimpleType
    aliasname?: string[];
    mitglieder?: Mitglieder[];
}

export interface Gruppenmitglied {
    name: string;
    von?: string;
    bis?: string;
    gruppen_id?: string;
    funktion?: string;
}

export interface Mitglieder {
    person_id?: string;
    von?: string;
    bis?: string;
    name: Personenname;
}

export interface Medium {
    dateiname: string;
    medium_id?: string;
    dateigroesse?: number;
    reihenfolge?: number;
    titel?: string;
    beschreibung?: string;
    sprache?: string;
    gueltigkeit?: Gueltigkeit | string;
    letzte_aenderung?: string; // datum_oder_datumzeitSimpleType
    quelle: Quelle[];
    schlagwort?: string[];
    freigabe?: Mediumfreigabe[];
    url?: Link[];
    altersangabe?: Altersangaben;
    untertitelung?: string[];
    mediumtyp: Mediumtyp;
}

export interface Quelle {
    quelle: string;
    copyright?: string;
    quelltext?: string;
}

export interface Mediumfreigabe {
    freigabeart?: string;
    nutzung_von?: string;
    nutzung_bis?: string;
    veroeffentlichungshinweis?: string;
}

export type Mediumtyp =
    | { textmaterial: Textmaterial }
    | { bildmaterial: Bildmaterial }
    | { filmmaterial: Filmmaterial }
    | { tonmaterial: Tonmaterial };

export interface Textmaterial {
    dateiformat?: DateiformatText | string;
    textmaterialtyp?: Textmaterialtyp | string;
}

export interface Bildmaterial {
    dateiformat?: DateiformatBild | string;
    hoehe?: number;
    breite?: number;
    aufloesung?: number;
    bildmaterialtyp?: Bildmaterialtyp | string;
    bildunterschrift?: string;
    fotograf?: string;
    person_id?: string[];
    gruppe_id?: string[];
}

export interface Filmmaterial {
    dateiformat?: DateiformatBewegtbild | string;
    filmmaterialtyp?: Filmmaterialtyp | string;
    laenge?: number;
    hoehe?: number;
    breite?: number;
    fps?: number;
    person_id?: string[];
    gruppe_id?: string[];
    ton?: SdzTon[];
    dolby?: SdzDolby;
    bild?: SdzBild[];
    hd?: SdzHd;
    uhd?: SdzUhd;
    bildverhaeltnis?: SdzBildverhaeltnis;
    sonstige?: SdzSonstige[];
}

export interface Tonmaterial {
    dateiformat?: DateiformatTon | string;
    tonmaterialtyp?: Tonmaterialtyp | string;
    ton: SdzTon;
}

export interface Link {
    link: XsdAnyUri;
    streamformat?: Streamformat | string;
    titel?: string;
    beschreibung?: string;
    verfuegbarkeit?: string;
}

export interface Altersangaben {
    fsk?: Altersfreigabe | string;
    fsf?: Altersfreigabe | string;
    JK?: boolean;
    empfehlung?: string; // pattern [0-9]{1,2}
}

export interface Land {
    laendername: string;
    laenderabkuerzung?: string;
    laender_id?: string;
    laenderschema?: Laenderschema | string;
    laenderreihenfolge?: number;
}

export interface Ort {
    ort?: string;
    stadt?: string;
    info?: string;
    land?: Land[];
}

export interface Personenname {
    titel?: string;
    vorname?: string;
    name: string;
    namensanhang?: string;
}

export interface Text {
    _text?: string; // simpleContent
    textart: Textart | string;
    quelle?: string;
    laenge?: number;
    sprache?: string;
    erstellung?: XsdDateTime;
    letzte_aenderung?: XsdDateTime;
}

// Utility: full parsed representation (convenience)
export interface StruPPIParsed {
    xml?: string; // original xml
    programmdaten: Programmdaten;
    validation?: ValidationReport;
}

// Validation report model (client-side)
export interface ValidationIssue {
    severity: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
    column?: number;
    path?: string; // XPath-like
}

export interface ValidationReport {
    valid: boolean;
    issues: ValidationIssue[];
}

