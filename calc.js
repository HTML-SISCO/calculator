// Calculator + Temperature Converter logic
const display = document.getElementById('display');

// Calculator state
let current = '0';
let previous = null;
let operator = null;
let waitingForNewNumber = false;

function updateDisplay(){
  if (display) display.textContent = current;
}

function formatNumber(n){
  if (typeof n === 'string') return n;
  if (!isFinite(n)) return 'Error';
  let s = String(n);
  if (s.length > 12) s = Number(n.toPrecision(12)).toString();
  return s;
}

function inputDigit(d) {
  if (waitingForNewNumber) {
    current = d === '.' ? '0.' : d;
    waitingForNewNumber = false;
    return;
  }
  if (d === '.' && current.includes('.')) return;
  current = (current === '0' && d !== '.') ? d : current + d;
}

function calculate(a, b, op) {
  a = Number(a);
  b = Number(b);
  let res = 0;
  switch(op){
    case '+': res = a + b; break;
    case '-': res = a - b; break;
    case '*': res = a * b; break;
    case '/':
      if (b === 0) return 'Error';
      res = a / b; break;
    default: return b;
  }
  return formatNumber(res);
}

function handleOperator(nextOp){
  const inputValue = parseFloat(current);
  if (operator && !waitingForNewNumber) {
    const result = calculate(previous, inputValue, operator);
    current = String(result);
    previous = result === 'Error' ? null : result;
  } else {
    previous = inputValue;
  }

  waitingForNewNumber = true;

  if (nextOp === '=') {
    operator = null;
    previous = null;
  } else {
    operator = nextOp;
  }
}

function clearAll(){
  current = '0';
  previous = null;
  operator = null;
  waitingForNewNumber = false;
}

function toggleSign(){
  if (current === '0') return;
  current = String(parseFloat(current) * -1);
}

function percent(){
  current = String(parseFloat(current) / 100);
  current = formatNumber(Number(current));
}

// Calculator button handling
const buttons = document.querySelector('.buttons');
if (buttons) {
  buttons.addEventListener('click', e => {
    const target = e.target;
    if (!target.matches('button')) return;
    const val = target.dataset.value;
    const action = target.dataset.action;

    if (val !== undefined) {
      inputDigit(val);
      updateDisplay();
      return;
    }

    if (action) {
      if (action === 'clear') { clearAll(); updateDisplay(); return; }
      if (action === 'neg') { toggleSign(); updateDisplay(); return; }
      if (action === 'percent') { percent(); updateDisplay(); return; }
      if (action === '=') { handleOperator('='); updateDisplay(); return; }
      handleOperator(action);
      updateDisplay();
    }
  });
}

// Keyboard support
window.addEventListener('keydown', e => {
  // numbers and dot
  if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
    inputDigit(e.key);
    updateDisplay();
    return;
  }
  if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    handleOperator('=');
    updateDisplay();
    return;
  }
  if (e.key === 'Backspace') {
    current = current.length > 1 ? current.slice(0, -1) : '0';
    updateDisplay();
    return;
  }
  if (e.key === 'Escape') {
    clearAll();
    updateDisplay();
    return;
  }
  if (['+','-','*','/'].includes(e.key)) {
    handleOperator(e.key);
    updateDisplay();
    return;
  }
  if (e.key === '%') {
    percent();
    updateDisplay();
    return;
  }
});

updateDisplay();

// Mode switching (calculator <-> converters)
const modeButtons = document.querySelectorAll('.mode-btn');
const calcView = document.getElementById('calcView');
const tempView = document.getElementById('tempView');
const distView = document.getElementById('distView');
const currView = document.getElementById('currView');
const weightView = document.getElementById('weightView');
const volView = document.getElementById('volView');

