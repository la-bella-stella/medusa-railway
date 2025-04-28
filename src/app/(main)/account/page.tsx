import { redirect } from "next/navigation";
import { Metadata } from "next";
import Overview from "@modules/account/components/overview";
import { retrieveCustomer } from "@lib/data/customer";
import { listOrders } from "@lib/data/orders";
import AccountContent from "./AccountContent"; // Import the new client component

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
};

export default async function AccountPage() {
  const customer = await retrieveCustomer().catch(() => null);
  if (!customer) {
    redirect("/login?from=/account");
  }

  const orders = (await listOrders().catch(() => [])) || [];

  const completeness = customer.first_name && customer.last_name ? 50 : 0;

  return <AccountContent customer={customer} orders={orders} completeness={completeness} />;
}