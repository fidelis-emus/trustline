import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Calculator as CalcIcon, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  LogOut, 
  Plus, 
  Trash2, 
  Users, 
  LayoutDashboard,
  Menu,
  X,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
interface Product {
  id: number;
  title: string;
  description: string;
  min_investment: number;
  expected_return: number;
  duration_months: number;
  image_url: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
}

interface AdminData {
  id: number;
  email: string;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState<UserData | null>(null);
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Check local storage for session
    const savedUser = localStorage.getItem("trustline_user");
    const savedAdmin = localStorage.getItem("trustline_admin");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin));
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    localStorage.removeItem("trustline_user");
    localStorage.removeItem("trustline_admin");
    setPage("home");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => setPage("home")}>
              <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="text-primary" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight">TRUSTLINE</span>
                <span className="block text-[10px] text-accent font-semibold tracking-[0.2em] uppercase">Capital Limited</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink label="Home" active={page === "home"} onClick={() => setPage("home")} />
              <NavLink label="About" active={page === "about"} onClick={() => setPage("about")} />
              <NavLink label="Products" active={page === "products"} onClick={() => setPage("products")} />
              <NavLink label="Calculator" active={page === "calculator"} onClick={() => setPage("calculator")} />
              <NavLink label="Contact" active={page === "contact"} onClick={() => setPage("contact")} />
              
              {user ? (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/20">
                  <span className="text-sm font-medium text-accent">Hello, {user.name.split(' ')[0]}</span>
                  <button onClick={logout} className="text-sm hover:text-accent transition-colors flex items-center">
                    <LogOut size={16} className="mr-1" /> Logout
                  </button>
                </div>
              ) : admin ? (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/20">
                  <button onClick={() => setPage("admin")} className="text-sm font-medium text-accent flex items-center">
                    <LayoutDashboard size={16} className="mr-1" /> Admin Panel
                  </button>
                  <button onClick={logout} className="text-sm hover:text-accent transition-colors flex items-center">
                    <LogOut size={16} className="mr-1" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4 ml-4">
                  <button onClick={() => setPage("login")} className="text-sm font-medium hover:text-accent transition-colors">Login</button>
                  <button onClick={() => setPage("register")} className="bg-accent hover:bg-accent-hover text-primary px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg">Open Account</button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-primary/95 border-t border-white/10"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                <MobileNavLink label="Home" onClick={() => { setPage("home"); setIsMenuOpen(false); }} />
                <MobileNavLink label="About" onClick={() => { setPage("about"); setIsMenuOpen(false); }} />
                <MobileNavLink label="Products" onClick={() => { setPage("products"); setIsMenuOpen(false); }} />
                <MobileNavLink label="Calculator" onClick={() => { setPage("calculator"); setIsMenuOpen(false); }} />
                <MobileNavLink label="Contact" onClick={() => { setPage("contact"); setIsMenuOpen(false); }} />
                {!user && !admin && (
                  <>
                    <MobileNavLink label="Login" onClick={() => { setPage("login"); setIsMenuOpen(false); }} />
                    <button onClick={() => { setPage("register"); setIsMenuOpen(false); }} className="w-full bg-accent text-primary py-3 rounded-lg font-bold mt-4">Open Account</button>
                  </>
                )}
                {(user || admin) && <MobileNavLink label="Logout" onClick={() => { logout(); setIsMenuOpen(false); }} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {page === "home" && <HomePage key="home" setPage={setPage} products={products} />}
          {page === "about" && <AboutPage key="about" />}
          {page === "products" && <ProductsPage key="products" products={products} />}
          {page === "calculator" && <CalculatorPage key="calculator" products={products} />}
          {page === "contact" && <ContactPage key="contact" />}
          {page === "login" && <LoginPage key="login" setUser={setUser} setAdmin={setAdmin} setPage={setPage} />}
          {page === "register" && <RegisterPage key="register" setPage={setPage} />}
          {page === "admin" && admin && <AdminPanel key="admin" products={products} fetchProducts={fetchProducts} />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 gold-gradient rounded flex items-center justify-center mr-2">
                  <TrendingUp className="text-primary w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight">TRUSTLINE</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Trustline Capital Limited is a leading asset management firm dedicated to providing innovative investment solutions and superior returns for our clients.
              </p>
            </div>
            <div>
              <h4 className="text-accent font-bold mb-6 uppercase text-xs tracking-widest">Quick Links</h4>
              <ul className="space-y-4 text-sm text-white/70">
                <li><button onClick={() => setPage("home")} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setPage("about")} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => setPage("products")} className="hover:text-white transition-colors">Investment Products</button></li>
                <li><button onClick={() => setPage("calculator")} className="hover:text-white transition-colors">Calculator</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-accent font-bold mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-white/70">
                <li><button onClick={() => setPage("contact")} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => setPage("login")} className="hover:text-white transition-colors">Investor Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-accent font-bold mb-6 uppercase text-xs tracking-widest">Contact Info</h4>
              <ul className="space-y-4 text-sm text-white/70">
                <li className="flex items-start">
                  <Mail size={16} className="mr-3 text-accent mt-1" />
                  <span>info@trustline.com</span>
                </li>
                <li className="flex items-start">
                  <Phone size={16} className="mr-3 text-accent mt-1" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start">
                  <Shield size={16} className="mr-3 text-accent mt-1" />
                  <span>SEC Registered & Regulated</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Trustline Capital Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Sub-Components ---

function NavLink({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`text-sm font-medium transition-all relative py-2 ${active ? 'text-accent' : 'text-white/80 hover:text-white'}`}
    >
      {label}
      {active && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
    </button>
  );
}

function MobileNavLink({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="block w-full text-left py-3 text-white/80 hover:text-accent font-medium transition-colors"
    >
      {label}
    </button>
  );
}

// --- Pages ---

function HomePage({ setPage, products }: { setPage: (p: string) => void, products: Product[], key?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Hero Section */}
      <section className="hero-gradient h-[85vh] flex items-center text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/30">
              Trusted Asset Management
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
              Grow Your Wealth with <span className="text-accent italic">Confidence</span>
            </h1>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              Experience professional-grade investment strategies tailored to your financial goals. We combine data-driven insights with decades of expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setPage("register")}
                className="bg-accent hover:bg-accent-hover text-primary px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl flex items-center justify-center"
              >
                Get Started Now <ArrowRight className="ml-2" size={20} />
              </button>
              <button 
                onClick={() => setPage("products")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-lg transition-all border border-white/20"
              >
                View Products
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <BarChart3 className="w-full h-full" />
        </div>
      </section>

      {/* Highlights */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Trustline?</h2>
            <div className="w-20 h-1 bg-accent mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HighlightCard 
              icon={<Shield className="text-accent" size={32} />}
              title="Secure & Regulated"
              description="Your assets are protected by industry-leading security protocols and full regulatory compliance."
            />
            <HighlightCard 
              icon={<BarChart3 className="text-accent" size={32} />}
              title="Expert Management"
              description="Our portfolio managers have a proven track record of delivering consistent returns across market cycles."
            />
            <HighlightCard 
              icon={<TrendingUp className="text-accent" size={32} />}
              title="Innovative Products"
              description="Access a wide range of investment vehicles from fixed income to high-growth equity funds."
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Investment Products</h2>
              <p className="text-slate-500">Explore our top-performing funds curated for your growth.</p>
            </div>
            <button onClick={() => setPage("products")} className="text-accent font-bold flex items-center hover:underline">
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.slice(0, 3).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your investment journey?</h2>
          <p className="text-white/70 mb-10 text-lg">Join thousands of successful investors who trust Trustline Capital Limited with their future.</p>
          <button 
            onClick={() => setPage("register")}
            className="bg-accent hover:bg-accent-hover text-primary px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl"
          >
            Create Your Account
          </button>
        </div>
      </section>
    </motion.div>
  );
}

function HighlightCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 card-hover">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ProductCard({ product, key }: { product: Product, key?: number }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 card-hover flex flex-col h-full">
      <div className="h-48 overflow-hidden relative">
        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4 bg-accent text-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          {product.expected_return}% Expected Return
        </div>
      </div>
      <div className="p-8 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-3">{product.title}</h3>
        <p className="text-slate-600 text-sm mb-6 flex-grow">{product.description}</p>
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Min. Investment</span>
            <span className="font-bold">${product.min_investment.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Duration</span>
            <span className="font-bold">{product.duration_months} Months</span>
          </div>
        </div>
        <button className="w-full mt-8 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
          Invest Now
        </button>
      </div>
    </div>
  );
}

