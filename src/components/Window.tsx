import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type Props = {
  id?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  toolbar?: ReactNode;
};

/**
 * visionOS-style floating glass window. Has a subtle grabber bar at the
 * bottom (purely decorative — selling the spatial metaphor), rounded
 * chrome, and a soft highlight rim.
 */
export function Window({
  id,
  title,
  subtitle,
  className,
  children,
  toolbar,
}: Props) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className={cn(
        "glass-window relative flex flex-col overflow-hidden",
        className,
      )}
    >
      {(title || toolbar) && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b hairline">
          <div>
            {title && (
              <div className="text-[15px] font-medium text-white/95 tracking-tight">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-[11px] text-white/55 mt-0.5">{subtitle}</div>
            )}
          </div>
          <div className="flex items-center gap-2">{toolbar}</div>
        </div>
      )}
      <div className="flex-1 relative">{children}</div>
      {/* Grabber bar */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 flex items-center gap-1.5 pointer-events-none">
        <div className="w-24 h-1.5 rounded-full bg-white/25 shadow-[0_0_12px_rgba(255,255,255,0.25)]" />
      </div>
    </motion.div>
  );
}
