/** Public marketing home */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const emojis = ['💰', '📈', '🏦', '📊', '💎', '🎯'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050B14] overflow-hidden relative font-sans text-eq-text">

      {/* Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob [animation-delay:2000ms]" />
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob [animation-delay:4000ms]" />
      <div className="absolute inset-0 bg-grid-white opacity-[0.03] pointer-events-none" />

      <section className="relative z-10 px-4 pt-32 pb-20 text-center flex flex-col items-center justify-center min-h-[85vh]">
        <div className="pointer-events-none absolute inset-0 flex justify-around opacity-30">
          {emojis.map((e, i) => (
            <motion.span
              key={e}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: [0, -20, 0], opacity: 0.6 }}
              transition={{
                y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: i * 0.4 },
                opacity: { duration: 1 }
              }}
              className="text-4xl md:text-5xl drop-shadow-2xl"
              style={{ marginTop: `${(i % 3) * 40 + 20}px` }}
            >
              {e}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl max-auto flex flex-col items-center"
        >


          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tight leading-tight mb-6">
            Master Economics.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-eq-primary to-eq-secondary text-glow">
              One Quest at a Time.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-400 font-light mb-10 leading-relaxed">
            Gamified learning for micro, macro, and personal finance. <br className="hidden md:block" /> No textbooks. Just interactive challenges.
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-2xl bg-gradient-to-r from-eq-primary to-eq-primaryDark px-8 py-4 font-bold text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] border border-blue-400/30"
              >
                Start Your Journey
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.95 }}
                className="rounded-2xl glass-panel px-8 py-4 font-bold text-white transition-all hover:border-white/30"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats/Features Banner */}
      <section className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 pb-24 md:grid-cols-3">
        {[
          ['50+', 'Interactive Quests', 'Structured learning paths'],
          ['500+', 'Micro Challenges', 'Quizzes & scenarios'],
          ['Free', 'Forever Access', 'Learn at your own pace'],
        ].map(([stat, t, s], i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            key={t}
            className="glass-panel glass-panel-hover rounded-2xl p-6 text-center group flex flex-col items-center"
          >
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-2 group-hover:scale-110 transition-transform duration-300">{stat}</div>
            <div className="text-lg font-bold text-white">{t}</div>
            <div className="text-sm text-slate-400 mt-1">{s}</div>
          </motion.div>
        ))}
      </section>

      {/* Value Props Section */}
      <section className="relative z-10 border-t border-white/5 bg-black/20 px-4 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white">Why EconQuest?</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-eq-primary to-eq-secondary mt-6 rounded-full" />
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {[
            ['📚', 'Quest-Based Learning', 'Structured topics like an RPG adventure. Level up your knowledge tree by tree.', 'from-blue-500/20 to-blue-600/5'],
            ['🎮', 'Interactive Challenges', 'Quizzes, scenarios, and matching games. Active recall instead of passive reading.', 'from-emerald-500/20 to-emerald-600/5'],
            ['🏆', 'Earn & Compete', 'Gain XP, unlock achievements, and climb the leaderboard with friends.', 'from-amber-500/20 to-amber-600/5'],
          ].map(([icon, title, desc, gradient], i) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15 }}
              key={title}
              className={`rounded-3xl glass-panel p-8 bg-gradient-to-b ${gradient} border-t border-white/10 hover:-translate-y-2 transition-transform duration-300`}
            >
              <div className="text-5xl mb-6 shadow-sm">{icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-400 font-light leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-4 py-24">
        <div className="text-center mb-16 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white">How It Works</h2>
        </div>
        <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-start md:justify-between relative">

          {/* Connector Line */}
          <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-eq-primary/0 via-eq-primary/50 to-eq-primary/0 z-0" />

          {[
            ['📝 Sign Up', 'Create your free account'],
            ['🗺️ Pick Quest', 'Choose a topic'],
            ['📖 Play', 'Tackle challenges'],
            ['⭐ Level Up', 'Unlock achievements'],
          ].map(([t, d], idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 + 0.2 }}
              key={t}
              className="flex flex-1 flex-col items-center text-center relative z-10 group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl glass-panel bg-eq-dark border border-eq-primary/30 text-xl font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-all duration-300 mb-6">
                {idx + 1}
              </div>
              <h3 className="text-lg font-semibold text-white">{t}</h3>
              <p className="mt-2 text-sm text-slate-400">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black/40 py-8 text-center text-sm text-slate-500 backdrop-blur-md">
        © 2026 EconQuest. Built for learning. <br className="md:hidden" />
        <span className="hidden md:inline"> | </span> Master the market.
      </footer>
    </div>
  );
}
