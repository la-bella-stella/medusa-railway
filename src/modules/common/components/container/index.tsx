// src/modules/common/components/container/index.tsx
import cn from "classnames";

interface ContainerProps {
  className?: string;
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ className, children }) => {
  return (
    <div
      className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
};

export default Container;