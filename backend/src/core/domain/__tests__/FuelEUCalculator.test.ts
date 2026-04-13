import { FuelEUCalculator } from '../FuelEU';

describe('FuelEUCalculator', () => {
    describe('computeEnergy', () => {
        it('should calculate energy correctly based on fuel weight', () => {
            const fuelWeight = 100;
            const expectedEnergy = 100 * 41000;
            expect(FuelEUCalculator.computeEnergy(fuelWeight)).toBe(expectedEnergy);
        });
    });

    describe('computeCB', () => {
        it('should calculate compliance balance correctly', () => {
            const actualIntensity = 91.00;
            const fuelWeight = 100;
            // CB = (Target - Actual) * Energy
            // Targeted is 89.3368
            const expectedEnergy = 100 * 41000;
            const expectedCB = (89.3368 - 91.00) * expectedEnergy;
            expect(FuelEUCalculator.computeCB(actualIntensity, fuelWeight)).toBeCloseTo(expectedCB, 2);
        });
    });

    describe('allocatePool', () => {
        it('should allocate surplus to deficits correctly', () => {
            const members = [
                { ship_id: 'SurplusShip', cb_current: 500000 },
                { ship_id: 'DeficitShip', cb_current: -200000 }
            ];

            const results = FuelEUCalculator.allocatePool(members);

            const surplus = results.find(r => r.ship_id === 'SurplusShip');
            const deficit = results.find(r => r.ship_id === 'DeficitShip');

            expect(deficit?.cb_after).toBe(0);
            expect(surplus?.cb_after).toBe(300000);
        });

        it('should throw error if pool total is negative', () => {
            const members = [
                { ship_id: 'SurplusShip', cb_current: 100000 },
                { ship_id: 'DeficitShip', cb_current: -200000 }
            ];

            expect(() => FuelEUCalculator.allocatePool(members)).toThrow("Pool sum must be >= 0");
        });
    });
});
