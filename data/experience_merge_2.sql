create table public.tb_consultant_category_item_assignment_backup_1 
as select * from public.tb_consultant_category_item_assignment;

delete from public.tb_consultant_category_item_assignment;

insert into public.tb_consultant_category_item_assignment(consultant_id, category_item_id, reason) 
select consultant_id, category_item_id, reason from public.tb_consultant_category_item_assignment_backup_1;

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~11-15 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~10 years+'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~10 years+');


UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~21-25 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~20 years+'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~20 years+');

UPDATE public.tb_category_item SET item = '~30 years+'
WHERE item = '~35 years+';

UPDATE public.tb_category_item SET item = '~15-20 years'
WHERE item = '~11-20 years';

select * from public.tb_consultant_category_item_assignment
where category_item_id = (select id from public.tb_category_item where item = '~30+ years');

update public.tb_consultant_category_item_assignment 
set category_item_id = (select id from public.tb_category_item where item = '~30 years+')
where category_item_id = (select id from public.tb_category_item where item = '~30+ years');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~30+ years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~30 years+'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~30 years+');

select item from public.tb_category_item
where category_id = (select category_id from public.tb_category_item where item like '%30 years+');

update public.tb_category_item set item = replace(item, '~', '')
where category_id = (select category_id from public.tb_category_item where item = '~30 years+');

