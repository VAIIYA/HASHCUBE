'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SubmitForm } from '@/components/SubmitForm';

export default function SubmitPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-metamask-beige p-6 flex items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-metamask-orange/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl bg-white p-10 rounded-[40px] pill-shadow border border-white space-y-8 relative z-10"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-metamask-purple/60 hover:text-metamask-purple font-bold transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-metamask-purple">Add to HASHCUBE</h1>
                    <p className="text-metamask-purple/50 font-medium italic">
                        Anonymously submit links to the decentralized index.
                    </p>
                </div>

                <SubmitForm onSuccess={() => router.push('/')} />
            </motion.div>
        </div>
    );
}
