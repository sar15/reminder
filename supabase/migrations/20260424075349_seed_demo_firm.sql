insert into firms (id, name, partner_name, email, phone, plan, client_limit)
values (
  '00000000-0000-0000-0000-000000000001',
  'Demo CA Firm',
  'Demo Partner',
  'demo@cafirm.com',
  '+91 98765 43210',
  'professional',
  100
)
on conflict (id) do nothing;;
