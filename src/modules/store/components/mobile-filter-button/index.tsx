"use client";

import { useUI } from "@lib/context/ui-context";

export default function MobileFilterButton({
  itemCount,
}: {
  itemCount: number;
}) {
  const { openSidebar } = useUI();

  const handleFilterButtonClick = () => {
    openSidebar({
      view: "DISPLAY_FILTER",
      data: { searchResultCount: itemCount },
    });
  };

  return (
    <button
      className="lg:hidden text-heading text-sm px-4 py-2 font-semibold border border-gray-300 rounded-md flex items-center transition duration-200 ease-in-out focus:outline-none hover:bg-gray-200"
      onClick={handleFilterButtonClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18px"
        height="14px"
        viewBox="0 0 18 14"
      >
        <g transform="translate(-925 -1122.489)">
          <path
            d="M942.581,1295.564H925.419c-.231,0-.419-.336-.419-.75s.187-.75.419-.75h17.163c.231,0,.419.336.419.75S942.813,1295.564,942.581,1295.564Z"
            transform="translate(0 -169.575)"
            fill="currentColor"
          />
          <path
            d="M942.581,1951.5H925.419c-.231,0-.419-.336-.419-.75s.187-.75.419-.75h17.163c.231,0,.419.336.419.75S942.813,1951.5,942.581,1951.5Z"
            transform="translate(0 -816.512)"
            fill="currentColor"
          />
          <path
            d="M1163.713,1122.489a2.5,2.5,0,1,0,1.768.732A2.483,2.483,0,0,0,1163.713,1122.489Z"
            transform="translate(-233.213)"
            fill="currentColor"
          />
          <path
            d="M2344.886,1779.157a2.5,2.5,0,1,0,.731,1.768A2.488,2.488,0,0,0,2344.886,1779.157Z"
            transform="translate(-1405.617 -646.936)"
            fill="currentColor"
          />
        </g>
      </svg>
      <span className="ltr:pl-2.5 rtl:pr-2.5">Filters</span>
    </button>
  );
}