modeButtons.forEach(btn => btn.addEventListener('click', () => {
  modeButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
  btn.classList.add('active');
  btn.setAttribute('aria-selected','true');
  const mode = btn.dataset.mode;

  // hide all views first
  if (calcView) calcView.hidden = true;
  if (tempView) tempView.hidden = true;
  if (distView) distView.hidden = true;
  if (currView) currView.hidden = true;
  if (weightView) weightView.hidden = true;
  if (volView) volView.hidden = true;

  // show the requested view
  if (mode === 'temp') {
    if (tempView) tempView.hidden = false;
  } else if (mode === 'dist') {
    if (distView) distView.hidden = false;
  } else if (mode === 'curr') {
    if (currView) currView.hidden = false;
  } else if (mode === 'weight') {
    if (weightView) weightView.hidden = false;
  } else if (mode === 'vol') {
    if (volView) volView.hidden = false;
  } else {
    if (calcView) calcView.hidden = false;
  }
}));

// Temperature converter logic
function cToF(c){ return c * 9/5 + 32; }
function cToK(c){ return c + 273.15; }
function fToC(f){ return (f - 32) * 5/9; }
function fToK(f){ return (f - 32) * 5/9 + 273.15; }
function kToC(k){ return k - 273.15; }
function kToF(k){ return (k - 273.15) * 9/5 + 32; }

const tempInput = document.getElementById('tempInput');
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const convertBtn = document.getElementById('convertBtn');
const convClear = document.getElementById('convClear');
const convResult = document.getElementById('convResult');

function convertTemp(){
  if (!tempInput || !fromUnit || !toUnit || !convResult) return;
  const raw = tempInput.value;
  if (raw === ''){ convResult.textContent = 'Result: —'; return; }
  const v = Number(raw);
  const from = fromUnit.value;
  const to = toUnit.value;
  let out = v;

  if (from === to){ out = v; }
  else if (from === 'C' && to === 'F'){ out = cToF(v); }
  else if (from === 'C' && to === 'K'){ out = cToK(v); }
  else if (from === 'F' && to === 'C'){ out = fToC(v); }
  else if (from === 'F' && to === 'K'){ out = fToK(v); }
  else if (from === 'K' && to === 'C'){ out = kToC(v); }
  else if (from === 'K' && to === 'F'){ out = kToF(v); }

  if (!isFinite(out)){
    convResult.textContent = 'Result: Error';
  } else {
    const s = Number(out.toPrecision(12)).toString();
    convResult.textContent = `Result: ${s} ${to === 'C' ? '°C' : to === 'F' ? '°F' : 'K'}`;
  }
}

if (convertBtn) convertBtn.addEventListener('click', convertTemp);
if (convClear) convClear.addEventListener('click', ()=>{ if (tempInput) tempInput.value=''; if (convResult) convResult.textContent='Result: —'; });

if (tempInput){ tempInput.addEventListener('keydown', e=>{ if (e.key === 'Enter') convertTemp(); }); }

// Distance converter logic
function toMeters(value, unit){
  // convert any supported unit to meters
  const v = Number(value);
  switch(unit){
    case 'm': return v;
    case 'km': return v * 1000;
    case 'mi': return v * 1609.344;
    case 'yd': return v * 0.9144;
    case 'ft': return v * 0.3048;
    case 'in': return v * 0.0254;
    default: return NaN;
  }
}

function fromMeters(meters, unit){
  const v = Number(meters);
  switch(unit){
    case 'm': return v;
    case 'km': return v / 1000;
    case 'mi': return v / 1609.344;
    case 'yd': return v / 0.9144;
    case 'ft': return v / 0.3048;
    case 'in': return v / 0.0254;
    default: return NaN;
  }
}

const distInput = document.getElementById('distInput');
const distFrom = document.getElementById('distFrom');
const distTo = document.getElementById('distTo');
const convertDist = document.getElementById('convertDist');
const distClear = document.getElementById('distClear');
const distResult = document.getElementById('distResult');

function convertDistance(){
  if (!distInput || !distFrom || !distTo || !distResult) return;
  const raw = distInput.value;
  if (raw === ''){ distResult.textContent = 'Result: —'; return; }
  const v = Number(raw);
  const from = distFrom.value;
  const to = distTo.value;
  const meters = toMeters(v, from);
  const out = fromMeters(meters, to);
  if (!isFinite(out)){
    distResult.textContent = 'Result: Error';
  } else {
    const s = Number(out.toPrecision(12)).toString();
    distResult.textContent = `Result: ${s} ${to}`;
  }
}

