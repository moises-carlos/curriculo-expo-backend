import { Router, Request, Response } from "express";
import { sql } from "../db.js";

const router = Router();

// GET /api/curriculos - Lista todos os currículos (resumo)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const pessoas = await sql`
      SELECT 
        p.*,
        (SELECT COUNT(*)::int FROM experiencias_academicas ea WHERE ea.pessoa_id = p.id) as total_academicas,
        (SELECT COUNT(*)::int FROM experiencias_profissionais ep WHERE ep.pessoa_id = p.id) as total_profissionais,
        (SELECT COUNT(*)::int FROM projetos pr WHERE pr.pessoa_id = p.id) as total_projetos,
        (SELECT COUNT(*)::int FROM habilidades h WHERE h.pessoa_id = p.id) as total_habilidades
      FROM pessoas p
      ORDER BY p.id ASC;
    `;
    res.json(pessoas);
  } catch (error) {
    console.error("Erro ao listar currículos:", error);
    res.status(500).json({ error: "Erro interno ao listar currículos" });
  }
});

// GET /api/curriculos/:id - Detalhes completos do currículo com todas as relações
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const pessoaResult = await sql`SELECT * FROM pessoas WHERE id = ${id};`;
    if (pessoaResult.length === 0) {
      return res.status(404).json({ error: "Currículo não encontrado" });
    }
    const pessoa = pessoaResult[0];

    // Busca relações em paralelo
    const [academicas, profissionais, projetos, habilidades] = await Promise.all([
      sql`SELECT * FROM experiencias_academicas WHERE pessoa_id = ${id} ORDER BY data_inicio DESC;`,
      sql`SELECT * FROM experiencias_profissionais WHERE pessoa_id = ${id} ORDER BY data_inicio DESC;`,
      sql`SELECT * FROM projetos WHERE pessoa_id = ${id} ORDER BY id ASC;`,
      sql`SELECT * FROM habilidades WHERE pessoa_id = ${id} ORDER BY categoria, nome;`,
    ]);

    const curriculoCompleto = {
      ...pessoa,
      experiencias_academicas: academicas,
      experiencias_profissionais: profissionais,
      projetos,
      habilidades,
    };

    res.json(curriculoCompleto);
  } catch (error) {
    console.error("Erro ao buscar currículo completo:", error);
    res.status(500).json({ error: "Erro interno ao buscar currículo" });
  }
});

// POST /api/curriculos - Cadastra nova pessoa/currículo
router.post("/", async (req: Request, res: Response) => {
  const {
    nome,
    email,
    telefone,
    cargo,
    resumo,
    localizacao,
    avatar_url,
    website,
    linkedin,
    github,
  } = req.body;

  if (!nome || !email || !cargo) {
    return res.status(400).json({ error: "Campos obrigatórios: nome, email e cargo." });
  }

  try {
    const inserted = await sql`
      INSERT INTO pessoas (
        nome, email, telefone, cargo, resumo, localizacao, avatar_url, website, linkedin, github
      ) VALUES (
        ${nome}, ${email}, ${telefone || null}, ${cargo}, ${resumo || null},
        ${localizacao || null}, ${avatar_url || null}, ${website || null},
        ${linkedin || null}, ${github || null}
      )
      RETURNING *;
    `;
    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error("Erro ao cadastrar currículo:", error);
    if (error?.code === "23505") {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }
    res.status(500).json({ error: "Erro interno ao cadastrar currículo" });
  }
});

// PUT /api/curriculos/:id - Atualiza dados do currículo
router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const {
    nome,
    email,
    telefone,
    cargo,
    resumo,
    localizacao,
    avatar_url,
    website,
    linkedin,
    github,
  } = req.body;

  try {
    const updated = await sql`
      UPDATE pessoas
      SET
        nome = COALESCE(${nome}, nome),
        email = COALESCE(${email}, email),
        telefone = COALESCE(${telefone}, telefone),
        cargo = COALESCE(${cargo}, cargo),
        resumo = COALESCE(${resumo}, resumo),
        localizacao = COALESCE(${localizacao}, localizacao),
        avatar_url = COALESCE(${avatar_url}, avatar_url),
        website = COALESCE(${website}, website),
        linkedin = COALESCE(${linkedin}, linkedin),
        github = COALESCE(${github}, github),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return res.status(404).json({ error: "Currículo não encontrado" });
    }

    res.json(updated[0]);
  } catch (error: any) {
    console.error("Erro ao atualizar currículo:", error);
    if (error?.code === "23505") {
      return res.status(409).json({ error: "E-mail já em uso por outro registro." });
    }
    res.status(500).json({ error: "Erro interno ao atualizar currículo" });
  }
});

// DELETE /api/curriculos/:id - Remove o currículo e relações (via CASCADE)
router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const deleted = await sql`
      DELETE FROM pessoas WHERE id = ${id} RETURNING id, nome;
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Currículo não encontrado" });
    }

    res.json({ message: "Currículo e todas as entidades associadas foram removidos com sucesso", item: deleted[0] });
  } catch (error) {
    console.error("Erro ao deletar currículo:", error);
    res.status(500).json({ error: "Erro interno ao deletar currículo" });
  }
});

export default router;
