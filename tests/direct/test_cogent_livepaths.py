"""Real Direct VM tests. Must run with pinned genlayer-test SDK, not marked as passed here.

Never replace these with a copied Python state model; contract execution is required.
"""
import json
import os
import random
import datetime
import pytest
from pathlib import Path

CONTRACT=Path(os.environ.get('COGENT_CONTRACT_SOURCE',str(Path(__file__).resolve().parents[2]/'contracts'/'cogent.py')))
OWNER='0x'+'1'*40
AGENT='0x'+'2'*40
VENDOR='0x'+'3'*40
STRANGER='0x'+'4'*40
INITIAL='2026-10-20T12:00:00+00:00'
POLICY='Commercial automation permitted; data must not train another model; no recurring subscription is permitted.'
PRODUCT='One-time API credits package'
TERMS='Commercial automation permitted. Customer data must not train another model. No recurring subscription is permitted.'

def offer_body(ref='QUOTE_2026_AAA',vendor=VENDOR,amount=10**17,product=PRODUCT,terms=TERMS):
 return json.dumps({'schema':'cogent.offer.v1','reference':ref,'vendor_address':vendor,
  'amount_wei':str(amount),'product':product,'commercial_terms':terms},sort_keys=True,separators=(',',':'))

def model_result(label= 'COMPLIANT', terms=TERMS):
 support=[]
 if label=='COMPLIANT':
  pairs=[('Commercial automation permitted','Commercial automation permitted.'),
   ('data must not train another model','Customer data must not train another model.'),
   ('no recurring subscription is permitted','No recurring subscription is permitted.')]
 elif label=='NON_COMPLIANT':
  pairs=[('data must not train another model','All customer data must be used for model training.')]
 else:
  pairs=[]
 for policy_clause,offer_clause in pairs:
  if policy_clause in POLICY and offer_clause in terms:
   support.append({'policy_clause':policy_clause,'offer_clause':offer_clause})
 return json.dumps({'label':label,'supporting_clauses':support})

@pytest.fixture
def deployed(direct_vm,direct_deploy):
 direct_vm.warp(INITIAL)
 direct_vm.sender=OWNER
 c=direct_deploy(CONTRACT,sdk_version='v0.2.12')
 direct_vm.value=10**18
 mid=c.create_mandate(AGENT,'Procurement guard',POLICY,json.dumps(['https://vendor.example.com/quotes/']),2*10**17,4*10**17,1793102400)
 direct_vm.value=0
 assert mid==1
 return c

def propose_and_accept(c,vm,ref='QUOTE_2026_AAA'):
 vm.sender=AGENT
 pid=c.propose(1,VENDOR,10**17,'https://vendor.example.com/quotes/'+ref,ref,PRODUCT)
 vm.sender=VENDOR
 c.accept_offer(pid)
 return pid

def test_freeze_funds_and_identity(deployed,direct_vm):
 m=json.loads(deployed.get_mandate(1))
 assert int(m['funded'])==10**18 and int(m['available'])==10**18 and int(m['reserved'])==0
 direct_vm.sender=STRANGER
 with pytest.raises(AssertionError,match='only the agent'):deployed.propose(1,VENDOR,10**17,'https://vendor.example.com/quotes/x','QUOTE_2026_X',PRODUCT)

def test_agent_reserve_vendor_accept_and_replay(deployed,direct_vm):
 pid=propose_and_accept(deployed,direct_vm)
 p=json.loads(deployed.get_proposal(pid))
 assert p['status']=='READY'
 assert int(json.loads(deployed.get_mandate(1))['reserved'])==10**17
 direct_vm.sender=AGENT
 with pytest.raises(AssertionError,match='offer replay'):deployed.propose(1,VENDOR,10**17,'https://vendor.example.com/quotes/QUOTE_2026_AAA','QUOTE_2026_AAA',PRODUCT)

