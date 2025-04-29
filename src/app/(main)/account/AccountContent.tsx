"use client"; // Mark this as a client component

import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import Divider from "@modules/common/components/divider"; // Import Divider component for consistency
import User from "@modules/common/icons/user"; // Import icons for action cards
import MapPin from "@modules/common/icons/map-pin";
import Package from "@modules/common/icons/package";
import { useRouter } from "next/navigation"; // Import useRouter for client-side navigation

interface AccountContentProps {
  customer: any; // Replace 'any' with the actual type of customer if you have a type definition
  orders: any[]; // Replace 'any' with the actual type of orders if you have a type definition
  completeness: number;
}

export default function AccountContent({ customer, orders, completeness }: AccountContentProps) {
  const router = useRouter(); // Initialize useRouter for navigation

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Account Overview</h1>
        <p className="text-base text-gray-700">
          Welcome to your account dashboard, {customer.first_name}. Manage your account details below.
        </p>
      </div>

      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Hello, {customer.first_name}
        </h2>
        <p className="text-base text-gray-500 mt-1">Signed in as: {customer.email}</p>
      </div>

      <Divider className="my-8" />

      {/* Action Cards */}
      <div className="space-y-6">
        {/* Your Orders */}
        <Card className="shadow-none border border-gray-200 rounded-lg">
          <CardBody className="flex flex-col sm:flex-row items-center gap-6 p-6">
            {/* Icon */}
            <div className="w-32 h-32 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-500" />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Your Orders</h3>
              <p className="text-base text-gray-700 mt-2">
                View and manage your recent orders.
              </p>
            </div>

            {/* Action Button */}
            <Button
              color="primary"
              variant="solid"
              size="md"
              className="bg-black text-white rounded-md px-6 py-2"
              onClick={() => router.push("/account/dashboard/orders")} // Use router.push instead of redirect
            >
              View Orders
            </Button>
          </CardBody>
        </Card>

        {/* Your Addresses */}
        <Card className="shadow-none border border-gray-200 rounded-lg">
          <CardBody className="flex flex-col sm:flex-row items-center gap-6 p-6">
            {/* Icon */}
            <div className="w-32 h-32 flex items-center justify-center">
              <MapPin className="w-16 h-16 text-gray-500" />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Your Addresses</h3>
              <p className="text-base text-gray-700 mt-2">
                Manage your shipping addresses ({customer.addresses?.length || 0}).
              </p>
            </div>

            {/* Action Button */}
            <Button
              color="primary"
              variant="solid"
              size="md"
              className="bg-black text-white rounded-md px-6 py-2"
              onClick={() => router.push("/account/dashboard/addresses")} // Use router.push instead of redirect
            >
              Manage Addresses
            </Button>
          </CardBody>
        </Card>

        {/* Your Profile */}
        <Card className="shadow-none border border-gray-200 rounded-lg">
          <CardBody className="flex flex-col sm:flex-row items-center gap-6 p-6">
            {/* Icon */}
            <div className="w-32 h-32 flex items-center justify-center">
              <User className="w-16 h-16 text-gray-500" />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Your Profile</h3>
              <p className="text-base text-gray-700 mt-2">
                Update your profile information.
              </p>
            </div>

            {/* Action Button */}
            <Button
              color="primary"
              variant="solid"
              size="md"
              className="bg-black text-white rounded-md px-6 py-2"
              onClick={() => router.push("/account/dashboard/profile")} // Use router.push instead of redirect
            >
              Update Profile
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}