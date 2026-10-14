/* ==========================================================
   GESTORIA TALLADA — interacciones
   Sello de registro de entrada, dispensador de turnos que
   imprime un ticket con los trámites de su caso, calendario
   fiscal de hojas con cuenta atrás al próximo vencimiento,
   archivador de servicios con cajones y fichero de fotos.
   Textos de servicios: gestoriatallada.com
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static\b/.test(location.search);
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGSAP && !reduced;
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const IMG = (f) => 'assets/img/' + f;
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/* ----------------------------------------------------------
   DATOS
   ---------------------------------------------------------- */
const CASES = [
  { k: 'Particular', i: 'ph-user', items: ['Declaración de la renta (IRPF) y del patrimonio', 'Impuesto sobre sucesiones y donaciones', 'Transmisiones patrimoniales', 'Estudio y seguimiento de pensiones: jubilación, invalidez, viudedad, orfandad', 'Certificados de nacimiento, matrimonio, defunción, últimas voluntades y antecedentes penales', 'Empadronamiento, título de familia numerosa y trámites en el catastro', 'Notas simples y certificados del Registro de la Propiedad'] },
  { k: 'Autónomo', i: 'ph-briefcase', items: ['Alta en el Régimen Especial de Autónomos', 'Declaraciones censales de inicio, variación o cese de actividad (IAE)', 'Pagos fraccionados de IRPF e IVA trimestral', 'Registro de facturas emitidas y recibidas', 'Legalización de su actividad y licencias', 'Contratos, nóminas y Seguridad Social si tiene empleados'] },
  { k: 'Empresa', i: 'ph-buildings', items: ['Constitución y legalización de sociedades', 'Contabilidad, libros contables, balances y cierres anuales', 'Impuesto sobre Sociedades y cuentas anuales', 'Contratos, nóminas, Seguridad Social y prevención de riesgos laborales', 'Ampliaciones de capital, estatutos, nombramientos y compraventa de participaciones', 'Representación ante la Inspección de Trabajo y en inspecciones fiscales'] },
  { k: 'Extranjería', i: 'ph-globe-hemisphere-west', items: ['Permisos de trabajo y residencia: régimen general, reagrupación familiar, estudiantes…', 'Número de identificación de extranjeros (NIE)', 'Permisos de residencia en régimen comunitario', 'Nacionalidad', 'Obligaciones fiscales de no residentes'] },
  { k: 'Vehículos', i: 'ph-car-profile', items: ['Matriculación y transferencias de vehículos', 'Renovación de permisos de conducir y permisos internacionales', 'Recursos y gestión de multas', 'Tarjetas de transporte: altas, visados y duplicados', 'Gestión de flota', 'Inscripción y cancelación de reservas de dominio'] },
  { k: 'Seguros', i: 'ph-umbrella', items: ['Hogar, comunidades y responsabilidad civil', 'Vehículos y embarcaciones', 'Asistencia sanitaria, accidentes y vida', 'Comercio y pymes', 'Decesos, defensa jurídica y ahorro', 'Asistencia en viajes, caza y pesca'] }
];
const SERVICES = [
  { k: 'Gestoría', n: 'Gestoría administrativa', s: 'Trámites ante la administración local, autonómica y central', d: [
    ['Actividades económicas', ['Legalización de actividades empresariales, profesionales y artísticas', 'Proyectos técnicos para legalizar actividades', 'Licencias medioambientales']],
    ['Inmuebles', ['Legalización de viviendas, locales y propiedad horizontal', 'Altas de urbana y cédulas de habitabilidad', 'Licencias de obras']],
    ['Vehículos y conductores', ['Matriculación y transferencias', 'Tarjetas de transporte: altas, cesiones, duplicados y visados', 'Recursos y gestión de multas · gestión de flota', 'Renovación de permisos y permisos internacionales', 'Reservas de dominio']],
    ['Licencias y certificados', ['Registro de patentes y marcas', 'Licencias de armas largas, caza y pesca', 'Certificados: antecedentes penales, nacimiento, matrimonio, defunción, últimas voluntades', 'Empadronamiento', 'Notas simples del Registro de la Propiedad y Mercantil']],
    ['Extranjería', ['Permisos de trabajo y residencia', 'NIE', 'Residencia en régimen comunitario', 'Nacionalidad']],
    ['Asociaciones y otros', ['Sociedades civiles y asociaciones sin ánimo de lucro: constitución, estatutos y disolución', 'Padrón municipal, familia numerosa y catastro']]
  ] },
  { k: 'Laboral', n: 'Asesoría laboral', s: 'Al día en normativa, convenios y Seguridad Social', d: [
    ['Día a día', ['Contratos, nóminas y Seguridad Social', 'Alta inicial de empresa en la Seguridad Social y mutua', 'Prevención de riesgos laborales', 'Régimen especial de autónomos y de empleados del hogar']],
    ['Pensiones y convenios', ['Jubilación, invalidez, viudedad, orfandad…', 'Convenios especiales de cotización']],
    ['Defensa', ['Representación ante la Inspección de Trabajo', 'Recursos y reclamaciones administrativas', 'Despidos', 'Demandas laborales ante el CMAC y el Juzgado Social']]
  ] },
  { k: 'Fiscal', n: 'Asesoría tributaria y fiscal', s: 'Planificación y gestión fiscal a medida', d: [
    ['Impuestos', ['Renta (IRPF) y patrimonio', 'IVA y pagos fraccionados', 'Impuesto de Sociedades', 'Operaciones con terceros', 'Actividades económicas (IAE) y declaraciones censales']],
    ['Patrimonio', ['Transmisiones patrimoniales y actos jurídicos documentados', 'Sucesiones y donaciones', 'Obligaciones fiscales de no residentes']],
    ['Inspecciones', ['Asistencia y representación en inspecciones fiscales', 'Recursos y reclamaciones en materia fiscal']]
  ] },
  { k: 'Mercantil', n: 'Asesoría mercantil', s: 'En todas las fases de la vida de su sociedad', d: [
    ['Sociedades', ['Constitución y legalización', 'Adaptación y transformación', 'Modificaciones estructurales, reestructuración, disolución y liquidación']],
    ['Capital y órganos', ['Ampliaciones y reducciones de capital', 'Estatutos y nombramiento de cargos', 'Libros de actas y de socios', 'Compraventa de participaciones y acciones']],
    ['Documentos', ['Cuentas anuales', 'Contratos mercantiles', 'Anuncios en el BOE, BORME y prensa']]
  ] },
  { k: 'Contable', n: 'Contabilidad de empresas', s: 'Un experto asignado que conoce su negocio', d: [
    ['Contabilidad', ['Asesoramiento contable integral', 'Planificación y puesta en marcha de contabilidades', 'Empresas, profesionales y otras entidades']],
    ['Registros y cierres', ['Registro de facturas emitidas y recibidas', 'Confección y legalización de libros', 'Balances de situación y cuentas de explotación', 'Cierres anuales']]
  ] },
  { k: 'Jurídica', n: 'Asesoría jurídica', s: 'Colaboradores especializados en cada ámbito', d: [
    ['Ámbitos', ['Mercantil', 'Laboral', 'Internacional', 'Tributario', 'Civil', 'Administrativo y urbanismo', 'Penal', 'Mediación']]
  ] }
];
const INSURANCE = [
  ['Accidentes y vida', 'ph-heartbeat'], ['Asistencia en viajes', 'ph-airplane-tilt'], ['Asistencia sanitaria', 'ph-first-aid-kit'], ['Caza y pesca', 'ph-fish-simple'],
  ['Comercio y pymes', 'ph-storefront'], ['Decesos', 'ph-flower-lotus'], ['Defensa jurídica', 'ph-scales'], ['Embarcaciones', 'ph-sailboat'],
  ['Hogar', 'ph-house-line'], ['Comunidades', 'ph-buildings'], ['Responsabilidad civil', 'ph-shield-check'], ['Vehículos', 'ph-car-profile'], ['Ahorro', 'ph-piggy-bank']
];
// vencimientos generales de la AEAT (ejercicio natural)
const DEADLINES = [
  { m: 0, d: 30, t: 'IVA e IRPF del 4.º trimestre y resumen anual de IVA', r: 'Del 1 al 30 de enero', mo: ['303', '130', '111', '115', '390'] },
  { m: 0, d: 31, t: 'Resúmenes anuales de retenciones', r: 'Hasta el 31 de enero', mo: ['190', '180'] },
  { m: 1, d: 0, t: 'Declaración anual de operaciones con terceros', r: 'Durante el mes de febrero', mo: ['347'] },
  { m: 3, d: 20, t: 'IVA e IRPF del 1.er trimestre y pago fraccionado de Sociedades', r: 'Del 1 al 20 de abril', mo: ['303', '130', '111', '115', '202'] },
  { m: 5, d: 30, t: 'Campaña de la Renta y del Patrimonio', r: 'De abril al 30 de junio', mo: ['100', '714'] },
  { m: 6, d: 20, t: 'IVA e IRPF del 2.º trimestre', r: 'Del 1 al 20 de julio', mo: ['303', '130', '111', '115'] },
  { m: 6, d: 25, t: 'Impuesto sobre Sociedades', r: 'Del 1 al 25 de julio', mo: ['200'] },
  { m: 9, d: 20, t: 'IVA e IRPF del 3.er trimestre y pago fraccionado de Sociedades', r: 'Del 1 al 20 de octubre', mo: ['303', '130', '111', '115', '202'] },
  { m: 11, d: 20, t: 'Pago fraccionado del Impuesto sobre Sociedades', r: 'Del 1 al 20 de diciembre', mo: ['202'] }
];
const PHOTOS = [
  ['escaparate.jpg', 'El escaparate', 'gestoriatallada.com'],
  ['equipo-revision.jpg', 'Revisando un expediente', 'gestoriatallada.com'],
  ['fachada.jpg', 'La fachada', 'Google'],
  ['equipo-reunion.jpg', 'Reunión con clientes', 'gestoriatallada.com'],
  ['equipo-consulta.jpg', 'Consulta en el despacho', 'gestoriatallada.com'],
  ['fachada-plaza.jpg', 'En la Plaça Espanya', 'Google'],
  ['firma.jpg', 'La firma', 'gestoriatallada.com'],
  ['calculadora.jpg', 'Cuentas claras', 'gestoriatallada.com']
];

