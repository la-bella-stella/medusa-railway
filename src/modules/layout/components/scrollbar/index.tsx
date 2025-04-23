// src/modules/layout/components/scrollbar/index.tsx
import React from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import cn from "classnames";

interface ScrollbarProps {
  options?: any;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const Scrollbar: React.FC<ScrollbarProps> = ({
  options,
  children,
  style,
  className,
  ...props
}) => {
  return (
    <OverlayScrollbarsComponent
      options={{
        scrollbars: { autoHide: "scroll" },
        ...(options ? options : {}),
      }}
      className={cn("os-theme-thin", className)}
      style={style}
      defer
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default Scrollbar;