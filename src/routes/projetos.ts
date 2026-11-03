import { Router, Request, Response } from "express";
import { sql } from "../db.js";

const router = Router();

// GET /api/curriculos/:pessoaId/projetos - Lista projetos da pessoa
router.get("/curriculos/:pessoaId/projetos", async (req: Request, res: Response) => {
  const pessoaId = Number(req.params.pessoaId);
  if (isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido" });

  try {
    const list = await sql`
      SELECT * FROM projetos 
      WHERE pessoa_id = ${pessoaId} 
      ORDER BY id ASC;
    `;
    res.json(list);
  } catch (error) {
    console.error("Erro ao listar projetos:", error);
    res.status(500).json({ error: "Erro interno ao listar projetos" });
  }
});

// POST /api/curriculos/:pessoaId/projetos - Cria novo projeto
router.post("/curriculos/:pessoaId/projetos", async (req: Request, res: Response) => {
  const pessoaId = Number(req.params.pessoaId);
  if (isNaN(pessoaId)) return res.status(400).json({ error: "ID de pessoa inválido" });

  const { titulo, descricao, link_projeto, link_repositorio, data, tecnologias } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: "O campo 'titulo' é obrigatório." });
  }

  try {
    const result = await sql`
      INSERT INTO projetos (
        pessoa_id, titulo, descricao, link_projeto, link_repositorio, data, tecnologias
      ) VALUES (
        ${pessoaId}, ${titulo}, ${descricao || null}, ${link_projeto || null},
        ${link_repositorio || null}, ${data || null}, ${tecnologias || null}
      )
      RETURNING *;
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Erro ao cadastrar projeto:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar projeto" });
  }
});

// GET /api/projetos/:id - Detalhes de um projeto
router.get("/projetos/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await sql`SELECT * FROM projetos WHERE id = ${id};`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Projeto não encontrado" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
    res.status(500).json({ error: "Erro interno ao buscar projeto" });
  }
});

// PUT /api/projetos/:id - Atualiza um projeto
router.put("/projetos/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { titulo, descricao, link_projeto, link_repositorio, data, tecnologias } = req.body;

  try {
    const result = await sql`
      UPDATE projetos
      SET
        titulo = COALESCE(${titulo}, titulo),
        descricao = COALESCE(${descricao}, descricao),
        link_projeto = COALESCE(${link_projeto}, link_projeto),
        link_repositorio = COALESCE(${link_repositorio}, link_repositorio),
        data = COALESCE(${data}, data),
        tecnologias = COALESCE(${tecnologias}, tecnologias)
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Projeto não encontrado" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    res.status(500).json({ error: "Erro interno ao atualizar projeto" });
  }
});

// DELETE /api/projetos/:id - Deleta um projeto
router.delete("/projetos/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const deleted = await sql`DELETE FROM projetos WHERE id = ${id} RETURNING id;`;
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Projeto não encontrado" });
    }
    res.json({ message: "Projeto removido com sucesso", id: deleted[0].id });
  } catch (error) {
    console.error("Erro ao remover projeto:", error);
    res.status(500).json({ error: "Erro interno ao remover projeto" });
  }
});

export default router;
