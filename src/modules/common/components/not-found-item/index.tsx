// src/modules/common/components/not-found-item/index.tsx
interface NotFoundItemProps {
    text: string;
  }
  
  const NotFoundItem: React.FC<NotFoundItemProps> = ({ text }) => (
    <div className="p-5 mb-12 border border-gray-300 rounded shadow-lg md:mb-14 xl:mb-16">
      {text}
    </div>
  );
  
  export default NotFoundItem;