import { ValidateForm } from "./ValidateForm";

export default function Validar() {
  return (
    <div className="box">
      <h2>Validar cupom do cliente</h2>
      <p className="note">Digite o código que aparece no celular do cliente. Cada cupom vale uma vez; na próxima visita o cliente resgata outro.</p>
      <ValidateForm />
    </div>
  );
}
