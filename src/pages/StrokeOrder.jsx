import { motion } from 'framer-motion';

const StrokeOrder = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-10 max-w-2xl w-full text-center"
      >
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          The Stroke Order Utility is still under development!
        </h1>
        <p className="text-zinc-400 mb-10">Come back soon!</p>

        <div className="grid gap-4"></div>
      </motion.div>
    </div>
  );
};

export default StrokeOrder;
