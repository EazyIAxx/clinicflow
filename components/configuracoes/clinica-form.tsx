"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ClinicaForm() {
  const [name, setName] = useState("Clínica ClinicFlow");
  const [cnpj, setCnpj] = useState("12.345.678/0001-90");
  const [phone, setPhone] = useState("(11) 4002-8922");
  const [address, setAddress] = useState("Av. Paulista, 1000 — São Paulo, SP");
  const [hours, setHours] = useState("Segunda a sexta, 08h às 19h. Sábado, 08h às 12h.");
  const [justSaved, setJustSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJustSaved(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da clínica</CardTitle>
        <CardDescription>
          Essas informações aparecem em e-mails e no atendimento via WhatsApp.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clinica-nome">Nome da clínica</Label>
            <Input
              id="clinica-nome"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setJustSaved(false);
              }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clinica-cnpj">CNPJ</Label>
              <Input
                id="clinica-cnpj"
                value={cnpj}
                onChange={(event) => {
                  setCnpj(event.target.value);
                  setJustSaved(false);
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clinica-telefone">Telefone</Label>
              <Input
                id="clinica-telefone"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setJustSaved(false);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clinica-endereco">Endereço</Label>
            <Input
              id="clinica-endereco"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                setJustSaved(false);
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clinica-horario">Horário de funcionamento</Label>
            <Textarea
              id="clinica-horario"
              value={hours}
              onChange={(event) => {
                setHours(event.target.value);
                setJustSaved(false);
              }}
              rows={2}
            />
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-3">
          <Button type="submit">Salvar</Button>
          {justSaved && <span className="text-muted-foreground text-sm">Alterações salvas.</span>}
        </CardFooter>
      </form>
    </Card>
  );
}
