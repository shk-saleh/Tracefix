"use client";

import { motion } from "framer-motion";
import { type TimelineItem as TTimelineItem } from "@/types/investigation";
import TimelineItem from "./TimelineItem";

interface TimelineProps {
  items: TTimelineItem[];
}

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function Timeline({ items }: TimelineProps) {
  if (items.length === 0) return null;

  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="relative flex flex-col"
      aria-label="Investigation timeline"
    >
      {items.map((item, i) => (
        <TimelineItem
          key={item.id}
          item={item}
          index={i}
          isLast={i === items.length - 1}
        />
      ))}
    </motion.ul>
  );
}
