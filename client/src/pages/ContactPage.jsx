import { useState } from 'react';
import Layout from '../components/Layout';

// ⬇️ Your Formspree endpoint + a direct email. Leave a value blank to hide it.
const CONTACT_FORM_URL = 'https://formspree.io/f/xzdnblwd';
const ADMIN_EMAIL = 'mulupurisrijith@gmail.com';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const [error, setError] = useState('');

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.message.trim()) {
      setError('Please add your email and a message.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(CONTACT_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('sent');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.errors?.[0]?.message || "That didn't go through — please try again.");
        setStatus('error');
      }
    } catch {
      setError('Network error — please check your connection and try again.');
      setStatus('error');
    }
  };

  return (
    <Layout>
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16">
        <div className="max-w-xl mx-auto text-center">
          <span className="text-4xl">📮</span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 mt-4">
            Say <em className="italic text-blossom-500">hello</em>
          </h1>
          <p className="text-ink-600 mt-4 leading-relaxed">
            Got feedback, a bug, a feature you're dying for, or just want to swap travel stories?
            I'd genuinely love to hear it — this is a one-person project and every message helps.
          </p>

          <div className="card p-6 sm:p-8 mt-8 text-left">
            {status === 'sent' ? (
              <div className="text-center py-6">
                <span className="text-4xl">🎒</span>
                <h2 className="font-display text-xl font-semibold text-ink-900 mt-3">Message on its way!</h2>
                <p className="text-ink-600 mt-2 text-sm">
                  Thanks for reaching out, {form.name.trim() ? form.name.trim().split(' ')[0] : 'traveler'} — I'll get back to you soon.
                </p>
                <button
                  onClick={() => { setForm({ name: '', email: '', message: '' }); setStatus('idle'); }}
                  className="btn-ghost text-sm mt-4"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1.5">Name</label>
                    <input id="name" name="name" type="text" value={form.name} onChange={update} placeholder="Your name" className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" className="input-field" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-ink-700 mb-1.5">Message</label>
                  <textarea id="message" name="message" rows={5} value={form.message} onChange={update} placeholder="What's on your mind?" className="input-field resize-none" required />
                </div>

                {error && <p className="text-coral-600 text-sm">{error}</p>}

                <button type="submit" disabled={status === 'sending'} className="btn-primary w-full py-3 justify-center">
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          {ADMIN_EMAIL && (
            <p className="text-sm text-ink-500 mt-6">
              Prefer email? Reach me at{' '}
              <a href={`mailto:${ADMIN_EMAIL}`} className="text-forest-700 hover:text-forest-800 font-medium">
                {ADMIN_EMAIL}
              </a>
            </p>
          )}
          <p className="text-xs text-ink-400 mt-2">Built by Srijith Mulupuri · usually replies within a day or two.</p>
        </div>
      </section>
    </Layout>
  );
}
