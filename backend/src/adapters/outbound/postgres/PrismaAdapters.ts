import { PrismaClient } from '@prisma/client';
import { IRouteRepository, IBankRepository, IPoolRepository } from '../../../core/ports/Repositories';
import { Route, BankEntry, PoolResult } from '../../../core/domain/FuelEU';

export class PrismaRouteRepo implements IRouteRepository {
    constructor(private prisma: PrismaClient) { }

    async findAll(): Promise<Route[]> {
        return this.prisma.route.findMany();
    }

    async getBaseline(): Promise<Route | null> {
        return this.prisma.route.findFirst({ where: { is_baseline: true } });
    }

    async setBaseline(id: string): Promise<void> {
        await this.prisma.route.updateMany({ data: { is_baseline: false } });
        await this.prisma.route.update({ where: { id }, data: { is_baseline: true } });
    }
}

export class PrismaBankRepo implements IBankRepository {
    constructor(private prisma: PrismaClient) { }

    async getEntries(shipId: string, year: number): Promise<BankEntry[]> {
        return this.prisma.bankEntry.findMany({ where: { ship_id: shipId, year } }) as any;
    }

    async saveEntry(entry: Omit<BankEntry, 'id'>): Promise<BankEntry> {
        return this.prisma.bankEntry.create({ data: entry }) as any;
    }

    async getNetBanked(shipId: string, year: number): Promise<number> {
        const entries = await this.getEntries(shipId, year);
        return entries.reduce((acc, r) => acc + r.amount_gco2eq, 0);
    }
}

export class PrismaPoolRepo implements IPoolRepository {
    constructor(private prisma: PrismaClient) { }

    async createPool(year: number, members: PoolResult[]): Promise<void> {
        await this.prisma.pool.create({
            data: {
                year,
                members: {
                    create: members.map(m => ({
                        ship_id: m.ship_id,
                        cb_before: m.cb_before,
                        cb_after: m.cb_after
                    }))
                }
            }
        });
    }
}