/* ----------------------------------------------------------
   HORA DE LLORET · ¿abierto?
   ---------------------------------------------------------- */
const madrid = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { y: +p.year, mo: +p.month - 1, d: +p.day, wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: +p.hour * 60 + +p.minute };
};
const OPEN = { 0: null, 1: [510, 990], 2: [510, 990], 3: [510, 990], 4: [510, 990], 5: [510, 900], 6: null };
const hhmm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const paintLive = () => {
  const n = madrid(), slot = OPEN[n.wd];
  let open = false, txt;
  if (slot && n.m >= slot[0] && n.m < slot[1]) { open = true; txt = `Abierto · hasta las ${hhmm(slot[1])}`; }
  else if (slot && n.m < slot[0]) txt = `Cerrado · abrimos a las ${hhmm(slot[0])}`;
  else { let k = 1; while (!OPEN[(n.wd + k) % 7]) k++; txt = `Cerrado · abrimos ${k === 1 ? 'mañana' : 'el ' + WDAYS[(n.wd + k) % 7]} a las 8:30`; }
  $$('[data-live]').forEach((el) => { el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); $('[data-live-text]', el).textContent = txt; });
  $$('#hours tr').forEach((tr) => tr.classList.toggle('is-today', +tr.dataset.day === n.wd));
};
paintLive(); setInterval(paintLive, 30000);
const NOW = madrid();
$('#yearNow').textContent = NOW.y; $('#ledgerNow').textContent = NOW.y;
$('#sealYears').textContent = NOW.y - 1960;

