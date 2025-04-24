// src/modules/common/icons/counter-plus-icon.tsx
import React from "react";

type CounterPlusIconProps = {
  width?: string;
  height?: string;
  className?: string;
};

const CounterPlusIcon: React.FC<CounterPlusIconProps> = ({
  width = "12px",
  height = "12px",
  className,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default CounterPlusIcon;