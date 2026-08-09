export type Procedure = {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
};

export const procedureCategories = [
  "Clínica Geral",
  "Ortodontia",
  "Dermatologia",
  "Fisioterapia",
  "Nutrição",
];

export function getMockProcedures(): Procedure[] {
  return [
    {
      id: "proc-1",
      name: "Consulta clínica geral",
      category: "Clínica Geral",
      price: 150,
      durationMinutes: 30,
    },
    {
      id: "proc-2",
      name: "Check-up completo",
      category: "Clínica Geral",
      price: 450,
      durationMinutes: 60,
    },
    {
      id: "proc-3",
      name: "Instalação de aparelho ortodôntico",
      category: "Ortodontia",
      price: 1800,
      durationMinutes: 90,
    },
    {
      id: "proc-4",
      name: "Manutenção ortodôntica",
      category: "Ortodontia",
      price: 180,
      durationMinutes: 30,
    },
    {
      id: "proc-5",
      name: "Clareamento dental",
      category: "Ortodontia",
      price: 900,
      durationMinutes: 60,
    },
    {
      id: "proc-6",
      name: "Avaliação dermatológica",
      category: "Dermatologia",
      price: 250,
      durationMinutes: 40,
    },
    {
      id: "proc-7",
      name: "Peeling químico",
      category: "Dermatologia",
      price: 380,
      durationMinutes: 45,
    },
    {
      id: "proc-8",
      name: "Sessão de fisioterapia",
      category: "Fisioterapia",
      price: 130,
      durationMinutes: 50,
    },
    {
      id: "proc-9",
      name: "Avaliação nutricional",
      category: "Nutrição",
      price: 220,
      durationMinutes: 45,
    },
    {
      id: "proc-10",
      name: "Acompanhamento nutricional mensal",
      category: "Nutrição",
      price: 180,
      durationMinutes: 30,
    },
  ];
}
