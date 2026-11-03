import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { app } from "./app.js";
import { initDatabase } from "./schema.js";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
    // Inicializa as tabelas e dados no Neon PostgreSQL
    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
      console.log(`📡 URL base: http://localhost:${PORT}`);
      console.log(`📋 Documentação dos endpoints: http://localhost:${PORT}/`);
      console.log(`👥 Lista de currículos: http://localhost:${PORT}/api/curriculos`);
    });

    return server;
  } catch (error) {
    console.error("Falha ao inicializar a aplicação:", error);
    process.exit(1);
  }
}

// Inicia caso seja o módulo principal
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  bootstrap();
}

export { app, bootstrap };
