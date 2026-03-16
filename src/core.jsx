// ═══════════════════════════════════════════════════════════════
// FANSTORE EPOS — CORE DATA, UTILITIES & SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

export const THEMES = {
  light: {
    bg:"#f1f5f9", bg2:"#ffffff", bg3:"#f8fafc", bg4:"#e2e8f0",
    sidebar:"#ffffff", topbar:"#ffffff",
    border:"#e2e8f0", border2:"#cbd5e1",
    text:"#0f172a", text2:"#334155", text3:"#64748b", text4:"#94a3b8",
    card:"#ffffff", cardHover:"#f8fafc",
    accent:"#dc2626", accent2:"#b91c1c", accentLight:"#fef2f2", accentBorder:"#fecaca",
    green:"#16a34a", greenBg:"#f0fdf4", greenBorder:"#bbf7d0",
    red:"#dc2626", redBg:"#fef2f2", redBorder:"#fecaca",
    yellow:"#d97706", yellowBg:"#fffbeb", yellowBorder:"#fde68a",
    blue:"#2563eb", blueBg:"#eff6ff", blueBorder:"#bfdbfe",
    purple:"#7c3aed", purpleBg:"#f5f3ff", purpleBorder:"#ddd6fe",
    orange:"#ea580c", orangeBg:"#fff7ed", orangeBorder:"#fed7aa",
    teal:"#0d9488", tealBg:"#f0fdfa", tealBorder:"#99f6e4",
    input:"#f8fafc", shadow:"0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
    shadowMd:"0 4px 16px rgba(0,0,0,0.08)", shadowLg:"0 10px 40px rgba(0,0,0,0.12)",
    posLeft:"#f8fafc", posRight:"#ffffff",
    tableHead:"#f8fafc", tableRow:"#ffffff", tableRowAlt:"#fafbfd",
    gradHero:"linear-gradient(135deg,#dc2626 0%,#b91c1c 50%,#7f1d1d 100%)",
  },
  dark: {
    bg:"#080b14", bg2:"#0e1420", bg3:"#141b2d", bg4:"#1a2235",
    sidebar:"#0a0f1e", topbar:"#0a0f1e",
    border:"#1e2d40", border2:"#2a3a50",
    text:"#f0f4ff", text2:"#b0bcd0", text3:"#607090", text4:"#405060",
    card:"#0e1420", cardHover:"#141b2d",
    accent:"#ef4444", accent2:"#dc2626", accentLight:"#450a0a", accentBorder:"#7f1d1d",
    green:"#22c55e", greenBg:"#052e16", greenBorder:"#166534",
    red:"#ef4444", redBg:"#450a0a", redBorder:"#7f1d1d",
    yellow:"#f59e0b", yellowBg:"#1c1400", yellowBorder:"#92400e",
    blue:"#3b82f6", blueBg:"#0c1a3b", blueBorder:"#1e3a5f",
    purple:"#a855f7", purpleBg:"#1a0533", purpleBorder:"#4c1d95",
    orange:"#f97316", orangeBg:"#1c0a00", orangeBorder:"#7c2d12",
    teal:"#14b8a6", tealBg:"#002a26", tealBorder:"#0f5a52",
    input:"#141b2d", shadow:"0 1px 3px rgba(0,0,0,0.3)",
    shadowMd:"0 4px 16px rgba(0,0,0,0.4)", shadowLg:"0 10px 40px rgba(0,0,0,0.5)",
    posLeft:"#0a0f1e", posRight:"#080b14",
    tableHead:"#0e1420", tableRow:"#0e1420", tableRowAlt:"#0a0f1e",
    gradHero:"linear-gradient(135deg,#1a0000 0%,#3b0000 50%,#7f1d1d 100%)",
  }
};

export const PRODUCT_IMAGES = {
  "Home Jersey 2024":"https://images.pexels.com/photos/1661338/pexels-photo-1661338.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Away Jersey 2024":"https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Third Kit Jersey":"https://images.pexels.com/photos/1124466/pexels-photo-1124466.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Training Jacket":"https://images.pexels.com/photos/1311523/pexels-photo-1311523.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Training Shorts":"https://images.pexels.com/photos/4753987/pexels-photo-4753987.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Football Scarf":"https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Team Cap":"https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Fan Hoodie":"https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Match Ball Official":"https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Goalkeeper Gloves":"https://images.pexels.com/photos/2277980/pexels-photo-2277980.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Shin Guards Pro":"https://images.pexels.com/photos/3621183/pexels-photo-3621183.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Signed Jersey":"https://images.pexels.com/photos/918778/pexels-photo-918778.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Stadium Print A3":"https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=300",
  "Mini Trophy Replica":"https://images.pexels.com/photos/1884577/pexels-photo-1884577.jpeg?auto=compress&cs=tinysrgb&w=300",
};

