/**
 * Monta um link de "clique pra conversar" do WhatsApp Web (wa.me) — abre uma
 * conversa com a mensagem já preenchida, mas quem envia é sempre uma pessoa,
 * clicando em "Enviar" dentro do próprio WhatsApp. Sem integração, sem
 * chave de API.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
