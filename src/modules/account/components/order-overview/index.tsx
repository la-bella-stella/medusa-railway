"use client"

import { Button } from "@medusajs/ui"
import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <section className="flex flex-col gap-8 w-full">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border-b border-gray-200 pb-6 last:pb-0 last:border-none"
          >
            <OrderCard order={order} />
          </div>
        ))}
      </section>
    )
  }

  return (
    <section
      className="w-full flex flex-col items-center justify-center text-center gap-4 py-12"
      data-testid="no-orders-container"
    >
      <h2 className="text-2xl font-semibold text-gray-900">
        Nothing to see here
      </h2>
      <p className="text-base text-gray-600 max-w-md">
        You haven't placed any orders yet. Let’s fix that and find something you'll love.
      </p>
      <LocalizedClientLink href="/" passHref>
        <Button data-testid="continue-shopping-button" className="mt-4">
          Continue shopping
        </Button>
      </LocalizedClientLink>
    </section>
  )
}

export default OrderOverview
