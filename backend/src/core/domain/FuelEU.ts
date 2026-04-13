export const CONSTANTS = { TARGET_2025: 89.3368, ENERGY_FACTOR: 41000 };

export interface Route {
    id: string;
    route_id: string;
    year: number;
    ghg_intensity: number;
    fuel_consumption_t: number;
    distance_km: number;
    total_emissions_t: number;
    vessel_type: string;
    fuel_type: string;
    is_baseline: boolean;
}

export interface BankEntry {
    id: string;
    ship_id: string;
    year: number;
    amount_gco2eq: number;
    type: 'BANKED' | 'APPLIED';
}

export interface PoolMemberInput {
    ship_id: string;
    cb_current: number;
}

export interface PoolResult {
    ship_id: string;
    cb_before: number;
    cb_after: number;
}

export class FuelEUCalculator {
    static computeEnergy(fuel_t: number): number {
        return fuel_t * CONSTANTS.ENERGY_FACTOR;
    }

    static computeCB(actual_intensity: number, fuel_t: number): number {
        return (CONSTANTS.TARGET_2025 - actual_intensity) * this.computeEnergy(fuel_t);
    }

    static allocatePool(members: PoolMemberInput[]): PoolResult[] {
        const sum = members.reduce((acc, m) => acc + m.cb_current, 0);
        if (sum < 0) throw new Error("Pool sum must be >= 0");

        let results = members.map(m => ({
            ship_id: m.ship_id,
            cb_before: m.cb_current,
            cb_after: m.cb_current
        }));

        results.sort((a, b) => b.cb_before - a.cb_before); // Descending

        let deficits = results.filter(m => m.cb_before < 0);
        let surpluses = results.filter(m => m.cb_before > 0);

        for (let d of deficits) {
            let needed = Math.abs(d.cb_after);
            for (let s of surpluses) {
                if (needed === 0) break;
                if (s.cb_after > 0) {
                    const transfer = Math.min(s.cb_after, needed);
                    s.cb_after -= transfer;
                    d.cb_after += transfer;
                    needed -= transfer;
                }
            }
            if (d.cb_after < d.cb_before) throw new Error("Deficit ship worsened");
        }

        surpluses.forEach(s => {
            if (s.cb_after < 0) throw new Error("Surplus ship became negative");
        });

        return results;
    }
}
