// src/modules/common/components/container/index.tsx
import React from "react";
import cn from "classnames";
import { twMerge } from "tailwind-merge";

interface ContainerProps {
  /**
   * Additional classes to merge in.
   */
  className?: string;
  /**
   * Child elements.
   */
  children?: React.ReactNode;
  /**
   * Which HTML element to render (e.g. "div", "section").
   */
  el?: keyof JSX.IntrinsicElements;
  /**
   * If true, removes all max-width and horizontal padding.
   */
  clean?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  className,
  el = "div",
  clean,
}) => {
  // When clean is false (default), apply legacy gutters & max-width:
  //   • mx-auto           — center horizontally
  //   • max-w-[1920px]    — cap at 1920px
  //   • px-4              — 1rem on mobile
  //   • md:px-8           — 2rem on md+
  //   • 2xl:px-16         — 4rem on 2xl+
  const rootClassName = cn(className, {
    "mx-auto max-w-[1920px] px-4 md:px-8 2xl:px-16": !clean,
  });

  const Component = el as React.ElementType;

  return <Component className={twMerge(rootClassName)}>{children}</Component>;
};

export default Container;
