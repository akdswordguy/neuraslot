import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";

const AnimatedItem = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
  selected
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3, triggerOnce: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={
        inView
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.9, y: 20 }
      }
      transition={{ duration: 0.3, delay: delay }}
      className={`${selected ? "opacity-100" : "opacity-90"} transition-all`}
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({
  items = [],
  onItemSelect,
  enableArrowNavigation = false,
  className = "",
  itemClassName = ""
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!enableArrowNavigation) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && selectedIndex !== -1) {
        onItemSelect?.(items[selectedIndex], selectedIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIndex, enableArrowNavigation, onItemSelect]);

  return (
    <div className={`relative w-full ${className}`}>
      <div ref={listRef} className="max-h-[400px] overflow-y-auto space-y-4">
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            index={index}
            delay={index * 0.005}
            selected={index === selectedIndex}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              onItemSelect?.(item, index);
            }}
          >
            <div className={`p-2 rounded-md ${itemClassName}`}>
              {item}
            </div>
          </AnimatedItem>
        ))}
      </div>
    </div>
  );
};

export default AnimatedList;
