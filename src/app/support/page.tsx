'use client';

import Link from 'next/link';
import { ArrowLeft, LifeBuoy, MessageSquare, AlertTriangle, Loader2, Camera, X, Image as ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submitInquiry, submitFeedback } from '@/app/actions/support';

export default function SupportPage() {
  const { user } = useAuth();
  const [inquirySent, setInquirySent] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingInquiry(true);
    const formData = new FormData(e.currentTarget);
    if (user?.email) {
      formData.append('userEmail', user.email);
    }
    
    await submitInquiry(formData);
    
    setIsSubmittingInquiry(false);
    setInquirySent(true);
  };

  const handleFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    const formData = new FormData(e.currentTarget);
    if (user?.email) {
      formData.append('userEmail', user.email);
    }
    
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }
    
    await submitFeedback(formData);
    
    setIsSubmittingFeedback(false);
    setFeedbackSent(true);
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please select an image under 5MB.');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-3xl mx-auto pt-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-primary p-6 sm:p-8 flex items-center min-h-[160px] sm:min-h-[200px]">
          {/* Decorative curve */}
          <div className="absolute right-[-20%] sm:right-[-10%] top-[-20%] bottom-[-20%] w-[70%] sm:w-[50%] rounded-l-[100%] bg-white/10 z-0" />
          
          <div className="relative z-20 w-[55%] sm:w-[65%] pr-2 sm:pr-0">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">Admin Support</h1>
            <p className="text-white/80 mt-2 text-sm sm:text-base">We are here to help you with your wedding planning journey.</p>
          </div>
          
          <img 
            src="https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/icons/NOTIFIACATION%20QUICKY.png" 
            alt="Support Mascot" 
            className="absolute bottom-0 right-[-10px] sm:right-6 z-10 h-[150px] sm:h-[210px] w-auto object-contain drop-shadow-2xl transition duration-500 hover:-translate-y-2 hover:scale-[1.03]"
          />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Inquiries Form */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif font-bold text-foreground">General Inquiries</h2>
            </div>
            {inquirySent ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-foreground mb-1">Message Sent!</p>
                <p className="text-sm text-text-secondary">We'll get back to you shortly.</p>
              </div>
            ) : (
              <form 
                className="space-y-4 flex-1 flex flex-col"
                onSubmit={handleInquiry}
              >
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1" htmlFor="subject">Subject</label>
                  <input required type="text" id="subject" name="subject" className="w-full rounded-xl border border-border bg-neutral px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="How can we help?" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-text-secondary mb-1" htmlFor="message">Message</label>
                  <textarea required id="message" name="message" className="w-full h-32 rounded-xl border border-border bg-neutral px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none" placeholder="Describe your question or issue..."></textarea>
                </div>
                <button type="submit" disabled={isSubmittingInquiry} className="w-full inline-flex justify-center items-center gap-2 min-h-[44px] rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-70">
                  {isSubmittingInquiry ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Send Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Feedback & Error Reports Form */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif font-bold text-foreground">Feedback & Errors</h2>
            </div>
            {feedbackSent ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-foreground mb-1">Feedback Received!</p>
                <p className="text-sm text-text-secondary">Thank you for helping us improve QuickWeds.</p>
              </div>
            ) : (
              <form 
                className="space-y-4 flex-1 flex flex-col"
                onSubmit={handleFeedback}
              >
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1" htmlFor="type">Type</label>
                  <select required id="type" name="type" className="w-full rounded-xl border border-border bg-neutral px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                    <option value="">Select a category...</option>
                    <option value="bug">Report an Error / Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="review">App Review / General Feedback</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-text-secondary mb-1" htmlFor="details">Details</label>
                  <textarea required id="details" name="details" className="w-full h-24 rounded-xl border border-border bg-neutral px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none" placeholder="Please provide as much detail as possible..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Screenshot (Optional)</label>
                  {!screenshotPreview ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 text-text-secondary hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <Camera className="w-5 h-5 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">Attach an image</span>
                    </button>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-border group h-32">
                      <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeScreenshot}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5 overflow-hidden">
                        <ImageIcon className="w-3 h-3 text-white shrink-0" />
                        <span className="text-[10px] text-white font-medium truncate">{screenshot?.name}</span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <button type="submit" disabled={isSubmittingFeedback} className="w-full inline-flex justify-center items-center gap-2 min-h-[44px] rounded-xl bg-foreground px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-black/80 disabled:opacity-70">
                  {isSubmittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