def test_preauthorised_compliance_is_not_claimed_until_review(deployed,direct_vm):
 pid=propose_and_accept(deployed,direct_vm)
 assert json.loads(deployed.get_proposal(pid))['status']=='READY'
 # In a Direct VM, mock the *boundary*, not the Cogent contract.
 direct_vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':offer_body()})
 direct_vm.mock_llm(r'Assess every condition in OWNER_POLICY',model_result())
 direct_vm.sender=STRANGER
 deployed.request_review(pid)
 deployed.observe_review(pid)
 p=json.loads(deployed.get_proposal(pid))
 assert p['status']=='PROVISIONAL_COMPLIANT'
 assert p['provisional_code']=='COMPLIANT'
 assert int(json.loads(deployed.get_mandate(1))['paid'])==0

def test_noncompliant_result_releases_reservation_only_after_finality(deployed,direct_vm):
 pid=propose_and_accept(deployed,direct_vm)
 direct_vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':offer_body(terms='All customer data must be used for model training.')})
 direct_vm.mock_llm(r'Assess every condition in OWNER_POLICY',model_result('NON_COMPLIANT','All customer data must be used for model training.'))
 deployed.request_review(pid)
 deployed.observe_review(pid)
 p=json.loads(deployed.get_proposal(pid))
 assert p['status']=='PROVISIONAL_NON_COMPLIANT'
 direct_vm.warp('2026-10-20T14:00:00+00:00')
 deployed.finalize(pid)
 p=json.loads(deployed.get_proposal(pid))
 assert p['status']=='REFUSED'
 assert int(json.loads(deployed.get_mandate(1))['reserved'])==0
 assert int(json.loads(deployed.get_mandate(1))['paid'])==0

@pytest.mark.parametrize('field,value',[('amount_wei',str(10**17+1)),('vendor_address',STRANGER),('product','Unrelated gift card')])
def test_offer_must_bind_price_vendor_and_product(deployed,direct_vm,field,value):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm)
 doc=json.loads(offer_body());doc[field]=value
 vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':json.dumps(doc,sort_keys=True,separators=(',',':'))})
 c.request_review(pid);c.observe_review(pid)
 p=json.loads(c.get_proposal(pid));manifest=json.loads(p['primary_manifest'])
 assert p['status']=='PROVISIONAL_NON_COMPLIANT'
 assert manifest['bindings_valid'] is False
 assert len(manifest['source_sha256'])==64 and len(manifest['terms_sha256'])==64
 assert c.owed_to(VENDOR)==0

def test_oversized_offer_is_rejected_without_truncation(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm)
 body=offer_body(terms='x'*17000)
 assert len(body.encode('utf-8'))>16384
 vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':body})
 c.request_review(pid);c.observe_review(pid)
 p=json.loads(c.get_proposal(pid));manifest=json.loads(p['primary_manifest'])
 assert p['status']=='RETRYABLE' and manifest['label']=='INCONCLUSIVE'
 assert len(manifest['source_sha256'])==64 and manifest['terms_sha256']==''
 assert c.owed_to(VENDOR)==0

def test_duplicate_offer_json_keys_are_rejected(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm)
 body=offer_body().replace('"amount_wei":"100000000000000000"',
  '"amount_wei":"1","amount_wei":"100000000000000000"')
 vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':body})
 c.request_review(pid);c.observe_review(pid)
 p=json.loads(c.get_proposal(pid));manifest=json.loads(p['primary_manifest'])
 assert p['status']=='RETRYABLE' and manifest['label']=='INCONCLUSIVE'
 assert manifest['bindings_valid'] is False and c.owed_to(VENDOR)==0

def test_supporting_clauses_must_be_exact_source_quotes(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm)
 bad={'label':'COMPLIANT','supporting_clauses':[{'policy_clause':'all policies are met','offer_clause':'Everything is fine.'}]}
 vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':offer_body()})
 vm.mock_llm(r'Assess every condition in OWNER_POLICY',json.dumps(bad))
 c.request_review(pid);c.observe_review(pid)
 p=json.loads(c.get_proposal(pid));assert p['status']=='RETRYABLE'
 assert json.loads(p['primary_manifest'])['label']=='MODEL_OUTPUT_INVALID'

