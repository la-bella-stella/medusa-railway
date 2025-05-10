// src/modules/layout/components/list-menu/index.tsx
interface ListMenuProps {
    dept: number;
    data: any;
    hasSubMenu: boolean;
    menuName: string;
    menuIndex: number;
  }
  
  const ListMenu: React.FC<ListMenuProps> = ({ dept, data, hasSubMenu, menuName, menuIndex }) => {
    return <li>ListMenu Placeholder (menu: {menuName})</li>;
  };
  
  export default ListMenu;