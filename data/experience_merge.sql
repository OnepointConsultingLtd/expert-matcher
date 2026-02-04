select id from public.tb_category where name = 'years of experience';

select 1, string_agg(consultant_id::varchar, ',') from public.tb_category_item ci
inner join public.tb_consultant_category_item_assignment cia on ci.id = cia.category_item_id
where category_id = (select id from public.tb_category where name = 'years of experience') and item = '~6-9 years'
group by 1;

-- new check
select * from public.tb_category_item ci
inner join public.tb_consultant_category_item_assignment cia on ci.id = cia.category_item_id
where category_id = (select id from public.tb_category where name = 'years of experience') and item = '~6-9 years';

-- old check
select * from public.tb_category_item ci
inner join public.tb_consultant_category_item_assignment_backup cia on ci.id = cia.category_item_id
where category_id = (select id from public.tb_category where name = 'years of experience') and item = '~6-9 years';

-- create backup
create table public.tb_consultant_category_item_assignment_backup 
as select * from public.tb_consultant_category_item_assignment;

create table public.tb_consultant_category_item_assignment_backup_1 
as select * from public.tb_consultant_category_item_assignment;

-- restore
delete from public.tb_consultant_category_item_assignment;

insert into public.tb_consultant_category_item_assignment(consultant_id, category_item_id, reason) 
select consultant_id, category_item_id, reason from public.tb_consultant_category_item_assignment_backup;

delete from public.tb_consultant_category_item_assignment

update public.tb_consultant_category_item_assignment set category_item_id = (select id from public.tb_category_item where item = '~6-10 years')
where category_item_id = (select id from public.tb_category_item where item = '~6-9 years') 
on conflict do nothing;

SELECT * from public.tb_category_item old_ci JOIN public.tb_category_item new_ci ON new_ci.item = '~6-10 years'
WHERE old_ci.item = '~6-9 years';

-- Used to merge experience years together
UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~6-10 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~6-9 years'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~6-9 years');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~6-10 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~7 years'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~7 years');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~6-10 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~7-10 years'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~7-10 years');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~6-10 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~8 years'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~8 years');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~6-10 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~8-10 years'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~8-10 years');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~6-10 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~9 years'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~9 years');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~10 years+'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~10 years'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~10 years');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~11-20 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~15 years+'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~15 years+');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~11-20 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~16 years+'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~16 years+');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~21-25 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~21 years+'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~21 years+');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~21-30 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~25 years+'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~25 years+');


UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~21-30 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~25+ years'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~25+ years');

UPDATE public.tb_consultant_category_item_assignment a
SET category_item_id = new_ci.id
FROM public.tb_category_item old_ci
JOIN public.tb_category_item new_ci
  ON new_ci.item = '~26-30 years'
WHERE a.category_item_id = old_ci.id
  AND old_ci.item = '~21-30 years'
  AND NOT EXISTS (
      SELECT 1
      FROM public.tb_consultant_category_item_assignment x
      WHERE x.consultant_id = a.consultant_id
        AND x.category_item_id = new_ci.id
  );

DELETE FROM public.tb_consultant_category_item_assignment a
WHERE category_item_id = (select id from public.tb_category_item where item = '~21-30 years');

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
WHERE category_item_id = (select id from public.tb_category_item where item = '~21-25 years');

DELETE FROM public.tb_category_item
WHERE id IN (
    -- Items in 'years of experience' category
    SELECT id
    FROM public.tb_category_item
    WHERE category_id = (
        SELECT id
        FROM public.tb_category
        WHERE name = 'years of experience'
    )

    EXCEPT

    -- Items currently assigned to consultants
    SELECT DISTINCT category_item_id
    FROM public.tb_consultant_category_item_assignment a
    INNER JOIN public.tb_category_item ci ON ci.id = a.category_item_id
);