def books(c):
 m=json.loads(c.get_mandate(1))
 assert int(m['funded'])==sum(int(m[k]) for k in ('available','reserved','paid','refunded'))
 b=json.loads(c.get_accounting())
 assert int(b['bonds_received'])==sum(int(b[k]) for k in ('bonds_locked','bonds_returned','bonds_forfeited'))
 return m

def review(c,vm,pid,label='COMPLIANT'):
 vm.clear_mocks()
 terms = 'All customer data must be used for model training.' if label == 'NON_COMPLIANT' else TERMS
 vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':offer_body(terms=terms)})
 vm.mock_llm(r'Assess every condition in OWNER_POLICY',model_result(label,terms))
 c.request_review(pid)
 c.observe_review(pid)
 assert vm.run_validator() is True

@pytest.mark.parametrize('label',['COMPLIANT','NON_COMPLIANT'])
def test_settlement_exact_credit_and_duplicate(deployed,direct_vm,label):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm)
 review(c,vm,pid,label)
 assert c.owed_to(VENDOR)==0
 vm.warp('2026-10-20T14:00:00+00:00');c.finalize(pid)
 assert c.owed_to(VENDOR)==(10**17 if label=='COMPLIANT' else 0)
 books(c)
 with pytest.raises(AssertionError,match='not provisional'):c.finalize(pid)

@pytest.mark.parametrize('initial,final',[('COMPLIANT','COMPLIANT'),('COMPLIANT','NON_COMPLIANT'),('NON_COMPLIANT','COMPLIANT'),('NON_COMPLIANT','NON_COMPLIANT')])
def test_challenge_bond_directions(deployed,direct_vm,initial,final):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm);review(c,vm,pid,initial)
 challenger=OWNER if initial=='COMPLIANT' else VENDOR
 counterparty=VENDOR if challenger==OWNER else OWNER
 vm.sender=challenger;vm.value=5*10**15
 assert c.challenge(pid) is True
 vm.value=0;books(c)
 vm.warp('2026-10-20T12:20:00+00:00');review(c,vm,pid,final)
 winner=challenger if initial!=final else counterparty
 assert c.owed_to(winner)==5*10**15+(10**17 if winner==VENDOR and final=='COMPLIANT' else 0)
 b=json.loads(c.get_accounting())
 assert int(b['bonds_returned' if initial!=final else 'bonds_forfeited'])==5*10**15
 books(c)

@pytest.mark.parametrize('label',['INCONCLUSIVE','SOURCE_UNAVAILABLE','COMPLIANT because I said so','{}'])
def test_uncertain_results_never_pay(deployed,direct_vm,label):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm);review(c,vm,pid,label)
 assert json.loads(c.get_proposal(pid))['status']=='RETRYABLE'
 assert c.owed_to(VENDOR)==0;books(c)

def test_vendor_signature_required(deployed,direct_vm):
 direct_vm.sender=AGENT
 pid=deployed.propose(1,VENDOR,10**17,'https://vendor.example.com/quotes/x','QUOTE_2026_AAA',PRODUCT)
 with pytest.raises(AssertionError,match='vendor signature'):deployed.accept_offer(pid)

@pytest.mark.parametrize('value',[1,5*10**15-1,5*10**15+1])
def test_wrong_bond_credited_back(deployed,direct_vm,value):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm);review(c,vm,pid)
 vm.sender=OWNER;vm.value=value
 assert c.challenge(pid) is False
 vm.value=0;assert c.owed_to(OWNER)==value;books(c)

def test_unknown_payable_challenge_refunds(deployed,direct_vm):
 direct_vm.sender=STRANGER;direct_vm.value=123
 assert deployed.challenge(999) is False
 direct_vm.value=0;assert deployed.owed_to(STRANGER)==123

