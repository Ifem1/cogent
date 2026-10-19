import {test,expect} from 'vitest';
import {assertSuccessfulReceipt} from '../lib/receipts';
const receipt=(value:unknown=null)=>({statusName:'FINALIZED',consensus_data:{leader_receipt:[{execution_result:'SUCCESS',result:{status:'return',payload:{readable:value}}}]}});
test('finality alone cannot establish successful execution',()=>{
 for(const value of [null,{}, {statusName:'FINALIZED'}, {statusName:'UNDETERMINED'}, {statusName:'FINALIZED',consensus_data:{leader_receipt:[{execution_result:'ERROR'}]}}])expect(()=>assertSuccessfulReceipt(value,'propose')).toThrow();
});
test('actual finalized execution is accepted',()=>expect(()=>assertSuccessfulReceipt(receipt(),'propose')).not.toThrow());
test('payable refusals cannot be shown as success',()=>{
 expect(()=>assertSuccessfulReceipt(receipt('-1'),'create_mandate')).toThrow();
 expect(()=>assertSuccessfulReceipt(receipt('false'),'challenge')).toThrow();
 expect(()=>assertSuccessfulReceipt(receipt(),'challenge')).toThrow();
});
test('mandate id and successful challenge use exact scalar return values',()=>{
 expect(()=>assertSuccessfulReceipt(receipt('1'),'create_mandate')).not.toThrow();
 expect(()=>assertSuccessfulReceipt(receipt('true'),'challenge')).not.toThrow();
});