/* ----------------------------------------------------------
   SCROLL + NAV
   ---------------------------------------------------------- */
let lenis = null;
if (motion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const lock = (on) => { document.body.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };
const burger = $('#burger'), links = $('#navLinks');
burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); links.classList.toggle('is-open', o); });
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  e.preventDefault(); burger.setAttribute('aria-expanded', 'false'); links.classList.remove('is-open');
  const t = id === '#top' ? 0 : $(id); if (t === null) return;
  if (lenis) lenis.scrollTo(t, { offset: -80, duration: 1.3 }); else (t === 0 ? scrollTo({ top: 0 }) : t.scrollIntoView());
}));
if (hasGSAP) $$('.nav__links a').forEach((a) => {
  const s = $(a.getAttribute('href'));
  if (s) ScrollTrigger.create({ trigger: s, start: 'top 45%', end: 'bottom 45%', onToggle: (st) => a.classList.toggle('is-here', st.isActive) });
});

/* ----------------------------------------------------------
   INTRO · el sello de registro de entrada
   ---------------------------------------------------------- */
const intro = $('#intro');
$('#stampDate').textContent = `${String(NOW.d).padStart(2, '0')} ${MONTHS[NOW.mo].slice(0, 3).toUpperCase()} ${NOW.y}`;
const heroIn = () => {
  if (!motion) return;
  gsap.from('.hero__title .line > span', { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: .12 });
  gsap.from('.hero .eyebrow, .hero__lead, .hero__cta .btn, .hero__facts div', { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .06, delay: .2 });
  gsap.from('.folder', { y: 80, rotate: 6, opacity: 0, duration: 1.3, ease: 'expo.out', delay: .15 });
  gsap.from('.seal', { scale: 2.2, opacity: 0, rotate: 20, duration: .45, ease: 'power4.in', delay: 1.1 });
  const o = { v: 0 }; gsap.to(o, { v: NOW.y - 1960, duration: 1.6, delay: 1.1, ease: 'power2.out', onUpdate: () => { $('#sealYears').textContent = Math.round(o.v); } });
};
if (motion) {
  lock(true);
  gsap.timeline({ onComplete: () => intro.remove() })
    .from('.intro__k', { opacity: 0, y: 10, duration: .5 })
    .fromTo('#stamp', { scale: 2.6, opacity: 0, rotate: -16 }, { scale: 1, opacity: 1, rotate: -6, duration: .38, ease: 'power4.in' }, .25)
    .to('.intro__sheet', { x: 3, duration: .05, yoyo: true, repeat: 3 })
    .to('.intro__sheet', { yPercent: -102, duration: .9, ease: 'expo.inOut', delay: .55 })
    .add(() => { lock(false); heroIn(); }, '-=.55');
  setTimeout(() => { if (document.body.contains(intro)) { intro.remove(); lock(false); } }, 5000);
} else { intro.remove(); }

