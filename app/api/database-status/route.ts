import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

/**
 * Checagem temporária de conexão. Não retorna registros nem credenciais.
 * Removeremos esta rota quando o painel administrativo estiver pronto.
 */
export async function GET() {
  const { error } = await supabase.from("food_parks").select("id").limit(1);

  if (error) {
    // Útil apenas durante a configuração local; não contém chaves ou senhas.
    console.error("Supabase database-status:", error);
    return NextResponse.json(
      {
        connected: false,
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ connected: true });
}
