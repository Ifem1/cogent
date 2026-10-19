import {test,expect,describe} from 'vitest';
import {toWei,gen,bondWei,isHexAddress} from '../lib/amounts';
describe('exact financial units',()=>{
 test('1 GEN is 18 decimal units',()=>expect(toWei('1')).toBe(10n**18n));
 test('fractions preserve precision',()=>expect(toWei('0.000000000000000001')).toBe(1n));
 test('display never uses floating point',()=>expect(gen('100000000000000001')).toBe('0.100000000000000001'));
 test('overprecision rejected',()=>expect(()=>toWei('0.0000000000000000001')).toThrow());
 test('negative, exponent and empty rejected',()=>{for(const s of ['-1','1e10','','0'])expect(()=>toWei(s)).toThrow()});
 test('exact rounded-up bond is 5 percent',()=>{expect(bondWei(20000000000000000n)).toBe(1000000000000000n);expect(bondWei(1n)).toBe(1n)});
 test('zero vendor address rejected',()=>expect(isHexAddress('0x'+'0'.repeat(40))).toBe(false));
});
