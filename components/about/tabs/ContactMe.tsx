'use client';
import React, { useState, useEffect } from 'react';
import { Turnstile } from 'nextjs-turnstile';
import { FaEnvelope, FaLinkedinIn, FaTelegram, FaXTwitter, FaInstagram, FaGithub } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';

interface ContactMeProps {
  onCheckingChange?: (checking: boolean) => void;
}

const ContactMe = ({ onCheckingChange }: ContactMeProps) => {
  const socialLinks = [
    { href: 'https://www.linkedin.com/in/yildizmehmet/', icon: FaLinkedinIn },
    { href: 'https://x.com/albursavi', icon: FaXTwitter },
    { href: 'https://www.instagram.com/mehmetyildizdev/', icon: FaInstagram },
    { href: 'https://github.com/mehmetyildizdev', icon: FaGithub },
    { href: 'https://t.me/memostar91', icon: FaTelegram },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [token, setToken] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // We only start the Turnstile check when the modal is open
  useEffect(() => {
    if (isModalOpen) {
      onCheckingChange?.(true);
    } else {
      onCheckingChange?.(false);
    }
  }, [isModalOpen, onCheckingChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill out all fields.' });
      return;
    }
    if (!token) {
      setStatus({ type: 'error', message: 'Please complete the security check.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Sending your message...' });
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, token }),
      });
      const result = await response.json();
      if (response.ok) {
        setStatus({ type: 'success', message: result.message || 'Message sent successfully!' });
        setFormData({ name: '', email: '', message: '' });
        setToken('');
        setTimeout(() => setIsModalOpen(false), 2000);
      } else {
        setStatus({
          type: 'error',
          message: result.message || result.error || 'Failed to send message.',
        });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    }
  };

  return (
    <section className="h-full p-8 md:p-12 flex flex-col items-center justify-center space-y-12 overflow-hidden">
      <div className="text-center space-y-6 max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-linear-to-r from-ruby via-platinum to-amethyst bg-clip-text text-transparent">
          Let&apos;s Connect
        </h2>
        <p className="text-lg text-foreground/70 leading-relaxed">
          Whether you have a specific project in mind, a technical challenge to solve, or just want to exchange ideas about digital
          architecture. I&apos;m always excited to connect with fellow creators and innovators.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <FaEnvelope className="text-xl group-hover:rotate-12 transition-transform" />
          Send Me a Message
        </button>
      </div>

      {/* Social Links Grid */}
      <div className="flex flex-col items-center space-y-6 pt-8 border-t border-border/10 w-full max-w-xs">
        <span className="text-sm font-semibold uppercase tracking-widest text-foreground/40">Connect Elsewhere</span>
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              rel="noopener noreferrer"
              target="_blank"
              title={link.href.replace(/^https?:\/\//, '').split('/')[0]}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-platinum/50 dark:bg-muted/50 border border-border/10 text-gold hover:bg-gold hover:text-platinum transition-all shadow-md hover:-translate-y-1 duration-300"
            >
              {React.createElement(link.icon, { size: 20 })}
            </a>
          ))}
        </div>
      </div>

      {/* Contact Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-card border border-border/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 md:p-12 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-foreground">Send a Message</h3>
                  <p className="text-foreground/50 mt-1">I usually respond within a few hours.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-full hover:bg-muted transition-colors">
                  <IoClose size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-name" className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1 ml-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="modal-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background/50 border border-border/20 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-email" className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1 ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="modal-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background/50 border border-border/20 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="modal-message" className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1 ml-1">
                    Message
                  </label>
                  <textarea
                    id="modal-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-background/50 border border-border/20 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    required
                  />
                </div>

                <div className="flex justify-center py-2 min-h-16.25">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(t: string) => {
                      setToken(t);
                      onCheckingChange?.(false);
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status.type === 'loading'}
                  className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                >
                  {status.type === 'loading' ? 'Sending...' : 'Send Message'}
                </button>

                {status.message && (
                  <div
                    className={`p-4 rounded-xl text-sm font-semibold text-center border ${
                      status.type === 'success' ? 'bg-emerald/10 text-emerald border-emerald/20' : 'bg-ruby/10 text-ruby border-ruby/20'
                    }`}
                  >
                    {status.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactMe;
