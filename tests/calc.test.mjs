import test from 'node:test';
import assert from 'node:assert/strict';
let calculate;try{({calculate}=await import('../dist/calc.mjs'));}catch{}
const base={amount:22000,period:'month',start:'09:00',end:'18:00',days:[1,2,3,4,5],breakEnabled:false,breakStart:'12:00',breakEnd:'13:00',off:[],extra:[]};
const run=(time,patch={})=>{assert.equal(typeof calculate,'function','salary calculation must exist');return calculate({...base,...patch},new Date(time));};
test('monthly pay divided by actual 21 workdays in Nov 2026',()=>{const r=run('2026-11-04T13:30:00');assert.equal(r.monthDays,21);assert.ok(Math.abs(r.daily-22000/21)<1e-8);assert.equal(r.progress,.5);assert.equal(r.weekDays,5);});
test('weekly daily hourly wage conversions',()=>{assert.equal(run('2026-11-04T13:30:00',{period:'week',amount:4500}).daily,900);assert.equal(run('2026-11-04T13:30:00',{period:'day',amount:900}).earned,450);assert.equal(run('2026-11-04T13:30:00',{period:'hour',amount:100}).earned,450);});
test('before and after shift clamp income',()=>{assert.equal(run('2026-11-04T08:00:00').earned,0);assert.equal(run('2026-11-04T20:00:00',{period:'day',amount:900}).earned,900);});
test('unpaid lunch pauses accrual and removes hour from denominator',()=>{const patch={period:'day',amount:800,breakEnabled:true};assert.equal(run('2026-11-04T12:30:00',patch).earned,300);assert.equal(run('2026-11-04T13:30:00',patch).earned,350);});
test('rest days and manually adjusted working days',()=>{assert.equal(run('2026-11-07T14:00:00').earned,0);assert.equal(run('2026-11-07T14:00:00',{extra:['2026-11-07']}).monthDays,22);assert.equal(run('2026-11-04T14:00:00',{off:['2026-11-04']}).earned,0);});
test('overnight shift is assigned to previous working day',()=>{const r=run('2026-11-05T02:00:00',{start:'22:00',end:'06:00',period:'day',amount:800});assert.equal(r.earned,400);assert.equal(r.shiftDate,'2026-11-04');});
test('invalid settings rejected rather than calculating infinity',()=>{assert.throws(()=>run('2026-11-04T12:00:00',{amount:0}));assert.throws(()=>run('2026-11-04T12:00:00',{days:[]}));assert.throws(()=>run('2026-11-04T12:00:00',{start:'09:00',end:'09:00'}));});
test('a month with all days off displays zero instead of NaN',()=>{const off=Array.from({length:30},(_,i)=>`2026-11-${String(i+1).padStart(2,'0')}`);const r=run('2026-11-04T14:00:00',{off});assert.equal(r.daily,0);assert.equal(r.earned,0);assert.equal(r.monthEarned,0);});
test('invalid break outside shift is rejected',()=>{assert.throws(()=>run('2026-11-04T12:00:00',{breakEnabled:true,breakStart:'08:00',breakEnd:'09:00'}),/班次/);});
