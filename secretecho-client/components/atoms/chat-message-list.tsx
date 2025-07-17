import { cn } from "@/lib/utils";
import * as React from "react";

const ChatMessageList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      className={cn("flex flex-col w-full h-full font-nunito p-6 gap-3 overflow-y-auto", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };