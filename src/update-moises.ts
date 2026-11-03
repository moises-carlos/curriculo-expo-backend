import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { sql } from "./db.js";

async function updateMoises() {
  console.log("Atualizando informações de Moisés Carlos no NeonDB...");

  // Busca o ID de Moisés
  const rows = await sql`
    SELECT id FROM pessoas WHERE email ILIKE '%moises%' OR id = 1 LIMIT 1;
  `;

  if (rows.length === 0) {
    console.error("Moisés não encontrado no banco.");
    process.exit(1);
  }

  const p1Id = rows[0].id;
  console.log(`ID encontrado para Moisés: ${p1Id}`);

  // 1. Atualiza dados principais da pessoa
  await sql`
    UPDATE pessoas
    SET
      nome = 'Moisés Carlos de Araújo Neto',
      email = 'moisescarlos664@gmail.com',
      telefone = '+55 (81) 99205-2292',
      cargo = 'Desenvolvedor Java Fullstack',
      resumo = 'Desenvolvedor Java Fullstack com experiência em engenharia de sistemas escaláveis e na manutenção de aplicações corporativas críticas. Experiência tanto em ecossistemas modernos (Spring Boot, Angular, Java 17 e 21) quanto na sustentação de sistemas legados de alta complexidade (Java EE / Jakarta EE, JSF, EJB). Atuação de ponta a ponta: modelagem de bancos relacionais (Oracle e PostgreSQL), construção de interfaces de usuário e implantação em servidores conteinerizados (Docker, WildFly, Tomcat). Perfil analítico e orientado a boas práticas (POO, Arquitetura em Camadas, Clean Code).',
      localizacao = 'Recife, PE - Brasil',
      avatar_url = 'https://github.com/moises-carlos.png',
      website = 'https://github.com/moises-carlos',
      linkedin = 'https://linkedin.com/in/moises-araujo',
      github = 'https://github.com/moises-carlos',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${p1Id};
  `;
  console.log("Perfil principal atualizado.");

  // 2. Limpa relações anteriores para recriar conforme o currículo real
  await sql`DELETE FROM experiencias_academicas WHERE pessoa_id = ${p1Id};`;
  await sql`DELETE FROM experiencias_profissionais WHERE pessoa_id = ${p1Id};`;
  await sql`DELETE FROM projetos WHERE pessoa_id = ${p1Id};`;
  await sql`DELETE FROM habilidades WHERE pessoa_id = ${p1Id};`;

  // 3. Insere Formação Acadêmica Real
  await sql`
    INSERT INTO experiencias_academicas (pessoa_id, instituicao, curso, grau, data_inicio, data_fim, atual, descricao)
    VALUES
    (
      ${p1Id},
      'Universidade Católica de Pernambuco (UNICAP)',
      'Sistemas para Internet',
      'Graduação (4° Período)',
      '2025',
      '2027',
      true,
      'Foco em desenvolvimento web e móvel, arquitetura de sistemas corporativos, microsserviços e computação em nuvem.'
    ),
    (
      ${p1Id},
      'Grau Técnico - Recife, PE',
      'Desenvolvimento de Sistemas',
      'Curso Técnico',
      '2024',
      '2026',
      false,
      'Fundamentos de lógica de programação, orientação a objetos, modelagem relacional de banco de dados e engenharia de software.'
    );
  `;
  console.log("Experiências acadêmicas inseridas.");

  // 4. Insere Experiências Profissionais Reais
  await sql`
    INSERT INTO experiencias_profissionais (pessoa_id, empresa, cargo, localizacao, data_inicio, data_fim, atual, descricao, tecnologias)
    VALUES
    (
      ${p1Id},
      'Grupo RAS',
      'Estagiário Desenvolvedor Java Fullstack',
      'Recife, PE',
      'Julho 2026',
      NULL,
      true,
      'Atuação direta na sustentação e evolução do SIC (Sistema de Informações da Compesa), aplicação corporativa crítica para todo o estado de PE, utilizando Jakarta EE 10, Java 17/21 e WildFly 33. Manutenção fullstack de módulos governamentais legados (Operacional, GHI, RH) com interface em JSF/Facelets e regras de negócio via EJB acessando Oracle DB. Suporte e modernização do sistema Empregabilidade JCPM com Spring MVC, Java e PostgreSQL em servidor Apache Tomcat. Geração de relatórios dinâmicos com JasperReports, gestão de repositórios em Git e SVN, e deploys conteinerizados via Docker com automação Maven.',
      ARRAY['Java 17/21', 'Jakarta EE 10', 'Spring Boot', 'WildFly', 'JSF', 'Oracle DB', 'PostgreSQL', 'Docker', 'Maven', 'JasperReports']
    ),
    (
      ${p1Id},
      'Infinity School',
      'Instrutor de Programação',
      'Recife, PE',
      'Dez 2025',
      'Mar 2026',
      false,
      'Apoio semanal a mais de 20 alunos com foco em lógica de programação, estruturas de dados e POO. Orientação em exercícios práticos, auxílio na depuração de código, desenvolvimento de raciocínio lógico guiado e suporte direto na estruturação de mais de 3 projetos finais.',
      ARRAY['Java', 'POO', 'Estruturas de Dados', 'Lógica de Programação', 'Clean Code']
    ),
    (
      ${p1Id},
      'Porto Digital',
      'Monitor da Residência Tecnológica',
      'Recife, PE',
      '2025',
      '2026',
      false,
      'Apoio a atividades de tecnologia e inovação, suporte operacional de ambientes de desenvolvimento e otimização do fluxo de execução de projetos técnicos. Organização de ambientes, documentação de processos técnicos e atuação em equipes multidisciplinares.',
      ARRAY['Ambientes de Dev', 'Gestão de Projetos', 'Documentação Técnica', 'Metodologias Ágeis']
    );
  `;
  console.log("Experiências profissionais inseridas.");

  // 5. Insere Projetos Reais
  await sql`
    INSERT INTO projetos (pessoa_id, titulo, descricao, link_projeto, link_repositorio, data, tecnologias)
    VALUES
    (
      ${p1Id},
      'QuestList - API de Gamificação de Tarefas (To-do RPG)',
      'REST API em Java com Spring Boot para gamificação de tarefas inspirada em mecânicas de RPG. Arquitetura em camadas (Controller, Service e Repository), sistema de progressão de níveis com XP, ranks e streaks, cálculo dinâmico de bônus e penalidades por atraso, modelagem de domínio com entidades e enums, além de integração com PostgreSQL e Docker via Spring Data JPA.',
      'https://github.com/moises-carlos/api-QuestList',
      'https://github.com/moises-carlos/api-QuestList',
      '2026',
      ARRAY['Java 17+', 'Spring Boot', 'Spring Data JPA', 'PostgreSQL', 'Docker', 'Maven']
    ),
    (
      ${p1Id},
      'Planify — Bot de Automação com Telegram, Notion e IA',
      'Bot em Java com Spring Boot para automação de tarefas no Notion via Telegram com inteligência artificial (Groq). Processamento de linguagem natural (PLN) com IA para converter mensagens livres em tarefas organizadas e estruturadas automaticamente, reduzindo etapas manuais e garantindo consistência com arquitetura em camadas.',
      'https://github.com/moises-carlos/planify',
      'https://github.com/moises-carlos/planify',
      '2026',
      ARRAY['Java 17+', 'Spring Boot', 'Telegram Bot API', 'Notion API', 'IA (Groq)', 'PostgreSQL', 'Maven']
    ),
    (
      ${p1Id},
      'App de Currículo & Portfólio Mobile (Expo)',
      'Aplicativo mobile completo em React Native com Expo SDK 58 e Expo Router, integrado à API REST Express com Neon PostgreSQL. Possui seletor dinâmico de múltiplos perfis, temas Dark/Light mode, filtros em tempo real de tecnologias e compartilhamento nativo.',
      'https://github.com/moises-carlos/curriculo-expo',
      'https://github.com/moises-carlos/curriculo-expo',
      '2026',
      ARRAY['React Native', 'Expo SDK 58', 'Expo Router', 'TypeScript', 'Neon Postgres', 'Express']
    );
  `;
  console.log("Projetos inseridos.");

  // 6. Insere Habilidades Reais
  await sql`
    INSERT INTO habilidades (pessoa_id, nome, nivel, categoria)
    VALUES
    (${p1Id}, 'Java (8, 17, 21)', 'Avançado', 'Backend'),
    (${p1Id}, 'Spring Boot & Spring Data JPA', 'Avançado', 'Backend'),
    (${p1Id}, 'Jakarta EE 10 & EJB', 'Avançado', 'Backend'),
    (${p1Id}, 'REST APIs & Arquitetura MVC', 'Avançado', 'Backend'),
    (${p1Id}, 'PostgreSQL', 'Avançado', 'Banco de Dados'),
    (${p1Id}, 'Oracle DB', 'Avançado', 'Banco de Dados'),
    (${p1Id}, 'Docker & Containers', 'Avançado', 'Infraestrutura & DevOps'),
    (${p1Id}, 'WildFly & Apache Tomcat', 'Avançado', 'Infraestrutura & DevOps'),
    (${p1Id}, 'Maven, Git & SVN', 'Avançado', 'Ferramentas'),
    (${p1Id}, 'Angular & TypeScript', 'Intermediário', 'Frontend'),
    (${p1Id}, 'JSF (JavaServer Faces) & Facelets', 'Avançado', 'Frontend'),
    (${p1Id}, 'JasperReports', 'Intermediário', 'Ferramentas'),
    (${p1Id}, 'React Native & Expo', 'Avançado', 'Mobile');
  `;
  console.log("Habilidades inseridas.");

  console.log("✅ Todas as informações de Moisés Carlos foram atualizadas com sucesso no Neon PostgreSQL!");
}

updateMoises()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro ao atualizar informações:", err);
    process.exit(1);
  });
