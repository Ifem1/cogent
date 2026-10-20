#!/usr/bin/env python3
"""Offline source hygiene only: not GenVM lint and not a security audit."""
from pathlib import Path
import ast, hashlib, json, sys
root=Path(__file__).resolve().parents[1]
contract=root/'contracts/cogent.py'
code=contract.read_bytes()
ast.parse(code,filename=str(contract))
source=code.decode()
expected=['create_mandate','propose','accept_offer','request_review','observe_review','expire_review','challenge','finalize','expire_challenge','expire_unresolved','close_mandate','withdraw','confirm_withdrawal','get_mandate','get_proposal','withdrawal_pending_for']
missing=[name for name in expected if f'def {name}(' not in source]
if missing:raise SystemExit('Missing public surface: '+', '.join(missing))
for bad in ('eval(', 'exec(', 'os.system(', 'pickle.loads(', 'generatePrivateKey'):
 if bad in source:raise SystemExit('Disallowed pattern '+bad)
print(json.dumps({'contract':str(contract.relative_to(root)),'source_sha256':hashlib.sha256(code).hexdigest(),'expected_method_count':len(expected),'status':'source check OK (not VM validation)'},indent=2))