def test_closed_mandate_late_reservation_refund(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm)
 vm.warp('2026-10-28T14:00:00+00:00');c.close_mandate(1)
 assert c.owed_to(OWNER)==9*10**17
 c.expire_unresolved(pid)
 m=books(c);assert int(m['available'])==0 and int(m['refunded'])==10**18
 assert c.owed_to(OWNER)==10**18

def test_review_expiry_preserves_recovery(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm);c.request_review(pid)
 vm.warp('2026-10-20T12:21:00+00:00');c.expire_review(pid)
 p=json.loads(c.get_proposal(pid));assert p['status']=='RETRYABLE' and p['attempts']==1
 assert json.loads(p['primary_manifest'])['label']=='CONTESTED';books(c)

def test_independent_validator_retrieves_again(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm);review(c,vm,pid)
 vm.clear_mocks()
 # Same policy verdict and exact supporting clauses, but a different source
 # version (whitespace-only change). The source commitment must still disagree.
 vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':offer_body()+' '})
 vm.mock_llm(r'Assess every condition in OWNER_POLICY',model_result())
 assert vm.run_validator() is False
 # Direct Mode captures validators after leader execution; this is not a
 # network rollback simulation. On-chain disagreement still needs live proof.
 assert c.owed_to(VENDOR)==0

def test_concurrent_caps_and_release(deployed,direct_vm):
 c=deployed;vm=direct_vm;vm.sender=AGENT
 ids=[c.propose(1,VENDOR,2*10**17,'https://vendor.example.com/quotes/x','QUOTE_2026_'+str(i),PRODUCT) for i in range(2)]
 with pytest.raises(AssertionError,match='cumulative vendor cap'):c.propose(1,VENDOR,1,'https://vendor.example.com/quotes/x','QUOTE_2026_EXTRA',PRODUCT)
 vm.sender=OWNER;c.cancel_unaccepted(ids[0]);books(c)
 vm.sender=AGENT;c.propose(1,VENDOR,2*10**17,'https://vendor.example.com/quotes/x','QUOTE_2026_NEW',PRODUCT)
 books(c)

def test_terminal_recovery_cannot_reopen_or_release_twice(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm)
 vm.sender=AGENT
 c.propose(1,VENDOR,10**17,'https://vendor.example.com/quotes/x','QUOTE_2026_SECOND',PRODUCT)
 c.request_review(pid)
 vm.warp('2026-10-28T14:00:00+00:00');c.expire_unresolved(pid)
 assert json.loads(c.get_proposal(pid))['review_due']==0
 with pytest.raises(AssertionError):c.expire_review(pid)
 with pytest.raises(AssertionError):c.expire_unresolved(pid)
 assert int(books(c)['reserved'])==10**17

@pytest.mark.parametrize('vendor',[OWNER,AGENT])
def test_vendor_cannot_be_principal_or_agent(deployed,direct_vm,vendor):
 direct_vm.sender=AGENT
 with pytest.raises(AssertionError,match='independent'):deployed.propose(1,vendor,1,'https://vendor.example.com/quotes/x','QUOTE_2026_AAA',PRODUCT)

def test_purchase_cap_and_source_enforced(deployed,direct_vm):
 direct_vm.sender=AGENT
 with pytest.raises(AssertionError,match='budget cap'):deployed.propose(1,VENDOR,2*10**17+1,'https://vendor.example.com/quotes/x','QUOTE_2026_AAA',PRODUCT)
 with pytest.raises(ValueError):deployed.propose(1,VENDOR,1,'https://vendor.example.com/quotes/../private','QUOTE_2026_AAA',PRODUCT)

@pytest.mark.parametrize('seed',range(8))
def test_random_reservations_conserve_escrow(deployed,direct_vm,seed):
 c=deployed;vm=direct_vm;rng=random.Random(seed);active=[]
 for step in range(50):
  if active and rng.randrange(2):
   pid=active.pop(rng.randrange(len(active)));vm.sender=OWNER;c.cancel_unaccepted(pid)
  else:
   vm.sender=AGENT
   amount=rng.randint(1,10**16)
   vendor='0x'+format(16+rng.randrange(6),'040x')
   active.append(c.propose(1,vendor,amount,'https://vendor.example.com/quotes/x',f'RANDOM_{seed}_{step}',PRODUCT))
  m=books(c)
  assert int(m['reserved'])==sum(int(json.loads(c.get_proposal(pid))['amount']) for pid in active)
  assert c.owed_to(VENDOR)==0

