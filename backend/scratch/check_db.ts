
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const routes = await prisma.route.findMany();
  console.log('Routes count:', routes.length);
  console.log('Routes:', JSON.stringify(routes, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
