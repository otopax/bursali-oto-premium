export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .loader {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(212, 175, 55, 0.3);
          border-radius: 50%;
          border-top-color: var(--accent-gold);
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
      <div className="loader"></div>
      <p style={{ marginTop: '1rem', color: 'var(--accent-gold)', letterSpacing: '2px', fontSize: '0.9rem' }}>YÜKLENİYOR...</p>
    </div>
  );
}
