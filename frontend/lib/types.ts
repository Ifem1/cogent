export type Mandate = {
  id:number; owner:string; agent:string; title:string; policy:string; sources:string[];
  funded:number|string; available:number|string; reserved:number|string; paid:number|string; refunded:number|string;
  per_purchase_cap:number|string; per_vendor_cap:number|string; expires_at:number; created_at:number; closed:boolean;
};
export type Proposal = {
  id:number; mandate_id:number; agent:string; principal:string; vendor:string; amount:number|string;
  offer_url:string; offer_ref:string; product:string; status:string; created_at:number; accept_by:number; accepted_at:number;
  attempts:number; last_attempt:number; review_due:number; phase:string; provisional_code:string; final_code:string;
  challenge_deadline:number; challenge_review_deadline:number; challenge_attempts:number; challenge_outcome:string;
  challenger:string; bond:number|string; primary_manifest:string; challenge_manifest:string; settled_at:number;
};
export type Accounting = {release:string;mandates:number;proposals:number;owed:string|number;bonds_received:string|number;bonds_locked:string|number;bonds_returned:string|number;bonds_forfeited:string|number;refused_payable_value:string|number};