/* ----------------------------------------------------------
   LA VENTANILLA · dispensador de turnos
   ---------------------------------------------------------- */
const keysEl = $('#keys'), turnEl = $('#turnNum'), tickets = $('#tickets'), aside = $('.vt__aside');
const doy = Math.floor((Date.UTC(NOW.y, NOW.mo, NOW.d) - Date.UTC(NOW.y, 0, 0)) / 864e5);
let turn = 10 + (doy * 7) % 80;
turnEl.textContent = 'A-' + String(turn).padStart(3, '0');
CASES.forEach((c, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'key'; b.innerHTML = `<i class="ph ${c.i}"></i><span>${c.k}</span>`;
  b.addEventListener('click', () => printTicket(i, b));
  keysEl.appendChild(b);
});
const printTicket = (i, btn) => {
  const c = CASES[i];
  turn++; const no = 'A-' + String(turn).padStart(3, '0');
  turnEl.textContent = no;
  btn.classList.add('is-press'); setTimeout(() => btn.classList.remove('is-press'), 160);
  const n = madrid(), when = `${String(n.d).padStart(2, '0')}/${String(n.mo + 1).padStart(2, '0')}/${n.y} · ${hhmm(n.m)}`;
  // el resguardo sale por la ranura
  const mini = document.createElement('div'); mini.className = 'mini'; mini.textContent = no + ' · ' + c.k;
  tickets.innerHTML = ''; tickets.appendChild(mini);
  if (motion) gsap.fromTo(mini, { clipPath: 'inset(0 0 100% 0)', y: -20 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: .7, ease: 'steps(8)' });
  const subject = encodeURIComponent(`Consulta (${c.k}) · turno ${no}`);
  const body = encodeURIComponent(`Hola, me gustaría información sobre:\n\n${c.items.map((x) => '· ' + x).join('\n')}\n\nGracias.`);
  aside.innerHTML = `<article class="ticket">
    <div class="ticket__head"><b>${no}</b><span>Gestoria Tallada<br>${when}</span></div>
    <p class="ticket__case">${c.k}: lo que le llevamos</p>
    <ul class="ticket__list">${c.items.map((x) => `<li>${x}</li>`).join('')}</ul>
    <p class="ticket__foot">Le atendemos en Plaça Espanya, 2 · lunes a jueves de 8:30 a 16:30 · viernes de 8:30 a 15:00</p>
    <div class="ticket__cta"><a class="btn btn--wine btn--sm" href="tel:+34972364564"><i class="ph ph-phone"></i><span>972 36 45 64</span></a><a class="btn btn--line btn--sm" href="mailto:gestallada@gestoriatallada.com?subject=${subject}&body=${body}"><i class="ph ph-envelope-simple"></i><span>Consultar por email</span></a></div>
    <div class="ticket__bar" aria-hidden="true"></div>
  </article>`;
  const t = $('.ticket', aside);
  if (motion) gsap.fromTo(t, { y: -60, rotate: -5, opacity: 0 }, { y: 0, rotate: (Math.random() - .5) * 2.4, opacity: 1, duration: .8, ease: 'back.out(1.4)', delay: .25 });
  else t.style.transform = `rotate(${(Math.random() - .5) * 2}deg)`;
};

