"use client"

import { Card, CardBody, Button } from "@nextui-org/react"
import Divider from "@modules/common/components/divider"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import { useRouter } from "next/navigation"

interface AccountContentProps {
  customer: {
    first_name: string
    email: string
    addresses?: any[]
  }
  orders: any[]
  completeness: number
}

const AccountContent = ({ customer }: AccountContentProps) => {
  const router = useRouter()

  const actions = [
    {
      icon: <Package className="w-12 h-12 text-gray-500" />,
      title: "Your Orders",
      description: "View and manage your recent orders.",
      action: () => router.push("/account/dashboard/orders"),
      button: "View Orders",
    },
    {
      icon: <MapPin className="w-12 h-12 text-gray-500" />,
      title: "Your Addresses",
      description: `Manage your shipping addresses (${customer.addresses?.length || 0}).`,
      action: () => router.push("/account/dashboard/addresses"),
      button: "Manage Addresses",
    },
    {
      icon: <User className="w-12 h-12 text-gray-500" />,
      title: "Your Profile",
      description: "Update your profile information.",
      action: () => router.push("/account/dashboard/profile"),
      button: "Update Profile",
    },
  ]

  return (
    <section className="w-full  mx-auto mt-8 md:mt-0">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {customer.first_name}</h1>
        <p className="text-base text-gray-600 mt-2">Signed in as <span className="font-medium">{customer.email}</span></p>
      </div>

      <Divider className="my-10" />

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map(({ icon, title, description, action, button }) => (
          <Card key={title} className="border border-gray-200 shadow-none rounded-lg">
            <CardBody className="flex items-start gap-4 p-6">
              <div className="shrink-0">{icon}</div>
              <div className="flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">{description}</p>
                <div>
                  <Button
                    onClick={action}
                    color="primary"
                    size="sm"
                    className="bg-black text-white px-5 py-2 rounded-md"
                  >
                    {button}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default AccountContent
