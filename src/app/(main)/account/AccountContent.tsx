"use client"; // Mark this as a client component

import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import { redirect } from "next/navigation";
import Divider from "@modules/common/components/divider"; // Import Divider component for consistency

interface AccountContentProps {
  customer: any; // Replace 'any' with the actual type of customer if you have a type definition
  orders: any[]; // Replace 'any' with the actual type of orders if you have a type definition
  completeness: number;
}

export default function AccountContent({ customer, orders, completeness }: AccountContentProps) {
  return (
    <div className="w-full space-y-12">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Account Overview</h1>
        <p className="text-base-regular">
          View your account details, recent orders, and more. Manage your profile, addresses, and orders from the sidebar.
        </p>
      </div>

      {/* Greeting + Stats */}
      <Card className="shadow-md border border-gray-200 rounded-xl">
        <CardHeader className="space-y-2 p-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Hello, {customer.first_name}
          </h2>
          <p className="text-base text-gray-500">Signed in as: {customer.email}</p>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg text-center border border-blue-100">
              <p className="text-5xl font-bold text-blue-600">{completeness}%</p>
              <p className="mt-4 text-base text-gray-700">Profile Completed</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg text-center border border-blue-100">
              <p className="text-5xl font-bold text-blue-600">{customer.addresses?.length || 0}</p>
              <p className="mt-4 text-base text-gray-700">Saved Addresses</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Divider />

      {/* Recent Orders */}
      <Card className="shadow-md border border-gray-200 rounded-xl">
        <CardHeader className="flex items-center justify-between p-6">
          <h3 className="text-2xl font-semibold text-gray-900">Recent Orders</h3>
          {orders.length > 0 && (
            <Button
              color="primary"
              variant="light"
              size="md"
              onClick={() => redirect("/account/orders")} // Updated to match AccountNav’s route
            >
              View all
            </Button>
          )}
        </CardHeader>
        <CardBody className="p-6">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-base">No recent orders</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-gray-700 font-semibold text-base">Order #</th>
                  <th className="py-4 px-6 text-gray-700 font-semibold text-base">Date</th>
                  <th className="py-4 px-6 text-gray-700 font-semibold text-base">Total</th>
                  <th className="py-4 px-6 text-gray-700 font-semibold text-base">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">{o.id.substring(0, 8)}</td>
                    <td className="py-4 px-6">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      {o.currency_code.toUpperCase()} {o.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 capitalize">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Note: The CTA is already rendered by AccountLayout, so we don’t need to include it here */}
    </div>
  );
}