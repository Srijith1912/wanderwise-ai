import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';

// "Sign in with Google" via Google Identity Services. Renders nothing until
// VITE_GOOGLE_CLIENT_ID is configured, so the auth pages work without it.
export default function GoogleSignInButton({ nextPath = '/', onError }) {
  const divRef = useRef(null);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!CLIENT_ID) return;

    const init = () => {
      if (!window.google?.accounts?.id || !divRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          const result = await loginWithGoogle(response.credential);
          if (result.success) navigate(nextPath);
          else onError?.(result.error || 'Google sign-in failed');
        },
      });
      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'center',
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      init();
      return;
    }
    let script = document.getElementById('google-gsi-script');
    if (!script) {
      script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.id = 'google-gsi-script';
      script.onload = init;
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-cream-300" />
        <span className="text-xs text-ink-400 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-cream-300" />
      </div>
      <div ref={divRef} className="flex justify-center" />
    </div>
  );
}