def test_challenge_timeout_and_duplicate(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm);review(c,vm,pid)
 vm.sender=OWNER;vm.value=5*10**15;assert c.challenge(pid)
 vm.value=0;vm.warp('2026-10-20T15:00:00+00:00');c.expire_challenge(pid)
 assert c.owed_to(VENDOR)==10**17
 assert c.owed_to(OWNER)==5*10**15
 p=json.loads(c.get_proposal(pid));assert p['challenge_outcome']=='UNADJUDICATED_BOND_RETURNED'
 assert int(json.loads(c.get_accounting())['bonds_returned'])==5*10**15
 assert int(json.loads(c.get_accounting())['bonds_forfeited'])==0
 with pytest.raises(AssertionError):c.expire_challenge(pid)
 books(c)

def test_unresolved_challenge_returns_bond_and_keeps_prior_decision(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm);review(c,vm,pid)
 vm.sender=OWNER;vm.value=5*10**15;assert c.challenge(pid);vm.value=0
 vm.warp('2026-10-20T12:20:00+00:00');vm.clear_mocks();vm.mock_web(r'vendor\.example\.com/quotes',{'status':503,'body':'Unavailable'})
 c.request_review(pid);c.observe_review(pid)
 p=json.loads(c.get_proposal(pid));assert p['status']=='CHALLENGED' and p['challenge_attempts']==1
 vm.warp('2026-10-20T13:20:00+00:00');c.expire_challenge(pid)
 p=json.loads(c.get_proposal(pid))
 assert p['final_code']=='COMPLIANT' and p['challenge_outcome']=='UNADJUDICATED_BOND_RETURNED'
 assert c.owed_to(OWNER)==5*10**15 and c.owed_to(VENDOR)==10**17
 books(c)

def test_challenge_review_disagreement_is_bounded_and_refundable(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm);review(c,vm,pid)
 vm.sender=OWNER;vm.value=5*10**15;assert c.challenge(pid);vm.value=0
 vm.warp('2026-10-20T12:10:00+00:00')
 vm.clear_mocks();vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':offer_body()})
 vm.mock_llm(r'Assess every condition in OWNER_POLICY',model_result())
 c.request_review(pid)
 # No validator agreement arrives before the observation window closes.
 vm.warp('2026-10-20T12:31:00+00:00');c.expire_review(pid)
 assert json.loads(c.get_proposal(pid))['challenge_attempts']==1
 vm.warp('2026-10-20T13:20:00+00:00');c.expire_challenge(pid)
 assert c.owed_to(OWNER)==5*10**15 and c.owed_to(VENDOR)==10**17
 books(c)

def test_late_primary_result_does_not_accept_unhearable_challenge(deployed,direct_vm):
 c=deployed;vm=direct_vm
 vm.value=10**18
 expiry=int(datetime.datetime(2026,10,20,13,0,tzinfo=datetime.timezone.utc).timestamp())
 mid=c.create_mandate(AGENT,'Near deadline mandate',POLICY,json.dumps(['https://vendor.example.com/quotes/']),2*10**17,4*10**17,expiry)
 vm.value=0;assert mid==2
 vm.sender=AGENT;pid=c.propose(mid,VENDOR,10**17,'https://vendor.example.com/quotes/QUOTE_2026_AAA','QUOTE_2026_AAA',PRODUCT)
 vm.sender=VENDOR;c.accept_offer(pid)
 vm.warp('2026-10-20T13:45:00+00:00')
 c.request_review(pid)
 vm.mock_web(r'vendor\.example\.com/quotes',{'status':200,'body':offer_body()})
 vm.mock_llm(r'Assess every condition in OWNER_POLICY',model_result())
 c.observe_review(pid)
 p=json.loads(c.get_proposal(pid));assert p['challenge_deadline']<int(datetime.datetime(2026,10,20,13,45,tzinfo=datetime.timezone.utc).timestamp())
 vm.sender=OWNER;vm.value=5*10**15
 assert c.challenge(pid) is False
 vm.value=0;assert c.owed_to(OWNER)==5*10**15
 c.finalize(pid)
 assert json.loads(c.get_proposal(pid))['status']=='RELEASED'
 books(c)

