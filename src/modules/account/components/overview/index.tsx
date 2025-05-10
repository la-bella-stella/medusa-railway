import { Container } from "@medusajs/ui"
import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const profileCompletion = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0

  return (
    <div data-testid="overview-page-wrapper">
      <div className="hidden small:block">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-2xl font-semibold"
            data-testid="welcome-message"
            data-value={customer?.first_name}
          >
            Hello {customer?.first_name}
          </h1>
          <p className="text-sm text-gray-600">
            Signed in as:{" "}
            <span
              className="font-medium"
              data-testid="customer-email"
              data-value={customer?.email}
            >
              {customer?.email}
            </span>
          </p>
        </div>

        {/* Profile Overview */}
        <div className="border-t border-gray-200 pt-8 space-y-10">
          <div className="flex gap-x-12">
            <OverviewStat title="Profile" value={`${profileCompletion}%`} subtitle="Completed" />
            <OverviewStat title="Addresses" value={addressCount} subtitle="Saved" />
          </div>

          {/* Recent Orders */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <ul className="space-y-4" data-testid="orders-wrapper">
              {orders && orders.length > 0 ? (
                orders.slice(0, 5).map((order) => (
                  <li key={order.id} data-testid="order-wrapper" data-value={order.id}>
                    <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
                      <Container className="bg-gray-50 p-4 flex justify-between items-center rounded-md hover:bg-gray-100 transition">
                        <div className="grid grid-cols-3 grid-rows-2 gap-x-4 text-sm flex-1">
                          <span className="font-semibold">Date placed</span>
                          <span className="font-semibold">Order number</span>
                          <span className="font-semibold">Total amount</span>

                          <span data-testid="order-created-date">
                            {new Date(order.created_at).toDateString()}
                          </span>
                          <span data-testid="order-id" data-value={order.display_id}>
                            #{order.display_id}
                          </span>
                          <span data-testid="order-amount">
                            {convertToLocale({
                              amount: order.total,
                              currency_code: order.currency_code,
                            })}
                          </span>
                        </div>

                        <button
                          className="ml-4 text-gray-500 hover:text-gray-700 transition"
                          data-testid="open-order-button"
                          aria-label={`Go to order #${order.display_id}`}
                        >
                          <ChevronDown className="-rotate-90" />
                        </button>
                      </Container>
                    </LocalizedClientLink>
                  </li>
                ))
              ) : (
                <span data-testid="no-orders-message" className="text-sm text-gray-500">
                  No recent orders
                </span>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

const OverviewStat = ({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string | number
  subtitle: string
}) => (
  <div className="flex flex-col gap-1">
    <h3 className="text-base font-medium text-gray-900">{title}</h3>
    <div className="flex items-end gap-x-1">
      <span className="text-3xl font-semibold leading-none">{value}</span>
      <span className="uppercase text-xs text-gray-500">{subtitle}</span>
    </div>
  </div>
)

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  if (!customer) return 0

  let count = 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  if (customer.addresses?.find((addr) => addr.is_default_billing)) count++

  return Math.round((count / 4) * 100)
}

export default Overview
