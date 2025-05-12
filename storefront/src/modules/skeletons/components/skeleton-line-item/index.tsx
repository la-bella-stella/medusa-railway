import { Table } from "@medusajs/ui"

const SkeletonLineItem = () => {
  return (
    <Table.Row className="w-full py-4 md:py-7 border-b border-gray-100 m-4">
      <Table.Cell className="p-4 w-24 md:w-28">
        <div className="flex w-24 md:w-28 h-24 bg-gray-200 animate-pulse rounded-md" />
      </Table.Cell>
      <Table.Cell className="text-left align-top">
        <div className="flex flex-col gap-y-2">
          <div className="w-32 h-4 bg-gray-200 animate-pulse" />
          <div className="w-24 h-4 bg-gray-200 animate-pulse" />
        </div>
      </Table.Cell>
      <Table.Cell className="align-top">
        <div className="flex gap-2 items-center">
          <div className="w-6 h-8 bg-gray-200 animate-pulse" />
          <div className="w-14 h-10 bg-gray-200 animate-pulse" />
        </div>
      </Table.Cell>
      <Table.Cell className="align-top">
        <div className="flex gap-2">
          <div className="w-12 h-6 bg-gray-200 animate-pulse" />
        </div>
      </Table.Cell>
      <Table.Cell className="align-top">
        <div className="flex gap-2 justify-end">
          <div className="w-12 h-6 bg-gray-200 animate-pulse" />
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default SkeletonLineItem