if (convertDist) convertDist.addEventListener('click', convertDistance);
if (distClear) distClear.addEventListener('click', ()=>{ if (distInput) distInput.value=''; if (distResult) distResult.textContent='Result: —'; });

if (distInput){ distInput.addEventListener('keydown', e=>{ if (e.key === 'Enter') convertDistance(); }); }

// Currency converter logic (static sample rates; update as needed)
const currInput = document.getElementById('currInput');
const currFrom = document.getElementById('currFrom');
const currTo = document.getElementById('currTo');
const convertCurr = document.getElementById('convertCurr');
const currClear = document.getElementById('currClear');
const currResult = document.getElementById('currResult');

// ratesToUSD: 1 unit of currency = X USD (approximate sample values)
const ratesToUSD = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.25,
  JPY: 0.0068,
  INR: 0.012,
  OMR: 2.597,
  AUD: 0.65,
  SAR: 0.266667,
  CAD: 0.74,
  CNY: 0.14
};

function convertCurrency(){
  if (!currInput || !currFrom || !currTo || !currResult) return;
  const raw = currInput.value;
  if (raw === ''){ currResult.textContent = 'Result: —'; return; }
  const v = Number(raw);
  const from = currFrom.value;
  const to = currTo.value;
  if (!ratesToUSD[from] || !ratesToUSD[to]){ currResult.textContent = 'Result: Error'; return; }

  const usd = v * ratesToUSD[from];
  const out = usd / ratesToUSD[to];

  if (!isFinite(out)){
    currResult.textContent = 'Result: Error';
  } else {
    let formatted;
    try {
      formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency: to }).format(out);
    } catch (e) {
      // fallback if Intl doesn't support this currency in the runtime
      formatted = `${Number(out.toPrecision(12)).toString()} ${to}`;
    }
    currResult.textContent = `Result: ${formatted}`;
  }
}

if (convertCurr) convertCurr.addEventListener('click', convertCurrency);
if (currClear) currClear.addEventListener('click', ()=>{ if (currInput) currInput.value=''; if (currResult) currResult.textContent='Result: —'; });
if (currInput){ currInput.addEventListener('keydown', e=>{ if (e.key === 'Enter') convertCurrency(); }); }

// Swap From/To for currency converter
const swapCurr = document.getElementById('swapCurr');
if (swapCurr) swapCurr.addEventListener('click', ()=>{
  if (!currFrom || !currTo) return;
  const fromIndex = currFrom.selectedIndex;
  const toIndex = currTo.selectedIndex;
  currFrom.selectedIndex = toIndex;
  currTo.selectedIndex = fromIndex;
  // re-run conversion after swap
  convertCurrency();
});

// Welcome / start overlay handler
const startBtn = document.getElementById('startBtn');
const welcomeOverlay = document.getElementById('welcomeOverlay');
const appRoot = document.querySelector('.app');

function startApp(mode){
  if (welcomeOverlay) welcomeOverlay.remove();
  if (appRoot) appRoot.hidden = false;
  // add animate class so brand/logo can play entrance animation and then select a mode if provided
  if (appRoot) {
    requestAnimationFrame(() => {
      appRoot.classList.add('animate');
      if (mode) {
        const targetBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
        if (targetBtn) targetBtn.click();
      }
    });
  }
  // focus the calculator display if present
  const d = document.getElementById('display');
  if (d) d.focus?.();
}

if (startBtn){
  startBtn.addEventListener('click', () => startApp());
  // allow Enter key on focused start button
  startBtn.addEventListener('keydown', e => { if (e.key === 'Enter') startApp(); });
}

// Note: removed quick-start Volume button from welcome overlay per user request

