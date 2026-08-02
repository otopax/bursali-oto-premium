'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams?.get('error');
    if (err) {
      if (err === 'login_required' || err === 'SessionRequired') {
        setError('Bu sayfaya erişmek için yetkili girişi yapmanız gerekiyor.');
      } else if (err === 'CredentialsSignin') {
        setError('Hatalı e-posta veya şifre.');
      } else {
        setError('Giriş yapılırken bir hata oluştu: ' + err);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!turnstileToken) {
      setError('Lütfen güvenlik doğrulamasını tamamlayın.');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        turnstileToken,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' 
          ? 'Hatalı e-posta veya şifre.' 
          : result.error);
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/tr/sanal-usta';
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>E-posta Adresi</label>
          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}>✉️</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="admin@bursalioto.com"
              autoComplete="email"
              data-testid="login-email-input"
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Şifre</label>
          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <Turnstile 
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setError('Güvenlik doğrulaması başarısız oldu.')}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitBtn,
            ...(loading ? styles.submitBtnDisabled : {}),
          }}
        >
          {loading ? (
            <span style={styles.loadingContent}>
              <span style={styles.spinner} />
              Giriş Yapılıyor...
            </span>
          ) : (
            'Giriş Yap →'
          )}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div style={styles.page}>
      {/* Animated Background */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />
      <div style={styles.bgGrid} />

      <div style={styles.container}>
        {/* Left Panel - Branding */}
        <div style={styles.brandPanel}>
          <div style={styles.brandContent}>
            <div style={styles.logoMark}>
              <span style={styles.logoIcon}>⚙️</span>
            </div>
            <h1 style={styles.brandTitle}>BURSALI OTO</h1>
            <p style={styles.brandSubtitle}>Dijital Yönetim Paneli</p>
            
            <div style={styles.featureList}>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🤖</span>
                <div>
                  <strong style={styles.featureTitle}>Sanal Usta AI</strong>
                  <p style={styles.featureDesc}>Yapay zekâ destekli arıza teşhisi</p>
                </div>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📊</span>
                <div>
                  <strong style={styles.featureTitle}>Teknik Kütüphane</strong>
                  <p style={styles.featureDesc}>40.000+ arıza kodu ve çözüm</p>
                </div>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🔧</span>
                <div>
                  <strong style={styles.featureTitle}>İş Emri Takibi</strong>
                  <p style={styles.featureDesc}>Araç giriş-çıkış ve faturalama</p>
                </div>
              </div>
            </div>
          </div>
          
          <p style={styles.brandFooter}>
            © 2026 Bursalı Oto Servis — Fethiye
          </p>
        </div>

        {/* Right Panel - Login Form */}
        <div style={styles.formPanel}>
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Hoş Geldiniz</h2>
              <p style={styles.formSubtitle}>Yetkili personel girişi</p>
            </div>

            <Suspense fallback={<div style={{color: '#fafafa'}}>Yükleniyor...</div>}>
              <LoginForm />
            </Suspense>

            <div style={styles.helpSection}>
              <p style={styles.helpText}>
                Giriş bilgilerinizi mi unuttunuz?
              </p>
              <p style={styles.helpContact}>
                Servis yöneticinize veya <strong style={{ color: 'var(--accent-gold)' }}>0554 881 20 21</strong> numarasına başvurun.
              </p>
            </div>
          </div>
        </div>
      </div>


      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.1); }
          66% { transform: translate(20px, -40px) scale(0.9); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: rgba(161, 161, 170, 0.5) !important;
        }
        input:focus {
          border-color: var(--accent-gold) !important;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15), 0 0 20px rgba(212, 175, 55, 0.1) !important;
        }
        button[type="submit"]:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.35) !important;
        }
        button[type="submit"]:active:not(:disabled) {
          transform: translateY(0);
        }
        @media (max-width: 900px) {
          .login-container {
            flex-direction: column !important;
          }
          .brand-panel {
            display: none !important;
          }
          .form-panel {
            border-radius: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-dark)',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'float1 15s ease-in-out infinite',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-5%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'float2 18s ease-in-out infinite',
    pointerEvents: 'none',
  },
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: '1000px',
    minHeight: '600px',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
    position: 'relative',
    zIndex: 1,
  },
  brandPanel: {
    flex: '1 1 45%',
    background: 'linear-gradient(160deg, rgba(212,175,55,0.08) 0%, rgba(24,24,27,0.95) 50%, rgba(24,24,27,1) 100%)',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    position: 'relative',
  },
  brandContent: {},
  logoMark: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
    border: '1px solid rgba(212,175,55,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  logoIcon: {
    fontSize: '1.8rem',
  },
  brandTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#fafafa',
    letterSpacing: '-0.02em',
    marginBottom: '0.3rem',
    fontFamily: 'var(--font-outfit), sans-serif',
    background: 'none',
    WebkitBackgroundClip: 'unset',
    WebkitTextFillColor: 'unset',
  },
  brandSubtitle: {
    fontSize: '1rem',
    color: 'var(--accent-gold)',
    fontWeight: '500',
    marginBottom: '2.5rem',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
    marginTop: '2px',
  },
  featureTitle: {
    color: '#fafafa',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'block',
    marginBottom: '2px',
  },
  featureDesc: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    margin: 0,
    lineHeight: '1.4',
  },
  brandFooter: {
    color: 'rgba(161,161,170,0.5)',
    fontSize: '0.8rem',
    marginTop: '2rem',
  },
  formPanel: {
    flex: '1 1 55%',
    background: 'rgba(24,24,27,0.95)',
    backdropFilter: 'blur(30px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
  },
  formHeader: {
    marginBottom: '2rem',
  },
  formTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fafafa',
    marginBottom: '0.4rem',
    fontFamily: 'var(--font-outfit), sans-serif',
  },
  formSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.9rem 1.2rem',
    borderRadius: '12px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  errorIcon: {
    flexShrink: 0,
    fontSize: '1.1rem',
  },
  inputGroup: {
    marginBottom: '1.3rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
    letterSpacing: '0.02em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    fontSize: '1rem',
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '0.9rem 1rem 0.9rem 2.8rem',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: '#fafafa',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '4px',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, var(--accent-gold), #b8941e)',
    color: '#09090b',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    letterSpacing: '0.02em',
    marginTop: '0.5rem',
    fontFamily: 'inherit',
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(9,9,11,0.2)',
    borderTopColor: '#09090b',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  helpSection: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'center',
  },
  helpText: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    margin: '0 0 0.3rem',
  },
  helpContact: {
    color: 'rgba(161,161,170,0.6)',
    fontSize: '0.8rem',
    margin: 0,
  },
};
