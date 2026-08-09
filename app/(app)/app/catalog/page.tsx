import { redirect } from "next/navigation";

// Catálogo se consolidó en Productos (la vista real, backed por `/products`).
// Se conserva `components/catalog/CatalogView.tsx` por si se repurpone a un
// catálogo público más adelante.
export default function Page() {
  redirect("/app/products");
}
