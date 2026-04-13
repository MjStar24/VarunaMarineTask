import { Route, Comparison, PoolMember } from '../domain/Types';

export interface IApiPort {
    getRoutes(): Promise<Route[]>;
    setBaseline(id: string): Promise<void>;
    getComparison(): Promise<Comparison[]>;
    getAdjustedCB(shipId: string, year: number): Promise<number>;
    bankSurplus(shipId: string, year: number): Promise<void>;
    createPool(year: number, members: PoolMember[]): Promise<any>;
}
