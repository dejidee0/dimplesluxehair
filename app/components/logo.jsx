import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center space-x-3 md:space-x-4 flex-shrink-0 min-w-0 group"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
        className="w-40 md:w-48 lg:w-56"
      >
        <Image
          src="/images/dimplesluxe-logo-dark.png"
          alt="Dimplesluxe — The Hair Destination"
          width={708}
          height={135}
          className="h-auto w-full"
        />
      </motion.div>
    </Link>
  );
};

export default Logo;
