"""Targeted mutation checks against real Direct Mode contract tests.

Each mutant is a separate source file; canonical source is never modified.
A nonzero test process is a kill only when pytest records an assertion failure,
not when imports, collection, SDK setup or external infrastructure fail.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
SOURCE=(ROOT/'contracts/cogent.py').read_text()
MUTANTS={
 'agent_authority':('assert self._me() == m["agent"],','assert True,','test_freeze_funds_and_identity'),
 'vendor_signature':('assert self._me() == p["vendor"],','assert True,','test_vendor_signature_required'),
 'vendor_independence':('assert v != m["agent"] and v != m["owner"],','assert True,','test_vendor_cannot_be_principal_or_agent'),
 'purchase_cap':('0 < a <= m["per_purchase_cap"] and a <= m["available"]','0 < a <= m["available"]','test_purchase_cap_and_source_enforced'),
 'vendor_cap':('assert int(self.vendor_commitments.get(k, u256(0))) + a <= m["per_vendor_cap"],','assert True,','test_concurrent_caps_and_release'),
 'offer_replay':('assert not bool(self.unique_offers.get(key, False)),','assert True,','test_agent_reserve_vendor_accept_and_replay'),
 'bond_exactness':('assert val == _bond(p["amount"]),','assert val > 0,','test_wrong_bond_credited_back'),
 'closed_refund':('if m["closed"]:\n                m["refunded"]','if False:\n                m["refunded"]','test_closed_mandate_late_reservation_refund'),
 'terminal_review':('p["review_due"] = 0\n        self._savem(m)','p["review_due"] = p["review_due"]\n        self._savem(m)','test_terminal_recovery_cannot_reopen_or_release_twice'),
}

def main():
 out=ROOT/'.tooling/mutations';out.mkdir(parents=True,exist_ok=True)
 rows=[]
 for name,(before,after,test) in MUTANTS.items():
  if SOURCE.count(before)!=1:raise RuntimeError(f'{name}: mutation anchor is not unique')
  path=out/f'{name}.py';path.write_text(SOURCE.replace(before,after))
  report=out/f'{name}.xml'
  env=dict(os.environ,COGENT_CONTRACT_SOURCE=str(path))
  run=subprocess.run([sys.executable,'-m','pytest','tests/direct','-q','-k',test,f'--junitxml={report}'],cwd=ROOT,env=env,capture_output=True,text=True)
  (out/f'{name}.log').write_text(run.stdout+run.stderr,encoding='utf-8')
  root=ET.parse(report).getroot() if report.exists() else None
  failures=len(root.findall('.//failure')) if root is not None else 0
  errors=len(root.findall('.//error')) if root is not None else 1
  status='KILLED' if run.returncode==1 and failures>0 and errors==0 else 'SURVIVED' if run.returncode==0 else 'ERROR'
  rows.append({'mutant':name,'test':test,'status':status,'failures':failures,'errors':errors})
  print(f'{name}: {status}',flush=True)
 (ROOT/'docs/evidence').mkdir(exist_ok=True)
 (ROOT/'docs/evidence/mutations.json').write_text(json.dumps(rows,indent=2)+'\n')
 return 0 if all(r['status']=='KILLED' for r in rows) else 1

if __name__=='__main__':sys.exit(main())
