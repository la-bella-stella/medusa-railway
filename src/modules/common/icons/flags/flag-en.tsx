// src/modules/common/icons/flags/flag-en.tsx
import { SVGAttributes } from "react";

const FlagEn: React.FC<SVGAttributes<SVGElement>> = ({ className }) => {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24">
      <rect width="24" height="24" fill="#F0F0F0" />
      <rect x="0" y="0" width="24" height="8" fill="#D80027" />
      <rect x="0" y="16" width="24" height="8" fill="#D80027" />
      <rect x="0" y="0" width="8" height="24" fill="#00247D" />
      <rect x="16" y="0" width="8" height="24" fill="#00247D" />
    </svg>
  );
};

export default FlagEn;