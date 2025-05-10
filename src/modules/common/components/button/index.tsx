"use client";

import React from "react";
import classNames from "classnames";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "slim" | "normal";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = "normal",
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-heading rounded-md transition duration-200 ease-in-out",
        {
          "opacity-50 cursor-not-allowed": disabled || loading,
          "px-6 py-3": variant === "normal",
          "px-8 py-2": variant === "slim",
        },
        className
      )}
    >
      {loading ? (
        <span className="animate-pulse">Loading...</span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;