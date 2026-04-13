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

export interface Comparison {
    route: string;
    baseline_ghg: number;
    comparison_ghg: number;
    percent_diff: number;
    compliant: boolean;
}

export interface PoolMember {
    ship_id: string;
    cb_current: number;
}
