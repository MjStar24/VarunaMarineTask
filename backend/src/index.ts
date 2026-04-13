import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaRouteRepo, PrismaBankRepo, PrismaPoolRepo } from './adapters/outbound/postgres/PrismaAdapters';
import { AppUseCases } from './core/application/UseCases';
import { createApp } from './adapters/inbound/http/ExpressApp';

const prisma = new PrismaClient();
const useCases = new AppUseCases(
    new PrismaRouteRepo(prisma),
    new PrismaBankRepo(prisma),
    new PrismaPoolRepo(prisma)
);
const app = createApp(useCases);

app.listen(3001, () => {
    console.log(`Backend running on http://localhost:3001`);
});