// Weight converter logic
const weightInput = document.getElementById('weightInput');
const weightFrom = document.getElementById('weightFrom');
const weightTo = document.getElementById('weightTo');
const convertWeight = document.getElementById('convertWeight');
const weightClear = document.getElementById('weightClear');
const weightResult = document.getElementById('weightResult');

// Convert any supported unit to grams
function toGrams(value, unit){
  const v = Number(value);
  switch(unit){
    case 'g': return v;
    case 'kg': return v * 1000;
    case 'lb': return v * 453.59237;
    case 'oz': return v * 28.349523125;
    case 't': return v * 1_000_000; // metric tonne
    default: return NaN;
  }
}

function fromGrams(grams, unit){
  const v = Number(grams);
  switch(unit){
    case 'g': return v;
    case 'kg': return v / 1000;
    case 'lb': return v / 453.59237;
    case 'oz': return v / 28.349523125;
    case 't': return v / 1_000_000;
    default: return NaN;
  }
}

function convertWeightFunc(){
  if (!weightInput || !weightFrom || !weightTo || !weightResult) return;
  const raw = weightInput.value;
  if (raw === ''){ weightResult.textContent = 'Result: —'; return; }
  const v = Number(raw);
  const from = weightFrom.value;
  const to = weightTo.value;
  const grams = toGrams(v, from);
  const out = fromGrams(grams, to);
  if (!isFinite(out)){
    weightResult.textContent = 'Result: Error';
  } else {
    const s = Number(out.toPrecision(12)).toString();
    weightResult.textContent = `Result: ${s} ${to}`;
  }
}

if (convertWeight) convertWeight.addEventListener('click', convertWeightFunc);
if (weightClear) weightClear.addEventListener('click', ()=>{ if (weightInput) weightInput.value=''; if (weightResult) weightResult.textContent='Result: —'; });
if (weightInput){ weightInput.addEventListener('keydown', e=>{ if (e.key === 'Enter') convertWeightFunc(); }); }

// Volume (mL) converter logic
const volInput = document.getElementById('volInput');
const volFrom = document.getElementById('volFrom');
const volTo = document.getElementById('volTo');
const convertVol = document.getElementById('convertVol');
const volClear = document.getElementById('volClear');
const volResult = document.getElementById('volResult');

// convert any supported unit to milliliters
function toMilliliters(value, unit){
  const v = Number(value);
  switch(unit){
    case 'ml': return v;
    case 'l': return v * 1000;
    case 'floz': return v * 29.5735295625; // US fluid ounce
    case 'cup': return v * 240; // US cup ~240 mL
    case 'pt': return v * 473.176473; // US pint
    case 'qt': return v * 946.352946; // US quart
    case 'gal': return v * 3785.411784; // US gallon
    default: return NaN;
  }
}

function fromMilliliters(ml, unit){
  const v = Number(ml);
  switch(unit){
    case 'ml': return v;
    case 'l': return v / 1000;
    case 'floz': return v / 29.5735295625;
    case 'cup': return v / 240;
    case 'pt': return v / 473.176473;
    case 'qt': return v / 946.352946;
    case 'gal': return v / 3785.411784;
    default: return NaN;
  }
}

function convertVolume(){
  if (!volInput || !volFrom || !volTo || !volResult) return;
  const raw = volInput.value;
  if (raw === ''){ volResult.textContent = 'Result: —'; return; }
  const v = Number(raw);
  const from = volFrom.value;
  const to = volTo.value;
  const ml = toMilliliters(v, from);
  const out = fromMilliliters(ml, to);
  if (!isFinite(out)){
    volResult.textContent = 'Result: Error';
  } else {
    const s = Number(out.toPrecision(12)).toString();
    volResult.textContent = `Result: ${s} ${to}`;
  }
}

if (convertVol) convertVol.addEventListener('click', convertVolume);
if (volClear) volClear.addEventListener('click', ()=>{ if (volInput) volInput.value=''; if (volResult) volResult.textContent='Result: —'; });
if (volInput){ volInput.addEventListener('keydown', e=>{ if (e.key === 'Enter') convertVolume(); }); }