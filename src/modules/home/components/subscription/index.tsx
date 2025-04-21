// src/modules/home/components/subscription/index.tsx
interface SubscriptionProps {
    className?: string;
    variant: "modern";
  }
  
  const Subscription: React.FC<SubscriptionProps> = ({ className, variant }) => {
    return <div className={className}>Subscription Placeholder (Variant: {variant})</div>;
  };
  
  export default Subscription;