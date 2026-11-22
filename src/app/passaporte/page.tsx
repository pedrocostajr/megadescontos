import type { Metadata } from "next";
import Link from "next/link";
import { getSession, getSettings } from "@/lib/data";
import { brl } from "@/lib/format";
import { startSubscription } from "@/app/conta/actions";
import { SavingsCalc } from "./SavingsCalc";

export const metadata: Metadata = {
  title: "Passaporte anual de descontos",
  description: "Um pagamento por ano e descontos de 10% a 30% em restaurantes, pousadas e passeios da Serra Gaúcha, quantas vezes quiser.",
  alternates: { canonical: "/passaporte" },
};

export default async function Passaporte({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const [{ supabase, user }, settings] = await Promise.all([getSession(), getSettings()]);
  const active = user ? Boolean((await supabase.rpc("has_active_subscription")).data) : false;
  return (
    <section className="band"><div className="wrap">
      <div className="sec-head"><div><div className="eyebrow">Passaporte anual</div><h1 className="page-title">Um passaporte, a Serra Gaúcha inteira</h1></div>
        <p>Pague uma vez e use os descontos por 12 meses, quantas vezes quiser em cada parceiro.</p></div>
      <div className="plans">
        <div className="plan">
          <div className="eyebrow">Passaporte anual</div>
          <div className="price">{brl(settings.passportPrice)} <small>/ano</small></div>
          <div className="note" style={{ fontSize: 14 }}>Equivale a {brl(settings.passportPrice / 12)} por mês</div>
          <ul>
            <li>Todos os parceiros de gastronomia, hospedagem e turismo</li>
            <li>Descontos de 10% a 30% em cada visita</li>
            <li>Uso repetido no mesmo estabelecimento, o ano todo</li>
            <li>Cupom digital com código e QR no celular</li>
            <li>Histórico de resgates e total economizado</li>
          </ul>
          {erro && <div className="alert err" role="alert" style={{ marginBottom: 12 }}>{erro}</div>}
          {active ? <Link className="btn btn-pine" href="/conta">Seu passaporte está ativo · ver meus cupons</Link>
            : !user ? <Link className="btn btn-sun" href="/entrar?next=/passaporte">Criar conta para assinar</Link>
            : <form action={startSubscription} style={{ display: "grid", gap: 8 }}>
                <button className="btn btn-sun">Ativar passaporte</button>
                {settings.paymentsMode === "simulado" && <span className="hint">Pagamento em modo de teste: o passaporte é ativado sem cobrança até a integração de pagamento entrar no ar.</span>}
              </form>}
        </div>
        <SavingsCalc price={settings.passportPrice} />
      </div>
    </div></section>
  );
}
