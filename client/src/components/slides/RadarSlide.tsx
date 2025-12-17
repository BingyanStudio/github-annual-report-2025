import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export function RadarSlide() {
  const { slidesData } = useAppStore();

  if (!slidesData) return null;

  const personaLabels: Record<string, string> = {
    'high-achiever': '高产开发者',
    'burst-coder': '爆发型开发者',
    'streak-master': '连续贡献者',
    'language-explorer': '语言探索者',
    'collaborator': '协作达人',
    'maintainer': '维护者',
    'weekend-warrior': '周末战士',
    'consistent-contributor': '稳定贡献者',
    'focused-coder': '专注型开发者',
    'night-owl': '夜猫子程序员',
    'steady-builder': '稳步建设者',
    'early-bird': '早起鸟工程师',
    default: '代码创造者',
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 pb-20">
      <div className="max-w-4xl w-full mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8"
        >
          你的 <span className="neon-green neon-glow">开发者画像</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-block bg-[#10b981]/10 border border-[#10b981]/30 rounded-2xl px-8 py-4">
            <span className="text-[#10b981] text-xl font-bold neon-glow">
              {personaLabels[slidesData.persona] || personaLabels.default}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto"
        >
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={slidesData.radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#9ca3af', fontSize: 14 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Radar
                name="能力值"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

