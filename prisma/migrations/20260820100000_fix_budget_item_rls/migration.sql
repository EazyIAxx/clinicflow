-- Corrige uma brecha de RLS encontrada na revisão de segurança do M21:
-- as policies de INSERT/DELETE de "BudgetItem" só checavam o perfil do
-- usuário (recepcionista/gestor), sem restringir pelo clinicId do Budget
-- pai — abria brecha pra escrever/apagar itens de orçamento de OUTRA
-- clínica via acesso direto à API REST do Supabase (anon key). O Prisma
-- nunca foi afetado, porque as Server Actions sempre escrevem BudgetItem
-- aninhado dentro de um Budget já filtrado por `where: { clinicId }`; isso
-- é só o reforço de defesa em profundidade da RLS, igual ao já aplicado na
-- policy de SELECT (budget_item_select_same_clinic).

DROP POLICY "budget_item_write_manager" ON "BudgetItem";
DROP POLICY "budget_item_delete_manager" ON "BudgetItem";

CREATE POLICY "budget_item_write_manager" ON "BudgetItem"
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('recepcionista', 'gestor')
    AND EXISTS (
      SELECT 1 FROM "Budget" b
      WHERE b.id = "BudgetItem"."budgetId" AND b."clinicId" = public.current_clinic_id()
    )
  );

CREATE POLICY "budget_item_delete_manager" ON "BudgetItem"
  FOR DELETE
  USING (
    public.current_user_role() IN ('recepcionista', 'gestor')
    AND EXISTS (
      SELECT 1 FROM "Budget" b
      WHERE b.id = "BudgetItem"."budgetId" AND b."clinicId" = public.current_clinic_id()
    )
  );
