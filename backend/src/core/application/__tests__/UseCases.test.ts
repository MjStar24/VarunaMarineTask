import { AppUseCases } from '../UseCases';
import { IRouteRepository, IBankRepository, IPoolRepository } from '../../ports/Repositories';

describe('AppUseCases', () => {
    let useCases: AppUseCases;
    let mockRouteRepo: jest.Mocked<IRouteRepository>;
    let mockBankRepo: jest.Mocked<IBankRepository>;
    let mockPoolRepo: jest.Mocked<IPoolRepository>;

    beforeEach(() => {
        mockRouteRepo = {
            findAll: jest.fn(),
            getBaseline: jest.fn(),
            setBaseline: jest.fn(),
        } as any;

        mockBankRepo = {
            getEntries: jest.fn(),
            saveEntry: jest.fn(),
            getNetBanked: jest.fn(),
        } as any;

        mockPoolRepo = {
            createPool: jest.fn(),
        } as any;

        useCases = new AppUseCases(mockRouteRepo, mockBankRepo, mockPoolRepo);
    });

    describe('getComparison', () => {
        it('should return comparison data relative to baseline', async () => {
            const mockRoutes = [
                { id: '1', route_id: 'R1', ghg_intensity: 91.0, fuel_consumption_t: 100, is_baseline: true },
                { id: '2', route_id: 'R2', ghg_intensity: 88.0, fuel_consumption_t: 100, is_baseline: false }
            ];
            mockRouteRepo.findAll.mockResolvedValue(mockRoutes as any);
            mockRouteRepo.getBaseline.mockResolvedValue(mockRoutes[0] as any);

            const result = await useCases.getComparison();

            expect(result).toHaveLength(2);
            expect(result[1].route).toBe('R2');
            expect(result[1].percent_diff).toBeCloseTo(((88.0 / 91.0) - 1) * 100, 2);
            expect(result[1].compliant).toBe(true); // 88.0 < 89.3368
        });

        it('should throw error if no baseline exists', async () => {
            mockRouteRepo.getBaseline.mockResolvedValue(null);
            await expect(useCases.getComparison()).rejects.toThrow("No baseline set");
        });
    });

    describe('banking logic', () => {
        it('should bank positive surplus', async () => {
            const shipId = 'Ship1';
            const year = 2024;
            // Mock computeCB logic (91.0 - 89.3368) * negative energy? No.
            // computeCB: (Target - Actual) * Energy
            // Targeted: 89.3368. Actual: 80.0. Energy: 41000 * 10
            const mockRoute = { route_id: shipId, ghg_intensity: 80.0, fuel_consumption_t: 10 };
            mockRouteRepo.findAll.mockResolvedValue([mockRoute] as any);
            mockBankRepo.getNetBanked.mockResolvedValue(0);

            await useCases.bankSurplus(shipId, year);

            expect(mockBankRepo.saveEntry).toHaveBeenCalledWith(expect.objectContaining({
                type: 'BANKED',
                ship_id: shipId
            }));
        });

        it('should prevent banking negative CB', async () => {
            const shipId = 'Ship1';
            const year = 2024;
            const mockRoute = { route_id: shipId, ghg_intensity: 100.0, fuel_consumption_t: 10 };
            mockRouteRepo.findAll.mockResolvedValue([mockRoute] as any);
            mockBankRepo.getNetBanked.mockResolvedValue(0);

            await expect(useCases.bankSurplus(shipId, year)).rejects.toThrow("Only positive CB can be banked");
        });
    });
});