export const INITIAL_PRODUCTS = [
  {id:1,name:"Home Jersey 2024",sku:"JRS-HOME-24",category:"Jerseys",price:89.99,stock:45,emoji:"🔴",featured:true,description:"Official 2024 home kit jersey. Premium quality breathable fabric, moisture-wicking technology. Club crest embroidered on chest.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["Red/White"],material:"100% Polyester",fit:"Regular Fit",care:"Machine wash 30°C",brand:"FanStore Official"},
  {id:2,name:"Away Jersey 2024",sku:"JRS-AWAY-24",category:"Jerseys",price:89.99,stock:32,emoji:"⚪",featured:true,description:"Official 2024 away kit jersey. Lightweight performance fabric with ventilation zones.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["White/Blue"],material:"100% Polyester",fit:"Slim Fit",care:"Machine wash 30°C",brand:"FanStore Official"},
  {id:3,name:"Third Kit Jersey",sku:"JRS-THIRD-24",category:"Jerseys",price:84.99,stock:18,emoji:"🔵",featured:false,description:"Limited edition third kit. Bold design with contrast trim, limited run of 500 units.",discount:0,sizes:["S","M","L","XL","XXL"],colors:["Navy Blue"],material:"100% Polyester",fit:"Regular Fit",care:"Machine wash 30°C",brand:"FanStore Official"},
  {id:4,name:"Training Jacket",sku:"TRN-JKT-24",category:"Training Wear",price:64.99,stock:27,emoji:"🧥",featured:true,description:"Lightweight training jacket with zip pockets. Wind-resistant shell, perfect for matchday warm-up.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["Red","Black"],material:"95% Polyester, 5% Elastane",fit:"Athletic Fit",care:"Machine wash 40°C",brand:"FanStore Official"},
  {id:5,name:"Training Shorts",sku:"TRN-SHT-24",category:"Training Wear",price:34.99,stock:41,emoji:"🩳",featured:false,description:"Pro training shorts with elastic waistband and side pockets.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["Red","Black","White"],material:"100% Polyester",fit:"Regular Fit",care:"Machine wash 40°C",waist:"28-38 inches adjustable",brand:"FanStore Official"},
  {id:6,name:"Football Scarf",sku:"ACC-SCARF-01",category:"Fan Accessories",price:19.99,stock:120,emoji:"🧣",featured:true,description:"Knitted team scarf, double-sided club colours. Official merchandise.",discount:0,sizes:["One Size"],colors:["Red/White"],material:"100% Acrylic",length:"150cm",width:"20cm",care:"Hand wash cold",brand:"FanStore Official"},
  {id:7,name:"Team Cap",sku:"ACC-CAP-01",category:"Fan Accessories",price:24.99,stock:85,emoji:"🧢",featured:false,description:"Embroidered team cap with adjustable strap.",discount:0,sizes:["One Size (Adjustable)"],colors:["Red","Black","White"],material:"Cotton Twill",fit:"Structured 6-panel",care:"Spot clean only",brand:"FanStore Official"},
  {id:8,name:"Fan Hoodie",sku:"ACC-HOOD-01",category:"Fan Accessories",price:54.99,stock:33,emoji:"👕",featured:true,description:"Premium fan hoodie with kangaroo pocket. Soft fleece lining, printed club crest.",discount:0,sizes:["XS","S","M","L","XL","XXL"],colors:["Red","Navy","Grey"],material:"80% Cotton, 20% Polyester",fit:"Relaxed Fit",care:"Machine wash 30°C",brand:"FanStore Official"},
  {id:9,name:"Match Ball Official",sku:"EQP-BALL-01",category:"Football Equipment",price:129.99,stock:12,emoji:"⚽",featured:true,description:"FIFA approved match ball. Used in official league matches. Thermally bonded panels.",discount:10,sizes:["Size 5 (Official)"],colors:["White/Black/Red"],material:"Synthetic leather, Latex bladder",circumference:"68-70cm",weight:"410-450g",care:"Wipe clean only",brand:"FanStore Pro"},
  {id:10,name:"Goalkeeper Gloves",sku:"EQP-GLV-01",category:"Football Equipment",price:44.99,stock:8,emoji:"🥅",featured:false,description:"Pro goalkeeper gloves with 4mm latex palm. Negative cut for superior grip.",discount:0,sizes:["6","7","8","9","10","11"],colors:["Red/Black","Black/Yellow"],material:"German Latex Palm, Neoprene back",cut:"Negative Cut",care:"Hand wash cold, air dry",brand:"FanStore Pro"},
  {id:11,name:"Shin Guards Pro",sku:"EQP-SHIN-01",category:"Football Equipment",price:29.99,stock:55,emoji:"🛡️",featured:false,description:"Lightweight shin guards with ankle protection. Hard shell with foam backing.",discount:0,sizes:["XS (6-9yrs)","S (9-12yrs)","M (12-15yrs)","L (15+yrs)"],colors:["Black","Red/Black"],material:"Polypropylene shell, EVA foam",height:"Multiple (see sizes)",care:"Wipe clean",brand:"FanStore Pro"},
  {id:12,name:"Signed Jersey",sku:"COL-SIG-CAP",category:"Collectibles",price:249.99,stock:3,emoji:"✍️",featured:true,description:"Signed by the club captain. Comes with certificate of authenticity and display frame. Limited edition.",discount:0,sizes:["L (Display Size)"],colors:["Red/White (Home)"],material:"Official match jersey with authentic signature",edition:"Limited — only 3 remaining",includes:"Certificate of Authenticity, Display Frame",care:"Keep away from direct sunlight",brand:"FanStore Collectibles"},
  {id:13,name:"Stadium Print A3",sku:"COL-PRT-01",category:"Collectibles",price:39.99,stock:22,emoji:"🖼️",featured:false,description:"A3 art print of the stadium, hand-numbered. Ideal for framing.",discount:0,sizes:["A3 (297 x 420mm)"],colors:["Full Colour"],material:"Premium 250gsm matte art paper",edition:"Hand-numbered limited edition",includes:"Cardboard backing, protective sleeve",care:"Store flat, frame to preserve",brand:"FanStore Collectibles"},
  {id:14,name:"Mini Trophy Replica",sku:"COL-TRP-01",category:"Collectibles",price:79.99,stock:9,emoji:"🏆",featured:true,description:"Die-cast trophy replica, 1:5 scale. Gold plated finish.",discount:0,sizes:["1:5 Scale (28cm tall)"],colors:["Gold"],material:"Zinc alloy, gold plated",weight:"850g",includes:"Display stand, dust cloth, gift box",care:"Dust regularly, avoid moisture",brand:"FanStore Collectibles"},
];

export const INITIAL_USERS = [
  {id:1,name:"Alex Rivera",email:"admin@fanstore.com",password:"admin123",role:"admin",avatar:"AR",phone:"07700900001",active:true,joinDate:"2023-01-01",loyaltyPoints:0,tier:"N/A"},
  {id:2,name:"Sam Chen",email:"manager@fanstore.com",password:"mgr123",role:"manager",avatar:"SC",phone:"07700900002",active:true,joinDate:"2023-01-15",loyaltyPoints:0,tier:"N/A"},
  {id:3,name:"Jordan Lee",email:"cashier@fanstore.com",password:"cash123",role:"cashier",counter:"Counter 1",avatar:"JL",phone:"07700900003",active:true,joinDate:"2023-03-01",loyaltyPoints:0,tier:"N/A"},
  {id:4,name:"Morgan Blake",email:"cashier2@fanstore.com",password:"cash456",role:"cashier",counter:"Counter 2",avatar:"MB",phone:"07700900004",active:true,joinDate:"2023-04-01",loyaltyPoints:0,tier:"N/A"},
  {id:5,name:"Taylor Smith",email:"customer@fanstore.com",password:"cust123",role:"customer",avatar:"TS",phone:"07700900005",active:true,joinDate:"2023-06-01",loyaltyPoints:320,tier:"Silver",pointsExpiry:"2025-06-01",totalSpent:1240},
  {id:6,name:"Chris Johnson",email:"chris@email.com",password:"cust456",role:"customer",avatar:"CJ",phone:"07700900006",active:true,joinDate:"2023-09-01",loyaltyPoints:45,tier:"Bronze",pointsExpiry:"2025-09-01",totalSpent:180},
  {id:7,name:"Alex Murphy",email:"staff1@fanstore.com",password:"staff123",role:"staff",avatar:"AM",phone:"07700900007",active:true,joinDate:"2024-01-01",counter:"Counter 1",loyaltyPoints:0,tier:"N/A"},
  {id:8,name:"Jamie Davis",email:"staff2@fanstore.com",password:"staff456",role:"staff",avatar:"JD",phone:"07700900008",active:true,joinDate:"2024-02-01",counter:"Counter 2",loyaltyPoints:0,tier:"N/A"},
];

export const INITIAL_ORDERS = [
  {id:"ORD-0001",customerId:5,customerName:"Taylor Smith",cashierId:3,cashierName:"Jordan Lee",items:[{productId:1,name:"Home Jersey 2024",qty:1,price:89.99,discount:0},{productId:6,name:"Football Scarf",qty:2,price:19.99,discount:0}],subtotal:129.97,tax:25.99,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:155.96,payment:"Card",cardLast4:"4242",date:"2024-01-15 10:23",counter:"Counter 1",status:"completed",orderType:"in-store",loyaltyEarned:155,loyaltyUsed:0},
  {id:"ORD-0002",customerId:6,customerName:"Chris Johnson",cashierId:4,cashierName:"Morgan Blake",items:[{productId:9,name:"Match Ball Official",qty:1,price:129.99,discount:0}],subtotal:129.99,tax:26.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:155.99,payment:"Cash",cashGiven:160,cashChange:4.01,date:"2024-01-15 11:45",counter:"Counter 2",status:"completed",orderType:"in-store",loyaltyEarned:155,loyaltyUsed:0},
  {id:"ORD-0003",customerId:null,customerName:"Walk-in",cashierId:3,cashierName:"Jordan Lee",items:[{productId:4,name:"Training Jacket",qty:1,price:64.99,discount:0},{productId:7,name:"Team Cap",qty:1,price:24.99,discount:0}],subtotal:89.98,tax:18.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:107.98,payment:"Card",cardLast4:"1234",date:"2024-01-15 13:12",counter:"Counter 1",status:"completed",orderType:"in-store",loyaltyEarned:0,loyaltyUsed:0},
  {id:"ORD-0004",customerId:5,customerName:"Taylor Smith",cashierId:3,cashierName:"Jordan Lee",items:[{productId:12,name:"Signed Jersey",qty:1,price:249.99,discount:0}],subtotal:249.99,tax:50.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:5.99,total:305.98,payment:"QR",date:"2024-01-14 14:05",counter:"Counter 1",status:"completed",orderType:"delivery",deliveryAddress:"123 Stadium Road, London",deliveryStatus:"delivered",loyaltyEarned:305,loyaltyUsed:0},
  {id:"ORD-0005",customerId:5,customerName:"Taylor Smith",cashierId:4,cashierName:"Morgan Blake",items:[{productId:2,name:"Away Jersey 2024",qty:2,price:89.99,discount:0},{productId:8,name:"Fan Hoodie",qty:1,price:54.99,discount:0}],subtotal:234.97,tax:47.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:281.97,payment:"Cash",cashGiven:300,cashChange:18.03,date:"2024-01-14 09:30",counter:"Counter 2",status:"completed",orderType:"in-store",loyaltyEarned:281,loyaltyUsed:0},
  {id:"ORD-0006",customerId:6,customerName:"Chris Johnson",cashierId:3,cashierName:"Jordan Lee",items:[{productId:10,name:"Goalkeeper Gloves",qty:1,price:44.99,discount:0},{productId:11,name:"Shin Guards Pro",qty:2,price:29.99,discount:0}],subtotal:104.97,tax:21.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:125.97,payment:"Card",cardLast4:"9999",date:"2024-01-13 11:20",counter:"Counter 1",status:"refunded",orderType:"in-store",loyaltyEarned:0,loyaltyUsed:0},
  {id:"ORD-0007",customerId:5,customerName:"Taylor Smith",cashierId:null,cashierName:"Online",items:[{productId:1,name:"Home Jersey 2024",qty:1,price:89.99,discount:0},{productId:6,name:"Football Scarf",qty:1,price:19.99,discount:0}],subtotal:109.98,tax:22.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:3.99,total:135.97,payment:"Online",date:"2024-01-16 09:10",counter:"Online",status:"preparing",orderType:"delivery",deliveryAddress:"45 King Street, London, E1 7PQ",deliveryZone:"London Zone 1",deliveryStatus:"pending",loyaltyEarned:135,loyaltyUsed:0,trackingStage:1},
  {id:"ORD-0008",customerId:6,customerName:"Chris Johnson",cashierId:null,cashierName:"Online",items:[{productId:7,name:"Team Cap",qty:2,price:24.99,discount:0},{productId:8,name:"Fan Hoodie",qty:1,price:54.99,discount:0}],subtotal:104.97,tax:21.00,discountAmt:0,loyaltyDiscount:0,deliveryCharge:0,total:125.97,payment:"Online",date:"2024-01-16 11:30",counter:"Online",status:"preparing",orderType:"pickup",loyaltyEarned:125,loyaltyUsed:0,trackingStage:1},
  {id:"ORD-0009",customerId:5,customerName:"Taylor Smith",cashierId:null,cashierName:"Online",items:[{productId:12,name:"Signed Jersey",qty:1,price:249.99,discount:15}],subtotal:212.49,tax:42.50,discountAmt:37.50,loyaltyDiscount:0,deliveryCharge:5.99,total:260.98,payment:"Online",date:"2024-01-16 14:00",counter:"Online",status:"completed",orderType:"delivery",deliveryAddress:"78 Stadium Rd, London EC1A 2BB",deliveryZone:"London Zone 1",deliveryStatus:"delivered",loyaltyEarned:260,loyaltyUsed:0,trackingStage:3},
];

export const INITIAL_RETURNS = [
  {id:"RET-001",orderId:"ORD-0006",customerId:6,customerName:"Chris Johnson",productId:10,productName:"Goalkeeper Gloves",qty:1,reason:"Wrong size",status:"approved",refundAmount:44.99,date:"2024-01-16 09:00",type:"full"},
  {id:"RET-002",orderId:"ORD-0001",customerId:5,customerName:"Taylor Smith",productId:6,productName:"Football Scarf",qty:1,reason:"Damaged item",status:"pending",refundAmount:19.99,date:"2024-01-16 14:30",type:"partial"},
];

export const INITIAL_BANNERS = [
  {id:1,title:"Match Day Special!",subtitle:"20% off all Jerseys today only",cta:"Shop Now",color:"#dc2626",grad:"linear-gradient(135deg,#dc2626,#7f1d1d)",emoji:"⚽",active:true,offerType:"category",offerTarget:"Jerseys",offerDiscount:20,startDate:"2024-01-01T00:00",endDate:"2026-12-31T23:59",image:"https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1600"},
  {id:2,title:"New Season Arrivals",subtitle:"2024 kits now in stock",cta:"Explore",color:"#2563eb",grad:"linear-gradient(135deg,#2563eb,#1e3a8a)",emoji:"🆕",active:true,offerType:"none",offerTarget:"",offerDiscount:0,startDate:"2024-01-01T00:00",endDate:"2026-12-31T23:59",image:"https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1600"},
  {id:3,title:"Loyalty Rewards",subtitle:"Earn & redeem points every visit",cta:"Join Now",color:"#16a34a",grad:"linear-gradient(135deg,#16a34a,#14532d)",emoji:"🏆",active:false,offerType:"none",offerTarget:"",offerDiscount:0,startDate:"2024-01-01T00:00",endDate:"2026-12-31T23:59",image:"https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1600"},
  {id:4,title:"Collectibles Sale",subtitle:"15% off signed memorabilia",cta:"Shop",color:"#7c3aed",grad:"linear-gradient(135deg,#7c3aed,#4c1d95)",emoji:"✍️",active:true,offerType:"category",offerTarget:"Collectibles",offerDiscount:15,startDate:"2024-01-01T00:00",endDate:"2026-12-31T23:59",image:"https://images.pexels.com/photos/918778/pexels-photo-918778.jpeg?auto=compress&cs=tinysrgb&w=1600"},
];

export const INITIAL_COUPONS = [
  {id:1,code:"FANDAY10",description:"10% off everything",type:"percent",value:10,minOrder:0,maxUses:100,uses:23,active:true,expiry:"2026-12-31"},
  {id:2,code:"WELCOME20",description:"£20 off for new customers",type:"fixed",value:20,minOrder:50,maxUses:50,uses:12,active:true,expiry:"2026-12-31"},
  {id:3,code:"FREESHIP",description:"Free delivery",type:"delivery",value:100,minOrder:30,maxUses:200,uses:67,active:true,expiry:"2026-12-31"},
];

export const INITIAL_COUNTERS = [
  {id:"c1",name:"Counter 1",location:"Main Entrance",active:true},
  {id:"c2",name:"Counter 2",location:"East Wing",active:true},
  {id:"c3",name:"Counter 3",location:"VIP Section",active:false},
];

export const INITIAL_SETTINGS = {
  storeName:"Football Fan Merchandise Store",
  storeAddress:"Sports Venue, Stadium Road, London, EC1A 1BB",
  storePhone:"020 7946 0800",
  storeEmail:"hello@fanstore.com",
  currency:"GBP",sym:"£",
  vatRate:20,
  loyaltyRate:1,loyaltyValue:0.01,
  receiptFooter:"Thank you for your purchase! ⚽ Come back soon.",
  allowReturns:true,returnDays:30,
  deliveryZones:[
    {zone:"London Zone 1",charge:3.99,days:1},
    {zone:"London Zone 2",charge:5.99,days:2},
    {zone:"UK Nationwide",charge:9.99,days:3},
  ],
  selfServiceEnabled:false,
};

export const INITIAL_PARKED = [];

export const CATEGORIES = ["All","Jerseys","Training Wear","Fan Accessories","Football Equipment","Collectibles"];

export const TIER_CONFIG = {
  Bronze:{min:0,max:499,color:"#cd7f32",bg:"#2a1a0a",label:"Bronze",icon:"🥉"},
  Silver:{min:500,max:1499,color:"#9ca3af",bg:"#1a1f2a",label:"Silver",icon:"🥈"},
  Gold:{min:1500,max:Infinity,color:"#f59e0b",bg:"#2a1e00",label:"Gold",icon:"🥇"},
};

export const getTier = (spent) => {
  if(spent>=1500) return "Gold";
  if(spent>=500) return "Silver";
  return "Bronze";
};

export const fmt = (n,sym="£")=>`${sym}${Number(n||0).toFixed(2)}`;
export const ts = ()=>new Date().toLocaleString("en-GB",{hour12:false}).replace(",","");
export const genId=(p)=>`${p}-${String(Math.floor(Math.random()*9000)+1000)}`;
export const isBannerActive=(b)=>{
  const now=new Date();
  const s=new Date(b.startDate); const e=new Date(b.endDate);
  return b.active && now>=s && now<=e;
};

// ─── NOTIFICATION ────────────────────────────────────────────────────────────
let _notif=null;
export const notify=(msg,type="info",duration=4000)=>_notif&&_notif(msg,type,duration);

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

export const NotificationCenter=({t})=>{
  const [ns,setNs]=useState([]);
  useEffect(()=>{
    _notif=(msg,type,dur=4000)=>{
      const id=Date.now()+Math.random();
      setNs(n=>[{id,msg,type},...n.slice(0,5)]);
      setTimeout(()=>setNs(n=>n.filter(x=>x.id!==id)),dur);
    };
  },[]);
  const cfg={success:[t.green,t.greenBg,t.greenBorder,"✓"],error:[t.red,t.redBg,t.redBorder,"✕"],warning:[t.yellow,t.yellowBg,t.yellowBorder,"⚠"],info:[t.blue,t.blueBg,t.blueBorder,"ℹ"]};
  return(
    <div style={{position:"fixed",top:60,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8,width:320,pointerEvents:"none"}}>
      {ns.map(n=>{const[c,bg,bdr,ic]=cfg[n.type]||cfg.info; return(
        <div key={n.id} style={{background:bg,border:`1px solid ${bdr}`,borderLeft:`4px solid ${c}`,borderRadius:10,padding:"12px 16px",display:"flex",gap:10,alignItems:"flex-start",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"slideInRight 0.25s ease",pointerEvents:"auto"}}>
          <span style={{color:c,fontWeight:900,fontSize:13,flexShrink:0}}>{ic}</span>
          <span style={{fontSize:13,color:t.text,fontWeight:500,flex:1,lineHeight:1.4}}>{n.msg}</span>
          <button onClick={()=>setNs(x=>x.filter(i=>i.id!==n.id))} style={{background:"none",border:"none",color:t.text3,cursor:"pointer",fontSize:14,padding:0,flexShrink:0}}>✕</button>
        </div>
      );})}
    </div>
  );
};

// ─── SHARED UI PRIMITIVES ─────────────────────────────────────────────────────
export const Btn=({onClick,children,variant="primary",size="md",disabled=false,style={},t,fullWidth=false})=>{
  const theme=t||THEMES.light;
  const V={
    primary:{background:`linear-gradient(135deg,${theme.accent},${theme.accent2})`,color:"#fff",border:"none",boxShadow:`0 2px 8px ${theme.accent}40`},
    secondary:{background:theme.bg3,color:theme.text2,border:`1px solid ${theme.border}`},
    success:{background:`linear-gradient(135deg,${theme.green},#15803d)`,color:"#fff",border:"none"},
    danger:{background:`linear-gradient(135deg,${theme.red},#b91c1c)`,color:"#fff",border:"none"},
    ghost:{background:"transparent",color:theme.text3,border:`1px solid ${theme.border}`},
    outline:{background:"transparent",color:theme.accent,border:`2px solid ${theme.accent}`},
    teal:{background:`linear-gradient(135deg,${theme.teal},#0f766e)`,color:"#fff",border:"none"},
  };
  const S={sm:{padding:"5px 12px",fontSize:11,borderRadius:7},md:{padding:"9px 18px",fontSize:13,borderRadius:9},lg:{padding:"13px 26px",fontSize:14,borderRadius:10}};
  return(
    <button onClick={onClick} disabled={disabled} style={{...V[variant],...S[size],fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,transition:"all 0.15s",width:fullWidth?"100%":undefined,fontFamily:"inherit",...style}}>
      {children}
    </button>
  );
};

export const Input=({label,value,onChange,type="text",placeholder,t,required,note,readOnly,prefix})=>{
  const theme=t||THEMES.light;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:11,color:theme.text3,fontWeight:800,textTransform:"uppercase",letterSpacing:0.7}}>{label}{required&&<span style={{color:theme.red}}> *</span>}</label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        {prefix&&<span style={{position:"absolute",left:12,fontSize:13,color:theme.text3,pointerEvents:"none"}}>{prefix}</span>}
        <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} readOnly={readOnly}
          style={{background:readOnly?theme.bg4:theme.input,border:`1px solid ${theme.border}`,borderRadius:9,padding:`10px ${prefix?"10px 10px 36px":"14px"}`,color:theme.text,fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit",paddingLeft:prefix?"36px":"14px"}}/>
      </div>
      {note&&<span style={{fontSize:11,color:theme.text4}}>{note}</span>}
    </div>
  );
};

export const Select=({label,value,onChange,options,t})=>{
  const theme=t||THEMES.light;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:11,color:theme.text3,fontWeight:800,textTransform:"uppercase",letterSpacing:0.7}}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{background:theme.input,border:`1px solid ${theme.border}`,borderRadius:9,padding:"10px 14px",color:theme.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
};

export const Toggle=({value,onChange,label,t})=>{
  const theme=t||THEMES.light;
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>onChange(!value)}>
      <div style={{width:42,height:23,borderRadius:12,background:value?theme.accent:theme.border2,position:"relative",transition:"background 0.2s",flexShrink:0}}>
        <div style={{width:17,height:17,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:value?22:3,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.25)"}}/>
      </div>
      {label&&<span style={{fontSize:13,color:theme.text2,userSelect:"none"}}>{label}</span>}
    </div>
  );
};

