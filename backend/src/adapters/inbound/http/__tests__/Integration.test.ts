import request from 'supertest';
import { createApp } from '../ExpressApp';
import { AppUseCases } from '../../../../core/application/UseCases';

describe('ExpressApp Integration', () => {
    let mockUseCases: jest.Mocked<AppUseCases>;
    let app: any;

    beforeEach(() => {
        mockUseCases = {
            getRoutes: jest.fn(),
            setBaseline: jest.fn(),
            getComparison: jest.fn(),
            computeCB: jest.fn(),
            getAdjustedCB: jest.fn(),
            bankSurplus: jest.fn(),
            applyBanked: jest.fn(),
            getBankingRecords: jest.fn(),
            createPool: jest.fn(),
        } as any;

        app = createApp(mockUseCases);
    });

    describe('GET /routes', () => {
        it('should return 200 and list of routes', async () => {
            const mockRoutes = [{ route_id: 'R1' }];
            mockUseCases.getRoutes.mockResolvedValue(mockRoutes as any);

            const res = await request(app).get('/routes');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockRoutes);
        });
    });

    describe('POST /routes/:id/baseline', () => {
        it('should return 200 on success', async () => {
            mockUseCases.setBaseline.mockResolvedValue(undefined);

            const res = await request(app).post('/routes/1/baseline');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ ok: true });
        });
    });

    describe('GET /banking/records', () => {
        it('should return 200 and banking records', async () => {
            const mockRecords = [{ id: 'B1', amount_gco2eq: 1000 }];
            mockUseCases.getBankingRecords.mockResolvedValue(mockRecords as any);

            const res = await request(app).get('/banking/records?shipId=S1&year=2024');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockRecords);
            expect(mockUseCases.getBankingRecords).toHaveBeenCalledWith('S1', 2024);
        });
    });

    describe('POST /pools', () => {
        it('should return 200 and pool results', async () => {
            const mockResults = [{ ship_id: 'S1', cb_after: 0 }];
            mockUseCases.createPool.mockResolvedValue(mockResults as any);

            const res = await request(app).post('/pools').send({
                year: 2024,
                members: [{ ship_id: 'S1', cb_current: -100 }]
            });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockResults);
        });

        it('should return 400 if UseCase throws error', async () => {
            mockUseCases.createPool.mockRejectedValue(new Error("Pool sum must be >= 0"));

            const res = await request(app).post('/pools').send({
                year: 2024,
                members: []
            });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Pool sum must be >= 0");
        });
    });
});
