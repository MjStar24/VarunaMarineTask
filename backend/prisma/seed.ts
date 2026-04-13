import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.route.createMany({
        data: [
            { route_id: 'R001', vessel_type: 'Container', fuel_type: 'HFO', year: 2024, ghg_intensity: 91.0, fuel_consumption_t: 5000, distance_km: 12000, total_emissions_t: 4500, is_baseline: true },
            { route_id: 'R002', vessel_type: 'BulkCarrier', fuel_type: 'LNG', year: 2024, ghg_intensity: 88.0, fuel_consumption_t: 4800, distance_km: 11500, total_emissions_t: 4200, is_baseline: false },
            { route_id: 'R003', vessel_type: 'Tanker', fuel_type: 'MGO', year: 2024, ghg_intensity: 93.5, fuel_consumption_t: 5100, distance_km: 12500, total_emissions_t: 4700, is_baseline: false },
            { route_id: 'R004', vessel_type: 'RoRo', fuel_type: 'HFO', year: 2025, ghg_intensity: 89.2, fuel_consumption_t: 4900, distance_km: 11800, total_emissions_t: 4300, is_baseline: false },
            { route_id: 'R005', vessel_type: 'Container', fuel_type: 'LNG', year: 2025, ghg_intensity: 90.5, fuel_consumption_t: 4950, distance_km: 11900, total_emissions_t: 4400, is_baseline: false }
        ],
        skipDuplicates: true
    });
    console.log("Database seeded!");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => await prisma.$disconnect());