export const Badge=({text,color="blue",t,size="sm"})=>{
  const theme=t||THEMES.light;
  const M={
    green:[theme.greenBg,theme.green,theme.greenBorder],
    red:[theme.redBg,theme.red,theme.redBorder],
    yellow:[theme.yellowBg,theme.yellow,theme.yellowBorder],
    blue:[theme.blueBg,theme.blue,theme.blueBorder],
    purple:[theme.purpleBg,theme.purple,theme.purpleBorder],
    orange:[theme.orangeBg,theme.orange,theme.orangeBorder],
    teal:[theme.tealBg,theme.teal,theme.tealBorder],
  };
  const[bg,fg,bdr]=M[color]||M.blue;
  return<span style={{background:bg,color:fg,border:`1px solid ${bdr}`,padding:size==="lg"?"4px 14px":"2px 10px",borderRadius:20,fontSize:size==="lg"?12:10,fontWeight:800,textTransform:"uppercase",letterSpacing:0.4,whiteSpace:"nowrap"}}>{text}</span>;
};

export const Card=({children,t,style={},onClick,hover=false})=>{
  const[hov,setHov]=useState(false);
  const theme=t||THEMES.light;
  return(
    <div onClick={onClick} onMouseEnter={()=>hover&&setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?theme.cardHover:theme.card,border:`1px solid ${theme.border}`,borderRadius:14,padding:20,boxShadow:theme.shadow,transition:"all 0.15s",cursor:onClick?"pointer":"default",...style}}>
      {children}
    </div>
  );
};

