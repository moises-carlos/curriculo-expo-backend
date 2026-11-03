import { sql } from "./db.js";

export async function initDatabase() {
  console.log("Inicializando tabelas no Neon Postgres...");

  await sql`
    CREATE TABLE IF NOT EXISTS pessoas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      telefone VARCHAR(50),
      cargo VARCHAR(255) NOT NULL,
      resumo TEXT,
      localizacao VARCHAR(255),
      avatar_url TEXT,
      website TEXT,
      linkedin TEXT,
      github TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS experiencias_academicas (
      id SERIAL PRIMARY KEY,
      pessoa_id INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
      instituicao VARCHAR(255) NOT NULL,
      curso VARCHAR(255) NOT NULL,
      grau VARCHAR(100),
      data_inicio VARCHAR(50) NOT NULL,
      data_fim VARCHAR(50),
      atual BOOLEAN DEFAULT FALSE,
      descricao TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS experiencias_profissionais (
      id SERIAL PRIMARY KEY,
      pessoa_id INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
      empresa VARCHAR(255) NOT NULL,
      cargo VARCHAR(255) NOT NULL,
      localizacao VARCHAR(255),
      data_inicio VARCHAR(50) NOT NULL,
      data_fim VARCHAR(50),
      atual BOOLEAN DEFAULT FALSE,
      descricao TEXT,
      tecnologias TEXT[],
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS projetos (
      id SERIAL PRIMARY KEY,
      pessoa_id INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT,
      link_projeto TEXT,
      link_repositorio TEXT,
      data VARCHAR(50),
      tecnologias TEXT[],
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS habilidades (
      id SERIAL PRIMARY KEY,
      pessoa_id INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
      nome VARCHAR(100) NOT NULL,
      nivel VARCHAR(50),
      categoria VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log("Tabelas verificadas com sucesso.");

  // Verifica se o banco já possui registros
  const countResult = await sql`SELECT COUNT(*)::int as total FROM pessoas;`;
  const total = countResult[0].total;

  if (total === 0) {
    console.log("Banco vazio. Populando com o currículo de 2 pessoas...");
    await seedDatabase();
  } else {
    console.log(`Banco já contém ${total} pessoa(s) cadastrada(s).`);
  }
}

export async function seedDatabase() {
  // Pessoa 1: Moisés Carlos de Araújo Neto
  const p1 = await sql`
    INSERT INTO pessoas (
      nome, email, telefone, cargo, resumo, localizacao, avatar_url, website, linkedin, github
    ) VALUES (
      'Moisés Carlos de Araújo Neto',
      'moisescarlos664@gmail.com',
      '+55 (81) 99205-2292',
      'Desenvolvedor Java Fullstack',
      'Desenvolvedor Java Fullstack com experiência em engenharia de sistemas escaláveis e na manutenção de aplicações corporativas críticas. Experiência tanto em ecossistemas modernos (Spring Boot, Angular, Java 17 e 21) quanto na sustentação de sistemas legados de alta complexidade (Java EE / Jakarta EE, JSF, EJB). Atuação de ponta a ponta: modelagem de bancos relacionais (Oracle e PostgreSQL), construção de interfaces de usuário e implantação em servidores conteinerizados (Docker, WildFly, Tomcat). Perfil analítico e orientado a boas práticas (POO, Arquitetura em Camadas, Clean Code).',
      'Recife, PE - Brasil',
      'https://github.com/moises-carlos.png',
      'https://github.com/moises-carlos',
      'https://linkedin.com/in/moises-araujo',
      'https://github.com/moises-carlos'
    ) RETURNING id;
  `;
  const p1Id = p1[0].id;

  // Experiências Acadêmicas de Moisés
  await sql`
    INSERT INTO experiencias_academicas (pessoa_id, instituicao, curso, grau, data_inicio, data_fim, atual, descricao)
    VALUES 
    (${p1Id}, 'Universidade Católica de Pernambuco (UNICAP)', 'Sistemas para Internet', 'Graduação (4° Período)', '2025', '2027', true, 'Foco em desenvolvimento web e móvel, arquitetura de sistemas corporativos, microsserviços e computação em nuvem.'),
    (${p1Id}, 'Grau Técnico - Recife, PE', 'Desenvolvimento de Sistemas', 'Curso Técnico', '2024', '2026', false, 'Fundamentos de lógica de programação, orientação a objetos, modelagem relacional de banco de dados e engenharia de software.');
  `;

  // Experiências Profissionais de Moisés
  await sql`
    INSERT INTO experiencias_profissionais (pessoa_id, empresa, cargo, localizacao, data_inicio, data_fim, atual, descricao, tecnologias)
    VALUES
    (${p1Id}, 'Grupo RAS', 'Estagiário Desenvolvedor Java Fullstack', 'Recife, PE', 'Julho 2026', NULL, true, 'Atuação direta na sustentação e evolução do SIC (Sistema de Informações da Compesa), aplicação corporativa crítica para todo o estado de PE, utilizando Jakarta EE 10, Java 17/21 e WildFly 33. Manutenção fullstack de módulos governamentais legados (Operacional, GHI, RH) com interface em JSF/Facelets e regras de negócio via EJB acessando Oracle DB. Suporte e modernização do sistema Empregabilidade JCPM com Spring MVC, Java e PostgreSQL em servidor Apache Tomcat. Geração de relatórios dinâmicos com JasperReports, gestão de repositórios em Git e SVN, e deploys conteinerizados via Docker com automação Maven.', ARRAY['Java 17/21', 'Jakarta EE 10', 'Spring Boot', 'WildFly', 'JSF', 'Oracle DB', 'PostgreSQL', 'Docker', 'Maven', 'JasperReports']),
    (${p1Id}, 'Infinity School', 'Instrutor de Programação', 'Recife, PE', 'Dez 2025', 'Mar 2026', false, 'Apoio semanal a mais de 20 alunos com foco em lógica de programação, estruturas de dados e POO. Orientação em exercícios práticos, auxílio na depuração de código, desenvolvimento de raciocínio lógico guiado e suporte direto na estruturação de mais de 3 projetos finais.', ARRAY['Java', 'POO', 'Estruturas de Dados', 'Lógica de Programação', 'Clean Code']),
    (${p1Id}, 'Porto Digital', 'Monitor da Residência Tecnológica', 'Recife, PE', '2025', '2026', false, 'Apoio a atividades de tecnologia e inovação, suporte operacional de ambientes de desenvolvimento e otimização do fluxo de execução de projetos técnicos. Organização de ambientes, documentação de processos técnicos e atuação em equipes multidisciplinares.', ARRAY['Ambientes de Dev', 'Gestão de Projetos', 'Documentação Técnica', 'Metodologias Ágeis']);
  `;

  // Projetos de Moisés
  await sql`
    INSERT INTO projetos (pessoa_id, titulo, descricao, link_projeto, link_repositorio, data, tecnologias)
    VALUES
    (${p1Id}, 'QuestList - API de Gamificação de Tarefas (To-do RPG)', 'REST API em Java com Spring Boot para gamificação de tarefas inspirada em mecânicas de RPG. Arquitetura em camadas (Controller, Service e Repository), sistema de progressão de níveis com XP, ranks e streaks, cálculo dinâmico de bônus e penalidades por atraso, modelagem de domínio com entidades e enums, além de integração com PostgreSQL e Docker via Spring Data JPA.', 'https://github.com/moises-carlos/api-QuestList', 'https://github.com/moises-carlos/api-QuestList', '2026', ARRAY['Java 17+', 'Spring Boot', 'Spring Data JPA', 'PostgreSQL', 'Docker', 'Maven']),
    (${p1Id}, 'Planify — Bot de Automação com Telegram, Notion e IA', 'Bot em Java com Spring Boot para automação de tarefas no Notion via Telegram com inteligência artificial (Groq). Processamento de linguagem natural (PLN) com IA para converter mensagens livres em tarefas organizadas e estruturadas automaticamente, reduzindo etapas manuais e garantindo consistência com arquitetura em camadas.', 'https://github.com/moises-carlos/planify', 'https://github.com/moises-carlos/planify', '2026', ARRAY['Java 17+', 'Spring Boot', 'Telegram Bot API', 'Notion API', 'IA (Groq)', 'PostgreSQL', 'Maven']),
    (${p1Id}, 'App de Currículo & Portfólio Mobile (Expo)', 'Aplicativo mobile completo em React Native com Expo SDK 58 e Expo Router, integrado à API REST Express com Neon PostgreSQL. Possui seletor dinâmico de múltiplos perfis, temas Dark/Light mode, filtros em tempo real de tecnologias e compartilhamento nativo.', 'https://github.com/moises-carlos/curriculo-expo', 'https://github.com/moises-carlos/curriculo-expo', '2026', ARRAY['React Native', 'Expo SDK 58', 'Expo Router', 'TypeScript', 'Neon Postgres', 'Express']);
  `;

  // Habilidades de Moisés
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

  // Pessoa 2: Beatriz Albuquerque
  const p2 = await sql`
    INSERT INTO pessoas (
      nome, email, telefone, cargo, resumo, localizacao, avatar_url, website, linkedin, github
    ) VALUES (
      'Beatriz Albuquerque',
      'beatriz.albuquerque@email.com',
      '+55 (81) 98765-4321',
      'Engenheira de Software Cloud & Backend',
      'Engenheira de software sênior especializada em arquitetura orientada a microsserviços, computação em nuvem, bancos distribuídos e automação CI/CD.',
      'Recife, PE - Brasil',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      'https://beatrizcloud.io',
      'https://linkedin.com/in/beatriz-albuquerque',
      'https://github.com/beatriz-albuquerque'
    ) RETURNING id;
  `;
  const p2Id = p2[0].id;

  // Experiências Acadêmicas de Beatriz
  await sql`
    INSERT INTO experiencias_academicas (pessoa_id, instituicao, curso, grau, data_inicio, data_fim, atual, descricao)
    VALUES 
    (${p2Id}, 'Universidade Federal de Pernambuco (UFPE)', 'Sistemas de Informação', 'Bacharelado', '2017', '2021', false, 'Ênfase em sistemas distribuídos, banco de dados avançado e arquitetura de software.'),
    (${p2Id}, 'PUC Minas', 'Engenharia de Software e Cloud Solutions', 'Especialização / Pós-graduação', '2022', '2023', false, 'Foco em arquitetura serverless, containers Kubernetes e escalabilidade em nuvem.');
  `;

  // Experiências Profissionais de Beatriz
  await sql`
    INSERT INTO experiencias_profissionais (pessoa_id, empresa, cargo, localizacao, data_inicio, data_fim, atual, descricao, tecnologias)
    VALUES
    (${p2Id}, 'CloudPeak Sistemas', 'Engenheira de Software Backend Sênior', 'São Paulo, SP (Remoto)', '2023-05', NULL, true, 'Liderança técnica no design e implementação de pipelines de streaming e APIs de alta vazão sobre arquitetura em nuvem.', ARRAY['Node.js', 'Go', 'PostgreSQL', 'AWS', 'Kubernetes', 'Kafka']),
    (${p2Id}, 'TechNordeste Tech', 'Desenvolvedora Backend Pleno', 'Recife, PE', '2021-02', '2023-04', false, 'Refatoração de monólito para microsserviços, redução de latência em consultas SQL e automação de testes.', ARRAY['TypeScript', 'Express', 'PostgreSQL', 'Docker', 'Redis']);
  `;

  // Projetos de Beatriz
  await sql`
    INSERT INTO projetos (pessoa_id, titulo, descricao, link_projeto, link_repositorio, data, tecnologias)
    VALUES
    (${p2Id}, 'Cloud Telemetry Engine', 'Coletor e analisador distribuído de métricas e telemetria para clusters de microsserviços com alertas em tempo real.', 'https://telemetry.cloudpeak.io', 'https://github.com/beatriz-albuquerque/cloud-telemetry', '2025', ARRAY['Go', 'PostgreSQL', 'Prometheus', 'Grafana']),
    (${p2Id}, 'Serverless Data Sync', 'Engine serverless para sincronização bidirecional de dados entre Neon Postgres e data lakes corporativos.', 'https://sync.beatrizcloud.io', 'https://github.com/beatriz-albuquerque/serverless-sync', '2024', ARRAY['TypeScript', 'Node.js', 'Neon Postgres', 'AWS Lambda']);
  `;

  // Habilidades de Beatriz
  await sql`
    INSERT INTO habilidades (pessoa_id, nome, nivel, categoria)
    VALUES
    (${p2Id}, 'Node.js & TypeScript', 'Especialista', 'Backend'),
    (${p2Id}, 'PostgreSQL & SQL Tuning', 'Especialista', 'Banco de Dados'),
    (${p2Id}, 'Go (Golang)', 'Avançado', 'Linguagens'),
    (${p2Id}, 'AWS (ECS, Lambda, S3, RDS)', 'Avançado', 'DevOps / Cloud'),
    (${p2Id}, 'Docker & Kubernetes', 'Avançado', 'DevOps / Cloud'),
    (${p2Id}, 'Arquitetura de Microsserviços', 'Especialista', 'Arquitetura');
  `;

  console.log("Currículos de Moisés Araújo e Beatriz Albuquerque cadastrados com sucesso no NeonDB!");
}
