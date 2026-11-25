import { useRef, useState } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFormAriaSync } from '../hooks/useFormAriaSync';
import { validateEmail } from '../utils/validators';

export default function ContactPage() {
  useDocumentTitle('Contact Us');
  const { showToast } = useToast();
  const formRef = useRef(null);
  useFormAriaSync(formRef);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      showToast(emailErr, 'error');
      return;
    }
    if (!name.trim() || !message.trim()) {
      showToast('Please complete all required fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been received by Velora Support.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-[#C26D2D]">
          Studio Concierge
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Questions about product specifications, order status, or warranty support? Our team
          typically responds within one business day.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F4C5C]/10 text-[#0F4C5C]">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Email Support</h2>
                <p className="mt-1 text-sm text-slate-600">support@velora-studio.example</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F4C5C]/10 text-[#0F4C5C]">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Showroom &amp; Studio</h2>
                <p className="mt-1 text-sm text-slate-600">
                  480 Shotwell Street, Suite 210
                  <br />
                  San Francisco, CA 94110
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F4C5C]/10 text-[#0F4C5C]">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Hours</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Monday – Friday: 9:00 AM – 6:00 PM PST
                  <br />
                  Saturday: 10:00 AM – 4:00 PM PST
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-9">
            {submitted ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Message Sent</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Thanks, {name}. We have logged your inquiry under <strong>{subject}</strong> and
                  will follow up at {email}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-6 rounded-xl bg-[#0F4C5C] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-extrabold text-slate-900">Send us a note</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-1 block text-xs font-bold text-slate-700">
                      Full Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="c-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                    <div className="velora-error-msg">Full name is required.</div>
                  </div>
                  <div>
                    <label htmlFor="c-email" className="mb-1 block text-xs font-bold text-slate-700">
                      Email Address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      required
                      autoComplete="email"
                      spellCheck={false}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                    <div className="velora-error-msg">Enter a valid email address.</div>
                  </div>
                </div>

                <div>
                  <label htmlFor="c-subject" className="mb-1 block text-xs font-bold text-slate-700">
                    Topic
                  </label>
                  <select
                    id="c-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm"
                  >
                    <option>Order Support</option>
                    <option>Product Question</option>
                    <option>Warranty &amp; Repairs</option>
                    <option>Wholesale &amp; Studio Partnerships</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="c-message" className="mb-1 block text-xs font-bold text-slate-700">
                    Message <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="c-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                  <div className="velora-error-msg">Please enter your message.</div>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F4C5C] px-6 py-3 text-sm font-bold text-white hover:bg-[#0A3642]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
