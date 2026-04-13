import { Route, BankEntry, PoolResult } from '../domain/FuelEU';

export interface IRouteRepository {
    findAll(): Promise<Route[]>;
    getBaseline(): Promise<Route | null>;
    setBaseline(id: string): Promise<void>;
}

export interface IBankRepository {
    getEntries(shipId: string, year: number): Promise<BankEntry[]>;
    saveEntry(entry: Omit<BankEntry, 'id'>): Promise<BankEntry>;
    getNetBanked(shipId: string, year: number): Promise<number>;
}

export interface IPoolRepository {
    createPool(year: number, members: PoolResult[]): Promise<void>;
}
