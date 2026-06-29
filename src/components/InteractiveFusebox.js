'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function InteractiveFusebox({ boxData }) {
  const [hoveredFuseId, setHoveredFuseId] = useState(null);
  const [selectedFuseId, setSelectedFuseId] = useState(null);
  
  // Resim modu (schema = kusursuz eşleşme, color = renkli fotoğraf)
  const [imageMode, setImageMode] = useState('schema');

  const defaultBoxRot = boxData ? (boxData.boxRotation || 0) : 0;
  
  // Şema modunda CSS döndürülür, koordinat düz kalır. 
  // Renkli foto modunda resim düzdür, koordinat döndürülür.
  const [mappingRotation, setMappingRotation] = useState(0); 
  const [visualRotation, setVisualRotation] = useState(defaultBoxRot);

  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  
  const handleModeChange = (mode) => {
    setImageMode(mode);
    // Hem Şema hem Renkli Fotoğrafta, asıl görüntü (img) her zaman düzdür (visualRotation: 0).
    // Ancak koordinatlar (JSON'dan gelenler) bazen ters çizildiği için matematiksel döndürme (mappingRotation) uygulanmalıdır.
    setVisualRotation(0);
    setMappingRotation(defaultBoxRot);
    setOffsetX(0);
    setOffsetY(0);
    setScaleX(1);
    setScaleY(1);
  };

  // Farklı bir araca geçildiğinde State'i güncelle (Stale state bug fix)
  useEffect(() => {
    if (boxData) {
      handleModeChange('schema');
    }
  }, [boxData?.boxName]);

  // Otomatik kaydırma için referanslar
  const rowRefs = useRef({});
  const tableContainerRef = useRef(null);

  // Seçili veya üzerine gelinen sigorta (id ve amper birleşimiyle tekilleştirilmiş)
  const activeFuseId = hoveredFuseId || selectedFuseId;

  // Composite ID oluşturucu
  const getUid = (id, amp) => `${id}-${amp || 'none'}`;

  useEffect(() => {
    if (selectedFuseId && rowRefs.current[selectedFuseId] && tableContainerRef.current) {
      const row = rowRefs.current[selectedFuseId];
      const container = tableContainerRef.current;
      
      // En güvenilir kaydırma yöntemi: BoundingClientRect ile ekrandaki göreceli konumu hesapla
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      
      const relativeTop = rowRect.top - containerRect.top;
      
      container.scrollBy({
        top: relativeTop - (containerRect.height / 2) + (rowRect.height / 2),
        behavior: 'smooth'
      });
    }
  }, [selectedFuseId]);

  if (!boxData) return null;
  
  const safeBoxName = boxData.boxName ? boxData.boxName.replace(/[^a-zA-Z0-9]/g, '-') : 'box';
  const activeFuseParts = activeFuseId ? activeFuseId.split('-') : [];
  const rawActiveId = activeFuseParts[0];
  const activeFuseDetails = boxData.fusesTable?.find(f => getUid(f.id, f.amp) === activeFuseId) || boxData.fusesTable?.find(f => f.id === rawActiveId);

  return (
    <div id={`fuse-box-${safeBoxName}`} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '5rem', width: '100%' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-light)', borderBottom: '2px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
        {boxData.boxName}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '1.2rem' }}>Görünüm Seçeneği:</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Şema modunda koordinatlar %100 kusursuz oturur. Renkli fotoğrafta hizalama yapmanız gerekebilir.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '8px' }}>
            <button 
              onClick={() => handleModeChange('schema')} 
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: imageMode === 'schema' ? 'var(--accent-gold)' : 'transparent', color: imageMode === 'schema' ? '#000' : 'var(--text-light)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📐 Siyah-Beyaz Şema (Kusursuz)
            </button>
            <button 
              onClick={() => handleModeChange('color')} 
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: imageMode === 'color' ? 'var(--accent-gold)' : 'transparent', color: imageMode === 'color' ? '#000' : 'var(--text-light)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📸 Renkli Fotoğraf
            </button>
          </div>
        </div>

        {imageMode === 'color' && (
          <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#ffcc00', fontWeight: 'bold', margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
              ⚠️ RENKLİ FOTOĞRAF HİZALAMASI: Eğer işaretleyiciler havada kalıyorsa, "Döndür: 270°" (veya 90°) seçin ve kaydırıcılarla yerlerine oturtun:
            </p>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>Döndür:</span>
                {[0, 90, 180, 270].map(angle => (
                  <button key={`map-${angle}`} onClick={() => setMappingRotation(angle)} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: mappingRotation === angle ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)', background: mappingRotation === angle ? 'var(--accent-gold)' : 'transparent', color: mappingRotation === angle ? '#000' : 'var(--text-light)', cursor: 'pointer', fontWeight: 'bold' }}>{angle}°</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  <b>Sol/Sağ:</b>
                  <input type="range" min="-50" max="50" step="0.5" value={offsetX} onChange={e => setOffsetX(parseFloat(e.target.value))} />
                </label>
                <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  <b>Aşağı/Yukarı:</b>
                  <input type="range" min="-50" max="50" step="0.5" value={offsetY} onChange={e => setOffsetY(parseFloat(e.target.value))} />
                </label>
                <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  <b>Genişlik:</b>
                  <input type="range" min="0.1" max="3" step="0.05" value={scaleX} onChange={e => setScaleX(parseFloat(e.target.value))} />
                </label>
                <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  <b>Yükseklik:</b>
                  <input type="range" min="0.1" max="3" step="0.05" value={scaleY} onChange={e => setScaleY(parseFloat(e.target.value))} />
                </label>
                <button onClick={() => {setOffsetX(0); setOffsetY(0); setScaleX(1); setScaleY(1); setMappingRotation(defaultBoxRot);}} style={{padding: '0.4rem 0.8rem', background: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Sıfırla</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* ANA YAPI: SOLDA DEVASA RESİM, SAĞDA TABLO */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '2rem', 
        alignItems: 'flex-start',
        flexWrap: 'wrap' // Mobilde alta inmesi için
      }}>
        
        {/* SOL: RESİM VE TOOLTIP */}
        <div className="glass-panel" style={{ 
          flex: '1 1 55%',
          minWidth: '400px',
          position: 'relative', 
          padding: '1rem', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: imageMode === 'schema' ? '#ffffff' : 'var(--glass-bg)' // Şema modu arka planı beyaz yapmalı ki orijinal png/webp şemalar güzel görünsün
        }}>
          <div style={{ 
            position: 'relative', 
            display: 'inline-block', 
            width: '100%', 
            maxWidth: '900px', // Resmin olabildiğince büyük görünmesini sağlar
            transform: `rotate(${visualRotation}deg)`,
            transition: 'transform 0.3s ease'
          }}>
            <img 
              src={imageMode === 'schema' ? (boxData.localImagePath || '').replace('_color', '') : boxData.localImagePath} 
              alt={boxData.boxName} 
              style={{ 
                display: 'block', 
                borderRadius: '8px',
                width: '100%', // Genişliği tam kaplar
                height: 'auto'
              }}
            />
            
            {/* Interactive Overlay & Tooltips */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
              
              {/* Tooltip & SVG Line */}
              {activeFuseId && activeFuseDetails && (() => {
                const item = boxData.layoutData?.find(i => getUid(i.id, i.kind?.amp) === activeFuseId) || boxData.layoutData?.find(i => i.id === rawActiveId);
                if (!item || !item.layout) return null;
                
                let { top, left, width, height } = item.layout;
                const rot = mappingRotation;
                let finalTop = top, finalLeft = left, finalWidth = width, finalHeight = height;
                
                // Koordinatları orijinal matematiksel formülle düz resme uyarla
                if (rot === 90) { finalLeft = top; finalTop = 100 - (left + width); finalWidth = height; finalHeight = width; }
                else if (rot === 180) { finalLeft = 100 - (left + width); finalTop = 100 - (top + height); }
                else if (rot === 270 || rot === -90) { finalLeft = 100 - (top + height); finalTop = left; finalWidth = height; finalHeight = width; }
                
                finalLeft = (finalLeft * scaleX) + offsetX;
                finalTop = (finalTop * scaleY) + offsetY;
                finalWidth = finalWidth * scaleX;
                finalHeight = finalHeight * scaleY;

                const anchorX = finalLeft + finalWidth / 2;
                const anchorY = finalTop + finalHeight / 2;
                
                const isLeft = anchorX > 50;
                const isTop = anchorY > 50;
                // Tooltip'i sigortanın aksi yönüne yerleştir ki üzerini kapatmasın
                const tooltipX = isLeft ? anchorX - 25 : anchorX + 25;
                const tooltipY = isTop ? anchorY - 15 : anchorY + 15;

                return (
                  <React.Fragment>
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15, overflow: 'visible' }}>
                      <line 
                        x1={`${anchorX}%`} y1={`${anchorY}%`} 
                        x2={`${tooltipX}%`} y2={`${tooltipY}%`} 
                        stroke="white" strokeWidth="2" 
                        style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      left: `${tooltipX}%`,
                      top: `${tooltipY}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: '#ffffff',
                      color: '#111',
                      padding: '12px 16px',
                      borderRadius: '4px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                      zIndex: 30,
                      width: '280px',
                      pointerEvents: 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{activeFuseDetails.id}</span>
                        <span style={{ fontSize: '0.9rem', color: '#777' }}>Sigorta</span>
                        {activeFuseDetails.amp && (
                          <span style={{ 
                            backgroundColor: activeFuseDetails.ampColor || '#d9534f', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            {activeFuseDetails.amp}
                          </span>
                        )}
                        {item.kind?.format && (
                          <span style={{ background: '#333', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {item.kind.format.toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {activeFuseDetails.translatedDesc || activeFuseDetails.originalDesc}
                      </div>

                      {item.relatedEntities && item.relatedEntities.length > 0 && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#0056b3', lineHeight: '1.4' }}>
                          <strong>Bağlı Sistemler:</strong> {item.relatedEntities.join(', ')}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })()}

              {/* Tıklanabilir Sigorta Alanları */}
              {boxData.layoutData && boxData.layoutData.map((item, index) => {
                if (!item.layout || !item.id) return null;
                
                let { top, left, width, height } = item.layout;
                const rot = mappingRotation;
                let finalTop = top, finalLeft = left, finalWidth = width, finalHeight = height;
                
                if (rot === 90) { finalLeft = top; finalTop = 100 - (left + width); finalWidth = height; finalHeight = width; }
                else if (rot === 180) { finalLeft = 100 - (left + width); finalTop = 100 - (top + height); }
                else if (rot === 270 || rot === -90) { finalLeft = 100 - (top + height); finalTop = left; finalWidth = height; finalHeight = width; }
                
                finalLeft = (finalLeft * scaleX) + offsetX;
                finalTop = (finalTop * scaleY) + offsetY;
                finalWidth = finalWidth * scaleX;
                finalHeight = finalHeight * scaleY;

                const uid = getUid(item.id, item.kind?.amp);
                const isActive = activeFuseId === uid;
                const fuseDetails = boxData.fusesTable?.find(f => getUid(f.id, f.amp) === uid) || boxData.fusesTable?.find(f => f.id === item.id);
                const ampColor = fuseDetails?.ampColor || '#ffffff';
                
                const hexToRgba = (hex, alpha) => {
                  if (!hex || !hex.startsWith('#')) return `rgba(255,255,255,${alpha})`;
                  const r = parseInt(hex.slice(1, 3), 16) || 255;
                  const g = parseInt(hex.slice(3, 5), 16) || 255;
                  const b = parseInt(hex.slice(5, 7), 16) || 255;
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };
                
                return (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      top: `${finalTop}%`,
                      left: `${finalLeft}%`,
                      width: `${finalWidth}%`,
                      height: `${finalHeight}%`,
                      cursor: 'pointer',
                      // HATA AYIKLAMA İÇİN: Kutuların yerini her zaman amfi rengiyle gösterelim
                      border: isActive ? `2px solid ${ampColor}` : `1px solid ${hexToRgba(ampColor, 0.4)}`,
                      backgroundColor: isActive ? hexToRgba(ampColor, 0.3) : hexToRgba(ampColor, 0.05),
                      borderRadius: '2px',
                      zIndex: isActive ? 20 : 10
                    }}
                    onMouseEnter={() => setHoveredFuseId(uid)}
                    onMouseLeave={() => setHoveredFuseId(null)}
                    onClick={() => setSelectedFuseId(uid)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* SAĞ: LİSTE (KAYDIRILABİLİR) */}
        <div 
          className="glass-panel" 
          ref={tableContainerRef}
          style={{ 
          flex: '1 1 40%', 
          minWidth: '350px',
          maxHeight: '85vh', // Sabit yükseklik, resimle yan yana kalması için
          overflowY: 'auto', // Bağımsız kaydırma!
          padding: '0' // Kenarlara yapışsın
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--text-light)', fontSize: '0.95rem' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(20,20,20,0.95)', zIndex: 5 }}>
              <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem', textAlign: 'center', width: '60px' }}>No</th>
                <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}>Amper</th>
                <th style={{ padding: '1rem' }}>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {boxData.fusesTable && boxData.fusesTable.map((fuse, index) => {
                const uid = getUid(fuse.id, fuse.amp);
                const isActive = activeFuseId === uid;
                
                // Eğer çeviri başarısız olduysa ve ikisi de aynıysa sadece birini göster. Değilse Türkçeyi büyük, İngilizceyi küçük göster.
                const origStr = (fuse.originalDesc || '').trim();
                const transStr = (fuse.translatedDesc || '').trim();
                const showOriginalDesc = origStr && origStr !== transStr;
                
                return (
                  <tr 
                    id={`fuse-row-${safeBoxName}-${uid}`}
                    key={index}
                    ref={el => rowRefs.current[uid] = el}
                    style={{
                      borderBottom: '1px solid var(--glass-border)',
                      transition: 'all 0.1s ease',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredFuseId(uid)}
                    onMouseLeave={() => setHoveredFuseId(null)}
                    onClick={() => setSelectedFuseId(uid)}
                  >
                    <td style={{ padding: '1rem', fontWeight: 'bold', textAlign: 'center', color: isActive ? '#fff' : 'var(--text-muted)' }}>
                      {fuse.id}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {fuse.amp && (
                        <span style={{ 
                          backgroundColor: fuse.ampColor || '#555', 
                          color: 'white', 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '6px',
                          fontWeight: 'bold'
                        }}>
                          {fuse.amp}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: isActive ? '#fff' : 'var(--text-light)' }}>
                      <div style={{ fontWeight: '500', fontSize: '1.05rem', color: 'var(--text-light)' }}>
                        {fuse.translatedDesc}
                      </div>
                      {showOriginalDesc && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {fuse.originalDesc}
                        </div>
                      )}
                      
                      {(() => {
                        const layoutMatch = boxData.layoutData?.find(l => getUid(l.id, l.kind?.amp) === uid);
                        if (layoutMatch?.relatedEntities?.length > 0) {
                          return (
                            <div style={{ fontSize: '0.85rem', color: '#88aaff', marginTop: '0.4rem' }}>
                              ⚡ Sistemler: {layoutMatch.relatedEntities.join(', ')}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