// un primer ticket de ejemplo cuando la máquina aparece
const demo = () => {
  const r = $('.machine').getBoundingClientRect();
  if (r.top < innerHeight * .7 && r.bottom > 0) { removeEventListener('scroll', demo); if (!$('.ticket', aside)) printTicket(0, $('.key', keysEl)); }
};
addEventListener('scroll', demo, { passive: true }); demo();

/* ----------------------------------------------------------
   CALENDARIO FISCAL · hojas que se pasan
   ---------------------------------------------------------- */
const lastDay = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const occ = [];
[NOW.y, NOW.y + 1].forEach((y) => DEADLINES.forEach((dl) => occ.push({ ...dl, y, day: dl.d || lastDay(y, dl.m) })));
occ.forEach((o) => { o.t0 = Date.UTC(o.y, o.m, o.day); });
const today0 = Date.UTC(NOW.y, NOW.mo, NOW.d);
let calI = occ.findIndex((o) => o.t0 >= today0); if (calI < 0) calI = 0;
const firstUpcoming = calI;
const page = $('#tearPage');
const paintCal = () => {
  const o = occ[calI], days = Math.round((o.t0 - today0) / 864e5);
  $('#tMonth').textContent = `${MONTHS[o.m]} ${o.y}`;
  $('#tDay').textContent = o.day;
  $('#tWd').textContent = WDAYS[new Date(o.t0).getUTCDay()];
  $('#tLeft').textContent = days <= 0 ? 'Hoy' : days;
  $('#tLeftLbl').textContent = days <= 0 ? 'vence el plazo' : (days === 1 ? 'día para el plazo' : 'días para el plazo');
  $('#tTitle').textContent = o.t; $('#tRange').textContent = o.r + (calI === firstUpcoming ? ' · el próximo' : '');
  $('#tModels').innerHTML = o.mo.map((x) => `<li>Modelo ${x}</li>`).join('');
  $$('#months button').forEach((b, k) => b.classList.toggle('is-on', k === o.m));
  $('#tPrev').disabled = calI <= firstUpcoming;
};
const flipTo = (k) => {
  k = clamp(k, firstUpcoming, occ.length - 1); if (k === calI) return;
  const fwd = k > calI;
  if (!motion) { calI = k; paintCal(); return; }
  gsap.timeline()
    .to(page, { rotateX: fwd ? 95 : -95, opacity: .2, duration: .32, ease: 'power2.in', transformOrigin: 'top center' })
    .add(() => { calI = k; paintCal(); })
    .fromTo(page, { rotateX: fwd ? -40 : 40, opacity: .4 }, { rotateX: 0, opacity: 1, duration: .45, ease: 'power3.out' });
};
$('#tNext').addEventListener('click', () => flipTo(calI + 1));
$('#tPrev').addEventListener('click', () => flipTo(calI - 1));
const monthsEl = $('#months');
MONTHS.forEach((m, k) => {
  const has = DEADLINES.some((d) => d.m === k);
  const li = document.createElement('li');
  li.innerHTML = `<button type="button" class="${has ? 'has' : ''}${k === NOW.mo ? ' is-now' : ''}" ${has ? '' : 'disabled'} aria-label="${m}">${m.slice(0, 3)}</button>`;
  if (has) $('button', li).addEventListener('click', () => { const t = occ.findIndex((o, i) => i >= firstUpcoming && o.m === k); if (t >= 0) flipTo(t); });
  monthsEl.appendChild(li);
});
paintCal();
if (motion) ScrollTrigger.create({ trigger: '.cal', start: 'top 70%', once: true, onEnter: () => { const o = { v: 0 }, target = Math.round((occ[calI].t0 - today0) / 864e5); if (target > 0) gsap.to(o, { v: target, duration: 1.4, ease: 'power2.out', onUpdate: () => { $('#tLeft').textContent = Math.round(o.v); } }); } });

