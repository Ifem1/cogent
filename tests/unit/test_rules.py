"""Local pure-helper tests; NOT GenVM Direct Mode execution tests."""
import ast
from pathlib import Path

code = Path(__file__).resolve().parents[2].joinpath('contracts/cogent.py').read_text()
mod=ast.parse(code)
wanted={'_address','_source_prefix','_offer_url','_label','_bond'}
namespace={'ALLOW':'COMPLIANT','DENY':'NON_COMPLIANT','UNKNOWN':'INCONCLUSIVE','NO_SOURCE':'SOURCE_UNAVAILABLE','INVALID':'MODEL_OUTPUT_INVALID','BOND_BPS':500}
exec(compile(ast.Module(body=[n for n in mod.body if isinstance(n,ast.FunctionDef) and n.name in wanted],type_ignores=[]),'rules','exec'),namespace)
address=namespace['_address'];prefix=namespace['_source_prefix'];url=namespace['_offer_url'];label=namespace['_label'];bond=namespace['_bond']
import pytest

@pytest.mark.parametrize('raw,expected',[
 ('COMPLIANT','COMPLIANT'),(' NON_COMPLIANT ','NON_COMPLIANT'),('"INCONCLUSIVE"','INCONCLUSIVE'),("'COMPLIANT'",'COMPLIANT'),
 ('SOURCE_UNAVAILABLE','SOURCE_UNAVAILABLE'),('other','MODEL_OUTPUT_INVALID'),('COMPLIANT because ...','MODEL_OUTPUT_INVALID'),
 ('```COMPLIANT```','MODEL_OUTPUT_INVALID'),('compliant','MODEL_OUTPUT_INVALID'),('{}','MODEL_OUTPUT_INVALID'),(None,'MODEL_OUTPUT_INVALID'),
 (['COMPLIANT'],'MODEL_OUTPUT_INVALID')])
def test_label(raw,expected):assert label(raw)==expected

@pytest.mark.parametrize('n,result',[(1,1),(199,10),(200,10),(10000,500),(10**18,5*10**16)])
def test_bond(n,result):assert bond(n)==result

@pytest.mark.parametrize('bad',['http://vendor.test/','https://a.test?token=secret','https://user@vendor.test/','https://vendor.test:8080/',
 'https://localhost/','https://127.0.0.1/','https://vendor.test/legal','https://vendor.test/#anchor', 'https://vendor.test/x y/'])
def test_source_rejects(bad):
 with pytest.raises((ValueError,AssertionError)):prefix(bad)

def test_source_and_offer_validation():
 src=prefix('https://docs.vendor.test/offers/')
 assert src=='https://docs.vendor.test/offers/'
 assert url('https://docs.vendor.test/offers/p1',[src])=='https://docs.vendor.test/offers/p1'
 with pytest.raises(ValueError):url('https://docs.vendor.test.evil.org/offers/p1',[src])
 with pytest.raises(ValueError):url('https://docs.vendor.test/legal/p1',[src])

def test_address_rejects_zero_and_incomplete():
 assert address('0x'+'A'*40)=='0x'+'a'*40
 for a in ('0x'+'0'*40,'0x123','0x'+'g'*40):
  with pytest.raises(ValueError):address(a)

@pytest.mark.parametrize('path',['../private','a/../../private','%2e%2e/private','a%2f..%2fprivate','quote\\private','quote\tsecret','quote\rsecret','quote\nsecret'])
def test_offer_cannot_escape_frozen_source(path):
 with pytest.raises(ValueError):url('https://docs.vendor.test/offers/'+path,['https://docs.vendor.test/offers/'])

@pytest.mark.parametrize('host',['172.16.0.1','169.254.169.254','0.0.0.0','2130706433','a.localhost','-a.test','a..test','a_test.com'])
def test_source_rejects_unsafe_authorities(host):
 with pytest.raises(ValueError):prefix('https://'+host+'/')

@pytest.mark.parametrize('path',['../','a/../../','%2e%2e/'])
def test_frozen_prefix_rejects_traversal(path):
 with pytest.raises(ValueError):prefix('https://docs.vendor.test/offers/'+path)
