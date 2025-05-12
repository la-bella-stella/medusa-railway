// src/modules/common/components/legacy-input/index.tsx
import cn from "classnames";
import { useTranslation } from "react-i18next";

interface LegacyInputProps {
  placeholderKey: string;
  type: string;
  variant: "solid" | "outline";
  className?: string;
  inputClassName?: string;
  errorKey?: string;
  disabled?: boolean;
  [key: string]: any;
}

const LegacyInput: React.FC<LegacyInputProps> = ({
  placeholderKey,
  type,
  variant = "solid",
  className = "",
  inputClassName = "",
  errorKey,
  disabled,
  ...props
}) => {
  const { t } = useTranslation("forms");

  return (
    <div className={cn("w-full", className)}>
      <input
        type={type}
        placeholder={t(placeholderKey)}
        className={cn(
          "border border-gray-300 rounded px-4 py-2",
          variant === "solid" ? "bg-gray-50" : "bg-transparent",
          disabled && "opacity-50 cursor-not-allowed",
          inputClassName
        )}
        disabled={disabled}
        {...props}
      />
      {errorKey && (
        <p className="mt-1 text-xs text-red-500">{t(errorKey)}</p>
      )}
    </div>
  );
};

export default LegacyInput;