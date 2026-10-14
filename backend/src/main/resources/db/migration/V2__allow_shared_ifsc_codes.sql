-- IFSC codes identify branches and are intentionally shared by many accounts.
-- Older Hibernate-generated schemas may still have a unique constraint on
-- accounts.ifsc_code even though the current Account entity does not.
DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT c.conname
        FROM pg_constraint c
        WHERE c.conrelid = to_regclass('accounts')
          AND c.contype = 'u'
          AND c.conkey = ARRAY[(
              SELECT a.attnum::smallint
              FROM pg_attribute a
              WHERE a.attrelid = c.conrelid
                AND a.attname = 'ifsc_code'
                AND NOT a.attisdropped
          )]
    LOOP
        EXECUTE format('ALTER TABLE accounts DROP CONSTRAINT %I', constraint_name);
    END LOOP;
END $$;
