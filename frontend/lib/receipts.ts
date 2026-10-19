/** Validate the actual 1.1.8 Studio receipt; unknown shapes fail closed. */
export function assertSuccessfulReceipt(receipt: unknown, method: string): void {
  const tx = receipt as {statusName?:string;consensus_data?:{leader_receipt?:Array<{execution_result?:string;result?:unknown}>}};
  const leaders = tx?.consensus_data?.leader_receipt;
  if (tx?.statusName !== 'FINALIZED' || !leaders?.length || leaders.some(r => r.execution_result !== 'SUCCESS' && r.execution_result !== 'FINISHED_WITH_RETURN')) {
    throw new Error('Transaction lacks finalized successful execution evidence.');
  }
  if (method === 'create_mandate' || method === 'challenge') {
    const result = leaders[leaders.length - 1].result as {status?:string;payload?:{readable?:unknown}} | undefined;
    const value = result?.payload?.readable;
    if (result?.status !== 'return' || (method === 'challenge' ? value !== true && value !== 'true' : !/^[1-9]\d*$/.test(String(value)))) {
      throw new Error('Payable request was refused or its return value could not be verified. Check Activity for refundable credit.');
    }
  }
}
