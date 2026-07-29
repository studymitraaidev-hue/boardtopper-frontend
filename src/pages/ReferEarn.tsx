import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Share2, Gift, Users, Trophy, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReferEarn() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'BOARD123';
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `I am preparing for my SSC board exams with BoardTopper AI!\n\nUse my referral code *${referralCode}* and we both get FREE Pro days!\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0a14] via-[#11101f] to-[#0b0a14] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-900/40">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">Refer and Earn</h1>
          <p className="text-white/50">Invite friends, get free Pro days together</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Share2, step: '1', text: 'Share your link' },
            { icon: Users, step: '2', text: 'Friend signs up' },
            { icon: Trophy, step: '3', text: 'Both get +3 Pro days' },
          ].map((item) => (
            <motion.div key={item.step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: parseInt(item.step) * 0.1 }} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2">
                <item.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-xs text-white/40">Step {item.step}</p>
              <p className="text-sm font-semibold text-white/80">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-400/20 rounded-2xl p-6 mb-6">
          <p className="text-sm font-semibold text-indigo-300 mb-3">Your Referral Link</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-black/30 rounded-xl px-4 py-3 text-sm text-white/70 font-mono truncate">
              {referralLink}
            </div>
            <button onClick={handleCopy} className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors shrink-0">
              {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
            </button>
          </div>
          <button onClick={handleWhatsAppShare} className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-green-500 hover:to-emerald-500 transition-all">
            <Share2 className="w-5 h-5" /> Share on WhatsApp
          </button>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-white">0</p>
            <p className="text-xs text-white/40">Friends Invited</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">0</p>
            <p className="text-xs text-white/40">Pro Days Earned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
