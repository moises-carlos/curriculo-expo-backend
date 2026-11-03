import express, { Request, Response } from "express";
import cors from "cors";
import curriculosRouter from "./routes/curriculos.js";
import academicasRouter from "./routes/academicas.js";
import profissionaisRouter from "./routes/profissionais.js";
import projetosRouter from "./routes/projetos.js";
import habilidadesRouter from "./routes/habilidades.js";

export const app = express();

app.use(cors());
app.use(express.json());

// Rota raiz com documentação dos endpoints da API
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "API de Currículos (Express + Neon PostgreSQL)",
    version: "1.0.0",
    status: "online",
    endpoints: {
      curriculos: {
        listAll: "GET /api/curriculos",
        getById: "GET /api/curriculos/:id (inclui acadêmicas, profissionais, projetos e habilidades)",
        create: "POST /api/curriculos",
        update: "PUT /api/curriculos/:id",
        delete: "DELETE /api/curriculos/:id (cascade delete)",
      },
      experienciasAcademicas: {
        listByPerson: "GET /api/curriculos/:pessoaId/academicas",
        create: "POST /api/curriculos/:pessoaId/academicas",
        getById: "GET /api/academicas/:id",
        update: "PUT /api/academicas/:id",
        delete: "DELETE /api/academicas/:id",
      },
      experienciasProfissionais: {
        listByPerson: "GET /api/curriculos/:pessoaId/profissionais",
        create: "POST /api/curriculos/:pessoaId/profissionais",
        getById: "GET /api/profissionais/:id",
        update: "PUT /api/profissionais/:id",
        delete: "DELETE /api/profissionais/:id",
      },
      projetos: {
        listByPerson: "GET /api/curriculos/:pessoaId/projetos",
        create: "POST /api/curriculos/:pessoaId/projetos",
        getById: "GET /api/projetos/:id",
        update: "PUT /api/projetos/:id",
        delete: "DELETE /api/projetos/:id",
      },
      habilidades: {
        listByPerson: "GET /api/curriculos/:pessoaId/habilidades",
        create: "POST /api/curriculos/:pessoaId/habilidades",
        getById: "GET /api/habilidades/:id",
        update: "PUT /api/habilidades/:id",
        delete: "DELETE /api/habilidades/:id",
      },
    },
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Rotas da API
app.use("/api/curriculos", curriculosRouter);
app.use("/api", academicasRouter);
app.use("/api", profissionaisRouter);
app.use("/api", projetosRouter);
app.use("/api", habilidadesRouter);

// Handler 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

export default app;
