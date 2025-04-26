import { FC, ReactNode } from "react";
import classNames from "classnames";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const Container: FC<ContainerProps> = ({ children, className = "" }) => {
  return (
    <div
      className={classNames(
        "max-w-[1920px] mx-auto px-4 md:px-8 2xl:px-16",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;