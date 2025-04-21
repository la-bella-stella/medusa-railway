// src/modules/layout/components/mega-menu/index.tsx
interface MegaMenuProps {
    columns: any;
    image?: string;
  }
  
  const MegaMenu: React.FC<MegaMenuProps> = ({ columns, image }) => {
    return <div>MegaMenu Placeholder (columns: {columns.length}, image: {image || "none"})</div>;
  };
  
  export default MegaMenu;