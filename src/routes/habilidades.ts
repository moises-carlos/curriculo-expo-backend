import { Router, Request, Response } from "express";
import { sql } from "../db.js";

const router = Router();

// GET /api/curriculos/:pessoaId/habilidades - Lista habilidades da pessoa
router.get("/curriculos/:pessoaId/habilidades", async (req: Request, res: Response) => {
  const pessoaId = Number(req.params.pessoaId);
  if (isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido" });

  try {
    const list = await sql`
      SELECT * FROM habilidades 
      WHERE pessoa_id = ${pessoaId} 
      ORDER BY categoria, nome;
    `;
    res.json(list);
  } catch (error) {
    console.error("Erro ao listar habilidades:", error);
    res.status(500).json({ error: "Erro interno ao listar habilidades" });
  }
});

// POST /api/curriculos/:pessoaId/habilidades - Adiciona habilidade
router.post("/curriculos/:pessoaId/habilidades", async (req: Request, res: Response) => {
  const pessoaId = Number(req.params.pessoaId);
  if (isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido" });

  const { nome, nivel, categoria } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "O campo 'nome' da habilidade é obrigatório." });
  }

  try {
    const result = await sql`
      INSERT INTO habilidades (
        pessoa_id, nome, nivel, categoria
      ) VALUES (
        ${pessoaId}, ${nome}, ${nivel || null}, ${categoria || null}
      )
      RETURNING *;
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Erro ao cadastrar habilidade:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar habilidade" });
  }
});

// GET /api/habilidades/:id - Detalhes de uma habilidade
router.get("/habilidades/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await sql`SELECT * FROM habilidades WHERE id = ${id};`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Habilidade não encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Erro ao buscar habilidade:", error);
    res.status(500).json({ error: "Erro interno ao buscar habilidade" });
  }
});

// PUT /api/habilidades/:id - Atualiza uma habilidade
router.put("/habilidades/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { nome, nivel, categoria } = req.body;

  try {
    const result = await sql`
      UPDATE habilidades
      SET
        nome = COALESCE(${nome}, nome),
        nivel = COALESCE(${nivel}, nivel),
        categoria = COALESCE(${categoria}, categoria)
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Habilidade não encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Erro ao atualizar habilidade:", error);
    res.status(500).json({ error: "Erro interno ao atualizar habilidade" });
  }
});

// DELETE /api/habilidades/:id - Deleta uma habilidade
router.delete("/habilidades/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const deleted = await sql`DELETE FROM habilidades WHERE id = ${id} RETURNING id;`;
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Habilidade não encontrada" });
    }
    res.json({ message: "Habilidade removida com sucesso", id: deleted[0].id });
  } catch (error) {
    console.error("Erro ao remover habilidade:", error);
    res.status(500).json({ error: "Erro interno ao remover habilidade" });
  }
});

export default router;
