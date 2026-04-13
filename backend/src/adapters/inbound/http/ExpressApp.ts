import express from 'express';
import cors from 'cors';
import { AppUseCases } from '../../../core/application/UseCases';

export function createApp(useCases: AppUseCases) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Routes
    app.get('/routes', async (req, res) => {
        try {
            res.json(await useCases.getRoutes());
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/routes/:id/baseline', async (req, res) => {
        try {
            await useCases.setBaseline(req.params.id);
            res.json({ ok: true });
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    app.get('/routes/comparison', async (req, res) => {
        try {
            res.json(await useCases.getComparison());
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    // Compliance
    app.get('/compliance/cb', async (req, res) => {
        try {
            const cb = await useCases.computeCB(String(req.query.shipId), Number(req.query.year));
            res.json({ cb });
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    app.get('/compliance/adjusted-cb', async (req, res) => {
        try {
            const adjusted_cb = await useCases.getAdjustedCB(String(req.query.shipId), Number(req.query.year));
            res.json({ adjusted_cb });
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    // Banking
    app.post('/banking/bank', async (req, res) => {
        try {
            res.json(await useCases.bankSurplus(req.body.shipId, req.body.year));
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    app.post('/banking/apply', async (req, res) => {
        try {
            res.json(await useCases.applyBanked(req.body.shipId, req.body.year, req.body.amount));
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    app.get('/banking/records', async (req, res) => {
        try {
            res.json(await useCases.getBankingRecords(String(req.query.shipId), Number(req.query.year)));
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    // Pools
    app.post('/pools', async (req, res) => {
        try {
            res.json(await useCases.createPool(req.body.year, req.body.members));
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    return app;
}
