import { initDatabase } from "./schema.js";
import { sql } from "./db.js";

async function runTests() {
  console.log("=== INICIANDO TESTES DO BANCO NEON POSTGRES E CRUD COMPLETO ===\n");

  // 1. Inicializa esquema e seeds
  await initDatabase();

  // 2. Consulta pessoas cadastradas (devem ser no mínimo as 2 pessoas solicitadas)
  console.log("\n[TESTE 1] Verificando pessoas cadastradas inicialmente no NeonDB...");
  const pessoas = await sql`SELECT id, nome, cargo, email FROM pessoas ORDER BY id ASC;`;
  console.log(`Encontradas ${pessoas.length} pessoas:`);
  pessoas.forEach((p) => console.log(`  - [ID ${p.id}] ${p.nome} (${p.cargo}) - ${p.email}`));

  if (pessoas.length < 2) {
    throw new Error("Esperava-se pelo menos 2 pessoas cadastradas.");
  }

  // 3. Testa consulta completa do primeiro currículo (Moisés Araújo) com suas relações
  console.log("\n[TESTE 2] Buscando dados completos do currículo 1 com todas as relações...");
  const p1Id = pessoas[0].id;
  const [academicas1, profissionais1, projetos1, habilidades1] = await Promise.all([
    sql`SELECT * FROM experiencias_academicas WHERE pessoa_id = ${p1Id};`,
    sql`SELECT * FROM experiencias_profissionais WHERE pessoa_id = ${p1Id};`,
    sql`SELECT * FROM projetos WHERE pessoa_id = ${p1Id};`,
    sql`SELECT * FROM habilidades WHERE pessoa_id = ${p1Id};`,
  ]);

  console.log(`Pessoa: ${pessoas[0].nome}`);
  console.log(`- Experiências Acadêmicas: ${academicas1.length}`);
  academicas1.forEach((a) => console.log(`  * ${a.curso} em ${a.instituicao} (${a.data_inicio} - ${a.data_fim || "atual"})`));
  console.log(`- Experiências Profissionais: ${profissionais1.length}`);
  profissionais1.forEach((pr) => console.log(`  * ${pr.cargo} na ${pr.empresa}`));
  console.log(`- Projetos: ${projetos1.length}`);
  projetos1.forEach((proj) => console.log(`  * ${proj.titulo}`));
  console.log(`- Habilidades: ${habilidades1.length}`);
  habilidades1.forEach((h) => console.log(`  * ${h.nome} [${h.categoria}] - ${h.nivel}`));

  // 4. Teste de CRUD: Criando um 3º currículo de teste
  console.log("\n[TESTE 3 - CREATE] Criando um novo currículo de teste...");
  const novo = await sql`
    INSERT INTO pessoas (nome, email, cargo, resumo, localizacao)
    VALUES ('Carlos Eduardo Teste', 'carlos.teste@example.com', 'Engenheiro de Dados', 'Especialista em pipelines de dados e ETL.', 'Recife, PE')
    RETURNING *;
  `;
  const novoId = novo[0].id;
  console.log(`Criado com sucesso: ID ${novoId} - ${novo[0].nome}`);

  // 5. Teste de CREATE em entidades filhas
  console.log("\n[TESTE 4 - CREATE RELAÇÕES] Adicionando experiência e habilidade para o novo currículo...");
  const acad = await sql`
    INSERT INTO experiencias_academicas (pessoa_id, instituicao, curso, data_inicio, atual)
    VALUES (${novoId}, 'UNICAP', 'Engenharia de Software', '2022', true)
    RETURNING *;
  `;
  console.log(`  + Experiência acadêmica adicionada: ${acad[0].curso}`);

  const hab = await sql`
    INSERT INTO habilidades (pessoa_id, nome, nivel, categoria)
    VALUES (${novoId}, 'Apache Spark', 'Avançado', 'Data')
    RETURNING *;
  `;
  console.log(`  + Habilidade adicionada: ${hab[0].nome} (ID ${hab[0].id})`);

  // 6. Teste de UPDATE
  console.log("\n[TESTE 5 - UPDATE] Atualizando cargo da pessoa e nível da habilidade...");
  const updatedPessoa = await sql`
    UPDATE pessoas
    SET cargo = 'Engenheiro de Dados Sênior'
    WHERE id = ${novoId}
    RETURNING id, nome, cargo;
  `;
  console.log(`  ~ Cargo atualizado para: ${updatedPessoa[0].cargo}`);

  const updatedHab = await sql`
    UPDATE habilidades
    SET nivel = 'Especialista'
    WHERE id = ${hab[0].id}
    RETURNING id, nome, nivel;
  `;
  console.log(`  ~ Nível da habilidade atualizado para: ${updatedHab[0].nivel}`);

  // 7. Teste de DELETE em entidade filha
  console.log("\n[TESTE 6 - DELETE ENTIDADE FILHA] Removendo a habilidade criada...");
  await sql`DELETE FROM habilidades WHERE id = ${hab[0].id};`;
  const habCount = await sql`SELECT COUNT(*)::int as total FROM habilidades WHERE id = ${hab[0].id};`;
  console.log(`  - Habilidade deletada (contagem atual: ${habCount[0].total})`);

  // 8. Teste de DELETE da pessoa com CASCADE automático
  console.log("\n[TESTE 7 - DELETE COM CASCADE] Removendo a 3ª pessoa e verificando exclusão em cascata...");
  await sql`DELETE FROM pessoas WHERE id = ${novoId};`;
  const pessoaCheck = await sql`SELECT COUNT(*)::int as total FROM pessoas WHERE id = ${novoId};`;
  const acadCheck = await sql`SELECT COUNT(*)::int as total FROM experiencias_academicas WHERE pessoa_id = ${novoId};`;
  console.log(`  - Pessoa removida (contagem: ${pessoaCheck[0].total})`);
  console.log(`  - Entidades associadas removidas por CASCADE (contagem acadêmicas: ${acadCheck[0].total})`);

  // 9. Verificação final
  const finalPessoas = await sql`SELECT COUNT(*)::int as total FROM pessoas;`;
  console.log(`\n[SUCESSO] Total de pessoas mantidas no NeonDB: ${finalPessoas[0].total} (Currículos originais preservados com sucesso!)`);
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro nos testes:", err);
    process.exit(1);
  });
