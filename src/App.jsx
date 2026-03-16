// ═══════════════════════════════════════════════════════════════
// FANSTORE EPOS — MAIN APPLICATION
// ═══════════════════════════════════════════════════════════════
import { Component, useState, useEffect, useRef, useCallback } from "react";
import {
  THEMES, INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_ORDERS, INITIAL_RETURNS,
  INITIAL_BANNERS, INITIAL_COUPONS, INITIAL_COUNTERS, INITIAL_SETTINGS,
  CATEGORIES, TIER_CONFIG, getTier, fmt, ts, genId, isBannerActive,
  notify, NotificationCenter, Btn, Input, Select, Toggle, Badge, Card,
  StatCard, Modal, Table, ProductCard, Sidebar, PRODUCT_IMAGES
} from "./core.jsx";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{margin:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
@keyframes slideInRight{from{transform:translateX(110%);opacity:0;}to{transform:translateX(0);opacity:1;}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
.fade-in{animation:fadeIn .3s ease;}
.spin{animation:spin 1s linear infinite;}

/* ── DESKTOP (>1024px) default styles ── */
.sidebar-wrap{width:220px;position:fixed;left:0;top:0;height:100vh;z-index:200;transition:transform .25s ease;}
.main-content{margin-left:220px;}

/* ── TABLET (769–1024px): icon-only sidebar ── */
@media(min-width:769px) and (max-width:1024px){
  .sidebar-wrap{width:60px!important;overflow:hidden;}
  .sidebar-label{display:none!important;}
  .main-content{margin-left:60px!important;}
}

/* ── MOBILE (≤768px): hidden drawer sidebar ── */
@media(max-width:768px){
  .hide-mobile{display:none!important;}
  .sidebar-wrap{transform:translateX(-100%)!important;width:220px!important;z-index:300!important;}
  .sidebar-wrap.open{transform:translateX(0)!important;}
  .main-content{margin-left:0!important;}
  /* POS: stack products on top, cart below */
  .pos-layout{flex-direction:column!important;height:auto!important;min-height:100vh;}
  .pos-left{flex:none!important;height:auto!important;min-height:0;max-height:none!important;}
  .pos-right{flex:none!important;width:100%!important;height:auto!important;max-height:none!important;border-left:none!important;border-top:1px solid #e2e8f0;}
  .pos-products-grid{max-height:none!important;height:auto!important;}
  /* Grids collapse */
  .grid-2{grid-template-columns:1fr!important;}
  .grid-3{grid-template-columns:1fr 1fr!important;}
  /* Cards and padding */
  .mob-p{padding:10px!important;}
  .mob-hide{display:none!important;}
  /* Table horizontal scroll */
  table{min-width:400px;}
  /* Content padding */
  .main-content > div:last-child{padding:12px!important;}
}

/* ── SMALL MOBILE (≤480px) ── */
@media(max-width:480px){
  .grid-3{grid-template-columns:1fr!important;}
  .grid-2{grid-template-columns:1fr!important;}
  .pos-left{min-height:40vh;}
}

/* ── Hamburger: hidden on desktop/tablet, shown on mobile ── */
.mob-menu-btn{display:none!important;}
@media(max-width:768px){.mob-menu-btn{display:flex!important;}}

/* ── POS layout: always takes remaining height on desktop ── */
@media(min-width:769px){
  .pos-layout{height:calc(100vh - 48px);overflow:hidden;}
  .pos-left{overflow:hidden;display:flex;flex-direction:column;}
  .pos-right{overflow:hidden;display:flex;flex-direction:column;}
}


/* ── Prevent horizontal overflow everywhere ── */
.main-content{overflow-x:hidden;}
`;

// ── GUEST FOOTER ────────────────────────────────────────────────────────────────
const GuestFooter = () => (
  <div style={{background:"#0f172a",color:"#94a3b8",padding:"40px 5% 24px",marginTop:"auto"}}>
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:36,height:36,background:"linear-gradient(135deg,#dc2626,#7f1d1d)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚽</div>
        <div style={{fontSize:17,fontWeight:900,color:"#fff"}}>Football Fan Store</div>
      </div>
      <div style={{fontSize:13,lineHeight:1.7,maxWidth:340,marginBottom:20}}>Your official destination for club merchandise — jerseys, accessories, equipment and collectibles.</div>
      <div style={{borderTop:"1px solid #1e293b",paddingTop:16,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12,fontSize:12}}>
        <span>© 2024 Football Fan Store. All rights reserved.</span>
        <div style={{display:"flex",gap:20}}>{["Privacy Policy","Terms of Service","Returns"].map(l=><span key={l} style={{cursor:"pointer"}}>{l}</span>)}</div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// GUEST / LANDING PAGE
// ═══════════════════════════════════════════════════════════════
const GuestPage = ({ banners, products, onLogin, onRegister, t, pendingGuestCart, onLoginWithCart }) => {
  const [bIdx, setBIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("All");
  const [guestCart, setGuestCart] = useState(pendingGuestCart||[]);
  const [showCart, setShowCart] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [guestView, setGuestView] = useState("home"); // "home" | "products" | "productDetail"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailSize, setDetailSize] = useState("");
  const [detailQty, setDetailQty] = useState(1);

  const goToProductDetail = (p) => {
    setSelectedProduct(p);
    setDetailSize("");
    setDetailQty(1);
    setGuestView("productDetail");
    window.scrollTo({top:0, behavior:"smooth"});
  };
  const active = banners.filter(b => b.active);

  useEffect(() => {
    if (active.length < 2) return;
    const i = setInterval(() => setBIdx(x => (x + 1) % active.length), 4500);
    return () => clearInterval(i);
  }, [active.length]);

  const allActiveOffers = banners.filter(b=>b.active && b.offerType==="category");
  const getGuestDisc = (p) => {
    const o = allActiveOffers.find(b => b.offerTarget === p.category);
    return Math.max(o ? o.offerDiscount : 0, p.discount||0);
  };

  const filtered = products.filter(p => activeTab === "All" || p.category === activeTab);
  const featured = products.filter(p => p.featured && p.stock > 0);
  const currentBanner = active[bIdx];

  const addGuest = (p, size) => {
    const disc = getGuestDisc(p);
    const key = p.id + (size?"__"+size:"");
    setGuestCart(c => {
      const ex = c.find(i => i._key === key);
      return ex ? c.map(i => i._key===key ? {...i, qty: i.qty+1} : i)
                : [...c, {...p, qty:1, _key:key, selectedSize: size||"", discount: disc}];
    });
    notify(`${p.name}${size?" ("+size+")":""} added to cart!`, "success");
  };

  const updateGuestQty = (key, d) => setGuestCart(c => c.map(i=>i._key===key?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));
  const cartTotal = guestCart.reduce((s,i) => s + i.price*(1-(i.discount||0)/100)*i.qty, 0);
  const cartCount = guestCart.reduce((s,i) => s+i.qty, 0);

  const handleLoginWithCart = (cat) => {
    if(onLoginWithCart && guestCart.length>0) onLoginWithCart(guestCart, cat||null);
    else onLogin(cat||null);
  };

  return (
    <div style={{minHeight:"100vh",background:t.bg}}>
      {/* NAVBAR */}
      <nav style={{background:"rgba(255,255,255,.97)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${t.border}`,padding:"0 5%",height:68,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>setGuestView("home")}>
          <div style={{width:40,height:40,background:`linear-gradient(135deg,${t.accent},${t.accent2})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 4px 12px ${t.accent}40`}}>⚽</div>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:t.text,letterSpacing:-.5}}>Football Fan Store</div>
            <div style={{fontSize:10,color:t.text3,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Official Merchandise</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center",position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
          <button onClick={()=>setGuestView("home")} style={{padding:"8px 22px",borderRadius:10,border:`2px solid ${guestView==="home"?t.accent:"transparent"}`,background:guestView==="home"?t.accent+"15":"transparent",color:guestView==="home"?t.accent:t.text2,fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>Home</button>
          <button onClick={()=>setGuestView("products")} style={{padding:"8px 22px",borderRadius:10,border:`2px solid ${guestView==="products"||guestView==="productDetail"?t.accent:"transparent"}`,background:guestView==="products"||guestView==="productDetail"?t.accent+"15":"transparent",color:guestView==="products"||guestView==="productDetail"?t.accent:t.text2,fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>Products</button>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>setShowCart(true)} style={{background:t.bg3,border:`1px solid ${t.border}`,borderRadius:10,padding:"9px 16px",color:t.text,cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:7}}>
            🛒 Cart {cartCount>0&&<span style={{background:t.accent,color:"#fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900}}>{cartCount}</span>}
          </button>
          <span className="hide-mobile"><Btn t={t} variant="ghost" size="sm" onClick={onRegister}>Register</Btn></span>
          <Btn t={t} size="sm" onClick={()=>handleLoginWithCart(null)} style={{boxShadow:`0 4px 14px ${t.accent}40`}}>Sign In →</Btn>
        </div>
      </nav>

      {/* ── HOME VIEW ── */}
      {guestView === "home" && <>

      {/* HERO BANNER */}
      <div style={{position:"relative",overflow:"hidden",height:"clamp(320px,55vw,520px)"}}>
        {active.length>0 ? (
          <>
            <div key={bIdx} style={{position:"absolute",inset:0,background:currentBanner?.grad||t.gradHero}}>
              {currentBanner?.image && <img src={currentBanner.image} alt={currentBanner.title} referrerPolicy="no-referrer" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0,opacity:.85}} onError={e=>{e.target.style.display="none";}}/>}
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(0,0,0,.65) 0%,rgba(0,0,0,.2) 60%,transparent 100%)"}}/>
            </div>
            <div style={{position:"relative",maxWidth:1100,margin:"0 auto",padding:"0 5%",height:"100%",display:"flex",alignItems:"center"}}>
              <div style={{color:"#fff",maxWidth:560}}>
                {currentBanner?.offerDiscount>0 && <div style={{display:"inline-flex",alignItems:"center",gap:8,background:t.accent,padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:900,marginBottom:16}}>🔥 {currentBanner.offerDiscount}% OFF {currentBanner.offerTarget?.toUpperCase()}</div>}
                <div style={{fontSize:"clamp(26px,5vw,54px)",fontWeight:900,lineHeight:1.1,marginBottom:16,letterSpacing:-1,textShadow:"0 2px 20px rgba(0,0,0,.3)"}}>{currentBanner?.title||"Football Fan Store"}</div>
                <div style={{fontSize:19,opacity:.9,marginBottom:28,lineHeight:1.5}}>{currentBanner?.subtitle}</div>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  <button onClick={()=>setGuestView("products")} style={{background:"#fff",color:currentBanner?.color||t.accent,border:"none",borderRadius:12,padding:"14px 28px",fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,.2)"}}>{currentBanner?.cta||"Shop Now"} →</button>
                  <button onClick={onRegister} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"2px solid rgba(255,255,255,.5)",borderRadius:12,padding:"14px 28px",fontSize:15,fontWeight:700,cursor:"pointer",backdropFilter:"blur(4px)"}}>Register Free</button>
                </div>
              </div>
            </div>
            {active.length>1 && <div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",display:"flex",gap:8}}>{active.map((_,i)=><div key={i} onClick={()=>setBIdx(i)} style={{width:i===bIdx?28:8,height:8,borderRadius:4,background:`rgba(255,255,255,${i===bIdx?1:0.4})`,cursor:"pointer",transition:"all .3s"}}/>)}</div>}
          </>
        ) : (
          <div style={{background:t.gradHero,height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{textAlign:"center",color:"#fff"}}>
              <div style={{fontSize:80,marginBottom:20}}>⚽</div>
              <div style={{fontSize:44,fontWeight:900,letterSpacing:-2}}>Football Fan Store</div>
              <div style={{fontSize:18,opacity:.8,marginTop:10,marginBottom:28}}>Official Merchandise &amp; Collectibles</div>
              <div style={{display:"flex",gap:14,justifyContent:"center"}}>
                <button onClick={()=>setGuestView("products")} style={{background:"#fff",color:"#dc2626",border:"none",borderRadius:12,padding:"14px 28px",fontSize:15,fontWeight:900,cursor:"pointer"}}>Shop Now →</button>
                <button onClick={onRegister} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"2px solid rgba(255,255,255,.5)",borderRadius:12,padding:"14px 28px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Register</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PERKS BAR */}
      <div style={{background:t.accent,padding:"16px 5%"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:12}}>
          {[["🚚","Free Delivery","Orders over £100"],["🔄","30-Day Returns","Hassle-free"],["⭐","Loyalty Rewards","Earn on every purchase"],["🔒","Secure Checkout","100% protected"]].map(([ic,t1,t2])=>(
            <div key={t1} style={{display:"flex",alignItems:"center",gap:10,color:"#fff"}}><span style={{fontSize:22}}>{ic}</span><div><div style={{fontSize:13,fontWeight:800}}>{t1}</div><div style={{fontSize:11,opacity:.8}}>{t2}</div></div></div>
          ))}
        </div>
      </div>

      {/* PROMOTIONS STRIP */}
      {active.filter(b=>b.offerDiscount>0).length>0 && (
        <div style={{background:t.yellowBg,borderBottom:`1px solid ${t.yellowBorder}`,padding:"12px 5%",overflowX:"auto"}}>
          <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:16,alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:800,color:t.yellow,whiteSpace:"nowrap"}}>🏷️ TODAY'S OFFERS:</span>
            {active.filter(b=>b.offerDiscount>0).map(b=>(
              <span key={b.id} style={{background:t.accent,color:"#fff",padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:800,whiteSpace:"nowrap"}}>{b.offerDiscount}% off {b.offerTarget}</span>
            ))}
          </div>
        </div>
      )}

      {/* FEATURED PRODUCTS */}
      {featured.length>0 && (
        <div style={{background:t.bg2,padding:"48px 5%"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12}}>
              <div><div style={{fontSize:28,fontWeight:900,color:t.text,letterSpacing:-.5}}>⭐ Featured Items</div><div style={{fontSize:14,color:t.text3,marginTop:4}}>Handpicked for true fans</div></div>
              <button onClick={()=>setGuestView("products")} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:9,padding:"8px 18px",color:t.text2,cursor:"pointer",fontSize:13,fontWeight:700}}>View All →</button>
            </div>
            <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:8,WebkitOverflowScrolling:"touch"}}>
              {featured.slice(0,6).map(p=>{
                const disc = getGuestDisc(p);
                return(
                  <div key={p.id} style={{flexShrink:0,width:220,background:t.card,border:`1px solid ${disc>0?t.accent:t.border}`,borderRadius:16,overflow:"hidden",boxShadow:t.shadowMd,transition:"transform .2s,box-shadow .2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=t.shadowLg;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=t.shadowMd;}}>
                    <div style={{height:190,background:t.bg3,overflow:"hidden",position:"relative",cursor:"pointer"}} onClick={()=>goToProductDetail(p)}>
                      <ImgWithFallback src={PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      <div style={{position:"absolute",top:10,left:10,background:t.accent,color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:900}}>FEATURED</div>
                      {disc>0 && <div style={{position:"absolute",top:10,right:10,background:"#f59e0b",color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:900}}>-{disc}% OFF</div>}
                    </div>
                    <div style={{padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:t.text3,marginBottom:3}}>{p.category}</div>
                      <div style={{fontSize:13,fontWeight:800,color:t.text,marginBottom:8,lineHeight:1.3}}>{p.name}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <div>
                          {disc>0?<><div style={{fontSize:11,color:t.text4,textDecoration:"line-through"}}>{fmt(p.price)}</div><div style={{fontSize:18,fontWeight:900,color:t.accent}}>{fmt(p.price*(1-disc/100))}</div></>:<span style={{fontSize:18,fontWeight:900,color:t.green}}>{fmt(p.price)}</span>}
                        </div>
                        <div style={{display:"flex",gap:5}}>
                          <button onClick={()=>goToProductDetail(p)} style={{background:t.bg3,color:t.text2,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Details</button>
                          <button onClick={()=>p.sizes?.length>1?goToProductDetail(p):addGuest(p)} style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:800,cursor:"pointer"}}>Add</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* HOME FOOTER */}
      {guestView === "home" && <GuestFooter />}

      {/* END HOME VIEW */}
      </>}

      {/* ── PRODUCTS VIEW ── */}
      {guestView === "products" && (
        <div style={{minHeight:"calc(100vh - 68px)",background:t.bg}}>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"36px 5%"}}>
            {/* Header */}
            <div style={{marginBottom:28}}>
              <div style={{fontSize:30,fontWeight:900,color:t.text,letterSpacing:-.5}}>Shop Our Collection</div>
              <div style={{fontSize:14,color:t.text3,marginTop:5}}>Official merchandise for every fan</div>
            </div>
            {/* Category tabs */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:28}}>
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setActiveTab(c)} style={{padding:"8px 18px",borderRadius:20,border:`1px solid ${activeTab===c?t.accent:t.border}`,background:activeTab===c?t.accent:"transparent",color:activeTab===c?"#fff":t.text2,fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>{c}</button>
              ))}
            </div>
            {/* Grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(210px,45vw),1fr))",gap:"clamp(12px,2vw,20px)"}}>
              {filtered.map(p=>{
                const disc = getGuestDisc(p);
                return(
                  <div key={p.id} style={{background:t.card,border:`1px solid ${disc>0?t.accent:t.border}`,borderRadius:16,overflow:"hidden",boxShadow:t.shadow,transition:"transform .15s,box-shadow .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=t.shadowMd;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=t.shadow;}}>
                    <div style={{position:"relative",height:180,background:t.bg3,overflow:"hidden",cursor:"pointer"}} onClick={()=>goToProductDetail(p)}>
                      <ImgWithFallback src={PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      {disc>0 && <div style={{position:"absolute",top:10,left:10,background:t.accent,color:"#fff",borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:900}}>-{disc}% OFF</div>}
                      {p.stock===0 && <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800}}>OUT OF STOCK</div>}
                      {p.stock>0&&p.stock<=5 && <div style={{position:"absolute",top:10,right:10,background:t.yellow,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>Only {p.stock} left!</div>}
                      <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,.5)",color:"#fff",borderRadius:6,padding:"3px 9px",fontSize:10,fontWeight:700}}>👁 View Details</div>
                    </div>
                    <div style={{padding:"14px 15px"}}>
                      <div style={{fontSize:10,color:t.text3,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>{p.category}</div>
                      <div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:10,lineHeight:1.3,cursor:"pointer"}} onClick={()=>goToProductDetail(p)}>{p.name}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          {disc>0?<><div style={{fontSize:11,color:t.text4,textDecoration:"line-through"}}>{fmt(p.price)}</div><div style={{fontSize:17,fontWeight:900,color:t.accent}}>{fmt(p.price*(1-disc/100))}</div></>:<div style={{fontSize:17,fontWeight:900,color:t.green}}>{fmt(p.price)}</div>}
                        </div>
                        <button onClick={()=>p.stock>0&&(p.sizes?.length>1?goToProductDetail(p):addGuest(p))} disabled={p.stock===0} style={{background:p.stock===0?t.bg4:t.accent,color:p.stock===0?t.text3:"#fff",border:"none",borderRadius:9,padding:"7px 16px",fontSize:12,fontWeight:800,cursor:p.stock===0?"not-allowed":"pointer",boxShadow:p.stock===0?"none":`0 2px 8px ${t.accent}40`}}>Add</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {filtered.length===0&&<div style={{textAlign:"center",padding:"80px 20px",color:t.text3}}><div style={{fontSize:48,marginBottom:16}}>🔍</div><div style={{fontSize:18,fontWeight:700}}>No products in this category</div></div>}
          </div>
          {/* Footer */}
          <GuestFooter />
        </div>
      )}

      {/* ── PRODUCT DETAIL VIEW ── */}
      {guestView === "productDetail" && selectedProduct && (() => {
        const p = selectedProduct;
        const disc = getGuestDisc(p);
        const price = p.price * (1 - disc/100);
        const sizes = p.sizes || [];
        const needsSize = sizes.length > 1;
        const canAdd = !needsSize || detailSize;
        const specs = [
          p.material && ["Material", p.material],
          p.fit && ["Fit", p.fit],
          p.care && ["Care", p.care],
          p.brand && ["Brand", p.brand],
          p.circumference && ["Circumference", p.circumference],
          p.weight && ["Weight", p.weight],
          p.length && ["Length", p.length],
          p.width && ["Width", p.width],
          p.waist && ["Waist", p.waist],
          p.cut && ["Cut", p.cut],
          p.edition && ["Edition", p.edition],
          p.includes && ["Includes", p.includes],
        ].filter(Boolean);

        return (
          <div style={{minHeight:"calc(100vh - 68px)",background:t.bg2}}>
            {/* Breadcrumb */}
            <div style={{background:t.bg,borderBottom:`1px solid ${t.border}`,padding:"12px 5%"}}>
              <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:8,fontSize:13,color:t.text3}}>
                <button onClick={()=>setGuestView("home")} style={{background:"none",border:"none",color:t.text3,cursor:"pointer",fontWeight:600,padding:0}}>Home</button>
                <span>›</span>
                <button onClick={()=>setGuestView("products")} style={{background:"none",border:"none",color:t.text3,cursor:"pointer",fontWeight:600,padding:0}}>Products</button>
                <span>›</span>
                <span style={{color:t.text,fontWeight:700}}>{p.name}</span>
              </div>
            </div>
            {/* Main Content */}
            <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 5%"}}>
              <div style={{display:"flex",gap:"clamp(24px,4vw,56px)",flexWrap:"wrap",alignItems:"flex-start"}}>
                {/* LEFT: Image */}
                <div style={{flex:"0 0 420px",maxWidth:"100%"}}>
                  <div style={{borderRadius:20,overflow:"hidden",background:t.bg3,aspectRatio:"1/1",position:"relative",boxShadow:t.shadowLg}}>
                    <ImgWithFallback src={PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    {disc>0 && <div style={{position:"absolute",top:16,left:16,background:t.accent,color:"#fff",borderRadius:20,padding:"6px 16px",fontSize:13,fontWeight:900}}>-{disc}% OFF</div>}
                    {p.stock===0 && <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20,fontWeight:900}}>OUT OF STOCK</div>}
                  </div>
                  {/* Price box below image */}
                  <div style={{marginTop:16,background:t.card,borderRadius:14,padding:"18px 20px",border:`1px solid ${t.border}`,boxShadow:t.shadow}}>
                    {disc>0 && <div style={{fontSize:14,color:t.text4,textDecoration:"line-through",marginBottom:2}}>{fmt(p.price)}</div>}
                    <div style={{fontSize:34,fontWeight:900,color:disc>0?t.accent:t.green,letterSpacing:-1}}>{fmt(price)}</div>
                    {disc>0 && <div style={{fontSize:12,color:t.accent,fontWeight:700,marginTop:2}}>You save {fmt(p.price - price)}</div>}
                    <div style={{fontSize:12,color:p.stock>0?t.green:t.red,fontWeight:700,marginTop:8}}>
                      {p.stock===0?"❌ Out of Stock":p.stock<=5?`⚠️ Only ${p.stock} left!`:`✅ In Stock (${p.stock} units)`}
                    </div>
                  </div>
                </div>
                {/* RIGHT: Details */}
                <div style={{flex:1,minWidth:280}}>
                  <div style={{fontSize:12,color:t.accent,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{p.category}</div>
                  <h1 style={{fontSize:"clamp(22px,4vw,32px)",fontWeight:900,color:t.text,letterSpacing:-.5,margin:"0 0 14px",lineHeight:1.2}}>{p.name}</h1>
                  {p.description && <p style={{fontSize:15,color:t.text2,lineHeight:1.7,marginBottom:20,margin:"0 0 20px"}}>{p.description}</p>}
                  {/* Sizes */}
                  {sizes.length>0 && (
                    <div style={{marginBottom:20}}>
                      <div style={{fontSize:12,fontWeight:800,color:t.text,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>
                        {needsSize?"Select Size":"Available As"}
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                        {sizes.map(s=>(
                          <button key={s} onClick={()=>setDetailSize(s===detailSize?"":s)}
                            style={{padding:"8px 18px",borderRadius:10,border:`2px solid ${detailSize===s?t.accent:t.border}`,background:detailSize===s?t.accent+"15":"transparent",color:detailSize===s?t.accent:t.text2,fontSize:13,fontWeight:detailSize===s?800:500,cursor:"pointer",transition:"all .15s"}}>
                            {s}
                          </button>
                        ))}
                      </div>
                      {needsSize&&!detailSize && <div style={{fontSize:12,color:t.yellow,marginTop:8}}>⚠️ Please select a size to add to cart</div>}
                    </div>
                  )}
                  {/* Specs */}
                  {specs.length>0 && (
                    <div style={{background:t.bg3,borderRadius:14,padding:"16px 18px",marginBottom:20,border:`1px solid ${t.border}`}}>
                      <div style={{fontSize:12,fontWeight:800,color:t.text,marginBottom:12,textTransform:"uppercase",letterSpacing:.5}}>Product Details</div>
                      {specs.map(([k,v])=>(
                        <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderBottom:`1px solid ${t.border}`}}>
                          <span style={{color:t.text3,fontWeight:600}}>{k}</span>
                          <span style={{color:t.text,fontWeight:500,textAlign:"right",maxWidth:"60%"}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{fontSize:11,color:t.text4,marginBottom:18}}>SKU: {p.sku}</div>
                  {/* Qty + Add to Cart */}
                  {p.stock>0 && (
                    <>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                        <span style={{fontSize:13,fontWeight:700,color:t.text}}>Qty:</span>
                        <div style={{display:"flex",alignItems:"center",gap:0,border:`1px solid ${t.border}`,borderRadius:10,overflow:"hidden"}}>
                          <button onClick={()=>setDetailQty(q=>Math.max(1,q-1))} style={{width:38,height:38,background:t.bg3,border:"none",cursor:"pointer",fontSize:18,color:t.text,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                          <span style={{width:44,fontSize:16,fontWeight:900,textAlign:"center",color:t.text}}>{detailQty}</span>
                          <button onClick={()=>setDetailQty(q=>Math.min(p.stock,q+1))} style={{width:38,height:38,background:t.bg3,border:"none",cursor:"pointer",fontSize:18,color:t.text,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                        </div>
                      </div>
                      <button
                        disabled={!canAdd}
                        onClick={()=>{if(canAdd){for(let i=0;i<detailQty;i++) addGuest(p,detailSize);}}}
                        style={{width:"100%",padding:"15px",background:canAdd?`linear-gradient(135deg,${t.accent},${t.accent2})`:"#e2e8f0",color:canAdd?"#fff":"#94a3b8",border:"none",borderRadius:14,fontSize:16,fontWeight:900,cursor:canAdd?"pointer":"not-allowed",boxShadow:canAdd?`0 6px 20px ${t.accent}40`:"none",transition:"all .2s",marginBottom:10}}>
                        🛒 Add to Cart{needsSize&&detailSize?` (${detailSize})`:""} — {fmt(price*detailQty)}
                      </button>
                      <button onClick={()=>{if(canAdd){for(let i=0;i<detailQty;i++) addGuest(p,detailSize); handleLoginWithCart(null);}}} disabled={!canAdd}
                        style={{width:"100%",padding:"13px",background:canAdd?"#0f172a":"#e2e8f0",color:canAdd?"#fff":"#94a3b8",border:"none",borderRadius:14,fontSize:14,fontWeight:800,cursor:canAdd?"pointer":"not-allowed",transition:"all .2s"}}>
                        ⚡ Sign In & Buy Now
                      </button>
                    </>
                  )}
                  {p.stock===0 && <div style={{background:t.redBg,border:`1px solid ${t.redBorder}`,borderRadius:12,padding:"14px 18px",fontSize:14,color:t.red,fontWeight:700,textAlign:"center"}}>❌ This item is currently out of stock</div>}
                  <div style={{marginTop:20,padding:"14px 18px",background:t.bg3,borderRadius:12,border:`1px solid ${t.border}`}}>
                    <div style={{display:"flex",flexWrap:"wrap",gap:16,fontSize:12,color:t.text3}}>
                      {[["🚚","Free delivery over £100"],["🔄","30-day returns"],["🔒","Secure checkout"],["⭐","Earn loyalty points"]].map(([ic,tx])=>(
                        <div key={tx} style={{display:"flex",alignItems:"center",gap:5,fontWeight:600}}><span style={{fontSize:15}}>{ic}</span>{tx}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <GuestFooter />
          </div>
        );
      })()}

      {/* CART MODAL — always available across all views */}
      {showCart && (
        <Modal t={t} title="🛒 Your Cart" onClose={()=>setShowCart(false)}>
          {guestCart.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px",color:t.text3}}><div style={{fontSize:40,marginBottom:12}}>🛒</div><div style={{fontWeight:700}}>Cart is empty</div><div style={{fontSize:13,marginTop:6}}>Browse products and add to cart</div></div>
          ):(
            <>
              {guestCart.map(item=>(
                <div key={item._key} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${t.border}`}}>
                  <div style={{width:48,height:48,borderRadius:9,overflow:"hidden",flexShrink:0,background:t.bg3}}>
                    <ImgWithFallback src={PRODUCT_IMAGES[item.name]} alt={item.name} emoji={item.emoji} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:t.text}}>{item.name}</div>
                    {item.selectedSize&&<div style={{fontSize:11,color:t.text3}}>Size: {item.selectedSize}</div>}
                    <div style={{fontSize:12,color:item.discount>0?t.accent:t.green,fontWeight:800}}>{fmt(item.price*(1-(item.discount||0)/100))}{item.discount>0&&<span style={{fontSize:10,color:t.text4,textDecoration:"line-through",marginLeft:5}}>{fmt(item.price)}</span>}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <button onClick={()=>updateGuestQty(item._key,-1)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${t.border}`,background:t.bg3,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                    <span style={{fontWeight:900,minWidth:18,textAlign:"center"}}>{item.qty}</span>
                    <button onClick={()=>updateGuestQty(item._key,1)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${t.border}`,background:t.bg3,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                  </div>
                  <span style={{fontSize:13,fontWeight:900,color:t.text,minWidth:54,textAlign:"right"}}>{fmt(item.price*(1-(item.discount||0)/100)*item.qty)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:900,color:t.text,paddingTop:14,borderTop:`2px solid ${t.border}`,marginTop:6}}>
                <span>Total</span><span style={{color:t.accent}}>{fmt(cartTotal)}</span>
              </div>
              <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
                <button onClick={()=>{setShowCart(false);handleLoginWithCart(null);}} style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${t.accent},${t.accent2})`,color:"#fff",border:"none",borderRadius:11,fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:`0 4px 14px ${t.accent}40`}}>
                  Sign In to Checkout · {fmt(cartTotal)} →
                </button>
                <Btn t={t} variant="ghost" fullWidth onClick={onRegister}>Create Free Account</Btn>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PRODUCT DETAIL MODAL — used by Guest page and Customer Shop
// ═══════════════════════════════════════════════════════════════
const ProductDetailModal = ({ p, t, getDisc, onClose, onAddToCart, onBuyNow, isGuest }) => {
  const [selSize, setSelSize] = useState("");
  const [qty, setQty] = useState(1);
  const disc = getDisc(p);
  const price = p.price * (1 - disc/100);

  const sizes = p.sizes || [];
  const needsSize = sizes.length > 1;
  const canAdd = !needsSize || selSize;

  const specs = [
    p.material && ["Material", p.material],
    p.fit && ["Fit", p.fit],
    p.care && ["Care", p.care],
    p.brand && ["Brand", p.brand],
    p.circumference && ["Circumference", p.circumference],
    p.weight && ["Weight", p.weight],
    p.length && ["Length", p.length],
    p.width && ["Width", p.width],
    p.waist && ["Waist", p.waist],
    p.cut && ["Cut", p.cut],
    p.edition && ["Edition", p.edition],
    p.includes && ["Includes", p.includes],
  ].filter(Boolean);

  return (
    <Modal t={t} title={p.name} subtitle={p.category} onClose={onClose} width={620}>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        {/* Image */}
        <div style={{width:"min(240px,100%)",flexShrink:0}}>
          <div style={{borderRadius:14,overflow:"hidden",background:t.bg3,height:240,position:"relative"}}>
            <ImgWithFallback src={PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            {disc>0&&<div style={{position:"absolute",top:10,left:10,background:t.accent,color:"#fff",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:900}}>-{disc}% OFF</div>}
          </div>
          {/* Price */}
          <div style={{marginTop:14,background:t.bg3,borderRadius:12,padding:"12px 16px"}}>
            {disc>0&&<div style={{fontSize:13,color:t.text4,textDecoration:"line-through",marginBottom:2}}>{fmt(p.price)}</div>}
            <div style={{fontSize:28,fontWeight:900,color:disc>0?t.accent:t.green}}>{fmt(price)}</div>
            {disc>0&&<div style={{fontSize:11,color:t.accent,fontWeight:700}}>You save {fmt(p.price-price)}</div>}
            <div style={{fontSize:11,color:p.stock>0?t.green:t.red,fontWeight:700,marginTop:6}}>
              {p.stock===0?"❌ Out of Stock":p.stock<=5?`⚠️ Only ${p.stock} left!`:`✅ In Stock (${p.stock} units)`}
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{flex:1,minWidth:220}}>
          <div style={{fontSize:13,color:t.text2,lineHeight:1.7,marginBottom:14}}>{p.description}</div>

          {/* Sizes */}
          {sizes.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:t.text,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>
                {needsSize?"Select Size":"Available As"}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {sizes.map(s=>(
                  <button key={s} onClick={()=>setSelSize(s===selSize?"":s)}
                    style={{padding:"6px 14px",borderRadius:9,border:`2px solid ${selSize===s?t.accent:t.border}`,background:selSize===s?t.accent+"15":"transparent",color:selSize===s?t.accent:t.text2,fontSize:12,fontWeight:selSize===s?800:500,cursor:"pointer",transition:"all .15s"}}>
                    {s}
                  </button>
                ))}
              </div>
              {needsSize&&!selSize&&<div style={{fontSize:11,color:t.yellow,marginTop:6}}>⚠️ Please select a size</div>}
            </div>
          )}

          {/* Specifications */}
          {specs.length>0&&(
            <div style={{background:t.bg3,borderRadius:12,padding:"12px 16px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,color:t.text,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Product Details</div>
              {specs.map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:`1px solid ${t.border}`}}>
                  <span style={{color:t.text3,fontWeight:600}}>{k}</span>
                  <span style={{color:t.text,fontWeight:500,textAlign:"right",maxWidth:"60%"}}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* SKU */}
          <div style={{fontSize:11,color:t.text4,marginBottom:14}}>SKU: {p.sku}</div>

          {/* Qty + Buttons */}
          {p.stock>0&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontSize:12,fontWeight:700,color:t.text}}>Qty:</span>
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:30,height:30,borderRadius:8,border:`1px solid ${t.border}`,background:t.bg3,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <span style={{fontSize:16,fontWeight:900,minWidth:28,textAlign:"center"}}>{qty}</span>
                <button onClick={()=>setQty(q=>Math.min(p.stock,q+1))} style={{width:30,height:30,borderRadius:8,border:`1px solid ${t.border}`,background:t.bg3,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
              <div style={{display:"flex",gap:10,flexDirection:"column"}}>
                <button
                  disabled={!canAdd}
                  onClick={()=>{if(canAdd){for(let i=0;i<qty;i++)onAddToCart(p,selSize);}}}
                  style={{width:"100%",padding:"12px",background:canAdd?`linear-gradient(135deg,${t.accent},${t.accent2})`:"#e2e8f0",color:canAdd?"#fff":"#94a3b8",border:"none",borderRadius:11,fontSize:14,fontWeight:900,cursor:canAdd?"pointer":"not-allowed",boxShadow:canAdd?`0 4px 14px ${t.accent}40`:"none"}}>
                  🛒 Add to Cart {needsSize&&selSize?`(${selSize})`:""}
                </button>
                {onBuyNow&&(
                  <button
                    disabled={!canAdd}
                    onClick={()=>{if(canAdd){onBuyNow(p,selSize);}}}
                    style={{width:"100%",padding:"12px",background:canAdd?t.green:"#e2e8f0",color:canAdd?"#fff":"#94a3b8",border:"none",borderRadius:11,fontSize:14,fontWeight:900,cursor:canAdd?"pointer":"not-allowed"}}>
                    {isGuest?"⚡ Sign In & Buy Now":"⚡ Buy Now"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

const ImgWithFallback = ({ src, alt, emoji, style }) => {
  const [err, setErr] = useState(false);
  const fontSize = style?.height ? Math.min(48, Math.round(style.height * 0.55)) : 32;
  if (err || !src) return <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", fontSize, background: "linear-gradient(135deg,#f1f5f9,#e2e8f0)", flexShrink:0 }}>{emoji}</div>;
  return <img src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setErr(true)} style={style} />;
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#111", color: "#f8d7da" }}>
          <div style={{ maxWidth: 520, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Something went wrong</div>
            <div style={{ marginBottom: 16, color: "#f8d7da" }}>{this.state.error.message || "An unexpected error occurred."}</div>
            <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" }}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
const LoginPage = ({ onLogin, onBack, allUsers, t }) => {
  const [email, setEmail] = useState("cashier@fanstore.com");
  const [pass, setPass] = useState("cash123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setLoading(true);
    setTimeout(() => {
      const u = allUsers.find(x => x.email === email && x.password === pass);
      if (u) onLogin(u);
      else { setErr("Invalid email or password"); setLoading(false); }
    }, 700);
  };

  const demos = [
    { l: "Admin", e: "admin@fanstore.com", p: "admin123", c: "#dc2626", i: "🛡️" },
    { l: "Manager", e: "manager@fanstore.com", p: "mgr123", c: "#d97706", i: "📋" },
    { l: "Cashier", e: "cashier@fanstore.com", p: "cash123", c: "#16a34a", i: "🛒" },
    { l: "Staff", e: "staff1@fanstore.com", p: "staff123", c: "#0d9488", i: "🖥️" },
    { l: "Customer", e: "customer@fanstore.com", p: "cust123", c: "#2563eb", i: "👤" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: t.bg }}>
      <div style={{ flex: 1, background: `linear-gradient(160deg,${t.accent} 0%,#7f1d1d 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }} className="hide-mobile">
        <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "relative", textAlign: "center", color: "#fff", maxWidth: 360 }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>⚽</div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, marginBottom: 10 }}>Football Fan Store</div>
          <div style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.6 }}>Your official club merchandise destination. Sign in to manage your store or account.</div>
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 460, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px,4vw,40px)", background: t.bg2 }}>
        <div style={{ width: "100%" }}>
          <button onClick={onBack} style={{ background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: t.text3, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Back to Store</button>
          <div style={{ fontSize: 26, fontWeight: 900, color: t.text, marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 14, color: t.text3, marginBottom: 28 }}>Sign in to your account</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input t={t} label="Email Address" value={email} onChange={setEmail} type="email" placeholder="email@example.com" />
            <Input t={t} label="Password" value={pass} onChange={setPass} type="password" placeholder="••••••••" />
            {err && <div style={{ color: t.red, background: t.redBg, border: `1px solid ${t.redBorder}`, borderRadius: 9, padding: "10px 14px", fontSize: 13 }}>{err}</div>}
            <button onClick={handle} disabled={loading} style={{ width: "100%", padding: 14, background: `linear-gradient(135deg,${t.accent},${t.accent2})`, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: `0 4px 16px ${t.accent}40` }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </div>
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 11, color: t.text4, textAlign: "center", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Quick Demo Access</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {demos.map(d => <button key={d.l} onClick={() => { setEmail(d.e); setPass(d.p); setErr(""); }} style={{ flex: "1 0 calc(50% - 4px)", padding: "9px 12px", background: d.c + "0f", border: `1px solid ${d.c}33`, borderRadius: 9, color: d.c, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>{d.i} {d.l}</button>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// REGISTER PAGE (OTP simulation)
// ═══════════════════════════════════════════════════════════════
const RegisterPage = ({ onBack, onRegister, t }) => {
  const [step, setStep] = useState(1); // 1=form, 2=otp, 3=done
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [err, setErr] = useState("");

  const sendOtp = () => {
    if (!form.name || !form.email || !form.phone || !form.password) { setErr("All fields required"); return; }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setStep(2);
    notify(`OTP sent to ${form.phone}: ${code} (demo)`, "info", 8000);
  };

  const verify = () => {
    if (otp === generatedOtp) { setStep(3); setTimeout(() => onRegister(form), 1500); }
    else setErr("Invalid OTP. Try again.");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: t.bg }}>
      <div style={{ flex: 1, background: `linear-gradient(160deg,#2563eb 0%,#1e3a8a 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }} className="hide-mobile">
        <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "relative", textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🏟️</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>Join the Fan Club</div>
          <div style={{ fontSize: 16, opacity: 0.8, marginTop: 12, lineHeight: 1.6 }}>Create your account and start earning loyalty points on every purchase.</div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32 }}>
            {[["⭐", "Earn Loyalty Points"], ["🎁", "Exclusive Offers"], ["🚚", "Free Delivery"]].map(([i, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{i}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 480, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px,4vw,40px)", background: t.bg2 }}>
        <div style={{ width: "100%" }}>
          <button onClick={onBack} style={{ background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: t.text3, cursor: "pointer", marginBottom: 24 }}>← Back to Store</button>
          {/* Steps */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28, gap: 0 }}>
            {["Your Details", "Verify OTP", "Complete"].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : undefined }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: step > i ? t.accent : step === i + 1 ? t.accent : t.bg4, color: step > i || step === i + 1 ? "#fff" : t.text3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 10, color: step === i + 1 ? t.accent : t.text4, fontWeight: 700, whiteSpace: "nowrap" }}>{s}</div>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? t.accent : t.border, margin: "0 4px", marginBottom: 18 }} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <div style={{ fontSize: 22, fontWeight: 900, color: t.text, marginBottom: 6 }}>Create Account</div>
              <div style={{ fontSize: 14, color: t.text3, marginBottom: 24 }}>Fill in your details to get started</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Input t={t} label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="John Smith" required />
                <Input t={t} label="Email Address" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" placeholder="john@email.com" required />
                <Input t={t} label="Phone Number" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+44 7700 900000" required note="OTP will be sent to this number" />
                <Input t={t} label="Password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} type="password" placeholder="Min 6 characters" required />
                {err && <div style={{ color: t.red, background: t.redBg, border: `1px solid ${t.redBorder}`, borderRadius: 9, padding: "10px 14px", fontSize: 13 }}>{err}</div>}
                <button onClick={sendOtp} style={{ width: "100%", padding: 14, background: `linear-gradient(135deg,${t.blue},#1e40af)`, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 900, cursor: "pointer" }}>Send OTP →</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontSize: 22, fontWeight: 900, color: t.text, marginBottom: 6 }}>Verify Your Number</div>
              <div style={{ fontSize: 14, color: t.text3, marginBottom: 8 }}>We sent a 6-digit OTP to <strong>{form.phone}</strong></div>
              <div style={{ background: t.yellowBg, border: `1px solid ${t.yellowBorder}`, borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: t.yellow, fontWeight: 700 }}>
                📱 Demo OTP: <span style={{ fontSize: 22, letterSpacing: 4, fontFamily: "monospace" }}>{generatedOtp}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Input t={t} label="Enter 6-Digit OTP" value={otp} onChange={v => { setOtp(v); setErr(""); }} placeholder="______" note="Check the yellow box above for demo OTP" />
                {err && <div style={{ color: t.red, background: t.redBg, border: `1px solid ${t.redBorder}`, borderRadius: 9, padding: "10px 14px", fontSize: 13 }}>{err}</div>}
                <button onClick={verify} disabled={otp.length < 6} style={{ width: "100%", padding: 14, background: `linear-gradient(135deg,${t.green},#15803d)`, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 900, cursor: otp.length < 6 ? "not-allowed" : "pointer", opacity: otp.length < 6 ? 0.5 : 1 }}>Verify & Create Account ✓</button>
                <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: t.text3, cursor: "pointer", fontSize: 13 }}>← Edit details</button>
              </div>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: t.text }}>Welcome to FanStore!</div>
              <div style={{ fontSize: 14, color: t.text3, marginTop: 8 }}>Account created. Signing you in...</div>
              <div style={{ marginTop: 20, display: "inline-block", width: 24, height: 24, border: `3px solid ${t.accent}`, borderTopColor: "transparent", borderRadius: "50%" }} className="spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// POS TERMINAL — FULL FEATURED
// ═══════════════════════════════════════════════════════════════
// ─── CARD TERMINAL WIDGET (compact) ─────────────────────────────────────────
const CardTerminal = ({ total, onApproved, t }) => {
  const [status, setStatus] = useState("idle");
  const tap = () => {
    if (status !== "idle") return;
    setStatus("processing");
    setTimeout(() => { setStatus("approved"); onApproved(); }, 1500);
  };
  return (
    <div style={{ marginTop: 4, background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 9, padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 9, color: t.text4, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>Card Terminal</div>
      {status === "idle" && (
        <div onClick={tap} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#0a0f1e", borderRadius: 7, padding: "6px 10px", cursor: "pointer", border: "1px dashed #334155" }}>
          <span style={{ fontSize: 16 }}>💳</span>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>TAP / INSERT / SWIPE</span>
        </div>
      )}
      {status === "processing" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "6px 10px" }}>
          <div style={{ width: 14, height: 14, border: "2px solid #ef4444", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: t.text3, fontWeight: 700 }}>Processing...</span>
        </div>
      )}
      {status === "approved" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "6px 10px" }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <span style={{ fontSize: 11, fontWeight: 900, color: t.green }}>APPROVED — {fmt(total)}</span>
        </div>
      )}
    </div>
  );
};

const POSTerminal = ({ products, setProducts, orders, setOrders, users, setUsers, user, addAudit, settings, banners, coupons, t }) => {
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [payMethod, setPayMethod] = useState("Card");
  const [showReceipt, setShowReceipt] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  // Customer
  const [custSearch, setCustSearch] = useState("");
  const [selCust, setSelCust] = useState(null);
  const [showNewCust, setShowNewCust] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [newCustForm, setNewCustForm] = useState({ name: "", phone: "" });
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  // Payment
  const [cashGiven, setCashGiven] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [qrPaid, setQrPaid] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  // Loyalty
  const [loyaltyRedeem, setLoyaltyRedeem] = useState(false);
  // Parked bills
  const [parked, setParked] = useState([]);
  // Favourites
  const [favourites, setFavourites] = useState([1, 6, 9, 4]);
  // Order type
  const [orderType, setOrderType] = useState("in-store");
  const [deliveryAddr, setDeliveryAddr] = useState("");
  const [deliveryZone, setDeliveryZone] = useState(settings.deliveryZones[0].zone);
  const [pickupDate, setPickupDate] = useState("");
  // Customer display
  const [showCustDisplay, setShowCustDisplay] = useState(false);
  // Self service
  const [selfService, setSelfService] = useState(false);
  // Void reason
  const [voidItem, setVoidItem] = useState(null);
  const [voidReason, setVoidReason] = useState("");

  const activeOffers = banners.filter(isBannerActive).filter(b => b.offerType !== "none");
  const vatRate = (settings.vatRate || 20) / 100;
  const filteredProds = products.filter(p => (cat === "All" || p.category === cat) && (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())));
  const favProds = products.filter(p => favourites.includes(p.id));

  // Auto-apply banner discount
  const getItemDiscount = useCallback((product) => {
    // Check banner category offers
    const offer = activeOffers.find(b => b.offerType === "category" && b.offerTarget === product.category);
    const bannerDisc = offer ? offer.offerDiscount : 0;
    // Also check individual product discount set by admin
    const prodDisc = product.discount || 0;
    return Math.max(bannerDisc, prodDisc);
  }, [activeOffers]);

  const addToCart = (p) => {
    const inCart = cart.find(i => i.id === p.id);
    const qtyInCart = inCart ? inCart.qty : 0;
    if (qtyInCart >= p.stock) { notify(`Only ${p.stock} in stock!`, "error"); return; }
    const disc = getItemDiscount(p);
    setCart(c => {
      const ex = c.find(i => i.id === p.id);
      if (ex) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...p, qty: 1, discount: disc }];
    });
    if (disc > 0) notify(`🎉 ${disc}% banner offer applied on ${p.name}!`, "success");
  };

  const updateQty = (id, d) => {
    const p = products.find(x => x.id === id);
    const ci = cart.find(i => i.id === id);
    if (d > 0 && ci && ci.qty >= p.stock) { notify(`Max stock reached (${p.stock})`, "error"); return; }
    setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0));
  };

  const doVoid = () => {
    if (!voidItem || !voidReason) return;
    addAudit(user, "Item Voided", "POS", `${voidItem.name} voided: ${voidReason}`);
    setCart(c => c.filter(i => i.id !== voidItem.id));
    notify(`${voidItem.name} voided: ${voidReason}`, "warning");
    setVoidItem(null); setVoidReason("");
  };

  // Subtotal with per-item discounts
  const cartSubtotal = cart.reduce((s, i) => s + (i.price * (1 - (i.discount || 0) / 100)) * i.qty, 0);
  const cartTax = cartSubtotal * vatRate;
  const deliveryCharge = orderType === "delivery" ? (settings.deliveryZones.find(z => z.zone === deliveryZone)?.charge || 0) : 0;
  const cartBeforeExtras = cartSubtotal + cartTax + deliveryCharge;

  // Coupon
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") couponDiscount = cartBeforeExtras * appliedCoupon.value / 100;
    else if (appliedCoupon.type === "fixed") couponDiscount = Math.min(appliedCoupon.value, cartBeforeExtras);
    else if (appliedCoupon.type === "delivery") couponDiscount = deliveryCharge;
  }

  // Loyalty
  const custPoints = selCust?.loyaltyPoints || 0;
  const loyaltyDiscount = loyaltyRedeem ? Math.min(custPoints * (settings.loyaltyValue || 0.01), cartBeforeExtras - couponDiscount) : 0;

  // Round to 2 decimals to avoid floating-point edge cases during cash comparison.
  const cartTotal = Math.max(0, Math.round((cartBeforeExtras - couponDiscount - loyaltyDiscount) * 100) / 100);
  const cashGivenNum = parseFloat(cashGiven) || 0;
  const cashChange = payMethod === "Cash" && cashGiven !== "" ? Math.round((cashGivenNum - cartTotal) * 100) / 100 : 0;
  const pointsEarned = selCust ? Math.floor(cartTotal * (settings.loyaltyRate || 1)) : 0;

  const applyCoupon = () => {
    const c = coupons.find(x => x.code === couponCode.toUpperCase() && x.active && new Date(x.expiry) >= new Date());
    if (!c) { notify("Invalid or expired coupon", "error"); return; }
    if (cartSubtotal < c.minOrder) { notify(`Minimum order ${fmt(c.minOrder)} required`, "error"); return; }
    setAppliedCoupon(c); notify(`Coupon ${c.code} applied!`, "success");
  };

  const parkBill = () => {
    if (cart.length === 0) return;
    const id = genId("PARKED");
    setParked(p => [...p, { id, cart, selCust, ts: ts() }]);
    setCart([]); setSelCust(null);
    notify(`Bill parked as ${id}`, "info");
  };

  const recallBill = (pb) => {
    setCart(pb.cart); setSelCust(pb.selCust);
    setParked(p => p.filter(x => x.id !== pb.id));
    notify("Parked bill recalled", "success");
  };

  const simulateScan = () => {
    setScanning(true); setScanMsg("Initializing scanner...");
    setTimeout(() => {
      setScanMsg("Ready to scan — Click 'Enter Barcode' below");
      setScanning(false);
    }, 800);
  };

  const [manualBarcode, setManualBarcode] = useState("");
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);

  const handleBarcodeScan = (barcode) => {
    const product = products.find(p => p.sku === barcode || p.id.toString() === barcode);
    if (product) {
      addToCart(product);
      setScanMsg(`✓ Scanned: ${product.name}`);
      setTimeout(() => setScanMsg(""), 2500);
    } else {
      setScanMsg("❌ Product not found");
      setTimeout(() => setScanMsg(""), 2500);
    }
    setManualBarcode("");
    setShowBarcodeInput(false);
  };

  const lookupCustomer = () => {
    const c = users.find(u => u.role === "customer" && (u.phone === custSearch || u.name.toLowerCase().includes(custSearch.toLowerCase()) || u.email.toLowerCase().includes(custSearch.toLowerCase())));
    if (c) { setSelCust(c); notify(`✓ ${c.name} — ⭐${c.loyaltyPoints} pts`, "success"); }
    else notify("Customer not found. Add as new?", "warning");
  };

  const sendNewCustOtp = () => {
    if (!newCustForm.name || !newCustForm.phone) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpStep(2);
    notify(`OTP for ${newCustForm.phone}: ${code}`, "info", 8000);
  };

  const verifyNewCust = () => {
    if (otpInput !== generatedOtp) { notify("Wrong OTP", "error"); return; }
    const nc = { id: Date.now(), name: newCustForm.name, phone: newCustForm.phone, email: `${newCustForm.phone.replace(/\s/g, "")}@customer.com`, password: "pass123", role: "customer", avatar: newCustForm.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2), active: true, joinDate: ts(), loyaltyPoints: 0, tier: "Bronze", totalSpent: 0, pointsExpiry: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0] };
    setUsers(us => [...us, nc]);
    setSelCust(nc);
    setShowNewCust(false);
    setOtpStep(1); setNewCustForm({ name: "", phone: "" }); setOtpInput("");
    addAudit(user, "Customer Registered", "POS", `New customer ${nc.name} registered`);
    notify(`${nc.name} registered & attached!`, "success");
  };

  const checkout = () => {
    if (cart.length === 0) return;
    if (payMethod === "Cash" && (cashGiven === "" || cashGivenNum < cartTotal)) { notify("Enter sufficient cash amount", "error"); return; }
    if (payMethod === "Card" && cardNum.length < 4) { notify("Please tap/insert card on terminal first", "error"); return; }
    if (payMethod === "QR" && !qrPaid) { setShowQrModal(true); return; }
    processOrder();
  };

  const processOrder = () => {
    const orderId = genId("ORD");
    const ptUsed = loyaltyRedeem ? Math.floor(loyaltyDiscount / (settings.loyaltyValue || 0.01)) : 0;
    const newOrder = {
      id: orderId, customerId: selCust?.id || null, customerName: selCust?.name || "Walk-in",
      cashierId: user.id, cashierName: user.name,
      items: cart.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price, discount: i.discount || 0 })),
      subtotal: cartSubtotal, tax: cartTax, discountAmt: couponDiscount + loyaltyDiscount,
      loyaltyDiscount, couponDiscount, couponCode: appliedCoupon?.code || null,
      deliveryCharge, total: cartTotal,
      payment: payMethod, cardLast4: payMethod === "Card" ? cardNum.slice(-4) : null,
      cashGiven: payMethod === "Cash" ? cashGivenNum : null,
      cashChange: payMethod === "Cash" ? cashChange : null,
      date: ts(), counter: user.counter || "Counter 1", status: "completed",
      orderType, deliveryAddress: orderType === "delivery" ? deliveryAddr : null,
      deliveryZone: orderType === "delivery" ? deliveryZone : null,
      deliveryStatus: orderType === "delivery" ? "pending" : null,
      pickupDate: orderType === "pickup" ? pickupDate : null,
      loyaltyEarned: selCust ? pointsEarned : 0, loyaltyUsed: ptUsed,
    };
    setOrders(o => [newOrder, ...o]);
    setProducts(ps => ps.map(p => { const ci = cart.find(i => i.id === p.id); return ci ? { ...p, stock: p.stock - ci.qty } : p; }));
    if (selCust) {
      const newPts = Math.max(0, (selCust.loyaltyPoints || 0) - ptUsed + pointsEarned);
      const newSpent = (selCust.totalSpent || 0) + cartTotal;
      setUsers(us => us.map(u => u.id === selCust.id ? { ...u, loyaltyPoints: newPts, totalSpent: newSpent, tier: getTier(newSpent) } : u));
    }
    if (appliedCoupon) coupons.forEach(c => { if (c.id === appliedCoupon.id) c.uses = (c.uses || 0) + 1; });
    addAudit(user, "Payment Completed", "POS", `${orderId} — ${fmt(cartTotal)} via ${payMethod}`);
    notify(`Order ${orderId} complete! 🎉`, "success");
    setShowReceipt(newOrder);
    setCart([]); setCashGiven(""); setCardNum(""); setCardExp(""); setCardCvv(""); setQrPaid(false); setAppliedCoupon(null); setCouponCode(""); setLoyaltyRedeem(false); setShowQrModal(false); setOrderType("in-store");
  };

  const kioskCheckout = (paymentMethod) => {
    if (cart.length === 0) return;
    const orderId = genId("ORD");
    const newOrder = {
      id: orderId, customerId: null, customerName: "Self-Service",
      cashierId: user.id, cashierName: user.name,
      items: cart.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price, discount: i.discount || 0 })),
      subtotal: cartSubtotal, tax: cartTax, discountAmt: 0, loyaltyDiscount: 0, couponDiscount: 0,
      couponCode: null, deliveryCharge: 0, total: cartTotal,
      payment: paymentMethod, date: ts(), counter: user.counter || "Kiosk", status: "completed",
      orderType: "in-store", loyaltyEarned: 0, loyaltyUsed: 0,
    };
    setOrders(o => [newOrder, ...o]);
    setProducts(ps => ps.map(p => { const ci = cart.find(i => i.id === p.id); return ci ? { ...p, stock: p.stock - ci.qty } : p; }));
    addAudit(user, "Kiosk Order", "POS", orderId + " — " + fmt(cartTotal) + " via " + paymentMethod);
    notify("Kiosk order " + orderId + " complete! 🎉", "success");
    setCart([]); setSelfService(false);
  };
  if (selfService) return <KioskMode products={products} addToCart={addToCart} cart={cart} setCart={setCart} updateQty={updateQty} cartTotal={cartTotal} cartSubtotal={cartSubtotal} cartTax={cartTax} onExit={() => setSelfService(false)} onCheckout={kioskCheckout} t={t} settings={settings} />;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 48px)", overflow: "hidden", fontFamily: "inherit" }} className="pos-layout">
      {/* LEFT: Products */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: t.posLeft, borderRight: `1px solid ${t.border}` }} className="pos-left">
        {/* Toolbar */}
        <div style={{ padding: "8px 10px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search / SKU..." style={{ width: "100%", background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: "8px 14px 8px 34px", color: t.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          </div>
          <button onClick={simulateScan} style={{ padding: "8px 12px", background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 9, color: t.green, fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
            {scanning ? "⏳ Scanning..." : "📷 Scan"}
          </button>
          <button onClick={() => setShowBarcodeInput(true)} style={{ padding: "8px 12px", background: t.blueBg, border: `1px solid ${t.blueBorder}`, borderRadius: 9, color: t.blue, fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
            🔢 Enter Barcode
          </button>
          {scanMsg && <span style={{ fontSize: 12, color: t.green, fontWeight: 700 }}>{scanMsg}</span>}
          <button onClick={parkBill} style={{ padding: "8px 12px", background: t.yellowBg, border: `1px solid ${t.yellowBorder}`, borderRadius: 9, color: t.yellow, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>⏸ Park</button>
          {parked.length > 0 && (
            <div style={{ position: "relative" }}>
              <button style={{ padding: "8px 12px", background: t.purpleBg, border: `1px solid ${t.purpleBorder}`, borderRadius: 9, color: t.purple, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📋 Recall ({parked.length})</button>
              <div style={{ position: "absolute", top: "110%", left: 0, background: t.bg2, border: `1px solid ${t.border}`, borderRadius: 10, padding: 8, zIndex: 100, minWidth: 200, boxShadow: t.shadowMd }}>
                {parked.map(pb => <button key={pb.id} onClick={() => recallBill(pb)} style={{ display: "block", width: "100%", padding: "8px 12px", background: "none", border: "none", color: t.text, cursor: "pointer", textAlign: "left", fontSize: 12, borderRadius: 6 }}>📋 {pb.id} — {pb.cart.length} items · {pb.ts}</button>)}
              </div>
            </div>
          )}
          <button onClick={() => setSelfService(true)} style={{ padding: "8px 12px", background: t.tealBg, border: `1px solid ${t.tealBorder}`, borderRadius: 9, color: t.teal, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>🖥️ Kiosk</button>
        </div>

        {/* Favourites bar */}
        {favProds.length > 0 && (
          <div style={{ padding: "8px 12px", borderBottom: `1px solid ${t.border}`, background: t.bg3 }}>
            <div style={{ fontSize: 10, color: t.text3, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>⭐ Favourites</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
              {favProds.map(p => {
                const disc = getItemDiscount(p);
                return (
                  <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock === 0} style={{ flexShrink: 0, background: t.card, border: `1px solid ${disc > 0 ? t.accent : t.border}`, borderRadius: 9, padding: "6px 12px", cursor: p.stock === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: p.stock === 0 ? 0.4 : 1 }}>
                    <span style={{ fontSize: 16 }}>{p.emoji}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.text, whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: t.green, fontWeight: 800 }}>{disc > 0 ? <><s style={{ color: t.text3 }}>{fmt(p.price)}</s> {fmt(p.price * (1 - disc / 100))}</> : fmt(p.price)}</div>
                    </div>
                    {disc > 0 && <span style={{ fontSize: 9, background: t.accent, color: "#fff", borderRadius: 5, padding: "1px 5px", fontWeight: 900 }}>-{disc}%</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 4, padding: "6px 10px", overflowX: "auto", borderBottom: `1px solid ${t.border}`, WebkitOverflowScrolling: "touch" }}>
          {CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding: "5px 13px", borderRadius: 20, border: "none", background: cat === c ? t.accent : t.bg4, color: cat === c ? "#fff" : t.text3, fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{c}</button>)}
        </div>

        {/* Products grid */}
        <div className="pos-products-grid" style={{ flex: 1, overflowY: "auto", padding: 8, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(110px,42vw),1fr))", gap: 6, alignContent: "start" }}>
          {filteredProds.map(p => {
            const disc = getItemDiscount(p);
            return (
              <div key={p.id} onClick={() => addToCart(p)} style={{ background: t.card, border: `1px solid ${disc > 0 ? t.accent : t.border}`, borderRadius: 11, overflow: "hidden", cursor: p.stock === 0 ? "not-allowed" : "pointer", opacity: p.stock === 0 ? 0.45 : 1, transition: "all 0.12s", boxShadow: t.shadow, position: "relative" }}
                onMouseEnter={e => { if (p.stock > 0) e.currentTarget.style.boxShadow = t.shadowMd; }}
                onMouseLeave={e => e.currentTarget.style.boxShadow = t.shadow}>
                {disc > 0 && <div style={{ position: "absolute", top: 6, left: 6, zIndex: 1, background: t.accent, color: "#fff", borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 900 }}>-{disc}% OFF</div>}
                <div style={{ height: "clamp(60px,12vw,80px)", background: t.bg3, overflow: "hidden" }}>
                  <ImgWithFallback src={PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "7px 9px" }}>
                  <div style={{ fontSize: "clamp(9px,2.5vw,11px)", fontWeight: 700, color: t.text, lineHeight: 1.3, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      {disc > 0 ? <><div style={{ fontSize: 10, color: t.text4, textDecoration: "line-through" }}>{fmt(p.price)}</div><div style={{ fontSize: 12, fontWeight: 900, color: t.accent }}>{fmt(p.price * (1 - disc / 100))}</div></> : <div style={{ fontSize: 12, fontWeight: 900, color: t.green }}>{fmt(p.price)}</div>}
                    </div>
                    <div style={{ fontSize: 9, color: p.stock <= 5 ? t.red : t.text4 }}>Stk:{p.stock}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div style={{ width: "clamp(260px,28vw,340px)", display: "flex", flexDirection: "column", background: t.posRight, flexShrink: 0, borderLeft: `1px solid ${t.border}` }} className="pos-right">
        {/* Customer */}
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.border}`, background: t.bg3 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: t.text3, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 7 }}>Customer</div>
          {selCust ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>👤 {selCust.name}</div>
                <div style={{ fontSize: 11, color: t.yellow }}>⭐ {selCust.loyaltyPoints} pts · {selCust.tier}</div>
              </div>
              <button onClick={() => { setSelCust(null); setLoyaltyRedeem(false); }} style={{ background: t.redBg, border: `1px solid ${t.redBorder}`, color: t.red, borderRadius: 7, padding: "3px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✕</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <input value={custSearch} onChange={e => setCustSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && lookupCustomer()} placeholder="Phone / Name / Email..." style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 10px", color: t.text, fontSize: 12, outline: "none" }} />
              <button onClick={lookupCustomer} style={{ background: t.accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Find</button>
              <button onClick={() => setShowNewCust(true)} style={{ background: t.blue, color: "#fff", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ New</button>
            </div>
          )}
        </div>

        {/* Order type — Cashier POS is always In-Store (delivery & pickup are customer-facing online) */}
        <div style={{ padding: "6px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13 }}>🏪</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: t.green }}>In-Store Transaction</span>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 10px", WebkitOverflowScrolling: "touch" }}>
          {cart.length === 0
            ? <div style={{ textAlign: "center", padding: "32px 16px", color: t.text3 }}><div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div><div style={{ fontSize: 13, fontWeight: 700 }}>Cart is empty</div><div style={{ fontSize: 12, marginTop: 4, color: t.text4 }}>Tap a product or scan barcode</div></div>
            : cart.map(item => (
              <div key={item.id} style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: t.bg3 }}>
                  <ImgWithFallback src={PRODUCT_IMAGES[item.name]} alt={item.name} emoji={item.emoji} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: item.discount > 0 ? t.accent : t.green, fontWeight: 800 }}>
                    {item.discount > 0 ? `${fmt(item.price * (1 - item.discount / 100))} (-${item.discount}%)` : fmt(item.price)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${t.border}`, background: t.bg3, color: t.text, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 900, color: t.text, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${t.border}`, background: t.bg3, color: t.text, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                <div style={{ fontSize: 12, fontWeight: 900, color: t.text, minWidth: 50, textAlign: "right" }}>{fmt(item.price * (1 - (item.discount || 0) / 100) * item.qty)}</div>
                <button onClick={() => setVoidItem(item)} style={{ background: "none", border: "none", color: t.text4, cursor: "pointer", fontSize: 14, padding: "0 2px" }}>✕</button>
              </div>
            ))}
        </div>

        {/* Coupon */}
        <div style={{ padding: "8px 14px", borderTop: `1px solid ${t.border}` }}>
          {appliedCoupon
            ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 8, padding: "7px 12px" }}>
              <span style={{ fontSize: 12, color: t.green, fontWeight: 800 }}>🎟️ {appliedCoupon.code} — {appliedCoupon.description}</span>
              <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} style={{ background: "none", border: "none", color: t.red, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            : <div style={{ display: "flex", gap: 6 }}>
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon / Voucher code" style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 10px", color: t.text, fontSize: 12, outline: "none" }} />
              <button onClick={applyCoupon} style={{ background: t.purple, color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Apply</button>
            </div>}

          {/* Loyalty redeem */}
          {selCust && (selCust.loyaltyPoints || 0) > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, background: t.yellowBg, border: `1px solid ${t.yellowBorder}`, borderRadius: 8, padding: "7px 12px" }}>
              <span style={{ fontSize: 12, color: t.yellow, fontWeight: 700 }}>⭐ Redeem {selCust.loyaltyPoints} pts = {fmt(selCust.loyaltyPoints * (settings.loyaltyValue || 0.01))}</span>
              <Toggle t={t} value={loyaltyRedeem} onChange={setLoyaltyRedeem} />
            </div>
          )}

          {/* Totals */}
          <div style={{ marginTop: 10 }}>
            {[["Subtotal", fmt(cartSubtotal)], [`VAT (${settings.vatRate}%)`, fmt(cartTax)], orderType !== "in-store" && deliveryCharge > 0 && ["Delivery", fmt(deliveryCharge)], couponDiscount > 0 && [`Coupon (${appliedCoupon?.code})`, `-${fmt(couponDiscount)}`], loyaltyDiscount > 0 && ["Loyalty Discount", `-${fmt(loyaltyDiscount)}`]].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: v.startsWith("-") ? t.green : t.text3, marginBottom: 4 }}><span>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 900, color: t.text, paddingTop: 10, borderTop: `2px solid ${t.border}`, marginTop: 4 }}>
              <span>Total</span><span style={{ color: t.accent }}>{fmt(cartTotal)}</span>
            </div>
            {selCust && pointsEarned > 0 && <div style={{ fontSize: 11, color: t.yellow, textAlign: "right", marginTop: 3 }}>+{pointsEarned} loyalty pts will be earned</div>}
          </div>

          {/* Payment method */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 10 }}>
            {[["Card", "💳"], ["Cash", "💵"], ["QR", "📱"]].map(([m, ic]) => (
              <button key={m} onClick={() => setPayMethod(m)} style={{ padding: "7px 4px", borderRadius: 8, border: `2px solid ${payMethod === m ? t.accent : t.border}`, background: payMethod === m ? t.accent + "15" : t.bg3, color: payMethod === m ? t.accent : t.text3, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{ic} {m}</button>
            ))}
          </div>

          {/* Card Terminal Widget */}
          {payMethod === "Card" && (
            <CardTerminal total={cartTotal} onApproved={() => { setCardNum("4242424242424242"); setCardExp("12/26"); setCardCvv("123"); }} t={t} />
          )}

          {/* Cash */}
          {payMethod === "Cash" && (
            <div style={{ marginTop: 8 }}>
              <input value={cashGiven} onChange={e => setCashGiven(e.target.value)} placeholder="Cash received (£)" type="number" style={{ width: "100%", background: t.input, border: `1px solid ${cashGiven && cashGivenNum >= cartTotal ? t.greenBorder : t.border}`, borderRadius: 8, padding: "9px 12px", color: t.text, fontSize: 14, fontWeight: 800, outline: "none", boxSizing: "border-box" }} />
              {cashGiven !== "" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
                  {[["Cash Given", fmt(cashGivenNum), t.text], ["Change Due", cashChange >= 0 ? fmt(cashChange) : "Insufficient", cashChange >= 0 ? t.green : t.red]].map(([k, v, c]) => (
                    <div key={k} style={{ background: t.bg3, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: t.text4 }}>{k}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Checkout */}
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button onClick={checkout} disabled={cart.length === 0}
              style={{ flex: 1, padding: "13px", background: cart.length === 0 ? t.bg4 : `linear-gradient(135deg,${t.accent},${t.accent2})`, color: cart.length === 0 ? t.text3 : "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 900, cursor: cart.length === 0 ? "not-allowed" : "pointer", boxShadow: cart.length > 0 ? `0 4px 14px ${t.accent}40` : "none" }}>
              {cart.length === 0 ? "Add items to cart" : `${payMethod === "Card" ? "💳" : payMethod === "Cash" ? "💵" : "📱"} Pay ${fmt(cartTotal)}`}
            </button>
            <button onClick={() => setShowCustDisplay(true)} title="Customer Display" style={{ padding: "13px 12px", background: t.tealBg, border: `1px solid ${t.tealBorder}`, borderRadius: 10, color: t.teal, cursor: "pointer", fontSize: 16 }}>🖥️</button>
          </div>
          {cart.length > 0 && <button onClick={() => setCart([])} style={{ width: "100%", padding: "6px", marginTop: 5, background: "transparent", color: t.text4, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 11, cursor: "pointer" }}>🗑️ Clear Cart</button>}
        </div>
      </div>

      {/* New Customer Modal with OTP */}
      {showNewCust && (
        <Modal t={t} title="Register New Customer" subtitle="Verify phone number via OTP" onClose={() => { setShowNewCust(false); setOtpStep(1); }}>
          {otpStep === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Input t={t} label="Customer Full Name" value={newCustForm.name} onChange={v => setNewCustForm(f => ({ ...f, name: v }))} required />
              <Input t={t} label="Mobile Number" value={newCustForm.phone} onChange={v => setNewCustForm(f => ({ ...f, phone: v }))} placeholder="+44 7700 900000" required note="OTP will be sent to verify this number" />
              <Btn t={t} onClick={sendNewCustOtp} disabled={!newCustForm.name || !newCustForm.phone} fullWidth>Send OTP →</Btn>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: t.yellowBg, border: `1px solid ${t.yellowBorder}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 13, color: t.yellow, fontWeight: 700, marginBottom: 4 }}>📱 Demo OTP sent to {newCustForm.phone}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: t.yellow, letterSpacing: 8, fontFamily: "monospace" }}>{generatedOtp}</div>
              </div>
              <Input t={t} label="Enter 6-Digit OTP" value={otpInput} onChange={v => { setOtpInput(v); }} placeholder="______" />
              <div style={{ display: "flex", gap: 10 }}>
                <Btn t={t} variant="ghost" onClick={() => setOtpStep(1)}>← Back</Btn>
                <Btn t={t} variant="success" onClick={verifyNewCust} disabled={otpInput.length < 6} style={{ flex: 1 }}>✓ Verify & Register</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Void item modal */}
      {voidItem && (
        <Modal t={t} title="Void Item" subtitle={`Remove ${voidItem.name} from cart`} onClose={() => setVoidItem(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Select t={t} label="Void Reason" value={voidReason} onChange={setVoidReason} options={[{ value: "", label: "Select reason..." }, "Customer changed mind", "Wrong item scanned", "Price discrepancy", "Out of stock after scan", "Manager override"].map(v => typeof v === "string" ? { value: v, label: v } : v)} />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn t={t} variant="ghost" onClick={() => setVoidItem(null)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn t={t} variant="danger" onClick={doVoid} disabled={!voidReason} style={{ flex: 1 }}>Void Item</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* QR Payment Modal */}
      {showQrModal && (
        <Modal t={t} title="QR Payment" subtitle={`Scan to pay ${fmt(cartTotal)}`} onClose={() => setShowQrModal(false)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "#fff", border: "3px solid #000", borderRadius: 12, padding: 24, display: "inline-block", margin: "0 auto 20px" }}>
              <div style={{ width: 160, height: 160, display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 1 }}>
                {Array.from({ length: 64 }, (_, i) => <div key={i} style={{ background: (i + Math.floor(i / 8)) % 3 === 0 ? "#000" : "#fff", borderRadius: 1 }} />)}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: t.accent, marginBottom: 6 }}>{fmt(cartTotal)}</div>
            <div style={{ fontSize: 14, color: t.text3, marginBottom: 24 }}>Scan with Google Pay, Apple Pay, or bank app</div>
            <Btn t={t} variant="success" size="lg" fullWidth onClick={() => { setQrPaid(true); setShowQrModal(false); processOrder(); }}>✓ Confirm Payment Received</Btn>
          </div>
        </Modal>
      )}

      {/* Barcode Input Modal */}
      {showBarcodeInput && (
        <Modal t={t} title="Enter Barcode" subtitle="Scan or type product barcode/SKU" onClose={() => setShowBarcodeInput(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ textAlign: "center", padding: 20, background: t.bg3, borderRadius: 10 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>📷</div>
              <div style={{ fontSize: 14, color: t.text3 }}>Position barcode in front of scanner</div>
            </div>
            <Input t={t} label="Barcode/SKU" value={manualBarcode} onChange={setManualBarcode} placeholder="Scan or type barcode..." />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn t={t} variant="ghost" onClick={() => setShowBarcodeInput(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn t={t} variant="success" onClick={() => handleBarcodeScan(manualBarcode)} disabled={!manualBarcode.trim()} style={{ flex: 1 }}>✓ Scan Product</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Display */}
      {showCustDisplay && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0a0f1e", borderRadius: 20, padding: 32, width: 480, color: "#fff", boxShadow: "0 25px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 24 }}>⚽</div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>Football Fan Store</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{user.counter} · Customer Display</div>
            </div>
            {selCust && <div style={{ background: "#1e293b", borderRadius: 10, padding: "10px 16px", marginBottom: 14, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Welcome,</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>{selCust.name} {selCust.tier === "Gold" ? "🥇" : selCust.tier === "Silver" ? "🥈" : "🥉"}</div>
              <div style={{ fontSize: 12, color: "#fbbf24" }}>⭐ {selCust.loyaltyPoints} points balance</div>
            </div>}
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 14 }}>
              {cart.map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e293b", fontSize: 13 }}>
                <span style={{ color: "#e2e8f0" }}>{i.emoji} {i.name} × {i.qty}</span>
                <span style={{ color: "#4ade80", fontWeight: 700 }}>{fmt(i.price * (1 - (i.discount || 0) / 100) * i.qty)}</span>
              </div>)}
            </div>
            {[["Subtotal", fmt(cartSubtotal)], [`VAT`, fmt(cartTax)], deliveryCharge > 0 && ["Delivery", fmt(deliveryCharge)], couponDiscount > 0 && ["Coupon Discount", `-${fmt(couponDiscount)}`], loyaltyDiscount > 0 && ["Loyalty", `-${fmt(loyaltyDiscount)}`]].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 3 }}><span>{k}</span><span>{v}</span></div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 900, color: "#fff", paddingTop: 10, borderTop: "2px solid #334155", marginTop: 6 }}>
              <span>TOTAL</span><span style={{ color: "#ef4444" }}>{fmt(cartTotal)}</span>
            </div>
            {payMethod === "Cash" && cashGiven !== "" && cashChange >= 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                {[["Cash Received", fmt(cashGivenNum), "#fff"], ["Your Change", fmt(cashChange), "#22c55e"]].map(([k, v, c]) => (
                  <div key={k} style={{ background: "#1e293b", borderRadius: 10, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{k}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowCustDisplay(false)} style={{ width: "100%", marginTop: 20, padding: 12, background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Close Display</button>
          </div>
        </div>
      )}

      {/* Receipt */}
      {showReceipt && <ReceiptModal order={showReceipt} settings={settings} onClose={() => setShowReceipt(null)} t={t} />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// KIOSK / SELF-SERVICE MODE
// ═══════════════════════════════════════════════════════════════
const KioskMode = ({ products, addToCart, cart, setCart, updateQty, cartTotal, cartSubtotal, cartTax, onExit, onCheckout, t, settings }) => {
  const [cat, setCat] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const filtered = products.filter(p => cat === "All" || p.category === cat);
  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <div style={{ background: "#000", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 28 }}>⚽</div>
          <div><div style={{ fontWeight: 900, fontSize: 18 }}>Self Service</div><div style={{ fontSize: 12, color: "#64748b" }}>Football Fan Store</div></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowCart(true)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 15, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            🛒 My Cart ({cart.reduce((s, i) => s + i.qty, 0)}) — {fmt(cartTotal)}
          </button>
          <button onClick={onExit} style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Exit Kiosk</button>
        </div>
      </div>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e293b", display: "flex", gap: 8, overflowX: "auto" }}>
        {CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding: "8px 18px", borderRadius: 20, border: "none", background: cat === c ? "#ef4444" : "#1e293b", color: cat === c ? "#fff" : "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{c}</button>)}
      </div>
      <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(180px,44vw),1fr))", gap: 16, alignContent: "start" }}>
        {filtered.map(p => (
          <div key={p.id} onClick={() => p.stock > 0 && addToCart(p)} style={{ background: "#0e1420", border: "1px solid #1e2d40", borderRadius: 14, overflow: "hidden", cursor: p.stock === 0 ? "not-allowed" : "pointer", opacity: p.stock === 0 ? 0.5 : 1, transition: "transform 0.15s,box-shadow 0.15s" }}
            onMouseEnter={e => { if (p.stock > 0) { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            <div style={{ height: 160, background: "#141b2d", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <ImgWithFallback src={PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f4ff", marginBottom: 6 }}>{p.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#22c55e" }}>{fmt(p.price)}</span>
                {p.stock === 0 ? <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>OUT OF STOCK</span> : <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>+</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {showCart && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0e1420", border: "1px solid #1e2d40", borderRadius: 20, width: 480, maxHeight: "80vh", overflow: "auto", padding: 24 }}>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 900, marginBottom: 20 }}>🛒 Your Cart</div>
            {cart.length === 0 ? <div style={{ color: "#64748b", textAlign: "center", padding: 40 }}>Empty cart</div> : (
              <>
                {cart.map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1e2d40", color: "#f0f4ff" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{i.emoji} {i.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => updateQty(i.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{i.qty}</span>
                    <button onClick={() => updateQty(i.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#22c55e", minWidth: 60, textAlign: "right" }}>{fmt(i.price * i.qty)}</span>
                  </div>
                </div>)}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 22, fontWeight: 900, color: "#fff", paddingTop: 12, borderTop: "2px solid #334155" }}>
                  <span>Total</span><span style={{ color: "#ef4444" }}>{fmt(cartTotal)}</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={() => setShowCart(false)} style={{ flex: 1, padding: 14, background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>← Continue</button>
                  <button onClick={() => onCheckout("Card")} style={{ flex: 1, padding: 14, background: "#ef4444", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: "pointer" }}>💳 Pay by Card</button>
                  <button onClick={() => onCheckout("Cash")} style={{ flex: 1, padding: 14, background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: "pointer" }}>💵 Pay Cash</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── RECEIPT MODAL ────────────────────────────────────────────────────────────
const ReceiptModal = ({ order, settings, onClose, t }) => (
  <Modal t={t} title="✓ Payment Successful" onClose={onClose} width={440}>
    <div style={{ background: "#fffbf5", borderRadius: 10, padding: 24, fontFamily: "monospace", border: "1px solid #e2d9c5" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>⚽ {settings.storeName}</div>
        <div style={{ fontSize: 11, color: "#666" }}>{settings.storeAddress}</div>
        <div style={{ fontSize: 11, color: "#666" }}>{settings.storePhone}</div>
        <div style={{ margin: "8px 0", borderTop: "1px dashed #aaa", paddingTop: 8 }}>
          <div style={{ fontSize: 11, color: "#888" }}>Order: {order.id} · {order.date}</div>
          <div style={{ fontSize: 11, color: "#888" }}>Counter: {order.counter} · Cashier: {order.cashierName}</div>
          {order.customerName !== "Walk-in" && <div style={{ fontSize: 11, color: "#888" }}>Customer: {order.customerName}</div>}
        </div>
      </div>
      <div style={{ borderTop: "1px dashed #aaa", borderBottom: "1px dashed #aaa", padding: "10px 0", marginBottom: 12 }}>
        {order.items.map((i, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span>{i.name} × {i.qty}{i.discount > 0 ? ` (-${i.discount}%)` : ""}</span>
            <span style={{ fontWeight: 700 }}>{fmt(i.price * (1 - (i.discount || 0) / 100) * i.qty)}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12 }}>
        {[["Subtotal", fmt(order.subtotal)], [`VAT (${settings.vatRate}%)`, fmt(order.tax)], order.deliveryCharge > 0 && ["Delivery", fmt(order.deliveryCharge)], order.couponDiscount > 0 && [`Coupon (${order.couponCode})`, `-${fmt(order.couponDiscount)}`], order.loyaltyDiscount > 0 && ["Loyalty Discount", `-${fmt(order.loyaltyDiscount)}`]].filter(Boolean).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span style={{ color: "#666" }}>{k}</span><span>{v}</span></div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 17, borderTop: "1px dashed #aaa", marginTop: 6, paddingTop: 6 }}><span>TOTAL</span><span>{fmt(order.total)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 3 }}><span>Payment</span><span style={{ fontWeight: 700 }}>{order.payment}{order.cardLast4 ? ` ****${order.cardLast4}` : ""}</span></div>
        {order.payment === "Cash" && <>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>Cash Given</span><span>{fmt(order.cashGiven)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, color: "#16a34a" }}><span>Change</span><span>{fmt(order.cashChange)}</span></div>
        </>}
        {order.orderType === "delivery" && <div style={{ marginTop: 8, background: "#eff6ff", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#1d4ed8" }}>🚚 Delivery to: {order.deliveryAddress} · {order.deliveryZone}</div>}
        {order.orderType === "pickup" && <div style={{ marginTop: 8, background: "#f0fdf4", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#15803d" }}>📦 Pickup: {order.pickupDate}</div>}
        {order.loyaltyEarned > 0 && <div style={{ marginTop: 8, background: "#fef9c3", border: "1px solid #fde047", borderRadius: 6, padding: "6px 10px", fontSize: 12, textAlign: "center", color: "#a16207", fontWeight: 800 }}>⭐ +{order.loyaltyEarned} loyalty points earned!</div>}
      </div>
      <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "#888", borderTop: "1px dashed #aaa", paddingTop: 10 }}>{settings.receiptFooter}</div>
    </div>
    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
      <Btn t={t} variant="secondary" onClick={onClose} style={{ flex: 1 }}>Close</Btn>
      <Btn t={t} onClick={() => window.print()} style={{ flex: 1 }}>🖨️ Print Receipt</Btn>
    </div>
  </Modal>
);

// ═══════════════════════════════════════════════════════════════
// PROFILE PAGE (all roles)
// ═══════════════════════════════════════════════════════════════
const ProfilePage = ({ user = {}, users = [], setUsers = () => {}, orders = [], returns = [], addAudit = () => {}, t = {}, banners = [] }) => {
  const [form, setForm] = useState({ name: user.name || "", email: user.email || "", phone: user.phone || "", password: "" });
  const [saved, setSaved] = useState(false);
  const myOrders = (orders || []).filter(o => o.customerId === user.id || o.cashierId === user.id);
  const tierColors = { Bronze: "#cd7f32", Silver: "#9ca3af", Gold: "#f59e0b" };

  const save = () => {
    setUsers(us => us.map(u => u.id === user.id ? { ...u, name: form.name, email: form.email, phone: form.phone, ...(form.password ? { password: form.password } : {}) } : u));
    addAudit(user, "Profile Updated", "Profile", `${user.name} updated profile`);
    notify("Profile updated!", "success"); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case "admin":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            <StatCard t={t} title="System Users" value={users.length} color={t.blue} icon="👥" />
            <StatCard t={t} title="Total Orders" value={orders.length} color={t.green} icon="🧾" />
            <StatCard t={t} title="Revenue" value={fmt(orders.reduce((s, o) => s + o.total, 0))} color={t.accent} icon="💰" />
            <StatCard t={t} title="Active Banners" value={(banners || []).filter(b => b.active).length} color={t.yellow} icon="🖼️" />
          </div>
        );

      case "manager":
        const mgrOrders = orders.filter(o => o.cashierId && users.find(u => u.id === o.cashierId)?.role === "cashier");
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            <StatCard t={t} title="Staff Managed" value={users.filter(u => u.role === "cashier").length} color={t.blue} icon="👥" />
            <StatCard t={t} title="Team Orders" value={mgrOrders.length} color={t.green} icon="🧾" />
            <StatCard t={t} title="Team Revenue" value={fmt(mgrOrders.reduce((s, o) => s + o.total, 0))} color={t.accent} icon="💰" />
            <StatCard t={t} title="Returns Processed" value={(returns || []).length} color={t.yellow} icon="↩️" />
          </div>
        );

      case "cashier":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            <StatCard t={t} title="Orders Processed" value={myOrders.length} color={t.green} icon="🧾" />
            <StatCard t={t} title="Revenue Generated" value={fmt(myOrders.reduce((s, o) => s + o.total, 0))} color={t.accent} icon="💰" />
            <StatCard t={t} title="Counter" value={user.counter || "Unassigned"} color={t.blue} icon="🏪" />
            <StatCard t={t} title="Avg Order Value" value={fmt(myOrders.length > 0 ? myOrders.reduce((s, o) => s + o.total, 0) / myOrders.length : 0)} color={t.purple} icon="📊" />
          </div>
        );

      case "customer":
      default:
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            <StatCard t={t} title="Total Spent" value={fmt(user.totalSpent || 0)} color={t.accent} icon="💰" />
            <StatCard t={t} title="Loyalty Points" value={`⭐ ${user.loyaltyPoints || 0}`} sub={`Expires: ${user.pointsExpiry || "—"}`} color={t.yellow} icon="🎯" />
            <StatCard t={t} title="Membership Tier" value={`${user.tier === "Gold" ? "🥇" : user.tier === "Silver" ? "🥈" : "🥉"} ${user.tier}`} sub={user.tier === "Gold" ? "Top tier!" : user.tier === "Silver" ? "£" + (1500 - (user.totalSpent || 0)) + " to Gold" : "£" + (500 - (user.totalSpent || 0)) + " to Silver"} color={tierColors[user.tier] || t.yellow} icon="⭐" />
            <StatCard t={t} title="Orders Placed" value={myOrders.length} color={t.green} icon="🛒" />
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg,${t.accent},${t.accent2})`, borderRadius: 16, padding: "28px 32px", color: "#fff", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900 }}>{user.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 900 }}>{user.name}</div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 3 }}>{user.email} · {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
          {user.role === "customer" && <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{user.tier === "Gold" ? "🥇" : user.tier === "Silver" ? "🥈" : "🥉"} {user.tier} Member</span>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>⭐ {user.loyaltyPoints} Points</span>
          </div>}
          {user.role === "cashier" && <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>🏪 {user.counter || "Unassigned"}</span>
          </div>}
        </div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, opacity: 0.7 }}>Member since</div><div style={{ fontSize: 18, fontWeight: 800 }}>{user.joinDate || "2024"}</div></div>
      </div>

      {user.role === "customer" && <BannerCarousel banners={banners} header={`Welcome Back, ${user.name}!`} t={t} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(340px,100%),1fr))", gap: 16 }}>
        {/* Edit form */}
        <Card t={t}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 16 }}>✏️ Edit Profile</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <Input t={t} label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
            <Input t={t} label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
            <Input t={t} label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
            <Input t={t} label="New Password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} type="password" placeholder="Leave blank to keep current" />
            <Btn t={t} onClick={save}>{saved ? "✓ Saved!" : "Save Changes"}</Btn>
          </div>
        </Card>

        {/* Role-specific stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {renderRoleSpecificContent()}
        </div>
      </div>

      {/* Recent activity for all roles */}
      <Card t={t}>
        <div style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 16 }}>📋 Recent Activity</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myOrders.slice(0, 5).map(o => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{o.id}</div>
                <div style={{ fontSize: 11, color: t.text3 }}>{o.date} · {o.items.length} items</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: t.accent }}>{fmt(o.total)}</div>
                <Badge t={t} text={o.status} color={o.status === "completed" ? "green" : "red"} />
              </div>
            </div>
          ))}
          {myOrders.length === 0 && <div style={{ textAlign: "center", padding: 20, color: t.text3 }}>No activity yet</div>}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ADMIN: Z-REPORT
// ═══════════════════════════════════════════════════════════════
const ZReport = ({ orders, t }) => {
  const today = new Date().toLocaleDateString("en-GB");
  const todayOrders = orders; // show all for prototype
  const total = todayOrders.reduce((s, o) => s + o.total, 0);
  const card = todayOrders.filter(o => o.payment === "Card").reduce((s, o) => s + o.total, 0);
  const cash = todayOrders.filter(o => o.payment === "Cash").reduce((s, o) => s + o.total, 0);
  const qr = todayOrders.filter(o => o.payment === "QR").reduce((s, o) => s + o.total, 0);
  const tax = todayOrders.reduce((s, o) => s + (o.tax || 0), 0);
  const refunded = todayOrders.filter(o => o.status === "refunded").reduce((s, o) => s + o.total, 0);
  const productSales = {};
  todayOrders.forEach(o => o.items.forEach(i => { productSales[i.name] = (productSales[i.name] || 0) + i.qty; }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>📑 End of Day Z-Report</div><div style={{ fontSize: 13, color: t.text3, marginTop: 3 }}>Daily trading summary</div></div>
        <Btn t={t} onClick={() => { const d = `Z-REPORT,${today}\nTotal Revenue,${fmt(total)}\nCard,${fmt(card)}\nCash,${fmt(cash)}\nQR,${fmt(qr)}\nVAT,${fmt(tax)}\nOrders,${todayOrders.length}\nRefunds,${fmt(refunded)}`; const b = new Blob([d], { type: "text/csv" }); const url = URL.createObjectURL(b); const a = document.createElement("a"); a.href = url; a.download = `zreport-${today}.csv`; a.click(); notify("Z-Report exported!", "success"); }}>⬇ Export CSV</Btn>
      </div>
      <div style={{ background: `linear-gradient(135deg,${t.accent},${t.accent2})`, borderRadius: 16, padding: 24, color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Total Trading Revenue</div>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2 }}>{fmt(total)}</div>
        <div style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>{todayOrders.length} transactions processed</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(180px,45vw),1fr))", gap: 14 }}>
        {[["Card Sales", fmt(card), t.blue, "💳"], ["Cash Sales", fmt(cash), t.green, "💵"], ["QR Sales", fmt(qr), t.purple, "📱"], ["VAT Collected", fmt(tax), t.yellow, "🏛️"], ["Refunds", fmt(refunded), t.red, "↩️"], ["Net Revenue", fmt(total - refunded), t.accent, "💰"]].map(([k, v, c, i]) => <StatCard key={k} t={t} title={k} value={v} color={c} icon={i} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card t={t}><div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>Top Products Today</div>
          {Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, qty], i) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${t.border}`, fontSize: 13 }}>
              <span style={{ color: t.text }}>#{i + 1} {name}</span><Badge t={t} text={`${qty} sold`} color="blue" />
            </div>
          ))}
        </Card>
        <Card t={t}><div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>Counter Breakdown</div>
          {["Counter 1", "Counter 2", "Counter 3"].map(c => {
            const rev = todayOrders.filter(o => o.counter === c).reduce((s, o) => s + o.total, 0);
            const cnt = todayOrders.filter(o => o.counter === c).length;
            return <div key={c} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${t.border}`, fontSize: 13 }}>
              <span style={{ color: t.text }}>{c}</span><div style={{ display: "flex", gap: 10 }}><span style={{ color: t.text3 }}>{cnt} orders</span><span style={{ fontWeight: 800, color: t.accent }}>{fmt(rev)}</span></div>
            </div>;
          })}
        </Card>
      </div>
    </div>
  );
};

// ─── COUPON MANAGEMENT ────────────────────────────────────────────────────────
const CouponManagement = ({ coupons, setCoupons, addAudit, currentUser, t }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", type: "percent", value: 10, minOrder: 0, maxUses: 100, active: true, expiry: "2024-12-31" });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>🎟️ Coupons & Vouchers</div>
        <Btn t={t} onClick={() => setShowAdd(true)}>+ Add Coupon</Btn>
      </div>
      <div style={{ background: t.yellowBg, border: `1px solid ${t.yellowBorder}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, color: t.yellow, fontWeight: 700 }}>
        💡 Demo codes to test at POS checkout: &nbsp;<code style={{ letterSpacing: 2 }}>FANDAY10</code> · <code style={{ letterSpacing: 2 }}>WELCOME20</code> · <code style={{ letterSpacing: 2 }}>FREESHIP</code>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(280px,90vw),1fr))", gap: 14 }}>
        {coupons.map(c => (
          <Card t={t} key={c.id} style={{ borderLeft: `4px solid ${c.active ? t.accent : t.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: t.text, fontFamily: "monospace", letterSpacing: 1 }}>{c.code}</span>
              <Badge t={t} text={c.active ? "Active" : "Inactive"} color={c.active ? "green" : "red"} />
            </div>
            <div style={{ fontSize: 13, color: t.text2, marginBottom: 10 }}>{c.description}</div>
            {[["Type", c.type === "percent" ? `${c.value}% off` : c.type === "fixed" ? `${fmt(c.value)} off` : "Free delivery"], ["Min Order", fmt(c.minOrder)], ["Uses", `${c.uses}/${c.maxUses}`], ["Expires", c.expiry]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: t.text3 }}>{k}</span><span style={{ color: t.text, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn t={t} variant={c.active ? "danger" : "success"} size="sm" style={{ flex: 1 }} onClick={() => setCoupons(cs => cs.map(x => x.id === c.id ? { ...x, active: !x.active } : x))}>{c.active ? "Disable" : "Enable"}</Btn>
              <Btn t={t} variant="ghost" size="sm" onClick={() => { setCoupons(cs => cs.filter(x => x.id !== c.id)); notify("Coupon deleted", "warning"); }}>Delete</Btn>
            </div>
          </Card>
        ))}
      </div>
      {showAdd && (
        <Modal t={t} title="Add Coupon" onClose={() => setShowAdd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input t={t} label="Code" value={form.code} onChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="SAVE20" required />
              <Input t={t} label="Discount Value" value={form.value} onChange={v => setForm(f => ({ ...f, value: +v }))} type="number" />
              <Input t={t} label="Min Order (£)" value={form.minOrder} onChange={v => setForm(f => ({ ...f, minOrder: +v }))} type="number" />
              <Input t={t} label="Max Uses" value={form.maxUses} onChange={v => setForm(f => ({ ...f, maxUses: +v }))} type="number" />
              <Input t={t} label="Expiry Date" value={form.expiry} onChange={v => setForm(f => ({ ...f, expiry: v }))} type="date" />
            </div>
            <Input t={t} label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
              <Input t={t} label="Discount %" value={form.discount||0} onChange={v => setForm(f => ({ ...f, discount: Math.min(100,Math.max(0,+v)) }))} type="number" note="Set % discount on this product (0 = no discount). Applies on landing page, shop & POS."/>
            <Select t={t} label="Discount Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={[{ value: "percent", label: "Percentage Off" }, { value: "fixed", label: "Fixed Amount Off" }, { value: "delivery", label: "Free Delivery" }]} />
            <Btn t={t} onClick={() => { setCoupons(cs => [...cs, { id: Date.now(), ...form, uses: 0 }]); addAudit(currentUser, "Coupon Created", "Coupons", `${form.code} created`); notify(`Coupon ${form.code} created!`, "success"); setShowAdd(false); }} disabled={!form.code}>Add Coupon</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── BANNER MANAGEMENT ────────────────────────────────────────────────────────
const BannerManagement = ({ banners, setBanners, addAudit, currentUser, t }) => {
  const [showAdd, setShowAdd] = useState(false);
  const empty = { title: "", subtitle: "", cta: "Shop Now", color: "#dc2626", grad: "linear-gradient(135deg,#dc2626,#7f1d1d)", emoji: "⚽", active: true, offerType: "none", offerTarget: "", offerDiscount: 0, startDate: new Date().toISOString().slice(0, 16), endDate: "2026-12-31T23:59", image: "" };
  const [form, setForm] = useState(empty);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setForm(f => ({ ...f, image: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>🖼️ Banner & Offer Management</div><div style={{ fontSize: 13, color: t.text3, marginTop: 3 }}>Active banners display on the login & guest pages</div></div>
        <Btn t={t} onClick={() => setShowAdd(true)}>+ Add Banner</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
        {banners.map(b => {
          const active = isBannerActive(b);
          return (
            <Card t={t} key={b.id} style={{ borderTop: `4px solid ${b.color}`, overflow: "hidden" }}>
              <div style={{ position: "relative", height: 120, borderRadius: 8, marginBottom: 14, overflow: "hidden" }}>
                {b.image ? (
                  <img src={b.image} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ background: b.grad, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 32 }}>{b.emoji}</span>
                  </div>
                )}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ color: "#fff", textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>{b.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{b.subtitle}</div>
                  </div>
                </div>
              </div>
              {b.offerType !== "none" && <div style={{ background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: t.green, fontWeight: 700 }}>🎁 Offer: {b.offerDiscount}% off {b.offerTarget}</div>}
              <div style={{ fontSize: 12, color: t.text3, marginBottom: 10 }}>
                <div>📅 Start: {b.startDate}</div>
                <div>📅 End: {b.endDate}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge t={t} text={active ? "Live Now" : b.active ? "Scheduled" : "Hidden"} color={active ? "green" : b.active ? "yellow" : "red"} />
                <div style={{ display: "flex", gap: 8 }}>
                  <Toggle t={t} value={b.active} onChange={v => { setBanners(bs => bs.map(x => x.id === b.id ? { ...x, active: v } : x)); notify(`Banner ${v ? "activated" : "hidden"}`, "info"); }} />
                  <Btn t={t} variant="danger" size="sm" onClick={() => { setBanners(bs => bs.filter(x => x.id !== b.id)); notify("Banner deleted", "warning"); }}>Del</Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {showAdd && (
        <Modal t={t} title="Add New Banner" onClose={() => setShowAdd(false)} width={600}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input t={t} label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
              <Input t={t} label="Subtitle" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} />
              <Input t={t} label="CTA Text" value={form.cta} onChange={v => setForm(f => ({ ...f, cta: v }))} />
              <Input t={t} label="Emoji" value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} />
              <Input t={t} label="Image URL" value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} placeholder="https://..." />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Btn t={t} variant="teal" onClick={() => setForm(f => ({ ...f, image: `https://picsum.photos/800/400?random=${Date.now()}` }))}>🎨 Generate AI Image</Btn>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7 }}>Or Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 14px", color: t.text, fontSize: 13, outline: "none" }} />
                  {form.image && <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: `1px solid ${t.border}` }}><img src={form.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                </div>
              </div>
              <Input t={t} label="Start Date & Time" value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} type="datetime-local" />
              <Input t={t} label="End Date & Time" value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} type="datetime-local" />
            </div>
            <Select t={t} label="Offer Type" value={form.offerType} onChange={v => setForm(f => ({ ...f, offerType: v }))} options={[{ value: "none", label: "No Offer" }, { value: "category", label: "Category Discount" }]} />
            {form.offerType === "category" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Select t={t} label="Category" value={form.offerTarget} onChange={v => setForm(f => ({ ...f, offerTarget: v }))} options={CATEGORIES.filter(c => c !== "All").map(c => ({ value: c, label: c }))} />
                <Input t={t} label="Discount %" value={form.offerDiscount} onChange={v => setForm(f => ({ ...f, offerDiscount: +v }))} type="number" />
              </div>
            )}
            {form.title && <div style={{ position: "relative", height: 120, borderRadius: 10, overflow: "hidden", marginTop: 10 }}>
              {form.image ? (
                <img src={form.image} alt={form.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ background: form.grad, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 32 }}>{form.emoji}</span>
                </div>
              )}
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "#fff", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{form.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>{form.subtitle}</div>
                </div>
              </div>
            </div>}
            <Btn t={t} onClick={() => { setBanners(bs => [...bs, { id: Date.now(), ...form }]); addAudit(currentUser, "Banner Created", "Banners", `${form.title} banner added`); notify("Banner added!", "success"); setShowAdd(false); setForm(empty); }} disabled={!form.title}>Add Banner</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────
const Reports = ({ orders, users, t }) => {
  const catRev = {};
  orders.forEach(o => o.items.forEach(i => {
    const p = INITIAL_PRODUCTS.find(x => x.name === i.name);
    const cat = p?.category || "Other";
    catRev[cat] = (catRev[cat] || 0) + i.price * i.qty;
  }));
  const totalCatRev = Object.values(catRev).reduce((s, v) => s + v, 0);
  const cashierPerf = {};
  orders.forEach(o => { cashierPerf[o.cashierName] = { orders: (cashierPerf[o.cashierName]?.orders || 0) + 1, revenue: (cashierPerf[o.cashierName]?.revenue || 0) + o.total }; });
  const sorted = Object.entries(cashierPerf).sort((a, b) => b[1].revenue - a[1].revenue);
  const colors = ["#dc2626", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0d9488"];

  const exportCsv = () => {
    const rows = [["Order ID", "Customer", "Total", "Payment", "Date", "Counter", "Status"]].concat(orders.map(o => [o.id, o.customerName, o.total, o.payment, o.date, o.counter, o.status]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const b = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href = url; a.download = "fanstore-report.csv"; a.click();
    notify("Report exported as CSV!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>Sales Reports & Analytics</div>
        <Btn t={t} onClick={exportCsv}>⬇ Export CSV</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Category pie-chart style */}
        <Card t={t}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 16 }}>Revenue by Category</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <svg viewBox="0 0 42 42" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                {Object.entries(catRev).reduce((acc, [cat, rev], i) => {
                  const pct = totalCatRev > 0 ? rev / totalCatRev * 100 : 0;
                  const prev = acc.offset;
                  acc.offset += pct;
                  acc.els.push(<circle key={cat} cx="21" cy="21" r="15.9" fill="none" stroke={colors[i % colors.length]} strokeWidth="5" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={100 - prev} />);
                  return acc;
                }, { offset: 0, els: [] }).els}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <div style={{ fontSize: 10, color: t.text3, fontWeight: 700 }}>TOTAL</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: t.text }}>{fmt(totalCatRev)}</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {Object.entries(catRev).map(([cat, rev], i) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
                      <span style={{ color: t.text2 }}>{cat}</span>
                      <span style={{ fontWeight: 800, color: t.text }}>{fmt(rev)}</span>
                    </div>
                    <div style={{ height: 4, background: t.bg4, borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${totalCatRev > 0 ? (rev / totalCatRev) * 100 : 0}%`, background: colors[i % colors.length], borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        {/* Cashier leaderboard */}
        <Card t={t}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 16 }}>🏆 Cashier Leaderboard</div>
          {sorted.map(([name, stats], i) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#fef9c3" : i === 1 ? "#f1f5f9" : t.bg3, border: `2px solid ${i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: i === 0 ? "#d97706" : t.text3 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{name}</div>
                <div style={{ fontSize: 11, color: t.text3 }}>{stats.orders} orders</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: t.accent }}>{fmt(stats.revenue)}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

const BannerCarousel = ({ banners = [], header, t }) => {
  const active = (banners || []).filter(b => b.active);
  const [bIdx, setBIdx] = useState(0);

  useEffect(() => {
    if (active.length < 2) return;
    const i = setInterval(() => setBIdx(x => (x + 1) % active.length), 4000);
    return () => clearInterval(i);
  }, [active.length]);

  if (!active.length) return null;
  const b = active[bIdx];

  return (
    <div style={{ position: "relative", overflow: "hidden", height: 240, borderRadius: 16, marginBottom: 20 }}>
      <div style={{ background: b.grad || t.gradHero, height: "100%", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
        {b.image && <img src={b.image} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />}
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ color: "#fff", flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>{header}</div>
            <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.1, marginBottom: 12, letterSpacing: -2 }}>{b.title}</div>
            <div style={{ fontSize: 16, opacity: 0.85, marginBottom: 20 }}>{b.subtitle}</div>
            <Btn t={t} size="md" style={{ background: "#fff", color: b.color || "#dc2626", border: "none" }}>{b.cta || "Shop Now"} →</Btn>
          </div>
        </div>
      </div>
      {active.length > 1 && (
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
          {active.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === bIdx ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer" }} onClick={() => setBIdx(i)} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── CUSTOMER TRACKING ────────────────────────────────────────────────────────
const CustomerTracking = ({ orders, user, t }) => {
  const [search, setSearch] = useState("");
  const myOrders = orders.filter(o => o.customerId === user.id && o.status !== "completed" && o.status !== "refunded");
  const found = search ? orders.find(o => o.id.toLowerCase() === search.toLowerCase() && (o.customerId === user.id || search.length > 6)) : null;
  const display = found ? [found] : (search ? [] : myOrders);
  const steps = [["Order Placed", "🛒"], ["Payment Confirmed", "💳"], ["Being Prepared", "📦"], ["Ready / Dispatched", "🚀"], ["Completed / Delivered", "✅"]];
  const deliverySteps = ["pending", "processing", "dispatched", "out-for-delivery", "delivered"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>📍 Live Order Tracking</div>
      <Card t={t}>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Enter Order ID (e.g. ORD-0001)..." style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 14px", color: t.text, fontSize: 13, outline: "none" }} />
          <Btn t={t} variant="secondary" onClick={() => {}}>Search</Btn>
        </div>
      </Card>
      {display.map(o => {
        const step = o.status === "completed" ? 4 : o.status === "refunded" ? 0 : 3;
        const dStep = deliverySteps.indexOf(o.deliveryStatus || "delivered");
        return (
          <Card t={t} key={o.id}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: t.text }}>{o.id}</div>
                <div style={{ fontSize: 12, color: t.text3, marginTop: 3 }}>{o.date} · {o.counter} · {o.orderType}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: t.accent }}>{fmt(o.total)}</div>
                <Badge t={t} text={o.status} color={o.status === "completed" ? "green" : "red"} />
              </div>
            </div>
            {/* Progress steps */}
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 20, gap: 0 }}>
              {steps.map(([label, icon], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: i <= step ? t.accent : t.bg4, border: `2px solid ${i <= step ? t.accent : t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: i <= step ? "#fff" : t.text4, transition: "all 0.3s" }}>{i <= step ? icon : ""}</div>
                    <div style={{ fontSize: 10, color: i <= step ? t.accent : t.text4, textAlign: "center", maxWidth: 70, fontWeight: i <= step ? 700 : 400 }}>{label}</div>
                  </div>
                  {i < steps.length - 1 && <div style={{ flex: 1, height: 3, background: i < step ? t.accent : t.border, margin: "0 3px", marginBottom: 26, transition: "background 0.3s", borderRadius: 2 }} />}
                </div>
              ))}
            </div>
            {/* Delivery tracker */}
            {o.orderType === "delivery" && (
              <div style={{ background: t.tealBg, border: `1px solid ${t.tealBorder}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: t.teal, marginBottom: 10 }}>🚚 Delivery Tracking</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {deliverySteps.map((ds, i) => (
                    <div key={ds} style={{ display: "flex", alignItems: "center", flex: i < deliverySteps.length - 1 ? 1 : undefined }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: i <= dStep ? t.teal : t.border }} />
                        <div style={{ fontSize: 9, color: i <= dStep ? t.teal : t.text4, textAlign: "center", maxWidth: 55, fontWeight: 700, textTransform: "capitalize" }}>{ds.replace("-", " ")}</div>
                      </div>
                      {i < deliverySteps.length - 1 && <div style={{ flex: 1, height: 2, background: i < dStep ? t.teal : t.border, margin: "0 2px", marginBottom: 18, borderRadius: 1 }} />}
                    </div>
                  ))}
                </div>
                {o.deliveryAddress && <div style={{ marginTop: 10, fontSize: 12, color: t.teal }}>📍 {o.deliveryAddress}</div>}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {o.items.map((i, idx) => <span key={idx} style={{ fontSize: 12, background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 6, padding: "3px 10px", color: t.text2 }}>{i.name} × {i.qty}</span>)}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ─── OTHER STUBS (Admin Dashboard, Manager etc.) ──────────────────────────────
const SHOPS = [
  { id: "s1", name: "Main Stadium Store", location: "Stadium Entrance, Gate A" },
  { id: "s2", name: "East Wing Megastore", location: "East Stand, Level 2" },
  { id: "s3", name: "Airport Pop-up", location: "Terminal 2, Departures" },
];

const AdminDash = ({ orders, users, t }) => {
  const [activeShop, setActiveShop] = useState("all");
  const total = orders.reduce((s, o) => s + o.total, 0);
  const topP = {}; orders.forEach(o => o.items.forEach(i => { topP[i.name] = (topP[i.name] || 0) + i.qty; }));
  const top = Object.entries(topP).sort((a, b) => b[1] - a[1]).slice(0, 5);
  // Simulate per-shop splits (deterministic by order index)
  const shopOrders = SHOPS.map((shop, si) => orders.filter((_, idx) => idx % 3 === si));
  const activeShopOrders = activeShop === "all" ? orders : shopOrders[SHOPS.findIndex(s => s.id === activeShop)] || [];
  const shopTotal = activeShopOrders.reduce((s, o) => s + o.total, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div><div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>Admin Dashboard</div><div style={{ fontSize: 13, color: t.text3 }}>Global system overview</div></div>
      {/* Shop selector tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setActiveShop("all")} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${activeShop === "all" ? t.accent : t.border}`, background: activeShop === "all" ? t.accent + "15" : t.bg3, color: activeShop === "all" ? t.accent : t.text3, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🌐 All Shops</button>
        {SHOPS.map(shop => (
          <button key={shop.id} onClick={() => setActiveShop(shop.id)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${activeShop === shop.id ? t.accent : t.border}`, background: activeShop === shop.id ? t.accent + "15" : t.bg3, color: activeShop === shop.id ? t.accent : t.text3, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🏪 {shop.name}</button>
        ))}
      </div>
      {activeShop !== "all" && (
        <div style={{ background: t.blueBg, border: `1px solid ${t.blueBorder}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, color: t.blue }}>
          📍 {SHOPS.find(s => s.id === activeShop)?.location}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(180px,45vw),1fr))", gap: 14 }}>
        <StatCard t={t} title="Revenue" value={fmt(shopTotal)} color={t.accent} icon="💰" trend={activeShop === "all" ? 12 : undefined} />
        <StatCard t={t} title="Orders" value={activeShopOrders.length} color={t.blue} icon="🧾" trend={activeShop === "all" ? 8 : undefined} />
        <StatCard t={t} title="Users" value={users.length} color={t.green} icon="👥" />
        <StatCard t={t} title="Active Counters" value={3} color={t.yellow} icon="🏪" />
      </div>
      {/* Multi-shop revenue breakdown */}
      {activeShop === "all" && (
        <Card t={t}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>🏪 Revenue by Shop</div>
          {SHOPS.map((shop, si) => {
            const shopRev = shopOrders[si].reduce((s, o) => s + o.total, 0);
            const pct = total > 0 ? Math.round(shopRev / total * 100) : 0;
            return (
              <div key={shop.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                  <div><span style={{ color: t.text, fontWeight: 700 }}>{shop.name}</span><span style={{ fontSize: 11, color: t.text3, marginLeft: 8 }}>{shop.location}</span></div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ color: t.text3, fontSize: 12 }}>{shopOrders[si].length} orders</span>
                    <span style={{ fontWeight: 800, color: t.accent }}>{fmt(shopRev)}</span>
                    <span style={{ fontSize: 11, color: t.text3 }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height: 7, background: t.bg4, borderRadius: 4 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: [t.accent, t.blue, t.teal][si], borderRadius: 4, transition: "width .5s" }} />
                </div>
              </div>
            );
          })}
        </Card>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card t={t}><div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>🏆 Top Sellers</div>
          {top.map(([n, q], i) => <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}`, fontSize: 13 }}><span style={{ color: t.text }}>#{i + 1} {n}</span><Badge t={t} text={`${q} sold`} color="blue" /></div>)}
        </Card>
        <Card t={t}><div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>🏪 Counter Revenue</div>
          {["Counter 1", "Counter 2", "Counter 3"].map(c => { const r = activeShopOrders.filter(o => o.counter === c).reduce((s, o) => s + o.total, 0); const p = shopTotal ? Math.round(r / shopTotal * 100) : 0; return <div key={c} style={{ marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span style={{ color: t.text2 }}>{c}</span><span style={{ fontWeight: 800, color: t.text }}>{fmt(r)}</span></div><div style={{ height: 6, background: t.bg4, borderRadius: 3 }}><div style={{ height: "100%", width: `${p}%`, background: t.accent, borderRadius: 3 }} /></div></div>; })}
        </Card>
      </div>
      <Card t={t} style={{ padding: 0, overflow: "hidden" }}><div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, fontSize: 14, fontWeight: 800, color: t.text }}>Recent Orders</div>
        <Table t={t} cols={["Order", "Customer", "Cashier", "Total", "Payment", "Status"]} rows={activeShopOrders.slice(0, 8).map(o => [o.id, o.customerName, o.cashierName, fmt(o.total), o.payment, <Badge t={t} text={o.status} color={o.status === "completed" ? "green" : "red"} />])} /></Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CUSTOMER SHOP PAGE — Product browsing + cart + ordering
// ═══════════════════════════════════════════════════════════════
const CustomerShop = ({ products, orders, setOrders, users, setUsers, currentUser, banners, coupons, settings, t, addGlobalNotif, initialCat, onCatConsumed, initialCart }) => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState(initialCat || "All");
  const [priceMax, setPriceMax] = useState(9999);
  const [sortBy, setSortBy] = useState("default");
  const [cart, setCart] = useState(initialCart||[]);
  const [showCart, setShowCart] = useState(!!(initialCart && initialCart.length>0));
  const [viewProduct, setViewProduct] = useState(null);
  const [orderType, setOrderType] = useState("pickup");
  const [deliveryAddr, setDeliveryAddr] = useState(currentUser?.savedAddr||"");
  const [deliveryZone, setDeliveryZone] = useState(settings.deliveryZones[0].zone);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payMethod2, setPayMethod2] = useState("card");
  const [savedCard, setSavedCard] = useState(currentUser?.savedCard||null);
  const [cardDetails, setCardDetails] = useState({num:currentUser?.savedCard?.num||"",exp:currentUser?.savedCard?.exp||"",name:currentUser?.savedCard?.name||currentUser?.name||""});
  const [saveCard, setSaveCard] = useState(true);
  const [saveAddr, setSaveAddr] = useState(true);
  const [cardApproved, setCardApproved] = useState(false);

  useEffect(()=>{ if(initialCat){ setCatFilter(initialCat); if(onCatConsumed) onCatConsumed(); } },[initialCat]);

  const activeOffers = banners.filter(b=>b.active&&b.offerType!=="none");
  const getDisc = (p) => {
    const o = activeOffers.find(b=>b.offerType==="category"&&b.offerTarget===p.category);
    return Math.max(o?o.offerDiscount:0, p.discount||0);
  };

  let filtered = products
    .filter(p => catFilter==="All" || p.category===catFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => priceMax>=9999 || p.price<=priceMax);

  if(sortBy==="price-asc") filtered=[...filtered].sort((a,b)=>a.price-b.price);
  else if(sortBy==="price-desc") filtered=[...filtered].sort((a,b)=>b.price-a.price);
  else if(sortBy==="name") filtered=[...filtered].sort((a,b)=>a.name.localeCompare(b.name));

  const addToCart = (p, size) => {
    const disc = getDisc(p);
    const key = p.id + (size?"__"+size:"");
    setCart(c => { const ex=c.find(i=>i._key===key); return ex?c.map(i=>i._key===key?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1,_key:key,selectedSize:size||"",discount:disc}]; });
    notify(p.name + (size ? " (" + size + ")" : "") + " added to cart", "success");
  };
  const updateQty = (key, d) => setCart(c=>c.map(i=>i._key===key?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));
  const removeItem = (key) => setCart(c=>c.filter(i=>i._key!==key));

  const subtotal = cart.reduce((s,i)=>s+i.price*(1-(i.discount||0)/100)*i.qty, 0);
  const deliveryFee = orderType==="delivery"?(settings.deliveryZones.find(z=>z.zone===deliveryZone)?.charge||0):0;
  const vatAmt = subtotal*(settings.vatRate||20)/100;
  let couponDisc = 0;
  if(appliedCoupon){
    if(appliedCoupon.type==="percent") couponDisc=(subtotal+vatAmt+deliveryFee)*appliedCoupon.value/100;
    else if(appliedCoupon.type==="fixed") couponDisc=Math.min(appliedCoupon.value,subtotal+vatAmt+deliveryFee);
    else if(appliedCoupon.type==="delivery") couponDisc=deliveryFee;
  }
  const total = Math.max(0, Math.round((subtotal+vatAmt+deliveryFee-couponDisc)*100)/100);
  const cartCount = cart.reduce((s,i)=>s+i.qty, 0);

  const applyCoupon = () => {
    const c = coupons.find(x=>x.code===couponCode.toUpperCase()&&x.active);
    if(!c){notify("Invalid coupon code","error");return;}
    if(subtotal<c.minOrder){notify("Minimum order £"+c.minOrder+" required","error");return;}
    setAppliedCoupon(c); notify("Coupon applied! "+c.description,"success");
  };

  const doPlaceOrder = (payment) => {
    if(cart.length===0) return;
    if(orderType==="delivery"&&!deliveryAddr.trim()){notify("Please enter delivery address","error");return;}
    const pts = Math.floor(total*(settings.loyaltyRate||1));
    const newOrder = {
      id:genId("ORD"), customerId:currentUser.id, customerName:currentUser.name,
      cashierId:null, cashierName:"Online",
      items:cart.map(i=>({productId:i.id,name:i.name,qty:i.qty,price:i.price,discount:i.discount||0,size:i.selectedSize||""})),
      subtotal, tax:vatAmt, discountAmt:couponDisc, loyaltyDiscount:0, couponDiscount:couponDisc,
      couponCode:appliedCoupon?.code||null, deliveryCharge:deliveryFee, total,
      payment, date:ts(), counter:"Online", status:"preparing",
      orderType, deliveryAddress:orderType==="delivery"?deliveryAddr:null,
      deliveryZone:orderType==="delivery"?deliveryZone:null,
      deliveryStatus:orderType==="delivery"?"pending":null,
      loyaltyEarned:pts, loyaltyUsed:0, trackingStage:1,
    };
    const updates={};
    if(saveCard&&payment==="Card"&&cardDetails.num) updates.savedCard={...cardDetails};
    if(saveAddr&&orderType==="delivery"&&deliveryAddr) updates.savedAddr=deliveryAddr;
    setUsers(us=>us.map(u=>u.id===currentUser.id?{...u,loyaltyPoints:(u.loyaltyPoints||0)+pts,totalSpent:(u.totalSpent||0)+total,...updates}:u));
    setOrders(os=>[newOrder,...os]);
    if(addGlobalNotif) addGlobalNotif("Order "+newOrder.id+" placed! "+( orderType==="delivery"?"Delivery in 2-3 days.":"Ready for pickup soon."),"success");
    if(window.__addAudit) window.__addAudit(currentUser,"Order Placed","Orders",newOrder.id+" · "+fmt(total)+" · "+payment+" · "+orderType);
    setOrderPlaced(newOrder);
    setCart([]); setAppliedCoupon(null); setCouponCode(""); setShowPayment(false); setCardApproved(false); setShowCart(false);
    notify("Order placed! "+newOrder.id,"success");
  };

  const placeOrder = () => {
    if(cart.length===0) return;
    if(orderType==="delivery"&&!deliveryAddr.trim()){notify("Please enter delivery address","error");return;}
    setShowPayment(true);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      {/* BannerCarousel */}
      {banners.filter(b=>b.active).length>0 && <BannerCarousel banners={banners} t={t} compact/>}

      {/* Floating cart */}
      {cartCount>0 && (
        <button onClick={()=>setShowCart(true)} style={{position:"fixed",bottom:24,right:24,zIndex:500,background:`linear-gradient(135deg,${t.accent},${t.accent2})`,color:"#fff",border:"none",borderRadius:50,padding:"12px 20px",fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:`0 4px 20px ${t.accent}60`,display:"flex",alignItems:"center",gap:8}}>
          🛒 Cart ({cartCount}) · {fmt(total)}
        </button>
      )}

      {/* Filters */}
      <div style={{background:t.bg2,borderBottom:`1px solid ${t.border}`,padding:"14px 20px",display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"9px 14px 9px 32px",color:t.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"9px 14px",color:t.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"9px 14px",color:t.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="name">Name A-Z</option>
        </select>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:t.text3}}>
          <span>{priceMax>=9999?"All prices":"Max: "+fmt(Math.min(priceMax,300))}</span>
          <input type="range" min={10} max={300} value={Math.min(priceMax,300)} onChange={e=>setPriceMax(+e.target.value)} style={{width:80}}/>
          {priceMax<9999&&<button onClick={()=>setPriceMax(9999)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:5,padding:"2px 7px",fontSize:10,cursor:"pointer",color:t.text3}}>✕</button>}
        </div>
      </div>

      {/* Category pills */}
      <div style={{background:t.bg2,borderBottom:`1px solid ${t.border}`,padding:"8px 20px",display:"flex",gap:6,overflowX:"auto"}}>
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setCatFilter(c)} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${catFilter===c?t.accent:t.border}`,background:catFilter===c?t.accent:"transparent",color:catFilter===c?"#fff":t.text3,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{c}</button>
        ))}
      </div>

      {/* Products */}
      <div style={{padding:"clamp(10px,2vw,20px)"}}>
        <div style={{fontSize:13,color:t.text3,marginBottom:14}}>{filtered.length} product{filtered.length!==1?"s":""}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,45vw),1fr))",gap:"clamp(10px,2vw,16px)"}}>
          {filtered.map(p=>{
            const disc=getDisc(p);
            const inCart=cart.find(i=>i.id===p.id);
            return(
              <div key={p.id} style={{background:t.card,border:`1px solid ${disc>0?t.accent:t.border}`,borderRadius:14,overflow:"hidden",boxShadow:t.shadow,transition:"transform .15s,box-shadow .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=t.shadowMd;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=t.shadow;}}>
                <div style={{position:"relative",height:165,background:t.bg3,overflow:"hidden",cursor:"pointer"}} onClick={()=>setViewProduct(p)}>
                  <ImgWithFallback src={PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  {disc>0&&<div style={{position:"absolute",top:8,left:8,background:t.accent,color:"#fff",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:900}}>-{disc}% OFF</div>}
                  {p.stock===0&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800}}>OUT OF STOCK</div>}
                  {p.stock>0&&p.stock<=5&&<div style={{position:"absolute",top:8,right:8,background:t.yellow,color:"#fff",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:800}}>Only {p.stock} left</div>}
                  <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,.5)",color:"#fff",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700}}>👁 View Details</div>
                </div>
                <div style={{padding:"11px 13px"}}>
                  <div style={{fontSize:10,color:t.text3,marginBottom:2}}>{p.category}</div>
                  <div style={{fontSize:13,fontWeight:700,color:t.text,marginBottom:6,lineHeight:1.3,cursor:"pointer"}} onClick={()=>setViewProduct(p)}>{p.name}</div>
                  {p.sizes&&p.sizes.length>1&&<div style={{fontSize:10,color:t.text3,marginBottom:6}}>Sizes: {p.sizes.slice(0,4).join(", ")}{p.sizes.length>4?"...":""}</div>}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      {disc>0?<><div style={{fontSize:11,color:t.text4,textDecoration:"line-through"}}>{fmt(p.price)}</div><div style={{fontSize:16,fontWeight:900,color:t.accent}}>{fmt(p.price*(1-disc/100))}</div></>:<div style={{fontSize:16,fontWeight:900,color:t.green}}>{fmt(p.price)}</div>}
                    </div>
                    {p.stock>0&&(
                      inCart?(
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <button onClick={()=>updateQty(inCart._key,-1)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${t.border}`,background:t.bg3,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                          <span style={{fontWeight:900,minWidth:16,textAlign:"center",fontSize:13}}>{inCart.qty}</span>
                          <button onClick={()=>setViewProduct(p)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${t.border}`,background:t.bg3,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                        </div>
                      ):(
                        <button onClick={()=>p.sizes?.length>1?setViewProduct(p):addToCart(p)} style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:800,cursor:"pointer"}}>Add</button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length===0&&<div style={{textAlign:"center",padding:"60px 20px",color:t.text3}}><div style={{fontSize:40,marginBottom:12}}>🔍</div><div style={{fontSize:16,fontWeight:700}}>No products found</div><div style={{fontSize:13,marginTop:6}}>Try adjusting your filters</div></div>}
      </div>

      {/* Product Detail Modal */}
      {viewProduct&&(
        <ProductDetailModal
          p={viewProduct} t={t} getDisc={getDisc}
          onClose={()=>setViewProduct(null)}
          onAddToCart={(p,size)=>{addToCart(p,size);setViewProduct(null);}}
          onBuyNow={(p,size)=>{addToCart(p,size);setViewProduct(null);setShowCart(true);}}
          isGuest={false}
        />
      )}

      {/* Cart slide-over */}
      {showCart&&(
        <div style={{position:"fixed",inset:0,zIndex:800,display:"flex"}}>
          <div onClick={()=>setShowCart(false)} style={{flex:1,background:"rgba(0,0,0,.4)"}}/>
          <div style={{width:"min(420px,100vw)",background:t.bg2,borderLeft:`1px solid ${t.border}`,display:"flex",flexDirection:"column",boxShadow:t.shadowLg}}>
            <div style={{padding:"18px 20px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:17,fontWeight:900,color:t.text}}>🛒 Your Cart</div>
              <button onClick={()=>setShowCart(false)} style={{background:t.bg3,border:`1px solid ${t.border}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:t.text3,fontSize:14}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
              {cart.length===0?<div style={{textAlign:"center",padding:40,color:t.text3}}><div style={{fontSize:36,marginBottom:12}}>🛒</div>Your cart is empty</div>:(
                <>
                  {cart.map(item=>(
                    <div key={item._key} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${t.border}`}}>
                      <div style={{width:48,height:48,borderRadius:9,overflow:"hidden",flexShrink:0,background:t.bg3}}>
                        <ImgWithFallback src={PRODUCT_IMAGES[item.name]} alt={item.name} emoji={item.emoji} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                        {item.selectedSize&&<div style={{fontSize:10,color:t.text3}}>Size: {item.selectedSize}</div>}
                        <div style={{fontSize:12,color:t.green,fontWeight:800}}>{fmt(item.price*(1-(item.discount||0)/100))}{item.discount>0&&<span style={{fontSize:10,color:t.text4,textDecoration:"line-through",marginLeft:5}}>{fmt(item.price)}</span>}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <button onClick={()=>updateQty(item._key,-1)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${t.border}`,background:t.bg3,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                        <span style={{fontSize:14,fontWeight:900,minWidth:16,textAlign:"center"}}>{item.qty}</span>
                        <button onClick={()=>updateQty(item._key,1)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${t.border}`,background:t.bg3,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                        <button onClick={()=>removeItem(item._key)} style={{background:"none",border:"none",color:t.text4,cursor:"pointer",fontSize:16,padding:"0 2px"}}>✕</button>
                      </div>
                      <div style={{fontSize:13,fontWeight:900,color:t.text,minWidth:54,textAlign:"right"}}>{fmt(item.price*(1-(item.discount||0)/100)*item.qty)}</div>
                    </div>
                  ))}
                  <div style={{marginTop:14,display:"flex",gap:7}}>
                    {[["pickup","📦 Pickup"],["delivery","🚚 Delivery"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setOrderType(v)} style={{flex:1,padding:"8px 4px",borderRadius:9,border:`1px solid ${orderType===v?t.accent:t.border}`,background:orderType===v?t.accent+"15":t.bg3,color:orderType===v?t.accent:t.text3,fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                  {orderType==="delivery"&&(
                    <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
                      {currentUser?.savedAddr&&!deliveryAddr&&(
                        <div style={{background:t.blueBg,border:`1px solid ${t.blueBorder}`,borderRadius:9,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:11,color:t.blue}}>📍 Saved: {currentUser.savedAddr.slice(0,28)}…</span>
                          <button onClick={()=>setDeliveryAddr(currentUser.savedAddr)} style={{background:t.blue,color:"#fff",border:"none",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Use</button>
                        </div>
                      )}
                      <Input t={t} label="Delivery Address" value={deliveryAddr} onChange={setDeliveryAddr} placeholder="Full address including postcode"/>
                      <Select t={t} label="Zone" value={deliveryZone} onChange={setDeliveryZone} options={settings.deliveryZones.map(z=>({value:z.zone,label:`${z.zone} — ${fmt(z.charge)} (${z.days}d)`}))}/>
                    </div>
                  )}
                  {appliedCoupon?(
                    <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center",background:t.greenBg,border:`1px solid ${t.greenBorder}`,borderRadius:9,padding:"8px 12px"}}>
                      <span style={{fontSize:12,color:t.green,fontWeight:800}}>🎟️ {appliedCoupon.code} — {appliedCoupon.description}</span>
                      <button onClick={()=>{setAppliedCoupon(null);setCouponCode("");}} style={{background:"none",border:"none",color:t.red,cursor:"pointer",fontSize:14}}>✕</button>
                    </div>
                  ):(
                    <div style={{marginTop:10,display:"flex",gap:8}}>
                      <input value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code (FANDAY10…)" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 10px",color:t.text,fontSize:12,outline:"none"}}/>
                      <button onClick={applyCoupon} style={{background:t.purple,color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Apply</button>
                    </div>
                  )}
                  <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:4}}>
                    {[["Subtotal",fmt(subtotal)],[`VAT (${settings.vatRate}%)`,fmt(vatAmt)],deliveryFee>0&&["Delivery",fmt(deliveryFee)],couponDisc>0&&["Discount","-"+fmt(couponDisc)]].filter(Boolean).map(([k,v])=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:t.text3}}><span>{k}</span><span style={{fontWeight:600}}>{v}</span></div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:900,color:t.text,paddingTop:10,borderTop:`2px solid ${t.border}`,marginTop:4}}>
                      <span>Total</span><span style={{color:t.accent}}>{fmt(total)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            {cart.length>0&&(
              <div style={{padding:"14px 20px",borderTop:`1px solid ${t.border}`}}>
                <button onClick={placeOrder} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${t.accent},${t.accent2})`,color:"#fff",border:"none",borderRadius:11,fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:`0 4px 14px ${t.accent}40`}}>
                  Checkout · {fmt(total)} →
                </button>
                <div style={{fontSize:11,color:t.text4,textAlign:"center",marginTop:6}}>🔒 Secure simulated checkout</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment&&(
        <Modal t={t} title="💳 Payment" subtitle={`Total: ${fmt(total)}`} onClose={()=>{setShowPayment(false);setCardApproved(false);}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",gap:8}}>
              {[["card","💳 Card"],["cod","💵 Cash on Delivery"]].map(([v,l])=>(
                <button key={v} onClick={()=>{setPayMethod2(v);setCardApproved(false);}} style={{flex:1,padding:"10px 8px",borderRadius:9,border:`2px solid ${payMethod2===v?t.accent:t.border}`,background:payMethod2===v?t.accent+"15":"transparent",color:payMethod2===v?t.accent:t.text3,fontSize:13,fontWeight:700,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            {payMethod2==="card"&&(
              <div style={{display:"flex",flexDirection:"column",gap:11}}>
                {savedCard&&!cardApproved&&(
                  <div style={{background:t.greenBg,border:`1px solid ${t.greenBorder}`,borderRadius:9,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:12,color:t.green,fontWeight:800}}>💳 Saved Card</div><div style={{fontSize:11,color:t.text3}}>•••• {savedCard.num?.slice(-4)} — {savedCard.name}</div></div>
                    <button onClick={()=>setCardDetails(savedCard)} style={{background:t.green,color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Use</button>
                  </div>
                )}
                <div style={{background:"#0a0f1e",borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:9}}>
                  <div style={{fontSize:10,color:"#607090",fontWeight:800,letterSpacing:2,textTransform:"uppercase"}}>Card Terminal · PCI DSS</div>
                  {!cardApproved?(
                    <>
                      <input value={cardDetails.name} onChange={e=>setCardDetails(d=>({...d,name:e.target.value}))} placeholder="Cardholder Name" style={{background:"#141b2d",border:"1px solid #1e2d40",borderRadius:8,padding:"8px 12px",color:"#f0f4ff",fontSize:13,outline:"none"}}/>
                      <input value={cardDetails.num} onChange={e=>setCardDetails(d=>({...d,num:e.target.value.replace(/\D/g,"").slice(0,16)}))} placeholder="Card Number" style={{background:"#141b2d",border:"1px solid #1e2d40",borderRadius:8,padding:"8px 12px",color:"#f0f4ff",fontSize:13,outline:"none",letterSpacing:2}}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <input value={cardDetails.exp} onChange={e=>setCardDetails(d=>({...d,exp:e.target.value}))} placeholder="MM/YY" maxLength={5} style={{background:"#141b2d",border:"1px solid #1e2d40",borderRadius:8,padding:"8px 12px",color:"#f0f4ff",fontSize:13,outline:"none"}}/>
                        <input placeholder="CVV" maxLength={3} style={{background:"#141b2d",border:"1px solid #1e2d40",borderRadius:8,padding:"8px 12px",color:"#f0f4ff",fontSize:13,outline:"none"}}/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setSaveCard(v=>!v)}>
                        <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${saveCard?t.accent:t.border}`,background:saveCard?t.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>{saveCard?"✓":""}</div>
                        <span style={{fontSize:12,color:t.text2}}>Save card for future purchases</span>
                      </div>
                      <button disabled={!cardDetails.num||cardDetails.num.length<14||!cardDetails.name}
                        onClick={()=>{setCardApproved(true);if(saveCard)setSavedCard({...cardDetails});}}
                        style={{padding:"11px",background:cardDetails.num?.length>=14&&cardDetails.name?"#ef4444":"#1e2d40",color:cardDetails.num?.length>=14&&cardDetails.name?"#fff":"#607090",border:"none",borderRadius:9,fontSize:13,fontWeight:900,cursor:cardDetails.num?.length>=14&&cardDetails.name?"pointer":"not-allowed"}}>
                        TAP / PAY {fmt(total)}
                      </button>
                    </>
                  ):(
                    <div style={{textAlign:"center",padding:"14px"}}>
                      <div style={{fontSize:32,marginBottom:8}}>✅</div>
                      <div style={{fontSize:15,fontWeight:900,color:"#22c55e"}}>APPROVED</div>
                      <div style={{fontSize:12,color:"#607090",marginTop:4}}>{fmt(total)} authorised</div>
                    </div>
                  )}
                </div>
                {cardApproved&&<Btn t={t} variant="success" fullWidth onClick={()=>doPlaceOrder("Card")}>Confirm Order →</Btn>}
              </div>
            )}
            {payMethod2==="cod"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{background:t.yellowBg,border:`1px solid ${t.yellowBorder}`,borderRadius:10,padding:"14px 16px"}}>
                  <div style={{fontSize:14,fontWeight:800,color:t.yellow,marginBottom:6}}>💵 Cash on Delivery</div>
                  <div style={{fontSize:13,color:t.text2}}>Pay <strong>{fmt(total)}</strong> when your order {orderType==="delivery"?"arrives":"is ready for pickup"}.</div>
                </div>
                {orderType==="delivery"&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setSaveAddr(v=>!v)}>
                    <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${saveAddr?t.accent:t.border}`,background:saveAddr?t.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>{saveAddr?"✓":""}</div>
                    <span style={{fontSize:12,color:t.text2}}>Save delivery address for next time</span>
                  </div>
                )}
                {orderType==="delivery"&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setSaveAddr(v=>!v)}>
                    <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${saveAddr?t.accent:t.border}`,background:saveAddr?t.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>{saveAddr?"✓":""}</div>
                    <span style={{fontSize:12,color:t.text2}}>Save this delivery address for next time</span>
                  </div>
                )}
                <Btn t={t} variant="success" fullWidth onClick={()=>doPlaceOrder("Cash on Delivery")}>Place COD Order →</Btn>
              </div>
            )}
            <div style={{fontSize:11,color:t.text4,textAlign:"center"}}>🔒 Prototype — no real payment processed</div>
          </div>
        </Modal>
      )}

      {/* Order success */}
      {orderPlaced&&(
        <Modal t={t} title="✅ Order Placed!" onClose={()=>setOrderPlaced(null)}>
          <div style={{textAlign:"center",padding:"10px 0 16px"}}>
            <div style={{fontSize:48,marginBottom:10}}>🎉</div>
            <div style={{fontSize:20,fontWeight:900,color:t.text,marginBottom:4}}>{orderPlaced.id}</div>
            <div style={{fontSize:13,color:t.text3,marginBottom:18}}>{orderPlaced.orderType==="delivery"?"Delivery in 2-3 days.":"Ready for pickup soon."}</div>
            <div style={{background:t.bg3,borderRadius:12,padding:"12px 18px",textAlign:"left",marginBottom:14}}>
              {orderPlaced.items.map((i,idx)=><div key={idx} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4,color:t.text2}}><span>{i.name}{i.size?" ("+i.size+")":""} ×{i.qty}</span><span>{fmt(i.price*i.qty)}</span></div>)}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:900,color:t.text,paddingTop:8,borderTop:`1px solid ${t.border}`,marginTop:6}}><span>Total</span><span style={{color:t.accent}}>{fmt(orderPlaced.total)}</span></div>
            </div>
            <Btn t={t} onClick={()=>setOrderPlaced(null)} fullWidth>Close</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CUSTOMER ORDER HISTORY (enhanced with filters)
// ═══════════════════════════════════════════════════════════════
const CustomerOrderHistory = ({ orders, user, t }) => {
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const STAGES = ["Order Placed","Preparing","Ready / Out for Delivery","Completed"];

  let my = orders.filter(o => o.customerId === user.id);
  if (dateFilter) my = my.filter(o => o.date.startsWith(dateFilter));
  if (statusFilter !== "all") my = my.filter(o => o.status === statusFilter);
  if (sourceFilter !== "all") {
    if (sourceFilter === "online") my = my.filter(o => o.payment === "Online" || o.cashierName === "Online");
    else if (sourceFilter === "walk-in") my = my.filter(o => o.customerName === "Walk-in");
    else my = my.filter(o => o.orderType === sourceFilter);
  }

  const getStageIdx = (o) => {
    if (o.status==="completed") return 3;
    if (o.status==="preparing") return 1;
    if (o.status==="ready"||o.deliveryStatus==="dispatched"||o.deliveryStatus==="out-for-delivery") return 2;
    return 0;
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{fontSize:22,fontWeight:900,color:t.text}}>📜 Order History</div>
      {/* Filters */}
      <Card t={t}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
          <Input t={t} label="Filter by Date" value={dateFilter} onChange={setDateFilter} type="date"/>
          <Select t={t} label="Status" value={statusFilter} onChange={setStatusFilter} options={[{value:"all",label:"All Statuses"},{value:"preparing",label:"Preparing"},{value:"ready",label:"Ready"},{value:"completed",label:"Completed"},{value:"refunded",label:"Refunded"}]}/>
          <Select t={t} label="Source" value={sourceFilter} onChange={setSourceFilter} options={[{value:"all",label:"All Orders"},{value:"online",label:"🌐 Online"},{value:"in-store",label:"🏪 In-Store"},{value:"pickup",label:"📦 Pickup"},{value:"delivery",label:"🚚 Delivery"},{value:"walk-in",label:"🚶 Walk-in"}]}/>
          {(dateFilter||statusFilter!=="all"||sourceFilter!=="all") && <Btn t={t} variant="ghost" size="sm" onClick={()=>{setDateFilter("");setStatusFilter("all");setSourceFilter("all");}}>Clear Filters</Btn>}
        </div>
      </Card>
      {my.length===0 ? (
        <Card t={t}><div style={{textAlign:"center",padding:40,color:t.text3}}><div style={{fontSize:36,marginBottom:12}}>📭</div>No orders found</div></Card>
      ) : my.map(o=>(
        <Card t={t} key={o.id} onClick={()=>setSelectedOrder(o)} style={{cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:10}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:t.text}}>{o.id}</div>
              <div style={{fontSize:12,color:t.text3,marginTop:3}}>{o.date} · {o.orderType}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:20,fontWeight:900,color:t.accent}}>{fmt(o.total)}</div>
              <Badge t={t} text={o.status} color={o.status==="completed"?"green":o.status==="preparing"?"yellow":"red"}/>
            </div>
          </div>
          {/* Mini progress bar */}
          <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:10}}>
            {STAGES.map((s,i)=>(
              <div key={s} style={{display:"flex",alignItems:"center",flex:i<STAGES.length-1?1:undefined}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:i<=getStageIdx(o)?t.accent:t.bg4,flexShrink:0}}/>
                {i<STAGES.length-1&&<div style={{flex:1,height:2,background:i<getStageIdx(o)?t.accent:t.bg4,minWidth:8}}/>}
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {o.items.map((i,idx)=><span key={idx} style={{fontSize:11,background:t.bg3,border:`1px solid ${t.border}`,borderRadius:6,padding:"2px 9px",color:t.text2}}>{i.name}×{i.qty}</span>)}
          </div>
          {o.loyaltyEarned>0 && <div style={{fontSize:12,color:t.yellow,fontWeight:700,marginTop:6}}>⭐ +{o.loyaltyEarned} points earned</div>}
        </Card>
      ))}
      {selectedOrder && (
        <Modal t={t} title={"Order Details — "+selectedOrder.id} subtitle={selectedOrder.date} onClose={()=>setSelectedOrder(null)} width={540}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <Badge t={t} text={selectedOrder.status} color={selectedOrder.status==="completed"?"green":selectedOrder.status==="preparing"?"yellow":"red"}/>
              <Badge t={t} text={selectedOrder.orderType} color="blue"/>
              <Badge t={t} text={"£"+selectedOrder.total.toFixed(2)} color="green"/>
            </div>
            {/* Full progress */}
            <div>
              <div style={{fontSize:12,fontWeight:800,color:t.text3,marginBottom:10,textTransform:"uppercase",letterSpacing:.7}}>Order Progress</div>
              <div style={{display:"flex",alignItems:"flex-start",gap:0}}>
                {STAGES.map((s,i)=>(
                  <div key={s} style={{display:"flex",alignItems:"center",flex:i<STAGES.length-1?1:undefined}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:i<=getStageIdx(selectedOrder)?t.accent:t.bg4,border:`2px solid ${i<=getStageIdx(selectedOrder)?t.accent:t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:i<=getStageIdx(selectedOrder)?"#fff":t.text4}}>
                        {i<=getStageIdx(selectedOrder)?"✓":(i+1)}
                      </div>
                      <div style={{fontSize:9,color:i<=getStageIdx(selectedOrder)?t.accent:t.text4,textAlign:"center",maxWidth:64,fontWeight:i<=getStageIdx(selectedOrder)?700:400}}>{s}</div>
                    </div>
                    {i<STAGES.length-1&&<div style={{flex:1,height:2,background:i<getStageIdx(selectedOrder)?t.accent:t.bg4,margin:"0 4px",marginBottom:22}}/>}
                  </div>
                ))}
              </div>
            </div>
            <Card t={t} style={{padding:14}}>
              {selectedOrder.items.map((i,idx)=>(
                <div key={idx} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,paddingBottom:6,borderBottom:idx<selectedOrder.items.length-1?`1px solid ${t.border}`:"none"}}>
                  <span style={{color:t.text2}}>{i.name} <span style={{color:t.text4}}>×{i.qty}</span></span>
                  <span style={{fontWeight:700,color:t.text}}>{fmt(i.price*i.qty)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:900,color:t.text,paddingTop:8,borderTop:`1px solid ${t.border}`,marginTop:4}}>
                <span>Total</span><span style={{color:t.accent}}>{fmt(selectedOrder.total)}</span>
              </div>
            </Card>
            {selectedOrder.deliveryAddress && <div style={{background:t.tealBg,border:`1px solid ${t.tealBorder}`,borderRadius:9,padding:"10px 14px",fontSize:13,color:t.teal}}>🚚 {selectedOrder.deliveryAddress}</div>}
            {selectedOrder.loyaltyEarned>0 && <div style={{background:t.yellowBg,border:`1px solid ${t.yellowBorder}`,borderRadius:9,padding:"10px 14px",fontSize:13,color:t.yellow,fontWeight:700}}>⭐ +{selectedOrder.loyaltyEarned} loyalty points earned on this order</div>}
            {selectedOrder.status==="completed" && !selectedOrder.feedback && (
              <FeedbackWidget orderId={selectedOrder.id} onSubmit={(rating, comment) => {
                const updated = {...selectedOrder, feedback:{rating,comment,date:ts()}};
                setSelectedOrder(updated);
              }} t={t}/>
            )}
            {selectedOrder.feedback && (
              <div style={{background:t.greenBg,border:`1px solid ${t.greenBorder}`,borderRadius:9,padding:"12px 14px"}}>
                <div style={{fontSize:12,fontWeight:800,color:t.green,marginBottom:4}}>✅ Feedback Submitted</div>
                <div style={{fontSize:14}}>{"⭐".repeat(selectedOrder.feedback.rating)}{"☆".repeat(5-selectedOrder.feedback.rating)}</div>
                {selectedOrder.feedback.comment && <div style={{fontSize:12,color:t.text2,marginTop:4}}>{selectedOrder.feedback.comment}</div>}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── FEEDBACK WIDGET ──────────────────────────────────────────────────────────
const FeedbackWidget = ({ orderId, onSubmit, t }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <div style={{background:t.bg3,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 16px"}}>
      <div style={{fontSize:13,fontWeight:800,color:t.text,marginBottom:10}}>⭐ Rate Your Experience</div>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[1,2,3,4,5].map(s=>(
          <button key={s} onClick={()=>setRating(s)} style={{fontSize:22,background:"none",border:"none",cursor:"pointer",opacity:s<=rating?1:.3,transition:"opacity .15s"}}>{s<=rating?"⭐":"☆"}</button>
        ))}
      </div>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tell us about your experience (optional)..." style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",color:t.text,fontSize:12,outline:"none",resize:"vertical",minHeight:60,fontFamily:"inherit",boxSizing:"border-box"}}/>
      <div style={{marginTop:10,display:"flex",gap:8}}>
        <Btn t={t} variant="success" onClick={()=>{if(!rating){notify("Please select a rating","error");return;}onSubmit(rating,comment);setDone(true);notify("Thank you for your feedback!","success");}}>Submit Feedback</Btn>
        <Btn t={t} variant="ghost" onClick={()=>setDone(true)}>Skip</Btn>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PICKUP ORDERS PANEL (Manager/Cashier)
// ═══════════════════════════════════════════════════════════════
const PickupOrdersPanel = ({ orders, setOrders, addAudit, user, t }) => {
  const pickups = orders.filter(o => o.orderType==="pickup").sort((a,b)=>b.date.localeCompare(a.date));
  const [verifyId, setVerifyId] = useState("");
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  const [verifyErr, setVerifyErr] = useState("");

  const markDone = (o) => {
    setOrders(os => os.map(x => x.id===o.id ? {...x, status:"completed"} : x));
    addAudit(user, "Pickup Completed", "Orders", o.id+" — "+o.customerName);
    notify("Order "+o.id+" marked as collected!", "success");
    if(verifiedOrder?.id===o.id){setVerifiedOrder({...o,status:"completed"});} 
  };

  const verifyOnlineOrder = () => {
    const found = orders.find(o => o.id.toLowerCase()===verifyId.trim().toLowerCase());
    if(!found){setVerifyErr("Order not found. Check the ID and try again.");setVerifiedOrder(null);return;}
    setVerifyErr("");
    setVerifiedOrder(found);
    notify("Order found: "+found.id+" — "+found.customerName,"success");
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{fontSize:22,fontWeight:900,color:t.text}}>📦 Pickup Orders</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
        <StatCard t={t} title="Total Pickups" value={pickups.length} color={t.blue} icon="📦"/>
        <StatCard t={t} title="Pending" value={pickups.filter(o=>o.status!=="completed").length} color={t.yellow} icon="⏳"/>
        <StatCard t={t} title="Completed" value={pickups.filter(o=>o.status==="completed").length} color={t.green} icon="✅"/>
      </div>
      {/* Online Order Verification */}
      <Card t={t}>
        <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:14}}>🔍 Verify Online Order for Pickup</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <input value={verifyId} onChange={e=>{setVerifyId(e.target.value.toUpperCase());setVerifyErr("");}} 
            onKeyDown={e=>e.key==="Enter"&&verifyOnlineOrder()}
            placeholder="Enter Order ID (e.g. ORD-1234)..." 
            style={{flex:1,minWidth:200,background:t.input,border:`1px solid ${verifyErr?t.red:t.border}`,borderRadius:9,padding:"9px 14px",color:t.text,fontSize:13,outline:"none"}}/>
          <Btn t={t} onClick={verifyOnlineOrder} disabled={!verifyId.trim()}>🔍 Lookup Order</Btn>
          {verifiedOrder && <Btn t={t} variant="ghost" size="sm" onClick={()=>{setVerifiedOrder(null);setVerifyId("");}}>Clear</Btn>}
        </div>
        {verifyErr && <div style={{marginTop:8,fontSize:12,color:t.red,background:t.redBg,border:`1px solid ${t.redBorder}`,borderRadius:8,padding:"7px 12px"}}>{verifyErr}</div>}
        {verifiedOrder && (
          <div style={{marginTop:14,background:t.bg3,borderRadius:12,border:`1px solid ${t.border}`,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:16,fontWeight:900,color:t.text}}>{verifiedOrder.id}</span>
                  <Badge t={t} text={verifiedOrder.status} color={verifiedOrder.status==="completed"?"green":verifiedOrder.status==="preparing"?"yellow":"blue"}/>
                  <Badge t={t} text={verifiedOrder.orderType||"in-store"} color={verifiedOrder.orderType==="delivery"?"teal":"blue"}/>
                </div>
                <div style={{fontSize:13,color:t.text2}}>👤 {verifiedOrder.customerName}</div>
                <div style={{fontSize:12,color:t.text3}}>📅 {verifiedOrder.date}</div>
                <div style={{fontSize:12,color:t.text3}}>💳 Payment: {verifiedOrder.payment}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
                  {verifiedOrder.items.map((i,idx)=><span key={idx} style={{fontSize:11,background:t.bg2,border:`1px solid ${t.border}`,borderRadius:6,padding:"2px 9px",color:t.text2}}>{i.name} ×{i.qty}</span>)}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:22,fontWeight:900,color:t.accent}}>{fmt(verifiedOrder.total)}</div>
                {verifiedOrder.status!=="completed" && (
                  <Btn t={t} variant="success" style={{marginTop:8}} onClick={()=>markDone(verifiedOrder)}>✓ Hand Over & Complete</Btn>
                )}
                {verifiedOrder.status==="completed" && (
                  <div style={{marginTop:8,fontSize:13,color:t.green,fontWeight:700}}>✅ Already Completed</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {pickups.length===0 ? <Card t={t}><div style={{textAlign:"center",padding:40,color:t.text3}}>No pickup orders yet</div></Card> : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {pickups.map(o=>(
            <Card t={t} key={o.id}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div>
                  <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                    <span style={{fontSize:15,fontWeight:800,color:t.text}}>{o.id}</span>
                    <Badge t={t} text={o.status} color={o.status==="completed"?"green":"yellow"}/>
                  </div>
                  <div style={{fontSize:13,color:t.text2}}>👤 {o.customerName}</div>
                  <div style={{fontSize:12,color:t.text3,marginTop:3}}>Ordered: {o.date}</div>
                  <div style={{fontSize:12,color:t.text3}}>Payment: {o.payment} · {fmt(o.total)}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
                    {o.items.map((i,idx)=><span key={idx} style={{fontSize:11,background:t.bg3,border:`1px solid ${t.border}`,borderRadius:6,padding:"2px 8px",color:t.text2}}>{i.name}×{i.qty}</span>)}
                  </div>
                </div>
                {o.status!=="completed" && (
                  <Btn t={t} variant="success" onClick={()=>markDone(o)}>✓ Mark Collected</Btn>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// STAFF DASHBOARD — Store orders + status + messaging
// ═══════════════════════════════════════════════════════════════
const StaffDashboard = ({ orders, setOrders, products, users, addAudit, currentUser, t }) => {
  const [messages, setMessages] = useState([
    {id:1,from:"Admin",text:"Match day special — all jerseys 20% off today!",time:"09:00",type:"info"},
    {id:2,from:"Manager",text:"Counter 3 reopening at 14:00",time:"10:30",type:"warning"},
    {id:3,from:"System",text:"Low stock alert: Goalkeeper Gloves (8 remaining)",time:"11:15",type:"error"},
  ]);
  const [newMsg, setNewMsg] = useState("");
  const [statusUpdates, setStatusUpdates] = useState({});
  const [orderSearch, setOrderSearch] = useState("");
  const ORDER_STATUSES = ["preparing","ready","completed"];
  const allStoreOrders = orders.filter(o=>o.orderType!=="in-store"||o.status!=="completed");
  const storeOrders = orderSearch
    ? allStoreOrders.filter(o => o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customerName.toLowerCase().includes(orderSearch.toLowerCase()))
    : allStoreOrders.slice(0,20);

  const updateStatus = (oid, status) => {
    setOrders(os => os.map(o => o.id===oid ? {...o, status} : o));
    setStatusUpdates(s=>({...s,[oid]:status}));
    addAudit(currentUser,"Order Status Updated","Orders",oid+" → "+status);
    notify("Order "+oid+" updated to "+status,"success");
    // Notify customer via global notifs (simulated)
    const ord = orders.find(o=>o.id===oid);
    if(ord && status==="ready") { /* would push to customer in real app */ }
  };

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setMessages(ms=>[...ms,{id:Date.now(),from:currentUser.name,text:newMsg,time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),type:"info"}]);
    setNewMsg(""); notify("Message sent","success");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{fontSize:22,fontWeight:900,color:t.text}}>🖥️ Staff Dashboard</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
        <StatCard t={t} title="Active Orders" value={orders.filter(o=>o.status==="preparing").length} color={t.yellow} icon="⏳"/>
        <StatCard t={t} title="Ready" value={orders.filter(o=>o.status==="ready").length} color={t.green} icon="✅"/>
        <StatCard t={t} title="Low Stock" value={products.filter(p=>p.stock<10).length} color={t.red} icon="⚠️"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}} className="grid-2">
        {/* Order management */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <div style={{fontSize:15,fontWeight:800,color:t.text}}>📋 Order Queue</div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span>
              <input value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} placeholder="Search by order ID or customer..." style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"7px 12px 7px 28px",color:t.text,fontSize:12,outline:"none",width:220}}/>
            </div>
          </div>
          {storeOrders.length===0?<Card t={t}><div style={{textAlign:"center",padding:30,color:t.text3}}>No active orders</div></Card>:storeOrders.map(o=>(
            <Card t={t} key={o.id} style={{padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:t.text}}>{o.id} · {o.customerName}</div>
                  <div style={{fontSize:11,color:t.text3}}>{o.orderType} · {o.date}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                    {o.items.map((i,idx)=><span key={idx} style={{fontSize:10,background:t.bg3,border:`1px solid ${t.border}`,borderRadius:5,padding:"2px 7px",color:t.text2}}>{i.name}</span>)}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {ORDER_STATUSES.map(s=>(
                    <button key={s} onClick={()=>updateStatus(o.id,s)} style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${o.status===s?t.accent:t.border}`,background:o.status===s?t.accent+"15":"transparent",color:o.status===s?t.accent:t.text3,fontSize:10,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>{s}</button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        {/* Messaging */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:15,fontWeight:800,color:t.text}}>💬 Store Updates</div>
          <Card t={t} style={{padding:0,overflow:"hidden"}}>
            <div style={{maxHeight:300,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
              {messages.map(m=>{
                const [bg,col] = m.type==="error"?[t.redBg,t.red]:m.type==="warning"?[t.yellowBg,t.yellow]:[t.blueBg,t.blue];
                return(
                  <div key={m.id} style={{background:bg,borderRadius:9,padding:"8px 12px"}}>
                    <div style={{fontSize:10,color:col,fontWeight:800,marginBottom:3}}>{m.from} · {m.time}</div>
                    <div style={{fontSize:12,color:t.text2}}>{m.text}</div>
                  </div>
                );
              })}
            </div>
            <div style={{padding:"10px 14px",borderTop:`1px solid ${t.border}`,display:"flex",gap:8}}>
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Send update..." style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"7px 10px",color:t.text,fontSize:12,outline:"none"}}/>
              <button onClick={sendMsg} style={{background:t.accent,color:"#fff",border:"none",borderRadius:7,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Send</button>
            </div>
          </Card>
          {/* Low stock alerts */}
          <div style={{fontSize:13,fontWeight:800,color:t.text}}>⚠️ Low Stock</div>
          {products.filter(p=>p.stock<10).map(p=>(
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:t.redBg,border:`1px solid ${t.redBorder}`,borderRadius:9,padding:"8px 12px"}}>
              <span style={{fontSize:12,color:t.text}}>{p.emoji} {p.name}</span>
              <span style={{fontSize:12,fontWeight:800,color:t.red}}>{p.stock} left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ADMIN CUSTOMER MANAGEMENT
// ═══════════════════════════════════════════════════════════════
const AdminCustomerManagement = ({ users, orders, t }) => {
  const [selected, setSelected] = useState(null);
  const customers = users.filter(u => u.role==="customer");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{fontSize:22,fontWeight:900,color:t.text}}>👥 Customer Management</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
        <StatCard t={t} title="Total Customers" value={customers.length} color={t.blue} icon="👥"/>
        <StatCard t={t} title="Gold Members" value={customers.filter(u=>u.tier==="Gold").length} color="#f59e0b" icon="🥇"/>
        <StatCard t={t} title="Silver Members" value={customers.filter(u=>u.tier==="Silver").length} color="#9ca3af" icon="🥈"/>
        <StatCard t={t} title="Total Loyalty Pts" value={customers.reduce((s,u)=>s+(u.loyaltyPoints||0),0)} color={t.yellow} icon="⭐"/>
      </div>
      <Card t={t} style={{padding:0,overflow:"hidden"}}>
        <Table t={t} cols={["Customer","Email","Phone","Tier","Points","Total Spent","Orders",""]}
          rows={customers.map(u=>{
            const myOrders = orders.filter(o=>o.customerId===u.id);
            const tierC={Bronze:"#cd7f32",Silver:"#9ca3af",Gold:"#f59e0b"};
            return [
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,background:tierC[u.tier]+"20",border:`2px solid ${tierC[u.tier]}40`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:tierC[u.tier]}}>{u.avatar}</div>
                <span style={{fontWeight:700,color:t.text}}>{u.name}</span>
              </div>,
              <span style={{fontSize:12,color:t.text3}}>{u.email}</span>,
              <span style={{fontSize:12,color:t.text3}}>{u.phone||"—"}</span>,
              <Badge t={t} text={u.tier||"Bronze"} color={u.tier==="Gold"?"yellow":u.tier==="Silver"?"blue":"orange"}/>,
              <span style={{color:t.yellow,fontWeight:700}}>⭐{u.loyaltyPoints||0}</span>,
              <span style={{fontWeight:800,color:t.accent}}>{fmt(u.totalSpent||0)}</span>,
              <span style={{color:t.blue,fontWeight:700}}>{myOrders.length}</span>,
              <Btn t={t} variant="secondary" size="sm" onClick={()=>setSelected(u)}>View Profile</Btn>
            ];
          })}
        />
      </Card>
      {selected && (
        <Modal t={t} title={"Customer Profile — "+selected.name} onClose={()=>setSelected(null)} width={600}>
          {(() => {
            const myOrders = orders.filter(o=>o.customerId===selected.id);
            const totalSpent = myOrders.reduce((s,o)=>s+o.total,0);
            const tierC={Bronze:"#cd7f32",Silver:"#9ca3af",Gold:"#f59e0b"};
            return (
              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                <div style={{display:"flex",alignItems:"center",gap:16,background:`linear-gradient(135deg,${t.accent},${t.accent2})`,borderRadius:12,padding:"20px 24px",color:"#fff"}}>
                  <div style={{width:56,height:56,background:"rgba(255,255,255,.2)",border:"3px solid rgba(255,255,255,.4)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900}}>{selected.avatar}</div>
                  <div>
                    <div style={{fontSize:20,fontWeight:900}}>{selected.name}</div>
                    <div style={{fontSize:13,opacity:.8}}>{selected.email} · {selected.role}</div>
                    <div style={{marginTop:6,display:"flex",gap:10}}>
                      <span style={{background:"rgba(255,255,255,.2)",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700}}>{selected.tier==="Gold"?"🥇":selected.tier==="Silver"?"🥈":"🥉"} {selected.tier}</span>
                      <span style={{background:"rgba(255,255,255,.2)",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700}}>⭐ {selected.loyaltyPoints} pts</span>
                    </div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  <StatCard t={t} title="Total Orders" value={myOrders.length} color={t.blue} icon="🧾"/>
                  <StatCard t={t} title="Total Spent" value={fmt(totalSpent)} color={t.accent} icon="💰"/>
                  <StatCard t={t} title="Loyalty Points" value={selected.loyaltyPoints||0} color={t.yellow} icon="⭐"/>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:t.text,marginBottom:12}}>Order History</div>
                  {myOrders.length===0?<div style={{color:t.text3,fontSize:13}}>No orders yet</div>:myOrders.map(o=>(
                    <div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${t.border}`,flexWrap:"wrap",gap:8}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:t.text}}>{o.id}</div>
                        <div style={{fontSize:11,color:t.text3}}>{o.date} · {o.items.length} items</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:14,fontWeight:800,color:t.accent}}>{fmt(o.total)}</div>
                        <Badge t={t} text={o.status} color={o.status==="completed"?"green":"yellow"}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ADMIN ANALYTICS DASHBOARD (with charts)
// ═══════════════════════════════════════════════════════════════
const AdminAnalytics = ({ orders, products, t }) => {
  const [shopFilter, setShopFilter] = useState("all");
  const SHOPS_LIST = ["all","Main Stadium Store","East Wing Megastore","Airport Pop-up"];
  const shopOrders = shopFilter==="all" ? orders : orders.filter((_,i)=>["Main Stadium Store","East Wing Megastore","Airport Pop-up"].indexOf(shopFilter)===i%3);
  
  const totalRev = shopOrders.reduce((s,o)=>s+o.total,0);
  const byPayment = {Card:0,Cash:0,QR:0,Online:0};
  shopOrders.forEach(o=>{byPayment[o.payment]=(byPayment[o.payment]||0)+o.total;});
  const byType = {"in-store":0,pickup:0,delivery:0};
  shopOrders.forEach(o=>{byType[o.orderType||"in-store"]=(byType[o.orderType||"in-store"]||0)+1;});
  const topP = {};
  shopOrders.forEach(o=>o.items.forEach(i=>{topP[i.name]=(topP[i.name]||0)+i.qty;}));
  const topProducts = Object.entries(topP).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const catRev={};
  shopOrders.forEach(o=>o.items.forEach(i=>{const p=products.find(x=>x.name===i.name);const cat=p?.category||"Other";catRev[cat]=(catRev[cat]||0)+i.price*i.qty;}));
  const maxRev = Math.max(...Object.values(catRev),1);
  const colors=["#dc2626","#2563eb","#16a34a","#d97706","#7c3aed","#0d9488"];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{fontSize:22,fontWeight:900,color:t.text}}>📈 Analytics Dashboard</div>
        <Select t={t} label="" value={shopFilter} onChange={setShopFilter} options={SHOPS_LIST.map(s=>({value:s,label:s==="all"?"🌐 All Shops":"🏪 "+s}))}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
        <StatCard t={t} title="Total Revenue" value={fmt(totalRev)} color={t.accent} icon="💰" trend={12}/>
        <StatCard t={t} title="Orders" value={shopOrders.length} color={t.blue} icon="🧾" trend={8}/>
        <StatCard t={t} title="Avg Order" value={fmt(shopOrders.length?totalRev/shopOrders.length:0)} color={t.green} icon="📊"/>
        <StatCard t={t} title="Online Orders" value={shopOrders.filter(o=>o.payment==="Online").length} color={t.teal} icon="🌐"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="grid-2">
        {/* Revenue by category bar chart */}
        <Card t={t}>
          <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:16}}>📊 Revenue by Category</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {Object.entries(catRev).sort((a,b)=>b[1]-a[1]).map(([cat,rev],i)=>(
              <div key={cat}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <span style={{color:t.text2,fontWeight:600}}>{cat}</span>
                  <span style={{fontWeight:800,color:t.text}}>{fmt(rev)}</span>
                </div>
                <div style={{height:8,background:t.bg4,borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(rev/maxRev)*100}%`,background:colors[i%colors.length],borderRadius:4,transition:"width .6s"}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
        {/* Order type donut */}
        <Card t={t}>
          <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:16}}>🥧 Order Types</div>
          <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{position:"relative",width:110,height:110,flexShrink:0}}>
              <svg viewBox="0 0 42 42" style={{width:"100%",height:"100%",transform:"rotate(-90deg)"}}>
                {(() => {
                  const total2 = Object.values(byType).reduce((s,v)=>s+v,0)||1;
                  const typeColors={"in-store":"#dc2626",pickup:"#2563eb",delivery:"#0d9488"};
                  let offset=0;
                  return Object.entries(byType).filter(([,v])=>v>0).map(([k,v])=>{
                    const pct=v/total2*100;
                    const el=<circle key={k} cx="21" cy="21" r="15.9" fill="none" stroke={typeColors[k]} strokeWidth="5" strokeDasharray={`${pct} ${100-pct}`} strokeDashoffset={100-offset}/>;
                    offset+=pct; return el;
                  });
                })()}
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                <div style={{fontSize:9,color:t.text3,fontWeight:700}}>ORDERS</div>
                <div style={{fontSize:13,fontWeight:900,color:t.text}}>{shopOrders.length}</div>
              </div>
            </div>
            <div style={{flex:1}}>
              {[["in-store","In-Store","#dc2626"],["pickup","Pickup","#2563eb"],["delivery","Delivery","#0d9488"]].map(([k,l,c])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:10,height:10,borderRadius:3,background:c,flexShrink:0}}/>
                  <div style={{flex:1,fontSize:12,color:t.text2}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:800,color:t.text}}>{byType[k]||0}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Payment breakdown */}
          <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${t.border}`}}>
            <div style={{fontSize:12,fontWeight:800,color:t.text3,marginBottom:10,textTransform:"uppercase",letterSpacing:.7}}>Payment Methods</div>
            {Object.entries(byPayment).filter(([,v])=>v>0).map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                <span style={{color:t.text2}}>{k}</span>
                <span style={{fontWeight:800,color:t.accent}}>{fmt(v)}</span>
              </div>
            ))}
          </div>
        </Card>
        {/* Top products */}
        <Card t={t}>
          <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:16}}>🏆 Top Products</div>
          {topProducts.map(([name,qty],i)=>(
            <div key={name} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#fef9c3":i===1?"#f1f5f9":t.bg3,border:`2px solid ${i===0?"#f59e0b":i===1?"#9ca3af":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:i===0?"#d97706":t.text3,flexShrink:0}}>
                {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:t.text}}>{name}</div>
                <div style={{height:4,background:t.bg4,borderRadius:2,marginTop:4}}>
                  <div style={{height:"100%",width:`${(qty/topProducts[0][1])*100}%`,background:colors[i%colors.length],borderRadius:2}}/>
                </div>
              </div>
              <Badge t={t} text={qty+" sold"} color="blue"/>
            </div>
          ))}
        </Card>
        {/* Simulated daily revenue chart */}
        <Card t={t}>
          <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:16}}>📅 Weekly Revenue</div>
          {(() => {
            const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
            const vals=[1240,985,1560,820,1890,2340,1650].map(v=>v*(shopFilter==="all"?1:0.33));
            const maxV=Math.max(...vals);
            return(
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120}}>
                {days.map((d,i)=>(
                  <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                    <div style={{width:"100%",background:t.accent,borderRadius:"4px 4px 0 0",height:`${(vals[i]/maxV)*100}px`,minHeight:4,transition:"height .5s",opacity:.85}}/>
                    <div style={{fontSize:9,color:t.text4,fontWeight:700}}>{d}</div>
                  </div>
                ))}
              </div>
            );
          })()}
          <div style={{fontSize:11,color:t.text4,marginTop:8,textAlign:"right"}}>Simulated mock data</div>
        </Card>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
// NOTIFICATION BELL PANEL
// ═══════════════════════════════════════════════════════════════
const NotifBell = ({ notifs, setNotifs, t }) => {
  const [open, setOpen] = useState(false);
  const unread = notifs.filter(n => !n.read).length;
  const markAll = () => setNotifs(ns => ns.map(n => ({...n, read:true})));
  const colorMap = {success:t.green, error:t.red, warning:t.yellow, info:t.blue};
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(v=>!v)} style={{background:t.bg3,border:`1px solid ${t.border}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:16,color:t.text,position:"relative",display:"flex",alignItems:"center"}}>
        🔔
        {unread > 0 && <span style={{position:"absolute",top:-4,right:-4,background:t.accent,color:"#fff",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900}}>{unread>9?"9+":unread}</span>}
      </button>
      {open && (
        <div style={{position:"absolute",top:"110%",right:0,width:320,background:t.bg2,border:`1px solid ${t.border}`,borderRadius:14,boxShadow:t.shadowLg,zIndex:500,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${t.border}`}}>
            <div style={{fontSize:13,fontWeight:900,color:t.text}}>🔔 Notifications</div>
            <div style={{display:"flex",gap:8}}>
              {unread>0 && <button onClick={markAll} style={{background:"none",border:"none",fontSize:11,color:t.blue,cursor:"pointer",fontWeight:700}}>Mark all read</button>}
              <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",fontSize:14,color:t.text3,cursor:"pointer"}}>✕</button>
            </div>
          </div>
          <div style={{maxHeight:340,overflowY:"auto"}}>
            {notifs.length===0 ? (
              <div style={{textAlign:"center",padding:"32px 20px",color:t.text3}}>
                <div style={{fontSize:28,marginBottom:8}}>🔔</div>No notifications
              </div>
            ) : notifs.map(n => (
              <div key={n.id} onClick={()=>setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))}
                style={{padding:"10px 16px",borderBottom:`1px solid ${t.border}`,background:n.read?"transparent":colorMap[n.type]+"0d",cursor:"pointer",display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:n.read?t.border:colorMap[n.type]||t.blue,marginTop:5,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:t.text,lineHeight:1.4,fontWeight:n.read?400:600}}>{n.msg}</div>
                  <div style={{fontSize:10,color:t.text4,marginTop:3}}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
// MANAGER DASHBOARD (store-specific, not admin global view)
// ═══════════════════════════════════════════════════════════════
const ManagerDash = ({ orders, products, users, counters, t }) => {
  const storeOrders = orders; // manager sees all store orders
  const todayRevenue = storeOrders.reduce((s,o) => s + o.total, 0);
  const pendingOrders = storeOrders.filter(o => o.status === "preparing").length;
  const staffCount = users.filter(u => u.role === "cashier").length;
  const lowStock = products.filter(p => p.stock < 10).length;
  const topP = {}; storeOrders.forEach(o => o.items.forEach(i => { topP[i.name] = (topP[i.name]||0) + i.qty; }));
  const topProducts = Object.entries(topP).sort((a,b) => b[1]-a[1]).slice(0,5);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div>
        <div style={{fontSize:22,fontWeight:900,color:t.text}}>Store Dashboard</div>
        <div style={{fontSize:13,color:t.text3,marginTop:3}}>Your store overview & active operations</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
        <StatCard t={t} title="Total Revenue" value={fmt(todayRevenue)} color={t.accent} icon="💰" trend={8}/>
        <StatCard t={t} title="Total Orders" value={storeOrders.length} color={t.blue} icon="🧾" trend={5}/>
        <StatCard t={t} title="Pending Orders" value={pendingOrders} color={t.yellow} icon="⏳"/>
        <StatCard t={t} title="Staff Active" value={staffCount} color={t.green} icon="👥"/>
        <StatCard t={t} title="Low Stock Items" value={lowStock} color={t.red} icon="⚠️"/>
        <StatCard t={t} title="Active Counters" value={counters.filter(c=>c.active).length} color={t.teal} icon="🏪"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="grid-2">
        <Card t={t}>
          <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:14}}>🏆 Top Selling Products</div>
          {topProducts.length===0 ? <div style={{color:t.text3,fontSize:13}}>No sales data yet</div> : topProducts.map(([name,qty],i)=>(
            <div key={name} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${t.border}`,fontSize:13}}>
              <span style={{color:t.text}}>#{i+1} {name}</span>
              <Badge t={t} text={qty+" sold"} color="blue"/>
            </div>
          ))}
        </Card>
        <Card t={t}>
          <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:14}}>🏪 Counter Performance</div>
          {counters.map(c => {
            const rev = storeOrders.filter(o=>o.counter===c.name).reduce((s,o)=>s+o.total,0);
            const cnt = storeOrders.filter(o=>o.counter===c.name).length;
            const pct = todayRevenue>0?Math.round(rev/todayRevenue*100):0;
            return (
              <div key={c.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                  <span style={{color:t.text2,fontWeight:600}}>{c.name} <span style={{fontSize:10,color:c.active?t.green:t.text4}}>({c.active?"active":"inactive"})</span></span>
                  <span style={{fontWeight:800,color:t.text}}>{fmt(rev)}</span>
                </div>
                <div style={{height:6,background:t.bg4,borderRadius:3}}>
                  <div style={{height:"100%",width:`${pct}%`,background:t.accent,borderRadius:3}}/>
                </div>
                <div style={{fontSize:10,color:t.text4,marginTop:2}}>{cnt} orders · {pct}% of revenue</div>
              </div>
            );
          })}
        </Card>
        <Card t={t}>
          <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:14}}>⚠️ Stock Alerts</div>
          {products.filter(p=>p.stock<15).sort((a,b)=>a.stock-b.stock).slice(0,8).map(p=>(
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${t.border}`}}>
              <span style={{fontSize:13,color:t.text}}>{p.emoji} {p.name}</span>
              <span style={{fontSize:12,fontWeight:800,color:p.stock<5?t.red:p.stock<10?t.yellow:t.text3}}>{p.stock} left</span>
            </div>
          ))}
          {products.filter(p=>p.stock<15).length===0 && <div style={{color:t.green,fontSize:13}}>✅ All stock levels healthy</div>}
        </Card>
        <Card t={t} style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${t.border}`,fontSize:14,fontWeight:800,color:t.text}}>📋 Recent Orders</div>
          <Table t={t} cols={["ID","Customer","Type","Total","Status"]} rows={storeOrders.slice(0,6).map(o=>[
            <span style={{fontSize:11,fontFamily:"monospace"}}>{o.id}</span>,
            o.customerName,
            <Badge t={t} text={o.orderType||"in-store"} color={o.orderType==="delivery"?"teal":o.orderType==="pickup"?"blue":"green"}/>,
            fmt(o.total),
            <Badge t={t} text={o.status} color={o.status==="completed"?"green":o.status==="preparing"?"yellow":"red"}/>
          ])} empty="No orders yet"/>
        </Card>
      </div>
    </div>
  );
};

export default function App() {
  const [page, setPage] = useState("guest"); // guest | login | register | app
  const [currentUser, setCurrentUser] = useState(null);
  const [section, setSection] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [appError, setAppError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOfferCat, setPendingOfferCat] = useState(null);
  const [pendingGuestCart, setPendingGuestCart] = useState([]);
  const [globalNotifs, setGlobalNotifs] = useState([
    {id:1, msg:"Welcome to FanStore! Check today's offers.", type:"info", read:false, time:"09:00"},
    {id:2, msg:"Your order ORD-0004 has been delivered!", type:"success", read:false, time:"11:30"},
    {id:3, msg:"New loyalty points earned: ⭐ +305", type:"success", read:true, time:"11:31"},
  ]);

  const addGlobalNotif = useCallback((msg, type="info") => {
    const id = Date.now();
    const time = new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
    setGlobalNotifs(ns => [{id, msg, type, read:false, time}, ...ns.slice(0,19)]);
  }, []);

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [returns, setReturns] = useState(INITIAL_RETURNS);
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [counters, setCounters] = useState(INITIAL_COUNTERS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);

  const t = darkMode ? THEMES.dark : THEMES.light;

  const addAudit = useCallback((u, action, module, details = "") => {
    setAuditLogs(l => [{ id: `LOG-${Date.now()}`, user: u?.name || "System", role: u?.role || "system", action, module, details, timestamp: ts() }, ...l]);
  }, []);
  useEffect(() => { window.__addAudit = addAudit; return () => { delete window.__addAudit; }; }, [addAudit]);

  // Global error handler (renders visible error message instead of blank screen)
  useEffect(() => {
    const onError = (event) => {
      setAppError(event.error?.message || event.message || "Unknown error");
    };
    const onRejection = (event) => {
      setAppError(event.reason?.message || String(event.reason) || "Unhandled promise rejection");
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  // Sync currentUser with users state
  useEffect(() => {
    if (currentUser) {
      const up = users.find(u => u.id === currentUser.id);
      if (up && JSON.stringify(up) !== JSON.stringify(currentUser)) setCurrentUser(up);
    }
  }, [users, currentUser]);

  const login = (u) => {
    if (!u || !u.role) return;
    setCurrentUser(u);
    const defs = { admin: "dashboard", manager: "dashboard", cashier: "pos", customer: "shop", staff: "staffdash" };
    setSection(defs[u.role] ?? "dashboard");
    setPage("app");
    addAudit(u, "User Login", "Auth", `${u.role} logged in`);
  };

  const register = (form) => {
    const nc = { id: Date.now(), name: form.name, email: form.email, phone: form.phone, password: form.password, role: "customer", avatar: form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2), active: true, joinDate: new Date().toISOString().split("T")[0], loyaltyPoints: 0, tier: "Bronze", totalSpent: 0, pointsExpiry: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0] };
    setUsers(us => [...us, nc]);
    login(nc);
    addAudit(nc, "User Registered", "Auth", `New customer ${nc.name} registered`);
    notify("Welcome to FanStore! 🎉", "success");
  };

  const logout = () => {
    addAudit(currentUser, "User Logout", "Auth", `${currentUser.role} logged out`);
    setCurrentUser(null); setSection(null); setPage("guest");
  };

  const commonP = { products, setProducts, orders, setOrders, returns, setReturns, users, setUsers, counters, setCounters, settings, setSettings, banners, setBanners, coupons, setCoupons, auditLogs, addAudit, addGlobalNotif, currentUser, user: currentUser, t, darkMode, setDarkMode };

  // Inline stubs for manager/cashier/admin sections
  const mkSection = (title, content) => <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><div style={{ fontSize: 22, fontWeight: 900, color: t.text }}>{title}</div>{content}</div>;

  const UserManagement = ({ users, t }) => {
    const [f, setF] = useState("all");
    const fil = f === "all" ? users : users.filter(u => u.role === f);
    return mkSection("User Management", <><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>{["all", "admin", "manager", "cashier", "customer"].map(r => <button key={r} onClick={() => setF(r)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${f === r ? t.accent : t.border}`, background: f === r ? t.accent + "15" : "transparent", color: f === r ? t.accent : t.text3, fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>{r}</button>)}</div><Card t={t} style={{ padding: 0, overflow: "hidden" }}><Table t={t} cols={["User", "Email", "Role", "Loyalty", "Status"]} rows={fil.map(u => [<div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 30, height: 30, background: t.accent + "15", border: `2px solid ${t.accent}30`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: t.accent }}>{u.avatar}</div><span style={{ fontWeight: 600, color: t.text }}>{u.name}</span></div>, u.email, <Badge t={t} text={u.role} color={{ admin: "red", manager: "yellow", cashier: "green", customer: "blue" }[u.role]} />, u.role === "customer" ? <span style={{ color: t.yellow, fontWeight: 700 }}>⭐{u.loyaltyPoints || 0}</span> : "—", <Badge t={t} text={u.active ? "Active" : "Off"} color={u.active ? "green" : "red"} />])} /></Card></>);
  };

  const AuditLogs = ({ auditLogs, t }) => {
    const [f, setF] = useState("all");
    const mods = ["all", ...new Set(auditLogs.map(l => l.module))];
    const fil = f === "all" ? auditLogs : auditLogs.filter(l => l.module === f);
    return mkSection("Audit Logs", <><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{mods.map(m => <button key={m} onClick={() => setF(m)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${f === m ? t.accent : t.border}`, background: f === m ? t.accent + "15" : "transparent", color: f === m ? t.accent : t.text3, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{m}</button>)}</div><Card t={t} style={{ padding: 0, overflow: "hidden" }}><Table t={t} cols={["ID", "User", "Role", "Action", "Module", "Details", "Time"]} rows={fil.map(l => [<span style={{ fontSize: 10, fontFamily: "monospace", color: t.text3 }}>{l.id}</span>, l.user, <Badge t={t} text={l.role} color={{ admin: "red", manager: "yellow", cashier: "green", customer: "blue", system: "purple" }[l.role] || "blue"} />, <Badge t={t} text={l.action} color="blue" />, l.module, <span style={{ fontSize: 12 }}>{l.details}</span>, <span style={{ fontSize: 10, fontFamily: "monospace", color: t.text3 }}>{l.timestamp}</span>])} /></Card></>);
  };

  const SettingsSection = ({ settings, setSettings, addAudit, currentUser, darkMode, setDarkMode, t }) => {
    const [form, setForm] = useState({ ...settings });
    const [saved, setSaved] = useState(false);

    const sections = [
      { title: "Store Info", fields: [["Store Name", "storeName"], ["Address", "storeAddress"], ["Phone", "storePhone"], ["Email", "storeEmail"]] },
      { title: "Financial", fields: [["Currency Symbol", "sym"], ["VAT Rate (%)", "vatRate", "number"], ["Loyalty Rate (pts/£)", "loyaltyRate", "number"], ["Point Value (£/pt)", "loyaltyValue", "number"]] },
      { title: "Receipt", fields: [["Footer Text", "receiptFooter"], ["Return Days", "returnDays", "number"]] },
    ];

    return mkSection("System Settings", (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(340px,100%),1fr))", gap: 16 }}>
          {sections.map(({ title, fields }) => (
            <Card t={t} key={title}>
              <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>{title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {fields.map(([label, key, type]) => (
                  <Input
                    key={key}
                    t={t}
                    label={label}
                    value={form[key] || ""}
                    onChange={v => setForm(f => ({ ...f, [key]: type === "number" ? +v : v }))}
                    type={type || "text"}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
        <Card t={t}>
          <div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 14 }}>Appearance</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: t.text3 }}>Switch interface theme</div>
            </div>
            <Toggle t={t} value={darkMode} onChange={setDarkMode} />
          </div>
        </Card>
        <Btn
          t={t}
          size="lg"
          onClick={() => {
            setSettings(form);
            addAudit(currentUser, "Settings Updated", "Settings", "Settings saved");
            notify("Settings saved!", "success");
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          {saved ? "✓ Saved!" : "Save Settings"}
        </Btn>
      </>
    ));
  };

  const renderSection = () => {
    if (!currentUser) return <div style={{ padding: 40, color: t.text3, textAlign: "center" }}>Loading...</div>;
    const p = commonP;
    if (section === "profile") return <ProfilePage user={currentUser} users={users} setUsers={setUsers} orders={orders} returns={returns} addAudit={addAudit} t={t} banners={banners} />;
    const map = {
      // Admin
      dashboard: { admin: <AdminDash orders={orders} users={users} t={t} />, manager: <ManagerDash orders={orders} products={products} users={users} counters={counters} t={t} />, customer: (() => { const myO = orders.filter(o => o.customerId === currentUser.id); return mkSection("My Account", <><BannerCarousel banners={banners} header={`Today's Offers`} t={t} /><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(180px,45vw),1fr))", gap: 14 }}><StatCard t={t} title="Orders" value={myO.length} color={t.blue} icon="🧾" /><StatCard t={t} title="Total Spent" value={fmt(currentUser.totalSpent || 0)} color={t.accent} icon="💰" /><StatCard t={t} title="Loyalty Pts" value={`⭐${currentUser.loyaltyPoints || 0}`} sub={`= ${fmt((currentUser.loyaltyPoints || 0) * 0.01)}`} color={t.yellow} icon="⭐" /></div><Card t={t}><div style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 12 }}>Loyalty Program</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>{[["Earn", "1pt per £1", "🛒"], ["Value", "1pt = £0.01", "💰"], ["Redeem", "At checkout", "✅"]].map(([k, v, i]) => <div key={k} style={{ background: t.yellowBg, border: `1px solid ${t.yellowBorder}`, borderRadius: 10, padding: 12, textAlign: "center" }}><div style={{ fontSize: 20 }}>{i}</div><div style={{ fontSize: 12, fontWeight: 800, color: t.text, marginTop: 4 }}>{k}</div><div style={{ fontSize: 11, color: t.yellow }}>{v}</div></div>)}</div></Card></>) })() }[currentUser.role],
      users: <UserManagement users={users} t={t} />,
      audit: <AuditLogs auditLogs={auditLogs} t={t} />,
      banners: <BannerManagement {...commonP} />,
      coupons: <CouponManagement {...commonP} />,
      zreport: <ZReport orders={orders} t={t} />,
      settings: <SettingsSection settings={settings} setSettings={setSettings} addAudit={addAudit} currentUser={currentUser} darkMode={darkMode} setDarkMode={setDarkMode} t={t} />,
      // Manager
      products: <ProductManagement products={products} setProducts={setProducts} addAudit={addAudit} currentUser={currentUser} t={t} />,
      inventory: <InventoryManagement products={products} setProducts={setProducts} addAudit={addAudit} currentUser={currentUser} t={t} />,
      staff: <StaffManagement users={users} setUsers={setUsers} counters={counters} addAudit={addAudit} currentUser={currentUser} t={t} />,
      cashiers: <CashierManagement users={users} setUsers={setUsers} counters={counters} orders={orders} addAudit={addAudit} currentUser={currentUser} t={t} />,
      counters: <CounterManagement counters={counters} setCounters={setCounters} orders={orders} addAudit={addAudit} currentUser={currentUser} t={t} />,
      returns: currentUser.role === "manager" ? <ReturnManagement returns={returns} setReturns={setReturns} products={products} setProducts={setProducts} addAudit={addAudit} currentUser={currentUser} t={t} /> : <CustomerReturns orders={orders} returns={returns} setReturns={setReturns} user={currentUser} addAudit={addAudit} t={t} />,
      reports: <Reports orders={orders} users={users} t={t} />,
      // Cashier
      pos: <POSTerminal {...commonP} />,
      orders: <CashierOrders orders={orders} setOrders={setOrders} user={currentUser} t={t} />,
      hardware: <HardwarePanel addAudit={addAudit} user={currentUser} t={t} />,
      // Customer
      shop: <CustomerShop products={products} orders={orders} setOrders={setOrders} users={users} setUsers={setUsers} currentUser={currentUser} banners={banners} coupons={coupons} settings={settings} t={t} addGlobalNotif={addGlobalNotif} initialCat={pendingOfferCat} onCatConsumed={()=>setPendingOfferCat(null)} initialCart={pendingGuestCart} />,
      history: <CustomerOrderHistory orders={orders} user={currentUser} t={t} />,
      tracking: <CustomerTracking orders={orders} user={currentUser} t={t} />,
      // Admin/Manager new
      customers: <AdminCustomerManagement users={users} orders={orders} t={t} />,
      analytics: <AdminAnalytics orders={orders} products={products} t={t} />,
      pickup: <PickupOrdersPanel orders={orders} setOrders={setOrders} addAudit={addAudit} user={currentUser} t={t} />,
      staffdash: <StaffDashboard orders={orders} setOrders={setOrders} products={products} users={users} addAudit={addAudit} currentUser={currentUser} t={t} />,
    };
    return map[section] || <div style={{ color: t.text3, padding: 40, textAlign: "center" }}>Section coming soon</div>;
  };

  // Inline components used in renderSection
  const ProductManagement = ({ products, setProducts, addAudit, currentUser, t }) => {
    const [search, setSearch] = useState(""); const [cat, setCat] = useState("All"); const [showForm, setShowForm] = useState(false); const [editP, setEditP] = useState(null);
    const empty = { name: "", sku: "", category: "Jerseys", price: "", stock: "", emoji: "⚽", description: "", image: "", discount: 0 }; const [form, setForm] = useState(empty);
    const [showBulkImport, setShowBulkImport] = useState(false); const [bulkData, setBulkData] = useState(""); const [importErrors, setImportErrors] = useState([]);
    const fil = products.filter(p => (cat === "All" || p.category === cat) && (p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase())));
    const save = () => { if (editP) { setProducts(ps => ps.map(p => p.id === editP.id ? { ...p, ...form, price: +form.price, stock: +form.stock, discount: +(form.discount||0) } : p)); notify("Product updated!", "success"); } else { setProducts(ps => [...ps, { id: Date.now(), ...form, price: +form.price, stock: +form.stock, discount: +(form.discount||0) }]); notify("Product added!", "success"); } addAudit(currentUser, editP ? "Product Updated" : "Product Created", "Inventory", form.name); setShowForm(false); setEditP(null); setForm(empty); };
    
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setForm(f => ({ ...f, image: e.target.result }));
        reader.readAsDataURL(file);
      }
    };

    const bulkImport = () => {
      const lines = bulkData.trim().split('\n');
      const errors = [];
      const newProducts = [];
      
      lines.forEach((line, idx) => {
        const parts = line.split(',');
        if (parts.length < 5) {
          errors.push(`Line ${idx + 1}: Invalid format. Expected: Name,SKU,Category,Price,Stock[,Description]`);
          return;
        }
        const [name, sku, category, priceStr, stockStr, ...descParts] = parts;
        const price = parseFloat(priceStr);
        const stock = parseInt(stockStr);
        
        if (!name || isNaN(price) || isNaN(stock)) {
          errors.push(`Line ${idx + 1}: Invalid data - Name: "${name}", Price: "${priceStr}", Stock: "${stockStr}"`);
          return;
        }
        
        if (!CATEGORIES.includes(category)) {
          errors.push(`Line ${idx + 1}: Invalid category "${category}". Valid: ${CATEGORIES.filter(c => c !== "All").join(', ')}`);
          return;
        }
        
        newProducts.push({
          id: Date.now() + idx,
          name: name.trim(),
          sku: sku.trim(),
          category: category.trim(),
          price,
          stock,
          emoji: "📦",
          description: descParts.join(',').trim() || "",
          image: ""
        });
      });
      
      if (errors.length > 0) {
        setImportErrors(errors);
        return;
      }
      
      setProducts(ps => [...ps, ...newProducts]);
      addAudit(currentUser, "Bulk Import", "Inventory", `${newProducts.length} products imported`);
      notify(`${newProducts.length} products imported!`, "success");
      setShowBulkImport(false);
      setBulkData("");
      setImportErrors([]);
    };

    return mkSection("Product Management", <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ flex: 1, minWidth: 180, background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: "9px 14px", color: t.text, fontSize: 13, outline: "none" }} />
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{CATEGORIES.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding: "7px 13px", borderRadius: 20, border: `1px solid ${cat === c ? t.accent : t.border}`, background: cat === c ? t.accent + "15" : "transparent", color: cat === c ? t.accent : t.text3, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{c}</button>)}</div>
        <Btn t={t} onClick={() => { setEditP(null); setForm(empty); setShowForm(true); }}>+ Add</Btn>
        <Btn t={t} variant="secondary" onClick={() => setShowBulkImport(true)}>📤 Bulk Import</Btn>
      </div>
      <Card t={t} style={{ padding: 0, overflow: "hidden" }}><Table t={t} cols={["", "Name", "SKU", "Category", "Price", "Disc%", "Stock", "Actions"]} rows={fil.map(p => [<div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden" }}><ImgWithFallback src={p.image || PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>, <span style={{ fontWeight: 700, color: t.text }}>{p.name}</span>, <span style={{ fontSize: 10, fontFamily: "monospace", color: t.text3 }}>{p.sku}</span>, <Badge t={t} text={p.category} color="blue" />, <span style={{ fontWeight: 800, color: t.green }}>{fmt(p.price)}</span>, <span style={{fontWeight:700,color:(p.discount||0)>0?t.accent:t.text3}}>{(p.discount||0)>0?"-"+(p.discount)+"%":"—"}</span>, <Badge t={t} text={String(p.stock)} color={p.stock < 10 ? "red" : p.stock < 20 ? "yellow" : "green"} />, <div style={{ display: "flex", gap: 5 }}><Btn t={t} variant="secondary" size="sm" onClick={() => { setEditP(p); setForm({ name: p.name, sku: p.sku || "", category: p.category, price: p.price, stock: p.stock, emoji: p.emoji, description: p.description || "", image: p.image || "", discount: p.discount || 0 }); setShowForm(true); }}>Edit</Btn><Btn t={t} variant="danger" size="sm" onClick={() => { setProducts(ps => ps.filter(x => x.id !== p.id)); notify("Deleted", "warning"); }}>Del</Btn></div>])} /></Card>
      {showForm && <Modal t={t} title={editP ? "Edit Product" : "Add Product"} onClose={() => { setShowForm(false); setEditP(null); }}><div style={{ display: "flex", flexDirection: "column", gap: 13 }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}><Input t={t} label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required /><Input t={t} label="SKU" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} /><Input t={t} label="Price (£)" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" required /><Input t={t} label="Stock" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} type="number" required /></div><Select t={t} label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={CATEGORIES.filter(c => c !== "All").map(c => ({ value: c, label: c }))} /><Input t={t} label="Emoji" value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} /><Input t={t} label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
              <Input t={t} label="Discount %" value={form.discount||0} onChange={v => setForm(f => ({ ...f, discount: Math.min(100,Math.max(0,+v)) }))} type="number" note="Set % discount on this product (0 = no discount). Applies on landing page, shop & POS."/><div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={{ fontSize: 11, color: t.text3, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7 }}>Product Image</label><input type="file" accept="image/*" onChange={handleImageUpload} style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 14px", color: t.text, fontSize: 13, outline: "none" }} />{form.image && <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: `1px solid ${t.border}` }}><img src={form.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}</div><Btn t={t} onClick={save} disabled={!form.name || !form.price}>{editP ? "Update" : "Add Product"}</Btn></div></Modal>}
      {showBulkImport && <Modal t={t} title="Bulk Import Products" subtitle="CSV format: Name,SKU,Category,Price,Stock[,Description]" onClose={() => { setShowBulkImport(false); setBulkData(""); setImportErrors([]); }}><div style={{ display: "flex", flexDirection: "column", gap: 13 }}><textarea value={bulkData} onChange={e => setBulkData(e.target.value)} placeholder={`Home Jersey 2024,JRS-HOME-24,Jerseys,89.99,45,Official 2024 home kit\nAway Jersey 2024,JRS-AWAY-24,Jerseys,89.99,32,Official 2024 away kit`} style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 9, padding: "12px 14px", color: t.text, fontSize: 13, outline: "none", minHeight: 120, fontFamily: "monospace" }} /><div style={{ fontSize: 12, color: t.text3 }}>Enter one product per line. Categories: {CATEGORIES.filter(c => c !== "All").join(', ')}</div>{importErrors.length > 0 && <div style={{ background: t.redBg, border: `1px solid ${t.redBorder}`, borderRadius: 9, padding: "10px 14px", fontSize: 12, color: t.red }}>{importErrors.map((err, i) => <div key={i}>• {err}</div>)}</div>}<Btn t={t} onClick={bulkImport} disabled={!bulkData.trim()}>📤 Import Products</Btn></div></Modal>}
    </>);
  };

  const InventoryManagement = ({ products, setProducts, addAudit, currentUser, t }) => {
    const [editStock, setEditStock] = useState(null); const [ns, setNs] = useState(""); const [addQ, setAddQ] = useState("");
    return mkSection("Inventory", <><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(180px,45vw),1fr))", gap: 14 }}><StatCard t={t} title="Products" value={products.length} color={t.blue} icon="📦" /><StatCard t={t} title="Total Units" value={products.reduce((s, p) => s + p.stock, 0)} color={t.green} icon="🔢" /><StatCard t={t} title="Low Stock" value={products.filter(p => p.stock < 15 && p.stock > 0).length} color={t.yellow} icon="⚠️" /><StatCard t={t} title="Out of Stock" value={products.filter(p => p.stock === 0).length} color={t.red} icon="❌" /></div><Card t={t} style={{ padding: 0, overflow: "hidden" }}><Table t={t} cols={["Product", "SKU", "Stock", "Status", "Action"]} rows={products.map(p => [<div style={{ display: "flex", alignItems: "center", gap: 8 }}><ImgWithFallback src={PRODUCT_IMAGES[p.name]} alt={p.name} emoji={p.emoji} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} /><span style={{ fontWeight: 600, color: t.text }}>{p.name}</span></div>, <span style={{ fontSize: 10, fontFamily: "monospace", color: t.text3 }}>{p.sku}</span>, <span style={{ fontWeight: 900, fontSize: 15, color: p.stock === 0 ? t.red : p.stock < 10 ? t.yellow : t.green }}>{p.stock}</span>, <Badge t={t} text={p.stock === 0 ? "Out" : p.stock < 10 ? "Critical" : p.stock < 20 ? "Low" : "Good"} color={p.stock === 0 ? "red" : p.stock < 10 ? "red" : p.stock < 20 ? "yellow" : "green"} />, <Btn t={t} variant="secondary" size="sm" onClick={() => { setEditStock(p); setNs(String(p.stock)); setAddQ(""); }}>Update</Btn>])} /></Card>
      {editStock && <Modal t={t} title={`Update Stock: ${editStock.name}`} onClose={() => setEditStock(null)}><div style={{ display: "flex", flexDirection: "column", gap: 14 }}><div style={{ background: t.bg3, padding: "12px 16px", borderRadius: 8, fontSize: 13 }}>Current: <strong style={{ color: t.text }}>{editStock.stock} units</strong></div><Input t={t} label="Set Exact Stock" value={ns} onChange={setNs} type="number" /><Input t={t} label="Or Add/Remove (+/-)" value={addQ} onChange={setAddQ} placeholder="e.g. +20 or -5" /><Btn t={t} onClick={() => { const q = Math.max(0, ns !== "" ? +ns : editStock.stock + (+addQ || 0)); setProducts(ps => ps.map(p => p.id === editStock.id ? { ...p, stock: q } : p)); addAudit(currentUser, "Stock Updated", "Inventory", `${editStock.name} → ${q}`); notify(`Stock updated to ${q}`, "success"); setEditStock(null); }}>Save</Btn></div></Modal>}
    </>);
  };

  const StaffManagement = ({ users, setUsers, counters, addAudit, currentUser, t }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [editStaff, setEditStaff] = useState(null);
    const [form, setForm] = useState({ name:"", email:"", phone:"", password:"staff123", role:"cashier", counter: counters[0]?.name||"" });
    const allStaff = users.filter(u => u.role==="cashier" || u.role==="staff");

    const resetForm = () => { setForm({name:"",email:"",phone:"",password:"staff123",role:"cashier",counter:counters[0]?.name||""}); setEditStaff(null); };
    const save = () => {
      if(editStaff){
        setUsers(us=>us.map(u=>u.id===editStaff.id?{...u,...form}:u));
        addAudit(currentUser,"Staff Updated","Staff",form.name);
        notify(form.name+" updated!","success");
      } else {
        const s={id:Date.now(),...form,avatar:form.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2),active:true,joinDate:ts(),loyaltyPoints:0,tier:"N/A"};
        setUsers(us=>[...us,s]);
        addAudit(currentUser,"Staff Added","Staff",form.name+" ("+form.role+") at "+form.counter);
        notify(form.name+" added!","success");
      }
      setShowAdd(false); resetForm();
    };
    const remove = (s) => { setUsers(us=>us.filter(u=>u.id!==s.id)); addAudit(currentUser,"Staff Removed","Staff",s.name); notify(s.name+" removed","warning"); };
    const toggle = (s) => { setUsers(us=>us.map(u=>u.id===s.id?{...u,active:!u.active}:u)); notify(s.name+" "+(s.active?"deactivated":"activated"),"info"); };

    const roleC = {cashier:t.green, staff:t.teal};
    return mkSection("Staff Management", <>
      <div style={{display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:10}}>
          <StatCard t={t} title="Total Staff" value={allStaff.length} color={t.blue} icon="👥"/>
          <StatCard t={t} title="Cashiers" value={allStaff.filter(s=>s.role==="cashier").length} color={t.green} icon="🛒"/>
          <StatCard t={t} title="Staff" value={allStaff.filter(s=>s.role==="staff").length} color={t.teal} icon="🖥️"/>
        </div>
        <Btn t={t} onClick={()=>{resetForm();setShowAdd(true);}}>+ Add Staff</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(260px,90vw),1fr))",gap:14}}>
        {allStaff.map(s=>(
          <Card t={t} key={s.id} style={{borderTop:`4px solid ${roleC[s.role]||t.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:44,height:44,background:(roleC[s.role]||t.accent)+"20",border:`2px solid ${(roleC[s.role]||t.accent)}40`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:roleC[s.role]||t.accent}}>{s.avatar}</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:t.text}}>{s.name}</div>
                <div style={{display:"flex",gap:6,marginTop:3}}><Badge t={t} text={s.role} color={s.role==="cashier"?"green":"teal"}/><Badge t={t} text={s.active?"Active":"Inactive"} color={s.active?"green":"red"}/></div>
              </div>
            </div>
            {[["Email",s.email],["Phone",s.phone||"—"],["Counter",s.counter||"Unassigned"],["Joined",s.joinDate||"—"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}><span style={{color:t.text3}}>{k}</span><span style={{color:t.text,fontWeight:600}}>{v}</span></div>
            ))}
            <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>
              <Btn t={t} variant="secondary" size="sm" onClick={()=>{setEditStaff(s);setForm({name:s.name,email:s.email,phone:s.phone||"",password:s.password||"",role:s.role,counter:s.counter||""});setShowAdd(true);}}>✏️ Edit</Btn>
              <Btn t={t} variant={s.active?"danger":"success"} size="sm" onClick={()=>toggle(s)}>{s.active?"Deactivate":"Activate"}</Btn>
              <Btn t={t} variant="ghost" size="sm" onClick={()=>remove(s)}>🗑</Btn>
            </div>
          </Card>
        ))}
        {allStaff.length===0&&<Card t={t}><div style={{textAlign:"center",padding:30,color:t.text3}}>No staff added yet. Click + Add Staff to get started.</div></Card>}
      </div>
      {showAdd&&(
        <Modal t={t} title={editStaff?"Edit Staff Member":"Add Staff Member"} onClose={()=>{setShowAdd(false);resetForm();}}>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
              <Input t={t} label="Full Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/>
              <Input t={t} label="Email" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} required/>
              <Input t={t} label="Phone" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))}/>
              <Input t={t} label="Password" value={form.password} onChange={v=>setForm(f=>({...f,password:v}))} type="password"/>
            </div>
            <Select t={t} label="Role" value={form.role} onChange={v=>setForm(f=>({...f,role:v}))} options={[{value:"cashier",label:"Cashier — POS access"},{value:"staff",label:"Staff — Order management"}]}/>
            <Select t={t} label="Assigned Counter" value={form.counter} onChange={v=>setForm(f=>({...f,counter:v}))} options={[{value:"",label:"— Unassigned —"},...counters.filter(c=>c.active).map(c=>({value:c.name,label:`${c.name} — ${c.location}`}))]}/>
            <Btn t={t} onClick={save} disabled={!form.name||!form.email}>{editStaff?"Update Staff":"Add Staff Member"}</Btn>
          </div>
        </Modal>
      )}
    </>);
  };

    const CashierManagement = ({ users, setUsers, counters, orders, addAudit, currentUser, t }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [editC, setEditC] = useState(null);
    const [form, setForm] = useState({name:"",email:"",phone:"",password:"cash123",counter:counters[0]?.name||""});
    const cashiers = users.filter(u=>u.role==="cashier");
    const resetForm = () => { setForm({name:"",email:"",phone:"",password:"cash123",counter:counters[0]?.name||""}); setEditC(null); };
    const save = () => {
      if(editC){
        setUsers(us=>us.map(u=>u.id===editC.id?{...u,...form}:u));
        addAudit(currentUser,"Cashier Updated","Staff",form.name);
        notify(form.name+" updated!","success");
      } else {
        const c2={id:Date.now(),...form,role:"cashier",avatar:form.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2),active:true,joinDate:ts(),loyaltyPoints:0,tier:"N/A"};
        setUsers(us=>[...us,c2]);
        addAudit(currentUser,"Cashier Added","Staff",form.name+" at "+form.counter);
        notify(form.name+" added as cashier!","success");
      }
      setShowAdd(false); resetForm();
    };
    const remove = (c2) => { setUsers(us=>us.filter(u=>u.id!==c2.id)); addAudit(currentUser,"Cashier Removed","Staff",c2.name); notify(c2.name+" removed","warning"); };
    const toggle = (c2) => { setUsers(us=>us.map(u=>u.id===c2.id?{...u,active:!u.active}:u)); notify(c2.name+" "+(c2.active?"deactivated":"activated"),"info"); };

    return mkSection("Cashier Management", <>
      <div style={{display:"flex",gap:12,justifyContent:"space-between",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(150px,45vw),1fr))",gap:12,flex:1}}>
          <StatCard t={t} title="Total Cashiers" value={cashiers.length} color={t.green} icon="🛒"/>
          <StatCard t={t} title="Active" value={cashiers.filter(c=>c.active).length} color={t.blue} icon="✅"/>
          <StatCard t={t} title="Inactive" value={cashiers.filter(c=>!c.active).length} color={t.red} icon="⏸️"/>
        </div>
        <Btn t={t} onClick={()=>{resetForm();setShowAdd(true);}}>+ Add Cashier</Btn>
      </div>
      <Card t={t} style={{padding:0,overflow:"hidden"}}>
        <Table t={t}
          cols={["Cashier","Email","Counter","Orders","Revenue","Status","Actions"]}
          rows={cashiers.map(c2=>{
            const myOrds = orders.filter(o=>o.cashierId===c2.id);
            const rev = myOrds.reduce((s,o)=>s+o.total,0);
            return [
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,background:t.green+"20",border:`2px solid ${t.green}40`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:t.green}}>{c2.avatar}</div>
                <span style={{fontWeight:700,color:t.text}}>{c2.name}</span>
              </div>,
              <span style={{fontSize:12,color:t.text3}}>{c2.email}</span>,
              <span style={{fontSize:12,color:t.text2}}>{c2.counter||"—"}</span>,
              <span style={{fontWeight:700,color:t.blue}}>{myOrds.length}</span>,
              <span style={{fontWeight:700,color:t.accent}}>{fmt(rev)}</span>,
              <Badge t={t} text={c2.active?"Active":"Inactive"} color={c2.active?"green":"red"}/>,
              <div style={{display:"flex",gap:5}}>
                <Btn t={t} variant="secondary" size="sm" onClick={()=>{setEditC(c2);setForm({name:c2.name,email:c2.email,phone:c2.phone||"",password:c2.password||"",counter:c2.counter||""});setShowAdd(true);}}>Edit</Btn>
                <Btn t={t} variant={c2.active?"danger":"success"} size="sm" onClick={()=>toggle(c2)}>{c2.active?"Off":"On"}</Btn>
                <Btn t={t} variant="ghost" size="sm" onClick={()=>remove(c2)}>🗑</Btn>
              </div>
            ];
          })}
          empty="No cashiers added yet"
        />
      </Card>
      {showAdd&&(
        <Modal t={t} title={editC?"Edit Cashier":"Add New Cashier"} onClose={()=>{setShowAdd(false);resetForm();}}>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
              <Input t={t} label="Full Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/>
              <Input t={t} label="Email" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} required/>
              <Input t={t} label="Phone" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))}/>
              <Input t={t} label="Password" value={form.password} onChange={v=>setForm(f=>({...f,password:v}))} type="password"/>
            </div>
            <Select t={t} label="Assigned Counter" value={form.counter} onChange={v=>setForm(f=>({...f,counter:v}))} options={[{value:"",label:"— Unassigned —"},...counters.filter(c=>c.active).map(c=>({value:c.name,label:`${c.name} — ${c.location}`}))]}/>
            <div style={{background:t.blueBg,border:`1px solid ${t.blueBorder}`,borderRadius:9,padding:"10px 14px",fontSize:12,color:t.blue}}>
              ℹ️ Cashier will be able to login with their email and password to access the POS Terminal.
            </div>
            <Btn t={t} onClick={save} disabled={!form.name||!form.email}>{editC?"Update Cashier":"Add Cashier"}</Btn>
          </div>
        </Modal>
      )}
    </>);
  };

    const CounterManagement = ({ counters, setCounters, orders, addAudit, currentUser, t }) => {
    const [showAdd, setShowAdd] = useState(false); const [form, setForm] = useState({ name: "", location: "" });
    return mkSection("Counter Management", <><div style={{ display: "flex", justifyContent: "flex-end" }}><Btn t={t} onClick={() => setShowAdd(true)}>+ Add Counter</Btn></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(260px,90vw),1fr))", gap: 14 }}>{counters.map(c => { const rev = orders.filter(o => o.counter === c.name).reduce((s, o) => s + o.total, 0); const cnt = orders.filter(o => o.counter === c.name).length; return <Card t={t} key={c.id} style={{ borderTop: `4px solid ${c.active ? t.green : t.border}` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div><div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>🏪 {c.name}</div><div style={{ fontSize: 12, color: t.text3 }}>📍{c.location}</div></div><Badge t={t} text={c.active ? "Active" : "Off"} color={c.active ? "green" : "red"} /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>{[["Revenue", fmt(rev), t.accent], ["Orders", cnt, t.blue]].map(([k, v, col]) => <div key={k} style={{ background: t.bg3, borderRadius: 8, padding: "8px 12px", textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 900, color: col }}>{v}</div><div style={{ fontSize: 10, color: t.text3 }}>{k}</div></div>)}</div><Btn t={t} variant={c.active ? "danger" : "success"} size="sm" fullWidth onClick={() => { setCounters(cs => cs.map(x => x.id === c.id ? { ...x, active: !x.active } : x)); notify(`Counter ${c.name} ${c.active ? "deactivated" : "activated"}`, "info"); }}>{c.active ? "Deactivate" : "Activate"}</Btn></Card>; })}</div>
      {showAdd && <Modal t={t} title="Add Counter" onClose={() => setShowAdd(false)}><div style={{ display: "flex", flexDirection: "column", gap: 13 }}><Input t={t} label="Counter Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Counter 4" required /><Input t={t} label="Location" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="e.g. North Entrance" required /><Btn t={t} onClick={() => { setCounters(cs => [...cs, { id: `c${Date.now()}`, ...form, active: true }]); addAudit(currentUser, "Counter Added", "Counters", form.name); notify(`Counter ${form.name} added!`, "success"); setShowAdd(false); setForm({ name: "", location: "" }); }} disabled={!form.name}>Add Counter</Btn></div></Modal>}
    </>);
  };

  const ReturnManagement = ({ returns, setReturns, products, setProducts, addAudit, currentUser, t }) => {
    const approve = (r) => { setReturns(rs => rs.map(x => x.id === r.id ? { ...x, status: "approved" } : x)); setProducts(ps => ps.map(p => p.id === r.productId ? { ...p, stock: p.stock + r.qty } : p)); addAudit(currentUser, "Refund Approved", "Returns", `${r.id} — £${r.refundAmount}`); notify(`Refund approved for ${r.productName}`, "success"); };
    const reject = (r) => { setReturns(rs => rs.map(x => x.id === r.id ? { ...x, status: "rejected" } : x)); notify("Return rejected", "warning"); };
    return mkSection("Returns & Refunds", <><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(180px,45vw),1fr))", gap: 14 }}><StatCard t={t} title="Pending" value={returns.filter(r => r.status === "pending").length} color={t.yellow} icon="⏳" /><StatCard t={t} title="Approved" value={returns.filter(r => r.status === "approved").length} color={t.green} icon="✅" /><StatCard t={t} title="Refunded" value={fmt(returns.filter(r => r.status === "approved").reduce((s, r) => s + r.refundAmount, 0))} color={t.accent} icon="💸" /></div><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{returns.map(r => <Card t={t} key={r.id}><div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}><div><div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}><span style={{ fontWeight: 800, color: t.text }}>{r.id}</span><Badge t={t} text={r.status} color={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "yellow"} /><Badge t={t} text={r.type + " refund"} color="blue" /></div><div style={{ fontSize: 13, color: t.text2 }}>👤 {r.customerName} · {r.orderId}</div><div style={{ fontSize: 13, color: t.text2 }}>📦 {r.productName} × {r.qty}</div><div style={{ fontSize: 12, color: t.text3 }}>Reason: {r.reason}</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 900, color: t.accent }}>{fmt(r.refundAmount)}</div>{r.status === "pending" && <div style={{ display: "flex", gap: 8, marginTop: 8 }}><Btn t={t} variant="success" size="sm" onClick={() => approve(r)}>✓ Approve</Btn><Btn t={t} variant="danger" size="sm" onClick={() => reject(r)}>✕ Reject</Btn></div>}</div></div></Card>)}</div></>);
  };

  const CashierOrders = ({ orders, setOrders, user, t }) => {
    const my = orders.filter(o => o.cashierId === user.id);
    const [pickupModal, setPickupModal] = useState(null);
    const [trackModal, setTrackModal] = useState(null);
    const DELIVERY_STATUSES = ["pending", "processing", "dispatched", "out-for-delivery", "delivered"];
    return mkSection("My Orders", <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(180px,45vw),1fr))", gap: 14 }}>
        <StatCard t={t} title="Orders" value={my.length} color={t.green} icon="🧾" />
        <StatCard t={t} title="Revenue" value={fmt(my.reduce((s, o) => s + o.total, 0))} color={t.accent} icon="💰" />
        <StatCard t={t} title="Deliveries" value={my.filter(o => o.orderType === "delivery").length} color={t.teal} icon="🚚" />
        <StatCard t={t} title="Pickups" value={my.filter(o => o.orderType === "pickup").length} color={t.blue} icon="📦" />
      </div>
      <Card t={t} style={{ padding: 0, overflow: "hidden" }}>
        <Table t={t} cols={["Order", "Customer", "Type", "Total", "Payment", "Status", "Actions"]} rows={my.map(o => [
          o.id,
          o.customerName,
          <Badge t={t} text={o.orderType || "in-store"} color={o.orderType === "delivery" ? "teal" : o.orderType === "pickup" ? "blue" : "green"} />,
          fmt(o.total),
          o.payment,
          <Badge t={t} text={o.status} color={o.status === "completed" ? "green" : "red"} />,
          <div style={{ display: "flex", gap: 5 }}>
            {o.orderType === "pickup" && o.status === "completed" && (
              <Btn t={t} variant="secondary" size="sm" onClick={() => setPickupModal(o)}>📦 Pickup</Btn>
            )}
            {o.orderType === "delivery" && (
              <Btn t={t} variant="secondary" size="sm" onClick={() => setTrackModal(o)}>🚚 Track</Btn>
            )}
          </div>
        ])} empty="No orders yet" />
      </Card>
      {pickupModal && (
        <Modal t={t} title="Confirm Pickup" subtitle={`Order ${pickupModal.id}`} onClose={() => setPickupModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: t.blueBg, border: `1px solid ${t.blueBorder}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, color: t.blue, fontWeight: 700 }}>👤 {pickupModal.customerName}</div>
              <div style={{ fontSize: 12, color: t.text3, marginTop: 4 }}>Scheduled: {pickupModal.pickupDate || "No date set"}</div>
              <div style={{ fontSize: 12, color: t.text3 }}>Items: {pickupModal.items.map(i => `${i.name} ×${i.qty}`).join(", ")}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: t.accent, marginTop: 6 }}>{fmt(pickupModal.total)}</div>
            </div>
            <Btn t={t} variant="success" fullWidth onClick={() => { addAudit(user, "Pickup Confirmed", "Orders", `${pickupModal.id} collected by ${pickupModal.customerName}`); notify(`Pickup confirmed for ${pickupModal.customerName}`, "success"); setPickupModal(null); }}>✓ Confirm Collected</Btn>
            <Btn t={t} variant="ghost" fullWidth onClick={() => setPickupModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
      {trackModal && (
        <Modal t={t} title="Update Delivery Status" subtitle={`Order ${trackModal.id} · ${trackModal.customerName}`} onClose={() => setTrackModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: t.tealBg, border: `1px solid ${t.tealBorder}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: t.teal }}>
              📍 {trackModal.deliveryAddress || "No address"}<br/>
              <span style={{ fontWeight: 700 }}>Current: {trackModal.deliveryStatus || "pending"}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DELIVERY_STATUSES.map(s => (
                <button key={s} onClick={() => { setOrders(os => os.map(o => o.id === trackModal.id ? { ...o, deliveryStatus: s } : o)); addAudit(user, "Delivery Updated", "Orders", `${trackModal.id} → ${s}`); notify(`Status updated to ${s}`, "success"); setTrackModal(null); }}
                  style={{ padding: "10px 14px", borderRadius: 9, border: `1px solid ${trackModal.deliveryStatus === s ? t.teal : t.border}`, background: trackModal.deliveryStatus === s ? t.tealBg : t.bg3, color: trackModal.deliveryStatus === s ? t.teal : t.text2, fontSize: 13, fontWeight: trackModal.deliveryStatus === s ? 800 : 500, cursor: "pointer", textAlign: "left", textTransform: "capitalize" }}>
                  {trackModal.deliveryStatus === s ? "✓ " : ""}{s.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>);
  };

  const HardwarePanel = ({ addAudit, user, t }) => {
    const [devs, setDevs] = useState([{ id: "scan", name: "Barcode Scanner", type: "Input", status: "connected", icon: "📷", serial: "BS-2024-001" }, { id: "print", name: "Receipt Printer", type: "Output", status: "connected", icon: "🖨️", serial: "RP-2024-002" }, { id: "card", name: "Card Terminal", type: "I/O", status: "connected", icon: "💳", serial: "CT-2024-003" }]);
    const [test, setTest] = useState({});
    return mkSection("Hardware", <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(260px,90vw),1fr))", gap: 14 }}>{devs.map(d => <Card t={t} key={d.id} style={{ borderTop: `4px solid ${d.status === "connected" ? t.green : t.border}` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><div style={{ display: "flex", gap: 10 }}><div style={{ width: 42, height: 42, background: d.status === "connected" ? t.greenBg : t.bg3, border: `1px solid ${d.status === "connected" ? t.greenBorder : t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{d.icon}</div><div><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{d.name}</div><div style={{ fontSize: 11, color: t.text3 }}>{d.type} · {d.serial}</div></div></div><Badge t={t} text={d.status} color={d.status === "connected" ? "green" : "red"} /></div><div style={{ display: "flex", gap: 8 }}><Btn t={t} variant={d.status === "connected" ? "danger" : "success"} size="sm" style={{ flex: 1 }} onClick={() => { setDevs(ds => ds.map(x => { if (x.id !== d.id) return x; const s = x.status === "connected" ? "disconnected" : "connected"; addAudit(user, `Device ${s}`, "Hardware", x.name); notify(`${x.name} ${s}`, s === "connected" ? "success" : "warning"); return { ...x, status: s }; })); }}>{d.status === "connected" ? "Disconnect" : "Connect"}</Btn><Btn t={t} variant="secondary" size="sm" style={{ flex: 1 }} disabled={d.status !== "connected" || test[d.id] === "testing"} onClick={() => { setTest(x => ({ ...x, [d.id]: "testing" })); setTimeout(() => { setTest(x => ({ ...x, [d.id]: "pass" })); notify(`${d.name} test passed!`, "success"); setTimeout(() => setTest(x => ({ ...x, [d.id]: null })), 2000); }, 1200); }}>{test[d.id] === "testing" ? "Testing..." : test[d.id] === "pass" ? "✓ Pass" : "Test"}</Btn></div></Card>)}</div>);
  };

  const CustomerHistory = ({ orders, user, t }) => {
    const my = orders.filter(o => o.customerId === user.id);
    return mkSection("Purchase History", <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{my.length === 0 ? <Card t={t}><div style={{ textAlign: "center", padding: 40, color: t.text3 }}>No purchases yet</div></Card> : my.map(o => <Card t={t} key={o.id}><div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}><div><div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{o.id}</div><div style={{ fontSize: 12, color: t.text3 }}>{o.date} · {o.counter}</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 20, fontWeight: 900, color: t.accent }}>{fmt(o.total)}</div><Badge t={t} text={o.status} color={o.status === "completed" ? "green" : "red"} /></div></div><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{o.items.map((i, idx) => <span key={idx} style={{ fontSize: 11, background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 6, padding: "2px 9px", color: t.text2 }}>{i.name}×{i.qty}</span>)}</div>{o.loyaltyEarned > 0 && <div style={{ fontSize: 12, color: t.yellow, fontWeight: 700, marginTop: 6 }}>⭐+{o.loyaltyEarned} points earned</div>}</Card>)}</div>);
  };

  const CustomerReturns = ({ orders, returns, setReturns, user, addAudit, t }) => {
    const myO = orders.filter(o => o.customerId === user.id); const myR = returns.filter(r => r.customerId === user.id);
    const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ orderId: "", productName: "", reason: "", type: "full" });
    return mkSection("Return Requests", <><div style={{ display: "flex", justifyContent: "flex-end" }}><Btn t={t} onClick={() => setShowForm(true)}>+ New Return</Btn></div>{myR.length === 0 ? <Card t={t}><div style={{ textAlign: "center", padding: 30, color: t.text3 }}>No returns yet</div></Card> : myR.map(r => <Card t={t} key={r.id}><div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}><div><div style={{ display: "flex", gap: 8, marginBottom: 5 }}><span style={{ fontWeight: 800, color: t.text }}>{r.id}</span><Badge t={t} text={r.status} color={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "yellow"} /></div><div style={{ fontSize: 13, color: t.text2 }}>Order: {r.orderId} · {r.productName}</div><div style={{ fontSize: 12, color: t.text3 }}>Reason: {r.reason}</div></div><span style={{ fontSize: 18, fontWeight: 900, color: t.accent }}>{fmt(r.refundAmount)}</span></div></Card>)}
      {showForm && <Modal t={t} title="Return Request" onClose={() => setShowForm(false)}><div style={{ display: "flex", flexDirection: "column", gap: 13 }}><Select t={t} label="Order" value={form.orderId} onChange={v => setForm(f => ({ ...f, orderId: v }))} options={[{ value: "", label: "Select order..." }, ...myO.map(o => ({ value: o.id, label: `${o.id} — ${o.date}` }))]} /><Input t={t} label="Product" value={form.productName} onChange={v => setForm(f => ({ ...f, productName: v }))} /><Input t={t} label="Reason" value={form.reason} onChange={v => setForm(f => ({ ...f, reason: v }))} /><Select t={t} label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={[{ value: "full", label: "Full Refund" }, { value: "partial", label: "Partial Refund" }]} /><Btn t={t} onClick={() => { setReturns(rs => [...rs, { id: genId("RET"), ...form, customerId: user.id, customerName: user.name, status: "pending", refundAmount: 0, date: ts(), qty: 1, productId: null }]); addAudit(user, "Return Requested", "Returns", `${form.orderId}`); notify("Return submitted!", "success"); setShowForm(false); }} disabled={!form.orderId || !form.productName}>Submit</Btn></div></Modal>}
    </>);
  };

  if (appError) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#111", color: "#f8d7da" }}>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Something broke</div>
        <div style={{ marginBottom: 16, color: "#f8d7da", whiteSpace: "pre-wrap", textAlign: "left" }}>{appError}</div>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" }}>Reload</button>
      </div>
    </div>
  );

  if (page === "guest") return <>
    <style>{CSS}</style>
    <NotificationCenter t={t} />
    <GuestPage banners={banners} products={products} onLogin={(cat) => { setPendingOfferCat(cat||null); setPage("login"); }} onRegister={() => setPage("register")} t={t} pendingGuestCart={pendingGuestCart} onLoginWithCart={(cart,cat) => { setPendingGuestCart(cart); setPendingOfferCat(cat||null); setPage("login"); }} />
  </>;

  if (page === "login") return <>
    <style>{CSS}</style>
    <NotificationCenter t={t} />
    <LoginPage onLogin={login} onBack={() => setPage("guest")} allUsers={users} t={t} pendingOfferCat={pendingOfferCat} />
  </>;

  if (page === "register") return <>
    <style>{CSS}</style>
    <NotificationCenter t={t} />
    <RegisterPage onBack={() => setPage("guest")} onRegister={register} t={t} />
  </>;

  const isPOS = section === "pos";
  return (
    <ErrorBoundary>
      <div style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", background: t.bg, minHeight: "100vh", color: t.text }}>
        <style>{CSS}</style>
        <NotificationCenter t={t} />
        <div className={`sidebar-wrap${sidebarOpen ? " open" : ""}`} style={{ width: 220, position: "fixed", left: 0, top: 0, height: "100vh", zIndex: 200, transition: "transform .25s ease" }}>
          <Sidebar user={currentUser} activeSection={section} setActiveSection={s => { setSection(s); setSidebarOpen(false); }} onLogout={logout} t={t} />
        </div>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 290 }} />}
        <div className="main-content" style={{ marginLeft: 220, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {/* Topbar */}
          <div style={{ background: t.topbar, borderBottom: `1px solid ${t.border}`, padding: "0 clamp(8px,2vw,20px)", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: t.shadow }}>
            <div style={{ fontSize: 13, color: t.text3, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <button className="mob-menu-btn" onClick={() => setSidebarOpen(v => !v)} style={{ background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 16, color: t.text, marginRight: 6 }}>☰</button>
              ⚽ <span style={{ color: t.text, fontWeight: 700 }}>FanStore</span>
              <span style={{ color: t.border2 }}>›</span>
              <span style={{ textTransform: "capitalize" }}>{section}</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: t.green, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.green, display: "inline-block" }} />Online
              </span>
              <NotifBell notifs={globalNotifs} setNotifs={setGlobalNotifs} t={t} />
              <button onClick={() => setDarkMode(d => !d)} style={{ background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 14, color: t.text }}>{darkMode ? "☀️" : "🌙"}</button>
              <span className="hide-mobile" style={{ fontSize: 12, color: t.text3 }}>{new Date().toLocaleDateString("en-GB")}</span>
            </div>
          </div>
          <div style={isPOS ? { flex: 1, overflow: "hidden" } : { padding: "clamp(10px,2vw,24px)", flex: 1, minWidth: 0 }}>
            {(() => {
              try {
                return renderSection();
              } catch (err) {
                return (
                  <div style={{ padding: 40, color: t.text3, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Render error</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{String(err)}</div>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
