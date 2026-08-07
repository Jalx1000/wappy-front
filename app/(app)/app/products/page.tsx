import { ProductsView } from "@/components/products/ProductsView";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Products" };
export default function Page() { return <ProductsView />; }