export const StatCard=({title,value,sub,color,icon,t,trend})=>{
  const theme=t||THEMES.light;
  return(
    <Card t={t}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{fontSize:11,color:theme.text3,fontWeight:800,textTransform:"uppercase",letterSpacing:0.7}}>{title}</div>
        <div style={{width:36,height:36,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
      </div>
      <div style={{fontSize:24,fontWeight:900,color:color||theme.accent,letterSpacing:-0.5,marginBottom:4}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:theme.text4}}>{sub}</div>}
      {trend&&<div style={{fontSize:12,color:trend>0?theme.green:theme.red,marginTop:4,fontWeight:700}}>{trend>0?"↑":"↓"} {Math.abs(trend)}% vs last week</div>}
    </Card>
  );
};

export const Modal=({title,onClose,children,t,width=580,subtitle})=>{
  const theme=t||THEMES.light;
  useEffect(()=>{
    const h=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[onClose]);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"clamp(0px,2vw,20px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}} data-modal-overlay="true">
    <style>{"@media(min-width:600px){[data-modal-overlay=true]{align-items:center!important;}}"}</style>
      <div style={{background:theme.bg2,border:`1px solid ${theme.border}`,borderRadius:"clamp(10px,2vw,18px)",width:"100%",maxWidth:width,maxHeight:"92vh",overflow:"auto",boxShadow:"0 25px 80px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"20px 24px 16px",borderBottom:`1px solid ${theme.border}`,position:"sticky",top:0,background:theme.bg2,zIndex:1}}>
          <div>
            <div style={{fontSize:17,fontWeight:900,color:theme.text}}>{title}</div>
            {subtitle&&<div style={{fontSize:13,color:theme.text3,marginTop:3}}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{background:theme.bg3,border:`1px solid ${theme.border}`,color:theme.text3,cursor:"pointer",padding:"6px 10px",borderRadius:8,fontSize:14,fontWeight:700,marginLeft:16}}>✕</button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
};

export const Table=({cols,rows,empty="No records found",t})=>{
  const theme=t||THEMES.light;
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead>
          <tr style={{background:theme.tableHead}}>
            {cols.map((c,i)=><th key={i} style={{textAlign:"left",padding:"10px 14px",fontSize:10,color:theme.text3,fontWeight:900,textTransform:"uppercase",letterSpacing:0.8,borderBottom:`2px solid ${theme.border}`,whiteSpace:"nowrap"}}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length===0
            ?<tr><td colSpan={cols.length} style={{textAlign:"center",padding:"48px 20px",color:theme.text4,fontSize:14}}>
              <div style={{fontSize:32,marginBottom:8}}>📭</div>{empty}
            </td></tr>
            :rows.map((row,i)=>(
              <tr key={i} style={{background:i%2===0?theme.tableRow:theme.tableRowAlt,transition:"background 0.1s"}}>
                {row.map((cell,j)=><td key={j} style={{padding:"11px 14px",color:theme.text2,borderBottom:`1px solid ${theme.border}`,verticalAlign:"middle"}}>{cell}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export const ProductCard=({p,onAdd,showAdd=true,t,compact=false})=>{
  const theme=t||THEMES.light;
  const img=PRODUCT_IMAGES[p.name]||`https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(p.emoji)}`;
  const[imgErr,setImgErr]=useState(false);
  return(
    <div style={{background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,overflow:"hidden",boxShadow:theme.shadow,transition:"all 0.15s",cursor:"pointer",opacity:p.stock===0?0.5:1}}
      onClick={()=>showAdd&&p.stock>0&&onAdd&&onAdd(p)}>
      <div style={{position:"relative",background:theme.bg3,height:compact?80:120,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        {imgErr
          ?<span style={{fontSize:compact?32:44}}>{p.emoji}</span>
          :<img src={img} alt={p.name} onError={()=>setImgErr(true)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        }
        {p.stock===0&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12}}>OUT OF STOCK</div>}
        {p.stock>0&&p.stock<=5&&<div style={{position:"absolute",top:6,right:6,background:theme.red,color:"#fff",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:800}}>Only {p.stock} left!</div>}
      </div>
      <div style={{padding:compact?"8px 10px":"10px 12px"}}>
        <div style={{fontSize:compact?11:12,fontWeight:700,color:theme.text,lineHeight:1.3,marginBottom:4}}>{p.name}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:compact?12:14,fontWeight:900,color:theme.green}}>{fmt(p.price)}</span>
          {showAdd&&p.stock>0&&<span style={{width:22,height:22,borderRadius:"50%",background:theme.accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900}}>+</span>}
        </div>
      </div>
    </div>
  );
};

export const Sidebar=({user,activeSection,setActiveSection,onLogout,t})=>{
  if (!user) return null;
  const theme=t;
  const navByRole={
    admin:[{key:"dashboard",l:"Dashboard",i:"📊"},{key:"analytics",l:"Analytics",i:"📈"},{key:"customers",l:"Customers",i:"👥"},{key:"users",l:"All Users",i:"🔑"},{key:"staff",l:"Staff Mgmt",i:"👥"},{key:"audit",l:"Audit Logs",i:"📋"},{key:"banners",l:"Banners",i:"🖼️"},{key:"coupons",l:"Coupons",i:"🎟️"},{key:"zreport",l:"Z-Report",i:"📑"},{key:"settings",l:"Settings",i:"⚙️"}],
    manager:[{key:"dashboard",l:"Dashboard",i:"📊"},{key:"staffdash",l:"Staff Dashboard",i:"🖥️"},{key:"pickup",l:"Pickup Orders",i:"📦"},{key:"products",l:"Products",i:"🏷️"},{key:"inventory",l:"Inventory",i:"📦"},{key:"staff",l:"Staff Mgmt",i:"👥"},{key:"cashiers",l:"Cashier Mgmt",i:"🛒"},{key:"counters",l:"Counters",i:"🏪"},{key:"returns",l:"Returns",i:"↩️"},{key:"reports",l:"Reports",i:"📈"}],
    cashier:[{key:"pos",l:"POS Terminal",i:"🛒"},{key:"orders",l:"My Orders",i:"🧾"},{key:"pickup",l:"Pickup Orders",i:"📦"},{key:"hardware",l:"Hardware",i:"🖨️"},{key:"profile",l:"Profile",i:"👤"}],
    staff:[{key:"staffdash",l:"Order Queue",i:"📋"},{key:"pickup",l:"Pickup Verify",i:"📦"},{key:"profile",l:"Profile",i:"👤"}],
    customer:[{key:"shop",l:"Shop",i:"🛍️"},{key:"history",l:"My Orders",i:"📜"},{key:"tracking",l:"Track Orders",i:"📍"},{key:"returns",l:"Returns",i:"↩️"},{key:"profile",l:"Profile",i:"👤"}],
  };
  const role = user.role || "customer";
  const nav = navByRole[role] || [];
  const rc={admin:theme.red,manager:theme.yellow,cashier:theme.green,customer:theme.blue,staff:theme.teal};
  const col=rc[role] || theme.accent;
  const tierC={Bronze:"#cd7f32",Silver:"#9ca3af",Gold:"#f59e0b"};
  return(
    <div style={{width:"100%",height:"100%",background:theme.sidebar,borderRight:`1px solid ${theme.border}`,display:"flex",flexDirection:"column",boxShadow:theme.shadowMd}}>
      <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${theme.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,background:`linear-gradient(135deg,${theme.accent},${theme.accent2})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>⚽</div>
          <div><div style={{fontSize:13,fontWeight:900,color:theme.text,letterSpacing:-0.3}}>FanStore</div><div style={{fontSize:10,color:theme.text4,fontWeight:600}}>EPOS v2.0</div></div>
        </div>
      </div>
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${theme.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:38,height:38,background:col+"20",border:`2px solid ${col}50`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:col,flexShrink:0}}>{user.avatar}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:800,color:theme.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:10,color:col,textTransform:"capitalize",fontWeight:700}}>{user.role}</div>
          </div>
        </div>
        {user.role==="customer"&&(
          <div style={{marginTop:8,display:"flex",gap:6}}>
            <div style={{flex:1,background:tierC[user.tier]+"20",border:`1px solid ${tierC[user.tier]}40`,borderRadius:7,padding:"4px 8px",textAlign:"center"}}>
              <div style={{fontSize:9,color:theme.text3,fontWeight:700}}>TIER</div>
              <div style={{fontSize:11,fontWeight:900,color:tierC[user.tier]}}>{user.tier==="Gold"?"🥇":user.tier==="Silver"?"🥈":"🥉"} {user.tier}</div>
            </div>
            <div style={{flex:1,background:theme.yellowBg,border:`1px solid ${theme.yellowBorder}`,borderRadius:7,padding:"4px 8px",textAlign:"center"}}>
              <div style={{fontSize:9,color:theme.text3,fontWeight:700}}>POINTS</div>
              <div style={{fontSize:11,fontWeight:900,color:theme.yellow}}>⭐{user.loyaltyPoints||0}</div>
            </div>
          </div>
        )}
        {user.counter&&<div style={{marginTop:6,fontSize:10,color:theme.text3,background:theme.bg3,padding:"3px 8px",borderRadius:6,display:"inline-block"}}>📍{user.counter}</div>}
      </div>
      <nav style={{flex:1,padding:"8px 8px",overflowY:"auto"}}>
        {nav.map(item=>(
          <button key={item.key} onClick={()=>setActiveSection(item.key)}
            style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:9,border:activeSection===item.key?`1px solid ${col}35`:"1px solid transparent",background:activeSection===item.key?col+"15":"transparent",color:activeSection===item.key?col:theme.text3,cursor:"pointer",marginBottom:2,textAlign:"left",fontWeight:activeSection===item.key?800:500,fontSize:12,transition:"all 0.12s",fontFamily:"inherit"}}>
            <span style={{fontSize:14}}>{item.i}</span>{item.l}
          </button>
        ))}
      </nav>
      <div style={{padding:"8px 8px",borderTop:`1px solid ${theme.border}`}}>
        <button onClick={()=>setActiveSection("profile")} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:9,border:"none",background:"transparent",color:theme.text3,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"inherit",marginBottom:4}}>
          👤 My Profile
        </button>
        <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:9,border:"none",background:"transparent",color:theme.red,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};
