import { FuelEUCalculator, PoolMemberInput } from '../domain/FuelEU';
import { IRouteRepository, IBankRepository, IPoolRepository } from '../ports/Repositories';

export class AppUseCases {
    constructor(
        private routeRepo: IRouteRepository,
        private bankRepo: IBankRepository,
        private poolRepo: IPoolRepository
    ) { }

    async getRoutes() {
        return this.routeRepo.findAll();
    }

    async setBaseline(id: string) {
        return this.routeRepo.setBaseline(id);
    }

    async getComparison() {
        const routes = await this.routeRepo.findAll();
        const baseline = await this.routeRepo.getBaseline();
        if (!baseline) throw new Error("No baseline set");

        return routes.map(r => ({
            route: r.route_id,
            baseline_ghg: baseline.ghg_intensity,
            comparison_ghg: r.ghg_intensity,
            percent_diff: ((r.ghg_intensity / baseline.ghg_intensity) - 1) * 100,
            compliant: r.ghg_intensity <= 89.3368
        }));
    }

    async computeCB(shipId: string, year: number) {
        const routes = await this.routeRepo.findAll();
        const route = routes.find(r => r.route_id === shipId);
        if (!route) return 0;
        return FuelEUCalculator.computeCB(route.ghg_intensity, route.fuel_consumption_t);
    }

    async getAdjustedCB(shipId: string, year: number) {
        const baseCb = await this.computeCB(shipId, year);
        const netBanked = await this.bankRepo.getNetBanked(shipId, year);
        return baseCb + netBanked;
    }

    async bankSurplus(shipId: string, year: number) {
        const cb = await this.getAdjustedCB(shipId, year);
        if (cb <= 0) throw new Error("Only positive CB can be banked");
        return this.bankRepo.saveEntry({ ship_id: shipId, year, amount_gco2eq: cb, type: 'BANKED' });
    }

    async applyBanked(shipId: string, year: number, amount: number) {
        const cb = await this.getAdjustedCB(shipId, year);
        const available = await this.bankRepo.getNetBanked(shipId, year);

        if (amount > available) throw new Error("Insufficient banked surplus");
        if (cb >= 0) throw new Error("Cannot apply to positive CB");

        await this.bankRepo.saveEntry({ ship_id: shipId, year, amount_gco2eq: -amount, type: 'APPLIED' });
        return { cb_before: cb, applied: amount, cb_after: cb + amount };
    }

    async getBankingRecords(shipId: string, year: number) {
        return this.bankRepo.getEntries(shipId, year);
    }

    async createPool(year: number, members: PoolMemberInput[]) {
        const results = FuelEUCalculator.allocatePool(members);
        await this.poolRepo.createPool(year, results);
        return results;
    }
}
