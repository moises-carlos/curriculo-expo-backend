import { Router, Request, Response } from "express";
import { sql } from "../db.js";

const router = Router();

// GET /api/curriculos/:pessoaId/academicas - Lista experiências acadêmicas da pessoa
router.get("/curriculos/:pessoaId/academicas", async (req: Request, res: Response) => {
  const pessoaId = Number(req.params.pessoaId);
  if (isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido" });

  try {
    const list = await sql`
      SELECT * FROM experiencias_academicas 
      WHERE pessoa_id = ${pessoaId} 
      ORDER BY data_inicio DESC;
    `;
    res.json(list);
  } catch (error) {
    console.error("Erro ao listar experiências acadêmicas:", error);
    res.status(500).json({ error: "Erro interno ao listar experiências acadêmicas" });
  }
});

// POST /api/curriculos/:pessoaId/academicas - Cria experiência acadêmica
router.post("/curriculos/:pessoaId/academicas", async (req: Request, res: Response) => {
  const pessoaId = Number(req.params.pessoaId);
  if (isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido" });

  const { instituicao, curso, grau, data_inicio, data_fim, atual, descricao } = req.body;

  if (!instituicao || !curso || !data_inicio) {
    return res.status(400).json({ error: "Campos obrigatórios: instituicao, curso, data_inicio." });
  }

  try {
    const result = await sql`
      INSERT INTO experiencias_academicas (
        pessoa_id, instituicao, curso, grau, data_inicio, data_fim, atual, descricao
      ) VALUES (
        ${pessoaId}, ${instituicao}, ${curso}, ${grau || null},
        ${data_inicio}, ${data_fim || null}, ${Boolean(atual)}, ${descricao || null}
      )
      RETURNING *;
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Erro ao criar experiência acadêmica:", error);
    res.status(500).json({ error: "Erro interno ao criar experiência acadêmica" });
  }
});

// GET /api/academicas/:id - Detalha uma experiência acadêmica
router.get("/academicas/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await sql`SELECT * FROM experiencias_academicas WHERE id = ${id};`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Experiência acadêmica não encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Erro ao buscar experiência acadêmica:", error);
    res.status(500).json({ error: "Erro interno ao buscar experiência acadêmica" });
  }
});

// PUT /api/academicas/:id - Atualiza uma experiência acadêmica
router.put("/academicas/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { instituicao, curso, grau, data_inicio, data_fim, atual, descricao } = req.body;

  try {
    const result = await sql`
      UPDATE experiencias_academicas
      SET
        instituicao = COALESCE(${instituicao}, instituicao),
        curso = COALESCE(${curso}, curso),
        grau = COALESCE(${grau}, grau),
        data_inicio = COALESCE(${data_inicio}, data_inicio),
        data_fim = COALESCE(${data_fim}, data_fim),
        atual = COALESCE(${atual !== undefined ? Boolean(atual) : null}, atual),
        descricao = COALESCE(${descricao}, descricao)
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Experiência acadêmica não encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Erro ao atualizar experiência acadêmica:", error);
    res.status(500).json({ error: "Erro interno ao atualizar experiência acadêmica" });
  }
});

// DELETE /api/academicas/:id - Deleta uma experiência acadêmica
router.delete("/academicas/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const deleted = await sql`DELETE FROM experiencias_academicas WHERE id = ${id} RETURNING id;`;
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Experiência acadêmica não encontrada" });
    }
    res.json({ message: "Experiência acadêmica removida com sucesso", id: deleted[0].id });
  } catch (error) {
    console.error("Erro ao remover experiência acadêmica:", error);
    res.status(500).json({ error: "Erro interno ao remover experiência acadêmica" });
  }
});

export default router;