/* ----------------------------------------------------------
   EL ARCHIVADOR
   ---------------------------------------------------------- */
const cab = $('#cabinet');
SERVICES.forEach((s, i) => {
  const dr = document.createElement('div'); dr.className = 'drawer';
  dr.innerHTML = `<button class="drawer__front" type="button" aria-expanded="false" aria-controls="dr${i}"><span class="drawer__label">${String(i + 1).padStart(2, '0')} · ${s.k}</span><span class="drawer__name">${s.n}<small>${s.s}</small></span><span class="drawer__handle" aria-hidden="true"></span></button>
    <div class="drawer__body" id="dr${i}"><div class="drawer__inner">${s.d.map(([h, li]) => `<div class="dossier" data-tab="${s.k}"><h4>${h}</h4><ul>${li.map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div></div>`;
  cab.appendChild(dr);
});
const setDrawer = (dr, open) => {
  const body = $('.drawer__body', dr), btn = $('.drawer__front', dr);
  dr.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open);
  if (motion) gsap.to(body, { height: open ? 'auto' : 0, duration: open ? .7 : .45, ease: open ? 'expo.out' : 'power3.inOut', onComplete: () => ScrollTrigger.refresh() });
  else { body.style.height = open ? 'auto' : '0'; if (hasGSAP) ScrollTrigger.refresh(); }
  if (open && motion) gsap.from($$('.dossier', dr), { y: 30, opacity: 0, duration: .6, stagger: .06, ease: 'power3.out', delay: .1 });
};
$$('.drawer', cab).forEach((dr) => $('.drawer__front', dr).addEventListener('click', () => {
  const open = !dr.classList.contains('is-open');
  $$('.drawer.is-open', cab).forEach((o) => { if (o !== dr) setDrawer(o, false); });
  setDrawer(dr, open);
}));
setDrawer($('.drawer', cab), true);

/* ----------------------------------------------------------
   SEGUROS
   ---------------------------------------------------------- */
$('#ins').innerHTML = INSURANCE.map(([n, ic]) => `<li><i class="ph ${ic}"></i><span>${n}</span></li>`).join('');

/* ----------------------------------------------------------
   LA OFICINA · fichero de fotos
   ---------------------------------------------------------- */
const flip = $('#flip'), flCount = $('#flCount');
const cards = PHOTOS.map(([f, t, s], i) => {
  const c = document.createElement('figure'); c.className = 'fcard';
  c.innerHTML = `<img src="${IMG(f)}" alt="${t}" loading="lazy" draggable="false"><figcaption class="fcard__cap"><b>${t}</b><span>${String(i + 1).padStart(2, '0')} · ${s}</span></figcaption><button type="button" aria-label="Ampliar: ${t}"></button>`;
  $('button', c).addEventListener('click', () => openLb(i));
  flip.appendChild(c); return c;
});
let fl = 0, flBusy = false;
const layoutCards = (instant) => {
  cards.forEach((c, i) => {
    const k = (i - fl + cards.length) % cards.length; // 0 = delante
    const props = { y: -k * 10, scale: 1 - k * .035, zIndex: 50 - k, opacity: k > 3 ? 0 : 1, rotateX: 0, rotate: k ? (k % 2 ? 1.2 : -1) * k * .6 : 0 };
    if (hasGSAP) gsap.to(c, { ...props, duration: instant || reduced ? 0 : .6, ease: 'power3.out' });
    else Object.assign(c.style, { transform: `translateY(${props.y}px) scale(${props.scale})`, zIndex: props.zIndex, opacity: props.opacity });
  });
  flCount.textContent = `${String(fl + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
};
const flipNext = (dir = 1) => {
  if (flBusy) return;
  if (!motion) { fl = (fl + dir + cards.length) % cards.length; layoutCards(true); return; }
  flBusy = true;
  if (dir > 0) {
    const top = cards[fl];
    gsap.to(top, { rotateX: 100, y: 40, opacity: 0, duration: .5, ease: 'power2.in', transformOrigin: '50% 100%', onComplete: () => { fl = (fl + 1) % cards.length; layoutCards(); gsap.set(top, { rotateX: 0 }); flBusy = false; } });
  } else {
    fl = (fl - 1 + cards.length) % cards.length; const c = cards[fl];
    gsap.set(c, { zIndex: 60, rotateX: 100, opacity: 0, transformOrigin: '50% 100%' });
    gsap.to(c, { rotateX: 0, opacity: 1, y: 0, duration: .55, ease: 'power3.out', onComplete: () => { layoutCards(); flBusy = false; } });
  }
};
$('#flNext').addEventListener('click', () => flipNext(1));
$('#flPrev').addEventListener('click', () => flipNext(-1));
flip.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); flipNext(1); } if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); flipNext(-1); } });
let fx = null;
flip.addEventListener('pointerdown', (e) => { fx = { x: e.clientX, y: e.clientY }; });
flip.addEventListener('pointerup', (e) => { if (!fx) return; const dx = e.clientX - fx.x, dy = e.clientY - fx.y; fx = null; if (Math.max(Math.abs(dx), Math.abs(dy)) > 40) flipNext(dx + dy < 0 ? 1 : -1); });
layoutCards(true);
// pasa solo mientras se ve
let flTimer = null, flHover = false;
flip.addEventListener('pointerenter', () => { flHover = true; }); flip.addEventListener('pointerleave', () => { flHover = false; });
if (motion) new IntersectionObserver((en) => { clearInterval(flTimer); if (en[0].isIntersecting) flTimer = setInterval(() => { if (!flHover && lb.hidden) flipNext(1); }, 4200); }, { threshold: .4 }).observe(flip);

