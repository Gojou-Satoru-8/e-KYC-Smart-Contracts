import { cn } from "@nextui-org/react";

const IconWrapper = ({ children, className }) => (
  <div className={cn(className, "flex items-center rounded-small justify-center w-7 h-7")}>
    {children}
  </div>
);

export default IconWrapper;
