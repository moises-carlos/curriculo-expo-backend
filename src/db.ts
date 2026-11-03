import dns from "node:dns";
import { neon, Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Força o Node.js a priorizar IPv4 para evitar ETIMEDOUT em redes com IPv6 inacessível
dns.setDefaultResultOrder("ipv4first");

// Carrega as variáveis de ambiente (.env.local, .env ou injetadas pela Vercel)
dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não configurada no arquivo de ambiente (.env.local ou .env).");
}

// Cliente HTTP serverless do Neon (ideal para consultas rápidas / edge / serverless)
export const sql = neon(connectionString);

// Pool WebSocket do Neon (para transações ou suporte a pool tradicional)
export const pool = new Pool({ connectionString });
