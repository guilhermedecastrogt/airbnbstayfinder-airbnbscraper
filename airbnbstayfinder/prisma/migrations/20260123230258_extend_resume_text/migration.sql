-- CreateTable
CREATE TABLE `AirbnbStay` (
    `id` VARCHAR(191) NOT NULL,
    `room_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subTitle` VARCHAR(191) NOT NULL,
    `isFreeCancellation` BOOLEAN NOT NULL,
    `price` DOUBLE NOT NULL,
    `priceWithoutDiscount` DOUBLE NULL,
    `rating` DOUBLE NULL,
    `ratingCount` INTEGER NULL,
    `personCapacity` INTEGER NULL,
    `hostName` VARCHAR(191) NULL,
    `hostId` VARCHAR(191) NULL,
    `isCompatible` BOOLEAN NOT NULL,
    `compatibilityScore` INTEGER NOT NULL,
    `resume` TEXT NOT NULL,
    `interest` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AirbnbStay_room_id_key`(`room_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AirbnbStayImage` (
    `id` VARCHAR(191) NOT NULL,
    `stayId` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AirbnbStayImage` ADD CONSTRAINT `AirbnbStayImage_stayId_fkey` FOREIGN KEY (`stayId`) REFERENCES `AirbnbStay`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