def test_missing_reference_and_unavailable_source(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm)
 vm.mock_web(r'vendor\.example\.com',{'status':200,'body':'Commercial terms without the committed reference.'})
 c.request_review(pid);c.observe_review(pid)
 assert json.loads(c.get_proposal(pid))['status']=='RETRYABLE'
 assert vm.run_validator()
 vm.warp('2026-10-20T12:20:00+00:00');vm.clear_mocks()
 vm.mock_web(r'vendor\.example\.com',{'status':503,'body':'Unavailable'})
 c.request_review(pid);c.observe_review(pid)
 assert vm.run_validator();assert c.owed_to(VENDOR)==0;books(c)

def test_withdraw_keeps_credit_pending_and_emits_once_until_confirmation(deployed,direct_vm):
 c=deployed;vm=direct_vm;pid=propose_and_accept(c,vm);review(c,vm,pid)
 vm.warp('2026-10-20T14:00:00+00:00');c.finalize(pid)
 from genlayer import Address
 vm.sender=Address(VENDOR)
 emissions=[]
 def capture(_vm,request):
  if 'EthSend' in request:
   emissions.append(request['EthSend'])
   return {'ok':None}
  return None
 vm._gl_call_hook=capture
 c.withdraw()
 assert c.owed_to(VENDOR)==10**17
 assert c.withdrawal_pending_for(VENDOR)==10**17
 assert int(json.loads(c.get_accounting())['owed'])==10**17
 assert len(emissions)==1
 assert str(emissions[0]['address']).lower()==VENDOR
 assert int(emissions[0]['value'])==10**17 and emissions[0]['calldata']==b''
 with pytest.raises(AssertionError,match='already pending'):c.withdraw()
 assert len(emissions)==1
 c.confirm_withdrawal()
 assert c.owed_to(VENDOR)==0 and c.withdrawal_pending_for(VENDOR)==0
 assert int(json.loads(c.get_accounting())['owed'])==0
 with pytest.raises(AssertionError,match='no credit'):c.withdraw()
 assert len(emissions)==1

def test_invalid_payable_creation_is_refundable(deployed,direct_vm):
 direct_vm.sender=STRANGER;direct_vm.value=123
 assert deployed.create_mandate(AGENT,'bad','bad','[]',1,1,0)==-1
 direct_vm.value=0
 assert deployed.get_mandate_count()==1 and deployed.owed_to(STRANGER)==123
 books(deployed)

def test_nondeterministic_closures_serialize_without_contract_storage(deployed,direct_vm):
 pid=propose_and_accept(deployed,direct_vm);review(deployed,direct_vm,pid)
 import cloudpickle
 _,leader,validator=direct_vm._captured_validators[-1]
 assert cloudpickle.dumps(leader)
 assert cloudpickle.dumps(validator)
 for fn in (leader,validator):
  captures=dict(zip(fn.__code__.co_freevars,(cell.cell_contents for cell in fn.__closure__ or ())))
  assert 'self' not in captures

def test_validator_scalar_encoding_and_malformed_results(deployed,direct_vm):
 pid=propose_and_accept(deployed,direct_vm);review(deployed,direct_vm,pid)
 assert direct_vm.run_validator()
 assert direct_vm.run_validator(leader_result={'label':'COMPLIANT'}) is False
 assert direct_vm.run_validator(leader_error=RuntimeError('failed leader')) is False
