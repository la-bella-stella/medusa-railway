// src/modules/common/icons/minus.tsx
import React from "react";

type MinusIconProps = {
  width?: string;
  height?: string;
  className?: string;
};

const MinusIcon: React.FC<MinusIconProps> = ({
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
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default MinusIcon;