ALTER TABLE public.tb_category_item ADD sort_order int;

update public.tb_category_item set sort_order = 0
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~6-9 years';

update public.tb_category_item set sort_order = 1
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~6-10 years';

update public.tb_category_item set sort_order = 2
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~7 years';

update public.tb_category_item set sort_order = 3
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~7-10 years';

update public.tb_category_item set sort_order = 4
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~8 years';

update public.tb_category_item set sort_order = 5
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~8-10 years';

update public.tb_category_item set sort_order = 6
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~9 years';

update public.tb_category_item set sort_order = 7
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~10 years';

update public.tb_category_item set sort_order = 8
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~10 years+';

update public.tb_category_item set sort_order = 9
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~11-15 years';

update public.tb_category_item set sort_order = 10
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~11-20 years';

update public.tb_category_item set sort_order = 11
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~15 years+';

update public.tb_category_item set sort_order = 12
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~16 years+';

update public.tb_category_item set sort_order = 13
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~16-20 years';

update public.tb_category_item set sort_order = 14
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~20 years+';

update public.tb_category_item set sort_order = 15
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~21 years+';

update public.tb_category_item set sort_order = 16
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~21-25 years';

update public.tb_category_item set sort_order = 17
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~21-30 years';

update public.tb_category_item set sort_order = 18
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~25 years+';

update public.tb_category_item set sort_order = 19
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~25+ years';

update public.tb_category_item set sort_order = 20
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~26-30 years';

update public.tb_category_item set sort_order = 21
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~30+ years';

update public.tb_category_item set sort_order = 22
where category_id = (SELECT id FROM tb_category WHERE name = 'years of experience') and item = '~35 years+';

ALTER TABLE public.tb_category_item ADD SORT_ORDER INT;

UPDATE public.tb_category_item SET SORT_ORDER = ID - 191
WHERE category_id = (
  SELECT id
  FROM tb_category
  WHERE name = 'company size'
);

UPDATE public.tb_category_item
SET item = regexp_replace(item, '^-', '~')
WHERE category_id = (
  SELECT id
  FROM tb_category
  WHERE name = 'years of experience'
);