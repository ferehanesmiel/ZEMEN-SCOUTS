import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Image as ImageIcon, Sparkles, Loader2, Download, CheckCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAppContext } from '../context/AppContext';

export default function AICamera() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAppContext();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            { text: prompt },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        },
      });

      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
        addNotification("Image generated successfully!");
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6 pb-24"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-[var(--color-sbr-orange)]" /> AI Studio
        </h1>
        <div className="bg-[var(--color-sbr-orange)]/20 text-[var(--color-sbr-orange)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-sbr-orange)]/30">
          Nano Banana 2
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl">
        <p className="text-sm text-gray-300 mb-4">
          Use Gemini 3.1 Flash Image Preview to generate verification photos or mockups for your tasks.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Image Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A busy local market in Addis Ababa with fresh vegetables..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-sbr-orange)]/50 transition-colors resize-none h-24"
            />
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-[var(--color-sbr-orange)] to-orange-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(255,106,0,0.4)] hover:shadow-[0_0_25px_rgba(255,106,0,0.6)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><Loader2 size={18} className="animate-spin" /> Generating...</>
            ) : (
              <><Camera size={18} /> Generate Image</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {generatedImage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-5 rounded-2xl space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ImageIcon size={18} className="text-[var(--color-sbr-orange)]" /> Result
            </h3>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Download size={18} />
            </button>
          </div>
          
          <div className="rounded-xl overflow-hidden border border-white/10 relative aspect-square">
            <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
          </div>
          
          <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2">
            <CheckCircle size={18} /> Use for Task Verification
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
