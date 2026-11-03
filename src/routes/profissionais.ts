import { Router, Request, Response } from "express";
import { sql } from "../db.js";

const router = Router();

// GET /api/curriculos/:pessoaId/profissionais - Lista experiências profissionais da pessoa
router.get("/curriculos/:pessoaId/profissionais", async (req: Request, res: Response) => {
  const pessoaId = Number(req.params.pessoaId);
  if (isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido" });

  try {
    const list = await sql`
      SELECT * FROM experiencias_profissionais 
      WHERE pessoa_id = ${pessoaId} 
      ORDER BY data_inicio DESC;
    `;
    res.json(list);
  } catch (error) {
    console.error("Erro ao listar experiências profissionais:", error);
    res.status(500).json({ error: "Erro interno ao listar experiências profissionais" });
  }
});

// POST /api/curriculos/:pessoaId/profissionais - Cria experiência profissional
router.post("/curriculos/:pessoaId/profissionais", async (req: Request, res: Response) => {
  const pessoaId = Number(req.params.pessoaId);
  if (isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido" });

  const { empresa, cargo, localizacao, data_inicio, data_fim, atual, descricao, tecnologias } = req.body;

  if (!empresa || !cargo || !data_inicio) {
    return res.status(400).json({ error: "Campos obrigatórios: empresa, cargo, data_inicio." });
  }

  try {
    const result = await sql`
      INSERT INTO experiencias_profissionais (
        pessoa_id, empresa, cargo, localizacao, data_inicio, data_fim, atual, descricao, tecnologias
      ) VALUES (
        ${pessoaId}, ${empresa}, ${cargo}, ${localizacao || null},
        ${data_inicio}, ${data_fim || null}, ${Boolean(atual)}, ${descricao || null},
        ${tecnologias || null}
      )
      RETURNING *;
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Erro ao criar experiência profissional:", error);
    res.status(500).json({ error: "Erro interno ao criar experiência profissional" });
  }
});

// GET /api/profissionais/:id - Detalha uma experiência profissional
router.get("/profissionais/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await sql`SELECT * FROM experiencias_profissionais WHERE id = ${id};`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Experiência profissional não encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Erro ao buscar experiência profissional:", error);
    res.status(500).json({ error: "Erro interno ao buscar experiência profissional" });
  }
});

// PUT /api/profissionais/:id - Atualiza uma experiência profissional
router.put("/profissionais/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { empresa, cargo, localizacao, data_inicio, data_fim, atual, descricao, tecnologias } = req.body;

  try {
    const result = await sql`
      UPDATE experiencias_profissionais
      SET
        empresa = COALESCE(${empresa}, empresa),
        cargo = COALESCE(${cargo}, cargo),
        localizacao = COALESCE(${localizacao}, localizacao),
        data_inicio = COALESCE(${data_inicio}, data_inicio),
        data_fim = COALESCE(${data_fim}, data_fim),
        atual = COALESCE(${atual !== undefined ? Boolean(atual) : null}, atual),
        descricao = COALESCE(${descricao}, descricao),
        tecnologias = COALESCE(${tecnologias}, tecnologias)
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Experiência profissional não encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Erro ao atualizar experiência profissional:", error);
    res.status(500).json({ error: "Erro interno ao atualizar experiência profissional" });
  }
});

// DELETE /api/profissionais/:id - Deleta uma experiência profissional
router.delete("/profissionais/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const deleted = await sql`DELETE FROM experiencias_profissionais WHERE id = ${id} RETURNING id;`;
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Experiência profissional não encontrada" });
    }
    res.json({ message: "Experiência profissional removida com sucesso", id: deleted[0].id });
  } catch (error) {
    console.error("Erro ao remover experiência profissional:", error);
    res.status(500).json({ error: "Erro interno ao remover experiência profissional" });
  }
});

export default router;
