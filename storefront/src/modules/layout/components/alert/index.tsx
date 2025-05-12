// src/modules/layout/components/alert/index.tsx
interface AlertProps {
    message: string;
    variant: string;
    className?: string;
    childClassName?: string;
    children?: React.ReactNode;
  }
  
  const Alert: React.FC<AlertProps> = ({ message, variant, className, childClassName, children }) => {
    return (
      <div className={className}>
        <div className={childClassName}>{message}</div>
        {children}
      </div>
    );
  };
  
  export default Alert;