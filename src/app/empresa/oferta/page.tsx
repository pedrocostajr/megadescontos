import { myPartner } from "../partner";
import { OfferForm } from "./OfferForm";

export default async function Oferta() {
  const { partner } = await myPartner();
  if (!partner) return null;
  return <OfferForm p={partner} />;
}
