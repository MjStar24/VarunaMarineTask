import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../adapters/infrastructure/FetchAdapter';
import { PoolMember } from '../domain/Types';

export const useRoutes = () =>
    useQuery({ queryKey: ['routes'], queryFn: () => api.getRoutes() });

export const useComparison = () =>
    useQuery({ queryKey: ['comparison'], queryFn: () => api.getComparison() });

export const useCB = (shipId: string, year: number) =>
    useQuery({
        queryKey: ['cb', shipId, year],
        queryFn: () => api.getAdjustedCB(shipId, year),
        enabled: !!shipId && !!year
    });

export const useSetBaseline = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.setBaseline(id),
        onSuccess: () => {
            qc.refetchQueries({ queryKey: ['routes'] });
            qc.refetchQueries({ queryKey: ['comparison'] });
        },
        onError: (err) => {
            console.error('Set baseline failed:', err);
        }
    });
};

export const useBankSurplus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ shipId, year }: { shipId: string; year: number }) =>
            api.bankSurplus(shipId, year),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cb'] })
    });
};

export const useCreatePool = () =>
    useMutation({
        mutationFn: ({ year, members }: { year: number; members: PoolMember[] }) =>
            api.createPool(year, members)
    });
