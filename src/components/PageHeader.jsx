import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const PageHeader = ({ title, subtitle, actionButton }) => {
  return (
    <header
      className="fixed top-0 left-64 bg-white h-24 px-10 flex items-center justify-between border-b border-gray-200 shadow-sm z-30"
      style={{ width: "calc(100% - 256px)" }}
    >
      <div className="flex flex-col">
        <motion.h1
          className="text-3xl font-bold text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            className="text-sm text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {actionButton && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex items-center gap-2"
        >
          {actionButton}
        </motion.div>
      )}
    </header>
  );
};

export default PageHeader;
