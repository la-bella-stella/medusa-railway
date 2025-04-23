// src/modules/common/icons/flags/flag-ar.tsx
import { SVGAttributes } from "react";

const FlagAr: React.FC<SVGAttributes<SVGElement>> = ({ className }) => {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24">
      <rect width="24" height="24" fill="#F0F0F0" />
      <rect x="0" y="0" width="24" height="8" fill="#000000" />
      <rect x="0" y="16" width="24" height="8" fill="#000000" />
      <rect x="0" y="0" width="8" height="24" fill="#CE1126" />
    </svg>
  );
};

export default FlagAr;