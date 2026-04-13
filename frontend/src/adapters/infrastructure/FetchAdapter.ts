import { IApiPort } from '../../core/ports/ApiPort';
import { Route, Comparison, PoolMember } from '../../core/domain/Types';

const BASE_URL = 'http://localhost:3001';

export class FetchAdapter implements IApiPort {
    private async request<T>(path: string, options?: RequestInit): Promise<T> {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            }
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ error: 'API Error' }));
            throw new Error(data.error || 'API Error');
        }
        if (res.status === 200 && res.headers.get('content-length') === '0') return null as T;
        return res.json();
    }

    getRoutes(): Promise<Route[]> {
        return this.request<Route[]>('/routes');
    }

    async setBaseline(id: string): Promise<void> {
        await this.request<void>(`/routes/${id}/baseline`, { method: 'POST' });
    }

    getComparison(): Promise<Comparison[]> {
        return this.request<Comparison[]>('/routes/comparison');
    }

    async getAdjustedCB(shipId: string, year: number): Promise<number> {
        const data = await this.request<{ adjusted_cb: number }>(
            `/compliance/adjusted-cb?shipId=${encodeURIComponent(shipId)}&year=${year}`
        );
        return data.adjusted_cb;
    }

    async bankSurplus(shipId: string, year: number): Promise<void> {
        await this.request<void>('/banking/bank', {
            method: 'POST',
            body: JSON.stringify({ shipId, year })
        });
    }

    createPool(year: number, members: PoolMember[]): Promise<any> {
        return this.request('/pools', {
            method: 'POST',
            body: JSON.stringify({ year, members })
        });
    }
}

export const api = new FetchAdapter();
