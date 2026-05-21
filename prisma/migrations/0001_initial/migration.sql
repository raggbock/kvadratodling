-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "sun_requirement" AS ENUM ('full_sun', 'part_shade', 'full_shade');

-- CreateEnum
CREATE TYPE "water_need" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "compatibility_type" AS ENUM ('companion', 'antagonist');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gardens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "last_frost_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gardens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beds" (
    "id" TEXT NOT NULL,
    "garden_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rows" INTEGER NOT NULL,
    "cols" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "common_name" TEXT NOT NULL,
    "scientific_name" TEXT,
    "family" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '🌱',
    "plants_per_sqft" DECIMAL(5,2) NOT NULL,
    "sun_requirement" "sun_requirement" NOT NULL,
    "water_need" "water_need" NOT NULL,
    "days_to_maturity_min" INTEGER,
    "days_to_maturity_max" INTEGER,
    "frost_tolerant" BOOLEAN NOT NULL DEFAULT false,
    "sow_indoors_days_before_frost" INTEGER,
    "direct_sow_days_before_frost" INTEGER,
    "transplant_days_after_frost" INTEGER,
    "notes" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_compatibility" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "other_plant_id" TEXT NOT NULL,
    "relationship" "compatibility_type" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "plant_compatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planting_slots" (
    "id" TEXT NOT NULL,
    "bed_id" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "plant_id" TEXT,
    "planted_at" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planting_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "plants_slug_key" ON "plants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "plant_compatibility_plant_id_other_plant_id_key" ON "plant_compatibility"("plant_id", "other_plant_id");

-- CreateIndex
CREATE UNIQUE INDEX "planting_slots_bed_id_row_col_key" ON "planting_slots"("bed_id", "row", "col");

-- AddForeignKey
ALTER TABLE "gardens" ADD CONSTRAINT "gardens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "gardens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_compatibility" ADD CONSTRAINT "plant_compatibility_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_compatibility" ADD CONSTRAINT "plant_compatibility_other_plant_id_fkey" FOREIGN KEY ("other_plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planting_slots" ADD CONSTRAINT "planting_slots_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planting_slots" ADD CONSTRAINT "planting_slots_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
