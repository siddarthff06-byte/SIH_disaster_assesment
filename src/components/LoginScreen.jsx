import React, { useState, useEffect, useRef } from 'react';
import './LoginScreen.css';

export default function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRevealedState, setIsRevealedState] = useState(false);
  
  const heroRef = useRef(null);
  const loginCardRef = useRef(null);
  const scrollPromptRef = useRef(null);
  const radarMeshRef = useRef(null);
  const logoGlowRef = useRef(null);
  const taglineRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;
      const maxScroll = vh * 0.8;
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // Smooth custom easing (cubic ease-out)
      const ease = 1 - Math.pow(1 - progress, 3);

      if (heroRef.current) {
        const maxUpShift = Math.min(vh * 0.36, 320);
        const shiftY = -ease * maxUpShift;
        const scale = 1.0 - (ease * 0.44);
        heroRef.current.style.transform = `translate(-50%, calc(-50% + ${shiftY}px)) scale(${scale})`;
      }

      if (taglineRef.current) {
        taglineRef.current.style.opacity = progress > 0.4 ? Math.max(0.3, 1 - (progress * 0.6)) : '1';
      }

      if (scrollPromptRef.current) {
        const promptOpacity = Math.max(0, 1 - progress * 2.5);
        scrollPromptRef.current.style.opacity = promptOpacity;
        scrollPromptRef.current.style.transform = `translateY(${ease * 18}px)`;
        scrollPromptRef.current.style.pointerEvents = promptOpacity <= 0.05 ? 'none' : 'auto';
      }

      if (loginCardRef.current) {
        const cardY = (1 - ease) * 80 - 36;
        const cardScale = 0.94 + (ease * 0.06);
        const cardOpacity = Math.max(0, (progress - 0.15) / 0.85);
        loginCardRef.current.style.transform = `translate(-50%, ${cardY}%) scale(${cardScale})`;
        loginCardRef.current.style.opacity = cardOpacity;
        loginCardRef.current.style.pointerEvents = cardOpacity > 0.65 ? 'auto' : 'none';
      }

      if (radarMeshRef.current) {
        radarMeshRef.current.style.opacity = 0.25 + (ease * 0.25);
      }
      
      if (logoGlowRef.current) {
        logoGlowRef.current.style.opacity = 0.8 - (ease * 0.4);
      }

      setIsRevealedState(progress > 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToLogin = () => {
    const targetY = window.innerHeight * 0.85;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  };

  const toggleScrollState = () => {
    if (isRevealedState) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollToLogin();
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        onLogin();
      }, 500);
    }, 1400);
  };

  return (
    <div className="login-screen-root">
      {/* Background Atmosphere */}
      <div className="fixed-bg">
        <div className="cosmic-gradient"></div>
        <div ref={radarMeshRef} className="radar-grid"></div>
        <div className="radar-sweep-container">
          <div className="animate-sweep">
            <div className="animate-sweep-gradient"></div>
          </div>
          <div className="concentric-ring-1"></div>
          <div className="concentric-ring-2"></div>
          <div className="concentric-ring-3"></div>
        </div>
        <div className="vignette"></div>
      </div>

      {/* Telemetry Header */}
      <header className="telemetry-header">
        <div className="telemetry-header-left">
          <span className="ping-dot"></span>
          <span className="ping-dot-base"></span>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>SAT-NODE // NORAD ID 49201</span>
          <span style={{ opacity: 0.7 }}>| ORBITAL SYNCHRONIZED</span>
        </div>
        <div className="telemetry-header-right">
          <span><span style={{ color: 'rgba(63, 193, 224, 0.7)' }}>LATENCY:</span> 14MS (LEO-5)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#eaf6fb', opacity: 0.9 }}>
            <svg className="submit-btn-icon" style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span>QUANTUM-AES-512</span>
          </div>
        </div>
      </header>

      {/* Scroll Indicator */}
      <div ref={scrollPromptRef} className="scroll-cue" onClick={scrollToLogin}>
        <span className="scroll-cue-text">Scroll to Authenticate</span>
        <div className="scroll-cue-icon">
          <svg style={{ width: '1rem', height: '1rem', color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      <div className="fixed-stage">
        {/* Hero Block */}
        <div ref={heroRef} className="hero-block" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' }}>
          <div ref={logoGlowRef} className="logo-glow-aura"></div>
          <div className="logo-container" onClick={scrollToLogin}>
            <img alt="Vista Orbital Surveillance Emblem" className="logo-image" src="/logo.png" />
            <div className="lens-glow-active">
              <div className="lens-dot"></div>
            </div>
          </div>
          <div className="brand-name-block">
            <h1 className="brand-title">VISTA</h1>
            <p ref={taglineRef} className="brand-tagline">Orbital Intelligence & Surveillance</p>
          </div>
        </div>

        {/* Revealed State: Glassmorphic Login Console Card */}
        <div ref={loginCardRef} className="glass-card-wrapper" style={{ top: '50%', left: '50%', transform: 'translate(-50%, 0%) scale(0.94)', opacity: 0 }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title">
                <span className="ping-dot" style={{ width: '6px', height: '6px' }}></span>
                <span>Console Authorization</span>
              </div>
              <span className="card-node">NODE // 0x99B</span>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Operator Identity</label>
                  <span className="form-label-badge">AUTH_UID</span>
                </div>
                <div className="input-container">
                  <div className="input-icon">
                    <svg style={{ width: '1rem', height: '1rem', color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <input className="glass-input" placeholder="operator@defense.vista" required type="text" defaultValue="op-8842 // user@defense.vista" />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Quantum Passkey</label>
                  <span className="form-label-badge">256-BIT</span>
                </div>
                <div className="input-container">
                  <div className="input-icon">
                    <svg style={{ width: '1rem', height: '1rem', color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input className="glass-input" style={{ letterSpacing: '0.1em' }} required type={showPassword ? 'text' : 'password'} defaultValue="••••••••••••••••••••" />
                  <button className="input-action" type="button" onClick={() => setShowPassword(!showPassword)} title="Toggle Visibility">
                    {showPassword ? (
                      <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    ) : (
                      <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="options-row">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                  <span>Retain secure session</span>
                </label>
                <a className="reset-link" href="#">Reset passkey?</a>
              </div>

              <button className={`submit-btn ${loading ? 'loading' : ''} ${success ? 'success' : ''}`} type="submit" disabled={loading || success}>
                <div className="submit-btn-bg"></div>
                <div className="submit-btn-content">
                  <span>{success ? 'AUTHORIZATION VERIFIED' : loading ? 'SYNCHRONIZING WITH ORBIT...' : 'Authenticate Link'}</span>
                  <svg className="submit-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
              </button>
            </form>

            <div className="divider-container">
              <div className="divider-line-wrapper"><div className="divider-line"></div></div>
              <div className="divider-text-wrapper"><span className="divider-text">Or delegate via</span></div>
            </div>

            <div className="social-buttons">
              <button className="social-btn" type="button">
                <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                </svg>
                <span>Google</span>
              </button>
              <button className="social-btn" type="button">
                <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.71-.93 2.73 1 .08 2.01-.48 2.63-1.23z"></path>
                </svg>
                <span>Apple</span>
              </button>
            </div>

            <div className="card-footer">
              <span>CLASSIFIED MIL-STD-188</span>
              <span className="enclave-text">
                <span className="enclave-dot"></span>
                DEFENSE ENCLAVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Helper Pill */}
      <div className="bottom-toggle">
        <button className="bottom-toggle-btn" onClick={toggleScrollState}>
          <span className="toggle-dot"></span>
          <span>{isRevealedState ? 'Scroll Up: Centered View' : 'Scroll Down: Revealed View'}</span>
        </button>
      </div>
    </div>
  );
}
