import { Metadata } from "next";
import OrderOverview from "@modules/account/components/order-overview";
import { notFound } from "next/navigation";
import { listOrders } from "@lib/data/orders";
import Divider from "@modules/common/components/divider";
import TransferRequestForm from "@modules/account/components/transfer-request-form";

// Force each request to be server-rendered (no static prerender)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
};

export default async function Orders() {
  let orders;
  try {
    orders = await listOrders();
  } catch (err) {
    // If the API call fails (e.g. unauthorized), show 404 or redirect to login
    
    notFound();
  }

  if (!orders) {
    notFound();
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Orders</h1>
        <p className="text-base-regular">
          View your previous orders and their status. You can also create
          returns or exchanges for your orders if needed.
        </p>
      </div>

      <div>
        <OrderOverview orders={orders} />
        <Divider className="my-8" />
        <TransferRequestForm />
      </div>
    </div>
  );
}
