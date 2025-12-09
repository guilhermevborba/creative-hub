import React from "react";
import { motion } from "framer-motion";

const PageHeader = ({ title, subtitle, actionButton }) => {
  return (
    <header
      className="
        fixed top-0 left-64 
        h-24 px-10
        flex items-center justify-between
        bg-gradient-to-br from-white to-gray-50
        border-b border-gray-200
        shadow-[0_4px_12px_rgba(0,0,0,0.05)]
        z-30
      "
      style={{ width: "calc(100% - 256px)" }}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-300 rounded-r-lg"></div>

      <div className="flex flex-col gap-1">
        <motion.h1
          className="
            text-[1.85rem] font-bold 
            text-gray-900 tracking-tight
          "
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.span
            className="text-[0.92rem] text-gray-500 font-medium"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            {subtitle}
          </motion.span>
        )}
      </div>

      {actionButton && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="flex items-center gap-3"
        >
          {actionButton}
        </motion.div>
      )}
    </header>
  );
};

export default PageHeader;