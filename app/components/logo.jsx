import { motion } from "framer-motion";
import Link from "next/link";

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center space-x-3 md:space-x-4 flex-shrink-0 min-w-0 group"
    >
      {/* Simple, scalable logo mark */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
        className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200"
      >
        <span className="text-white font-bold text-xl md:text-2xl lg:text-3xl leading-none">
          D
        </span>
      </motion.div>

      {/* Clean typography */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-bold text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent whitespace-nowrap group-hover:from-pink-700 group-hover:to-rose-700 transition-colors duration-200"
      >
        Dimplesluxe
      </motion.span>
    </Link>
  );
};

export default Logo;
