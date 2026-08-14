import 'dotenv/config';
import app from './app.js';
import { probarConexion } from './config/db.js';

const PUERTO = Number(process.env.PUERTO ?? 3000);

try {
  await probarConexion();
  console.log('Conexión con la base de datos establecida');

  app.listen(PUERTO, () => {
    console.log(`API disponible en http://localhost:${PUERTO}/api`);
  });
} catch (err) {
  console.error('No fue posible conectar con la base de datos:', err.message);
  console.error('Verifique que los contenedores estén activos: docker compose up -d');
  process.exit(1);
}
