import { format, subDays } from "date-fns";

import type { DocumentCategory } from "@/lib/document-access";

export type DocumentFileType = "pdf" | "image" | "doc";

export type PatientDocument = {
  id: string;
  patientId: string;
  name: string;
  category: DocumentCategory;
  fileType: DocumentFileType;
  sizeLabel: string;
  uploadedAt: string; // yyyy-MM-dd
  uploadedBy: string;
};

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Gera documentos mockados com data de upload ancorada em `referenceDate`,
 * mesma lógica de `getMockStockItems`/`getMockMovements` do módulo de
 * estoque: a demo não pode ficar sem sentido dependendo de quando é aberta.
 */
export function getMockDocuments(referenceDate: Date): PatientDocument[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));

  return [
    // Larissa Fernandes (pac-1)
    {
      id: "doc-1",
      patientId: "pac-1",
      name: "Hemograma completo.pdf",
      category: "exame",
      fileType: "pdf",
      sizeLabel: "812 KB",
      uploadedAt: ago(5),
      uploadedBy: "Dra. Camila Rocha",
    },
    {
      id: "doc-2",
      patientId: "pac-1",
      name: "Receita - Dipirona.pdf",
      category: "receita",
      fileType: "pdf",
      sizeLabel: "120 KB",
      uploadedAt: ago(5),
      uploadedBy: "Dra. Camila Rocha",
    },
    {
      id: "doc-3",
      patientId: "pac-1",
      name: "RG e CPF.pdf",
      category: "documento",
      fileType: "pdf",
      sizeLabel: "1.4 MB",
      uploadedAt: ago(390),
      uploadedBy: "Ana Souza",
    },
    // Eduardo Martins (pac-2)
    {
      id: "doc-4",
      patientId: "pac-2",
      name: "Raio-X panorâmico.jpg",
      category: "exame",
      fileType: "image",
      sizeLabel: "3.1 MB",
      uploadedAt: ago(20),
      uploadedBy: "Dr. Rafael Nunes",
    },
    {
      id: "doc-5",
      patientId: "pac-2",
      name: "Atestado odontológico.pdf",
      category: "atestado",
      fileType: "pdf",
      sizeLabel: "98 KB",
      uploadedAt: ago(20),
      uploadedBy: "Dr. Rafael Nunes",
    },
    // Patrícia Gomes (pac-3)
    {
      id: "doc-6",
      patientId: "pac-3",
      name: "Ficha de anamnese.docx",
      category: "documento",
      fileType: "doc",
      sizeLabel: "56 KB",
      uploadedAt: ago(15),
      uploadedBy: "Ana Souza",
    },
    // Marcos Vinícius Silva (pac-4)
    {
      id: "doc-7",
      patientId: "pac-4",
      name: "Eletrocardiograma.pdf",
      category: "exame",
      fileType: "pdf",
      sizeLabel: "640 KB",
      uploadedAt: ago(2),
      uploadedBy: "Dra. Camila Rocha",
    },
    {
      id: "doc-8",
      patientId: "pac-4",
      name: "Hemograma - retorno.pdf",
      category: "exame",
      fileType: "pdf",
      sizeLabel: "790 KB",
      uploadedAt: ago(60),
      uploadedBy: "Dra. Camila Rocha",
    },
    {
      id: "doc-9",
      patientId: "pac-4",
      name: "Receita - Losartana.pdf",
      category: "receita",
      fileType: "pdf",
      sizeLabel: "110 KB",
      uploadedAt: ago(2),
      uploadedBy: "Dra. Camila Rocha",
    },
    // Fernanda Azevedo (pac-5)
    {
      id: "doc-10",
      patientId: "pac-5",
      name: "Termo de consentimento.docx",
      category: "documento",
      fileType: "doc",
      sizeLabel: "44 KB",
      uploadedAt: ago(500),
      uploadedBy: "Ana Souza",
    },
    // Isabela Cardoso (pac-7)
    {
      id: "doc-11",
      patientId: "pac-7",
      name: "Ultrassonografia.jpg",
      category: "exame",
      fileType: "image",
      sizeLabel: "2.7 MB",
      uploadedAt: ago(30),
      uploadedBy: "Dra. Juliana Costa",
    },
    // Vinícius Barros (pac-8)
    {
      id: "doc-12",
      patientId: "pac-8",
      name: "Receita - Amoxicilina.pdf",
      category: "receita",
      fileType: "pdf",
      sizeLabel: "115 KB",
      uploadedAt: ago(1),
      uploadedBy: "Dra. Beatriz Lima",
    },
    {
      id: "doc-13",
      patientId: "pac-8",
      name: "Atestado médico.pdf",
      category: "atestado",
      fileType: "pdf",
      sizeLabel: "92 KB",
      uploadedAt: ago(1),
      uploadedBy: "Dra. Beatriz Lima",
    },
    {
      id: "doc-14",
      patientId: "pac-8",
      name: "Exame de sangue.pdf",
      category: "exame",
      fileType: "pdf",
      sizeLabel: "705 KB",
      uploadedAt: ago(90),
      uploadedBy: "Dra. Beatriz Lima",
    },
    // Renata Pires (pac-9)
    {
      id: "doc-15",
      patientId: "pac-9",
      name: "Ficha cadastral.docx",
      category: "documento",
      fileType: "doc",
      sizeLabel: "50 KB",
      uploadedAt: ago(700),
      uploadedBy: "Ana Souza",
    },
    // Diego Ramos (pac-10)
    {
      id: "doc-16",
      patientId: "pac-10",
      name: "Receita - Vitamina D.pdf",
      category: "receita",
      fileType: "pdf",
      sizeLabel: "104 KB",
      uploadedAt: ago(25),
      uploadedBy: "Dr. Thiago Alves",
    },
    // Camila Duarte (pac-11)
    {
      id: "doc-17",
      patientId: "pac-11",
      name: "Mamografia.jpg",
      category: "exame",
      fileType: "image",
      sizeLabel: "2.9 MB",
      uploadedAt: ago(10),
      uploadedBy: "Dr. Rafael Nunes",
    },
    {
      id: "doc-18",
      patientId: "pac-11",
      name: "Atestado - Repouso 3 dias.pdf",
      category: "atestado",
      fileType: "pdf",
      sizeLabel: "88 KB",
      uploadedAt: ago(10),
      uploadedBy: "Dr. Rafael Nunes",
    },
    // Sabrina Moura (pac-13)
    {
      id: "doc-19",
      patientId: "pac-13",
      name: "Exame de urina.pdf",
      category: "exame",
      fileType: "pdf",
      sizeLabel: "560 KB",
      uploadedAt: ago(6),
      uploadedBy: "Dra. Camila Rocha",
    },
    {
      id: "doc-20",
      patientId: "pac-13",
      name: "Encaminhamento.pdf",
      category: "documento",
      fileType: "pdf",
      sizeLabel: "72 KB",
      uploadedAt: ago(6),
      uploadedBy: "Dra. Camila Rocha",
    },
    // Henrique Farias (pac-14)
    {
      id: "doc-21",
      patientId: "pac-14",
      name: "Raio-X tórax.jpg",
      category: "exame",
      fileType: "image",
      sizeLabel: "3.3 MB",
      uploadedAt: ago(45),
      uploadedBy: "Dr. Thiago Alves",
    },
    {
      id: "doc-22",
      patientId: "pac-14",
      name: "Receita - Anti-inflamatório.pdf",
      category: "receita",
      fileType: "pdf",
      sizeLabel: "118 KB",
      uploadedAt: ago(45),
      uploadedBy: "Dr. Thiago Alves",
    },
    {
      id: "doc-23",
      patientId: "pac-14",
      name: "Cartão de convênio.pdf",
      category: "documento",
      fileType: "pdf",
      sizeLabel: "310 KB",
      uploadedAt: ago(450),
      uploadedBy: "Ana Souza",
    },
  ];
}
