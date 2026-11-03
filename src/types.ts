export interface Pessoa {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  cargo: string;
  resumo?: string | null;
  localizacao?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExperienciaAcademica {
  id: number;
  pessoa_id: number;
  instituicao: string;
  curso: string;
  grau?: string | null;
  data_inicio: string;
  data_fim?: string | null;
  atual: boolean;
  descricao?: string | null;
  created_at?: string;
}

export interface ExperienciaProfissional {
  id: number;
  pessoa_id: number;
  empresa: string;
  cargo: string;
  localizacao?: string | null;
  data_inicio: string;
  data_fim?: string | null;
  atual: boolean;
  descricao?: string | null;
  tecnologias?: string[] | null;
  created_at?: string;
}

export interface Projeto {
  id: number;
  pessoa_id: number;
  titulo: string;
  descricao?: string | null;
  link_projeto?: string | null;
  link_repositorio?: string | null;
  data?: string | null;
  tecnologias?: string[] | null;
  created_at?: string;
}

export interface Habilidade {
  id: number;
  pessoa_id: number;
  nome: string;
  nivel?: string | null; // ex: Iniciante, Intermediário, Avançado, Especialista
  categoria?: string | null; // ex: Frontend, Backend, Mobile, DevOps, Soft Skill
  created_at?: string;
}

export interface CurriculoCompleto extends Pessoa {
  experiencias_academicas: ExperienciaAcademica[];
  experiencias_profissionais: ExperienciaProfissional[];
  projetos: Projeto[];
  habilidades: Habilidade[];
}
