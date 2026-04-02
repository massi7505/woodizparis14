-- ============================================================
-- CORRECTION : tables et colonnes manquantes
-- À exécuter dans phpMyAdmin sur la base u898972308_woodizapp2
-- ============================================================

-- 1. Ajouter la colonne videoUrl dans hero_slides (si elle n'existe pas)
ALTER TABLE `hero_slides`
  ADD COLUMN IF NOT EXISTS `videoUrl` VARCHAR(191) NULL AFTER `imageUrl`;

-- 2. Créer la table notification_banners (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS `notification_banners` (
  `id`              INT            NOT NULL AUTO_INCREMENT,
  `isVisible`       TINYINT(1)     NOT NULL DEFAULT 1,
  `bgColor`         VARCHAR(191)   NOT NULL DEFAULT '#1F2937',
  `textColor`       VARCHAR(191)   NOT NULL DEFAULT '#F59E0B',
  `icon`            VARCHAR(191)   NULL,
  `link`            VARCHAR(191)   NULL,
  `linkLabel`       VARCHAR(191)   NULL,
  `priority`        INT            NOT NULL DEFAULT 0,
  `displayDuration` INT            NOT NULL DEFAULT 8000,
  `animType`        VARCHAR(191)   NOT NULL DEFAULT 'slide',
  `type`            VARCHAR(191)   NOT NULL DEFAULT 'custom',
  `scheduleEnabled` TINYINT(1)     NOT NULL DEFAULT 0,
  `scheduleStart`   VARCHAR(191)   NULL,
  `scheduleEnd`     VARCHAR(191)   NULL,
  `scheduleDays`    VARCHAR(191)   NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
  `sortOrder`       INT            NOT NULL DEFAULT 0,
  `createdAt`       DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`       DATETIME(3)    NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Créer la table notification_banner_translations (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS `notification_banner_translations` (
  `id`       INT          NOT NULL AUTO_INCREMENT,
  `bannerId` INT          NOT NULL,
  `locale`   VARCHAR(191) NOT NULL,
  `text`     TEXT         NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_banner_translations_bannerId_locale_key` (`bannerId`, `locale`),
  CONSTRAINT `notification_banner_translations_bannerId_fkey`
    FOREIGN KEY (`bannerId`) REFERENCES `notification_banners` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
