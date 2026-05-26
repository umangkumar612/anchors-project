import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { CreditConfig } from './models/CreditConfig.js';
import { seedDemoData } from './utils/seedDemoData.js';

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

async function bootstrap() {
  await connectDb();
  await CreditConfig.findOneAndUpdate(
    {},
    { $setOnInsert: { baseCredit: 1, incrementValue: 2 } },
    { upsert: true, new: true },
  );
  await seedDemoData();

  const server = app.listen(Number(env.port), () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });

  server.on('error', (error) => {
    if (isNodeError(error) && error.code === 'EADDRINUSE') {
      console.error(`Port ${env.port} is already in use. Stop the other process or set PORT to another value.`);
      process.exit(1);
    }

    throw error;
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