function AboutPage({ key }: { key?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-accent font-bold uppercase tracking-widest text-xs mb-4 block">Our Story</span>
            <h2 className="text-4xl font-bold mb-8">A Legacy of Trust and Performance</h2>
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>
                Founded in 2010, Trustline Capital Limited has grown from a boutique investment firm to a comprehensive asset management powerhouse. Our mission has always been clear: to empower our clients through sound financial strategies.
              </p>
              <p>
                We believe that investment success is built on a foundation of rigorous research, disciplined risk management, and an unwavering commitment to our clients' best interests.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">$2.5B+</div>
                  <div className="text-sm text-slate-500">Assets Under Management</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">15k+</div>
                  <div className="text-sm text-slate-500">Satisfied Investors</div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1000" 
              alt="Office" 
              className="rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-8 -left-8 bg-accent p-8 rounded-2xl shadow-xl hidden md:block">
              <div className="text-primary font-bold text-xl mb-1">15+ Years</div>
              <div className="text-primary/70 text-sm">Industry Excellence</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductsPage({ products, key }: { products: Product[], key?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Investment Products</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Choose from our diverse range of investment funds designed to match your risk profile and return expectations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CalculatorPage({ products, key }: { products: Product[], key?: string }) {
  const [amount, setAmount] = useState<number>(1000);
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);
  const [result, setResult] = useState<{ total: number, profit: number } | null>(null);

  const calculate = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    const profit = (amount * (product.expected_return / 100)) * (product.duration_months / 12);
    setResult({
      total: amount + profit,
      profit: profit
    });
  };

  useEffect(() => {
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-primary text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="p-10 md:w-1/2 bg-primary/50">
            <div className="flex items-center mb-8">
              <CalcIcon className="text-accent mr-3" size={28} />
              <h2 className="text-2xl font-bold">Investment Calculator</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Investment Amount ($)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Select Product</label>
                <select 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} className="text-primary">{p.title} ({p.expected_return}%)</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={calculate}
                className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-4 rounded-xl transition-all shadow-lg mt-4"
              >
                Calculate Returns
              </button>
            </div>
          </div>
          
          <div className="p-10 md:w-1/2 gold-gradient text-primary flex flex-col justify-center items-center text-center">
            {result ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="text-sm font-bold uppercase tracking-widest mb-2 opacity-60">Estimated Total Value</div>
                <div className="text-5xl font-bold mb-8">${result.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                
                <div className="grid grid-cols-2 gap-8 w-full border-t border-primary/10 pt-8">
                  <div>
                    <div className="text-xs font-bold uppercase opacity-60 mb-1">Total Profit</div>
                    <div className="text-xl font-bold">${result.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase opacity-60 mb-1">Growth</div>
                    <div className="text-xl font-bold">+{((result.profit / amount) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center">
                <CalcIcon size={64} className="mx-auto mb-6 opacity-20" />
                <p className="font-medium opacity-60">Enter your investment details to see estimated returns.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ContactPage({ key }: { key?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
            <p className="text-slate-600 mb-10 leading-relaxed">
              Have questions about our investment products or need assistance with your account? Our team of experts is here to help you.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 text-accent">
                  <Mail />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Email Us</h4>
                  <p className="text-slate-500">support@trustline.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 text-accent">
                  <Phone />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Call Us</h4>
                  <p className="text-slate-500">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 text-accent">
                  <Briefcase />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Office Address</h4>
                  <p className="text-slate-500">123 Financial District, Suite 500<br />New York, NY 10005</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input type="email" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"></textarea>
              </div>
              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LoginPage({ setUser, setAdmin, setPage, key }: { setUser: (u: UserData) => void, setAdmin: (a: AdminData) => void, setPage: (p: string) => void, key?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const endpoint = isAdminMode ? "/api/admin/login" : "/api/auth/login";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        if (isAdminMode) {
          setAdmin(data.admin);
          localStorage.setItem("trustline_admin", JSON.stringify(data.admin));
          setPage("admin");
        } else {
          setUser(data.user);
          localStorage.setItem("trustline_user", JSON.stringify(data.user));
          setPage("home");
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Connection failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-primary p-8 text-center text-white">
          <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{isAdminMode ? "Admin Portal" : "Investor Login"}</h2>
          <p className="text-white/60 text-sm mt-2">Access your Trustline account</p>
        </div>
        
        <div className="p-8">
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-center"><X size={16} className="mr-2" /> {error}</div>}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-accent" 
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-accent" 
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg">
              Sign In
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-center space-y-4">
            {!isAdminMode && (
              <p className="text-sm text-slate-500">
                Don't have an account? <button onClick={() => setPage("register")} className="text-accent font-bold hover:underline">Register Now</button>
              </p>
            )}
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)} 
              className="text-xs text-slate-400 hover:text-primary transition-colors uppercase tracking-widest font-bold"
            >
              {isAdminMode ? "Switch to Investor Login" : "Admin Login"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RegisterPage({ setPage, key }: { setPage: (p: string) => void, key?: string }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setPage("login"), 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Registration failed");
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Account Created!</h2>
          <p className="text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-primary p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-white/60 text-sm mt-2">Start your investment journey today</p>
        </div>
        
        <div className="p-8">
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6">{error}</div>}
          
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input 
                type="tel" required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" 
              />
            </div>
            
            <button className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg mt-4">
              Create Account
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account? <button onClick={() => setPage("login")} className="text-accent font-bold hover:underline">Login</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function AdminPanel({ products, fetchProducts, key }: { products: Product[], fetchProducts: () => void, key?: string }) {
  const [tab, setTab] = useState("products");
  const [users, setUsers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    min_investment: 1000,
    expected_return: 10,
    duration_months: 12,
    image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800"
  });

  useEffect(() => {
    if (tab === "users") fetchUsers();
  }, [tab]);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct)
    });
    if (res.ok) {
      setShowAddModal(false);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Admin Dashboard</h2>
            <p className="text-slate-500">Manage your platform assets and users</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button 
              onClick={() => setTab("products")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "products" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              Products
            </button>
            <button 
              onClick={() => setTab("users")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "users" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              Investors
            </button>
          </div>
        </div>

        {tab === "products" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Investment Products ({products.length})</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-accent text-primary px-4 py-2 rounded-lg font-bold flex items-center shadow-md hover:bg-accent-hover transition-all"
              >
                <Plus size={18} className="mr-2" /> Add Product
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg">{p.title}</h4>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                  <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Return</div>
                      <div className="font-bold text-accent">{p.expected_return}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Min. Invest</div>
                      <div className="font-bold">${p.min_investment}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Investor</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mr-3 font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold">{u.name}</div>
                          <div className="text-xs text-slate-400">ID: #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{u.email}</div>
                      <div className="text-xs text-slate-400">{u.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary hover:text-accent transition-colors text-sm font-bold">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Investment Product</h3>
              <button onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <form className="p-8 space-y-4" onSubmit={handleAddProduct}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Title</label>
                <input 
                  type="text" required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min. Invest ($)</label>
                  <input 
                    type="number" required
                    value={newProduct.min_investment}
                    onChange={(e) => setNewProduct({ ...newProduct, min_investment: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Return (%)</label>
                  <input 
                    type="number" required
                    value={newProduct.expected_return}
                    onChange={(e) => setNewProduct({ ...newProduct, expected_return: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Months)</label>
                <input 
                  type="number" required
                  value={newProduct.duration_months}
                  onChange={(e) => setNewProduct({ ...newProduct, duration_months: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                <input 
                  type="text" required
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                />
              </div>
              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-primary/90 transition-all">
                Save Product
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
