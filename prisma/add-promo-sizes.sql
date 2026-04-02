-- Add font-size control fields to promotions table
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "titleSize" INTEGER;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "descSize"  INTEGER;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "priceSize" INTEGER;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "badgeSize" INTEGER;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "ctaSize"   INTEGER;
