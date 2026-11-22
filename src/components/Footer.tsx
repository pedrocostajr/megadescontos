import Link from "next/link";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div style={{ maxWidth: 420 }}>
          <b>Mega Descontos Serra</b>
          <br />
          Conectamos você aos melhores lugares da Serra Gaúcha. Restaurantes, passeios, hospedagens e entretenimento.
        </div>
        <div>
          <Link href="/parceiros">Parceiros</Link> · <Link href="/blog">Blog</Link> · <Link href="/seja-parceiro">Seja parceiro</Link>
          <br />
          Descontos de 10% a 30% · use mais de uma vez no mesmo lugar
          <br />
          <span style={{ fontSize: 12 }}>Foto da Catedral de Pedra: Rosanetur, CC BY 2.0, via Wikimedia Commons</span>
        </div>
      </div>
    </footer>
  );
}