/* ----------------------------------------------------------
   VISOR
   ---------------------------------------------------------- */
const lb = $('#lb');
function openLb(i) { $('#lbImg').src = IMG(PHOTOS[i][0]); $('#lbImg').alt = PHOTOS[i][1]; $('#lbCap').textContent = PHOTOS[i][1]; lb.hidden = false; lock(true); $('.lb__close').focus(); }
const closeLb = () => { lb.hidden = true; lock(false); };
$('.lb__close').addEventListener('click', closeLb);
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
addEventListener('keydown', (e) => { if (!lb.hidden && e.key === 'Escape') closeLb(); });

/* ----------------------------------------------------------
   APARICIONES
   ---------------------------------------------------------- */
if (motion) {
  $$('.head .h2, .head .lead, .head .eyebrow, .seguros__copy > *, .oficina__copy > *, .contacto__copy > *').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  gsap.from('.ledger tbody tr', { x: -30, opacity: 0, duration: .7, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.ledger', start: 'top 80%', once: true } });
  gsap.from('.drawer', { y: 30, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.cabinet', start: 'top 85%', once: true } });
  gsap.from('.ins li', { y: 20, opacity: 0, duration: .5, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: '.ins', start: 'top 85%', once: true } });
  gsap.from('.opin blockquote', { y: 40, opacity: 0, duration: 1, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: '.opin', start: 'top 80%', once: true } });
  gsap.from('.machine', { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.ventanilla', start: 'top 70%', once: true } });
}
addEventListener('load', () => { if (hasGSAP) ScrollTrigger.refresh(); });
})();
