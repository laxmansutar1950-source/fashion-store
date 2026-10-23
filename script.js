const $ = (id) => document.getElementById(id);
const defaultProducts = [
  {id:"p1",name:"Men's Casual Shirt",category:"Men",price:799,image:"",emoji:"👔"},
  {id:"p2",name:"Women's Summer Dress",category:"Women",price:1299,image:"",emoji:"👗"},
  {id:"p3",name:"Classic Hoodie",category:"Men",price:999,image:"",emoji:"🧥"},
  {id:"p4",name:"Slim Fit Jeans",category:"Men",price:1199,image:"",emoji:"👖"},
  {id:"p5",name:"Women's Everyday Kurti",category:"Women",price:899,image:"",emoji:"🥻"},
  {id:"p6",name:"Kids Graphic T-Shirt",category:"Kids",price:399,image:"",emoji:"👕"},
  {id:"p7",name:"Everyday Sneakers",category:"Accessories",price:1499,image:"",emoji:"👟"},
  {id:"p8",name:"Mini Sling Bag",category:"Accessories",price:699,image:"",emoji:"👜"}
];
const read = (key, fallback) => { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
let products = read("fashionDemoProducts", defaultProducts);
let cart = read("fashionDemoCart", []);
let orders = read("fashionDemoOrders", []);
let settings = read("fashionDemoSettings", {storeName:"Vastrmanjiri",accent:"#2874f0"});
let activeCategory = "All";
let toastTimer;
function saveAll(){ localStorage.setItem("fashionDemoProducts",JSON.stringify(products)); localStorage.setItem("fashionDemoCart",JSON.stringify(cart)); localStorage.setItem("fashionDemoOrders",JSON.stringify(orders)); localStorage.setItem("fashionDemoSettings",JSON.stringify(settings)); }
function money(n){return "₹"+Number(n).toLocaleString("en-IN");}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2200);}
function productImage(p,small=false){return p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="image-placeholder" style="display:none">${p.emoji||"👕"}</span>` : `<span class="image-placeholder">${p.emoji||"👕"}</span>`;}
function renderProducts(){
  const query=$("searchInput").value.trim().toLowerCase();
  const list=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&(`${p.name} ${p.category}`).toLowerCase().includes(query));
  $("productGrid").innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-image">${productImage(p)}</div><div class="product-info"><h3>${escapeHtml(p.name)}</h3><div class="product-meta"><span class="price">${money(p.price)}</span><span class="tag">Demo offer</span></div><button class="add-button" data-add="${escapeHtml(p.id)}">＋ Cart मध्ये टाका</button></div></article>`).join(""):`<p>या शोधासाठी उत्पादने सापडली नाहीत.</p>`;
  $("productCount").textContent=`${list.length} उत्पादने`;
  document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b.dataset.category===activeCategory));
}
function renderCart(){
  $("cartCount").textContent=cart.reduce((n,i)=>n+i.qty,0);
  const items=cart.map(i=>({...i,product:products.find(p=>p.id===i.id)})).filter(i=>i.product);
  $("cartItems").innerHTML=items.length?items.map(i=>`<div class="cart-row"><div class="mini-image">${productImage(i.product,true)}</div><div class="cart-row-info"><strong>${escapeHtml(i.product.name)}</strong><span class="muted">${money(i.product.price)} each</span><div><strong>${money(i.product.price*i.qty)}</strong></div></div><div class="qty-controls"><button data-qty="${i.id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button data-qty="${i.id}" data-change="1" aria-label="Increase quantity">+</button><button class="remove-button" data-remove="${i.id}">Remove</button></div></div>`).join(""):`<p>तुझी Cart रिकामी आहे. आवडते कपडे Cart मध्ये टाक.</p>`;
  $("cartTotal").textContent=money(items.reduce((sum,i)=>sum+i.product.price*i.qty,0));
}
function hidePanels(){["cartPanel","checkoutPanel","successPanel","adminPanel"].forEach(id=>$(id).classList.add("hidden"));$("productGrid").classList.remove("hidden");}
function showPanel(id){hidePanels();$(id).classList.remove("hidden");if(id==="cartPanel")renderCart();if(id==="adminPanel")renderAdmin();$(id).scrollIntoView({behavior:"smooth",block:"start"});}
function renderAdmin(){
  $("adminProductList").innerHTML=products.map(p=>`<div class="admin-product"><div class="mini-image">${productImage(p,true)}</div><div class="product-desc"><strong>${escapeHtml(p.name)}</strong><span class="muted">${escapeHtml(p.category)} • ${money(p.price)}</span></div><div><button class="small-button" data-edit="${p.id}">Edit</button><button class="small-button" data-delete="${p.id}">Delete</button></div></div>`).join("")||"<p>अजून Product नाही.</p>";
  $("ordersList").innerHTML=orders.length?orders.slice().reverse().map(o=>`<div class="order-card"><strong>${escapeHtml(o.number)} — ${escapeHtml(o.name)}</strong><br>${escapeHtml(o.phone)} • ${escapeHtml(o.address)}<br>${o.items.map(i=>`${escapeHtml(i.name)} × ${i.qty}`).join(", ")}<br><strong>Total: ${money(o.total)}</strong> <span class="muted">• Demo order</span></div>`).join(""):"<p class='muted'>अजून Demo orders नाहीत.</p>";
  $("settingsForm").elements.storeName.value=settings.storeName;
  $("settingsForm").elements.accent.value=settings.accent;
}
function resetProductForm(){$("productForm").reset();$("productForm").elements.id.value="";$("productFormTitle").textContent="नवीन Product जोडा";}
function applySettings(){document.documentElement.style.setProperty("--accent",settings.accent);$("brandName").textContent=settings.storeName;$("footerBrand").textContent=settings.storeName;document.title=settings.storeName+" | Demo";}
function updateCart(id,change){const item=cart.find(i=>i.id===id);if(!item)return;item.qty+=change;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);saveAll();renderCart();renderProducts();}
$("productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;const id=b.dataset.add;const item=cart.find(i=>i.id===id);if(item)item.qty++;else cart.push({id,qty:1});saveAll();renderCart();toast("Product Cart मध्ये जोडले!");});
$("categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;renderProducts();});
$("searchInput").addEventListener("input",renderProducts);$("searchBtn").addEventListener("click",renderProducts);
$("shopNow").addEventListener("click",()=>$("productGrid").scrollIntoView({behavior:"smooth"}));
$("cartToggle").addEventListener("click",()=>showPanel("cartPanel"));$("adminToggle").addEventListener("click",()=>showPanel("adminPanel"));
$("closeCart").addEventListener("click",hidePanels);$("closeCheckout").addEventListener("click",()=>showPanel("cartPanel"));$("closeAdmin").addEventListener("click",hidePanels);
$("cartItems").addEventListener("click",e=>{const q=e.target.closest("[data-qty]");const r=e.target.closest("[data-remove]");if(q)updateCart(q.dataset.qty,Number(q.dataset.change));if(r){cart=cart.filter(i=>i.id!==r.dataset.remove);saveAll();renderCart();renderProducts();}});
$("goCheckout").addEventListener("click",()=>{if(!cart.length){toast("Checkout आधी Cart मध्ये Product टाक.");return;}showPanel("checkoutPanel");});
$("checkoutForm").addEventListener("submit",e=>{e.preventDefault();if(!cart.length){toast("Cart रिकामी आहे.");return;}const f=new FormData(e.currentTarget);const items=cart.map(i=>{const p=products.find(p=>p.id===i.id);return p?{id:p.id,name:p.name,price:p.price,qty:i.qty}:null;}).filter(Boolean);const total=items.reduce((n,i)=>n+i.price*i.qty,0);const order={number:"DEMO-"+Date.now().toString().slice(-7),name:f.get("name"),phone:f.get("phone"),address:f.get("address"),items,total,createdAt:new Date().toISOString()};orders.push(order);cart=[];saveAll();$("orderMessage").textContent=`Order ID: ${order.number} • Total: ${money(total)}. ही फक्त Demo order आहे; कोणतेही पेमेंट झालेले नाही.`;showPanel("successPanel");renderCart();});
$("continueShopping").addEventListener("click",()=>{hidePanels();window.scrollTo({top:0,behavior:"smooth"});});
$("productForm").addEventListener("submit",e=>{e.preventDefault();const form=e.currentTarget;const id=form.elements.id.value||"p"+Date.now();const file=form.elements.imageFile.files[0];const existing=products.find(p=>p.id===id);const saveProduct=(image)=>{const p={id,name:form.elements.name.value.trim(),category:form.elements.category.value,price:Number(form.elements.price.value),image:image||"",emoji:existing?.emoji||"👕"};if(existing)products=products.map(x=>x.id===id?p:x);else products.push(p);saveAll();renderProducts();renderAdmin();resetProductForm();toast("Product सेव्ह झाला!");};if(file){const reader=new FileReader();reader.onload=()=>saveProduct(reader.result);reader.readAsDataURL(file);}else saveProduct(form.elements.image.value.trim()||(existing?existing.image:""));});
$("adminProductList").addEventListener("click",e=>{const edit=e.target.closest("[data-edit]");const del=e.target.closest("[data-delete]");if(edit){const p=products.find(p=>p.id===edit.dataset.edit);if(!p)return;const f=$("productForm");f.elements.id.value=p.id;f.elements.name.value=p.name;f.elements.category.value=p.category;f.elements.price.value=p.price;f.elements.image.value=p.image.startsWith("data:")?"":p.image;$("productFormTitle").textContent="Product Edit करा";$("productForm").scrollIntoView({behavior:"smooth",block:"center"});}if(del){const id=del.dataset.delete;products=products.filter(p=>p.id!==id);cart=cart.filter(i=>i.id!==id);saveAll();renderProducts();renderCart();renderAdmin();toast("Product Delete झाला.");}});
$("cancelEdit").addEventListener("click",resetProductForm);
$("settingsForm").addEventListener("submit",e=>{e.preventDefault();const f=e.currentTarget;settings={storeName:f.elements.storeName.value.trim()||"Vastrmanjiri",accent:f.elements.accent.value};saveAll();applySettings();toast("Website settings सेव्ह झाल्या.");});
applySettings();renderProducts();renderCart();
