import { addDays, format, subDays } from "date-fns";

import { professionals } from "@/lib/mock-agenda";
import type { PatientStatus } from "@/lib/patient-status";

export type Patient = {
  id: string;
  name: string;
  initials: string;
  birthDate: string; // yyyy-MM-dd
  phone: string;
  email?: string;
  cpf?: string;
  responsibleProfessionalId?: string;
  status: PatientStatus;
  notes?: string;
  createdAt: string; // yyyy-MM-dd
  lastVisitAt?: string; // yyyy-MM-dd
  /** Ausência de operadora = paciente particular, sem convênio. */
  healthInsuranceProvider?: string;
  healthInsurancePlan?: string;
  healthInsuranceCardNumber?: string;
  healthInsuranceValidUntil?: string; // yyyy-MM-dd
};

export function responsibleProfessionalName(patient: Pick<Patient, "responsibleProfessionalId">) {
  return professionals.find((professional) => professional.id === patient.responsibleProfessionalId)
    ?.name;
}

export function deriveInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Gera pacientes mockados com cadastro/última visita ancorados em
 * `referenceDate`, para os indicadores ("novos este mês" etc.) fazerem
 * sentido não importa quando a página é aberta.
 */
export function getMockPatients(referenceDate: Date): Patient[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));
  const future = (days: number) => dateKey(addDays(referenceDate, days));

  return [
    {
      id: "pac-1",
      name: "Larissa Fernandes",
      initials: "LF",
      birthDate: "1988-03-12",
      phone: "(11) 98211-4432",
      email: "larissa.fernandes@email.com",
      cpf: "123.456.789-01",
      responsibleProfessionalId: "prof-1",
      status: "ativo",
      createdAt: ago(400),
      lastVisitAt: ago(5),
      healthInsuranceProvider: "Unimed",
      healthInsurancePlan: "Nacional Especial",
      healthInsuranceCardNumber: "0 123 4567 8901234 5",
      healthInsuranceValidUntil: future(420),
    },
    {
      id: "pac-2",
      name: "Eduardo Martins",
      initials: "EM",
      birthDate: "1975-07-22",
      phone: "(11) 97654-2210",
      email: "eduardo.martins@email.com",
      responsibleProfessionalId: "prof-2",
      status: "ativo",
      notes: "Usa aparelho ortodôntico, prefere horários no início da manhã.",
      createdAt: ago(200),
      lastVisitAt: ago(20),
    },
    {
      id: "pac-3",
      name: "Patrícia Gomes",
      initials: "PG",
      birthDate: "1993-11-05",
      phone: "(11) 96543-7789",
      email: "patricia.gomes@email.com",
      cpf: "234.567.890-12",
      responsibleProfessionalId: "prof-3",
      status: "ativo",
      createdAt: ago(15),
      lastVisitAt: ago(15),
      healthInsuranceProvider: "SulAmérica",
      healthInsurancePlan: "Direto Executivo",
      healthInsuranceCardNumber: "88 5544 3322 1100",
      healthInsuranceValidUntil: future(200),
    },
    {
      id: "pac-4",
      name: "Marcos Vinícius Silva",
      initials: "MS",
      birthDate: "1960-01-30",
      phone: "(11) 98877-1123",
      responsibleProfessionalId: "prof-1",
      status: "ativo",
      notes: "Hipertenso, faz acompanhamento contínuo.",
      createdAt: ago(600),
      lastVisitAt: ago(2),
      healthInsuranceProvider: "Bradesco Saúde",
      healthInsurancePlan: "Top Nacional",
      healthInsuranceCardNumber: "77 6655 4433 2211",
      healthInsuranceValidUntil: future(90),
    },
    {
      id: "pac-5",
      name: "Fernanda Azevedo",
      initials: "FA",
      birthDate: "1982-09-18",
      phone: "(11) 95566-8890",
      email: "fernanda.azevedo@email.com",
      responsibleProfessionalId: "prof-4",
      status: "inativo",
      createdAt: ago(500),
      lastVisitAt: ago(180),
    },
    {
      id: "pac-6",
      name: "Gabriel Teixeira",
      initials: "GT",
      birthDate: "1999-05-14",
      phone: "(11) 94433-5567",
      email: "gabriel.teixeira@email.com",
      responsibleProfessionalId: "prof-2",
      status: "ativo",
      createdAt: ago(8),
      healthInsuranceProvider: "Amil",
      healthInsurancePlan: "Amil One Black",
      healthInsuranceCardNumber: "44 3322 1100 9988",
      healthInsuranceValidUntil: future(300),
    },
    {
      id: "pac-7",
      name: "Isabela Cardoso",
      initials: "IC",
      birthDate: "1990-12-01",
      phone: "(11) 93322-9981",
      cpf: "345.678.901-23",
      responsibleProfessionalId: "prof-5",
      status: "ativo",
      createdAt: ago(90),
      lastVisitAt: ago(30),
    },
    {
      id: "pac-8",
      name: "Vinícius Barros",
      initials: "VB",
      birthDate: "1978-04-09",
      phone: "(11) 92211-4456",
      email: "vinicius.barros@email.com",
      responsibleProfessionalId: "prof-3",
      status: "ativo",
      notes: "Alérgico a dipirona.",
      createdAt: ago(300),
      lastVisitAt: ago(1),
      healthInsuranceProvider: "Hapvida",
      healthInsurancePlan: "Hapvida Premium",
      healthInsuranceCardNumber: "11 2233 4455 6677",
      healthInsuranceValidUntil: future(150),
    },
    {
      id: "pac-9",
      name: "Renata Pires",
      initials: "RP",
      birthDate: "1968-06-25",
      phone: "(11) 91100-3345",
      responsibleProfessionalId: "prof-1",
      status: "inativo",
      createdAt: ago(700),
      lastVisitAt: ago(400),
    },
    {
      id: "pac-10",
      name: "Diego Ramos",
      initials: "DR",
      birthDate: "1995-08-17",
      phone: "(11) 90099-6678",
      email: "diego.ramos@email.com",
      responsibleProfessionalId: "prof-4",
      status: "ativo",
      createdAt: ago(25),
      lastVisitAt: ago(25),
      healthInsuranceProvider: "Unimed",
      healthInsurancePlan: "Unimed Intercâmbio",
      healthInsuranceCardNumber: "0 987 6543 2109876 1",
      healthInsuranceValidUntil: future(60),
    },
    {
      id: "pac-11",
      name: "Camila Duarte",
      initials: "CD",
      birthDate: "1985-02-28",
      phone: "(11) 98988-7712",
      email: "camila.duarte@email.com",
      cpf: "456.789.012-34",
      responsibleProfessionalId: "prof-2",
      status: "ativo",
      createdAt: ago(150),
      lastVisitAt: ago(10),
      healthInsuranceProvider: "SulAmérica",
      healthInsurancePlan: "Clássico",
      healthInsuranceCardNumber: "99 8877 6655 4433",
      healthInsuranceValidUntil: future(250),
    },
    {
      id: "pac-12",
      name: "Otávio Nascimento",
      initials: "ON",
      birthDate: "2001-10-03",
      phone: "(11) 97877-8823",
      responsibleProfessionalId: "prof-5",
      status: "ativo",
      createdAt: ago(3),
    },
    {
      id: "pac-13",
      name: "Sabrina Moura",
      initials: "SM",
      birthDate: "1992-07-11",
      phone: "(11) 96766-9934",
      email: "sabrina.moura@email.com",
      responsibleProfessionalId: "prof-3",
      status: "ativo",
      createdAt: ago(60),
      lastVisitAt: ago(6),
      healthInsuranceProvider: "Bradesco Saúde",
      healthInsurancePlan: "Nacional Flex",
      healthInsuranceCardNumber: "22 1100 9988 7766",
      healthInsuranceValidUntil: future(500),
    },
    {
      id: "pac-14",
      name: "Henrique Farias",
      initials: "HF",
      birthDate: "1972-12-19",
      phone: "(11) 95655-0045",
      email: "henrique.farias@email.com",
      responsibleProfessionalId: "prof-4",
      status: "ativo",
      notes: "Prefere ser chamado de Rique.",
      createdAt: ago(450),
      lastVisitAt: ago(45),
    },
    {
      id: "pac-15",
      name: "Gabriel Andrade",
      initials: "GA",
      birthDate: "1995-06-15",
      phone: "(31) 98855-1832",
      email: "gabriel.teste@email.com",
      responsibleProfessionalId: "prof-1",
      status: "ativo",
      notes: "Cadastro de teste para validar o envio de mensagens via WhatsApp.",
      createdAt: ago(0),
    },
  ];
}
