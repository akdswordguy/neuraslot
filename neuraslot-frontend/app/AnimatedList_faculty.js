import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";

const AnimatedItem = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3, triggerOnce: false });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0 }}
      transition={{ duration: 0.25, delay }}
      style={{ marginBottom: "12px" }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({ items = [], renderItem }) => {
  const listRef = useRef(null);

  return (
    <div
      ref={listRef}
      style={{
        maxHeight: "350px",
        overflowY: "auto",
        paddingRight: "6px",
      }}
    >
      {items.map((item, index) => (
        <AnimatedItem key={index} delay={index * 0.05}>
          {renderItem ? renderItem(item, index) : null}
        </AnimatedItem>
      ))}
    </div>
  );
};

export default AnimatedList;
