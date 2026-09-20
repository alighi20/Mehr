import { useEffect, useMemo, useState } from "react";
import {
  checkServer,
  clearAuthSession,
  getCurrentUser,
  getStoredAuth,
  loginUser,
  registerUser,
  requestPasswordReset,
  submitCartOrder,
} from "./services/api";

const normalizeDigits = (value = "") =>
  value
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit).toString())
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit).toString());

function SunMark({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="12" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M32 5v8M32 51v8M5 32h8M51 32h8" />
        <path d="m13 13 6 6m26 26 6 6M13 51l6-6m26-26 6-6" />
      </g>
    </svg>
  );
}

function EyeIcon({ open }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="m3 3 18 18" />}
    </svg>
  );
}

function SidebarIcon({ name }) {
  const commonProps = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const icons = {
    dashboard: (
      <svg {...commonProps}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
    books: (
      <svg {...commonProps}>
        <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15.5H7.5A2.5 2.5 0 0 0 5 21V5.5Z" />
        <path d="M5 5.5V20" />
        <path d="M9 7h6M9 11h6" />
      </svg>
    ),
    cart: (
      <svg {...commonProps}>
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="17" cy="18" r="1.5" />
        <path d="M3 4h2l2.4 9.2a1 1 0 0 0 1 .8H17a1 1 0 0 0 1-.8L20 7H7" />
      </svg>
    ),
    orders: (
      <svg {...commonProps}>
        <path d="M7 4.5h10a2 2 0 0 1 2 2V19a1 1 0 0 1-1.5.9L12 17.5l-5.5 2.4A1 1 0 0 1 5 19V6.5a2 2 0 0 1 2-2Z" />
        <path d="M9 8.5h6M9 12h6" />
      </svg>
    ),
    profile: (
      <svg {...commonProps}>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19c1.2-2.8 4-4.2 7-4.2s5.8 1.4 7 4.2" />
      </svg>
    ),
  };

  return <span className="nav-icon">{icons[name] || icons.dashboard}</span>;
}

const formatPrice = (value) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

const initialValues = {
  name: "",
  phone: "",
  password: "",
  acceptTerms: false,
};

const dashboardProducts = [
  {
    id: 1,
    title: "کتاب رشد فردی",
    category: "آموزشی",
    price: 269000,
    image: "/products/book-growth.svg",
    description: "راهنمای تمرین‌های روزانه برای ساختن عادت‌های پایدار.",
    badge: "پرفروش",
    rating: 4.9,
  },
  {
    id: 2,
    title: "دفتر برنامه‌ریزی",
    category: "ابزار",
    price: 149000,
    image: "/products/book-planner.svg",
    description: "برای نظم، اهداف و پیگیری روزانه با طراحی ساده و کاربردی.",
    badge: "جدید",
    rating: 4.8,
  },
  {
    id: 3,
    title: "کتاب داستان‌های الهام‌بخش",
    category: "ادبی",
    price: 199000,
    image: "/products/book-story.svg",
    description: "داستان‌های کوتاه با پیام‌های مثبت و انگیزشی برای آرامش ذهن.",
    badge: "ویژه",
    rating: 4.7,
  },
  {
    id: 4,
    title: "جعبه ابزار ذهنی",
    category: "همراهی",
    price: 349000,
    image: "/products/book-tools.svg",
    description: "مجموعه‌ای از تمرین‌ها و تکنیک‌ها برای بهبود تمرکز و آرامش.",
    badge: "مخصوص",
    rating: 5,
  },
];

const productCategories = ["همه", ...new Set(dashboardProducts.map((product) => product.category))];

const sidebarNav = [
  { id: "dashboard", label: "داشبورد", icon: "dashboard" },
  { id: "books", label: "کتاب‌ها", icon: "books" },
  { id: "cart", label: "سبد خرید", icon: "cart" },
  { id: "orders", label: "سفارش‌ها", icon: "orders" },
  { id: "profile", label: "پروفایل", icon: "profile" },
];

const quickStats = [
  { label: "دستگاه‌ها", value: "۱۲", trend: "+۸%" },
  { label: "سفارش‌ها", value: "۵۴", trend: "+۱۲%" },
  { label: "امتیاز", value: "۴.۹", trend: "+۰.۲" },
];

const featuredOffers = [
  { title: "پیشنهاد ویژه", text: "تخفیف ۲۰٪ روی کتاب‌های رشد فردی", accent: "gold" },
  { title: "بسته‌ی هدیه", text: "دو کتاب انتخابی با ارسال رایگان", accent: "teal" },
];

const recentOrders = [
  { name: "کتاب رشد فردی", status: "تحویل داده شد" },
  { name: "دفتر برنامه‌ریزی", status: "در حال ارسال" },
  { name: "کتاب داستان", status: "در انتظار پرداخت" },
];

export default function App() {
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedProduct, setSelectedProduct] = useState(dashboardProducts[0]);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    try {
      const savedTheme = window.localStorage.getItem("mehr-theme");
      return savedTheme === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-theme", theme);

    try {
      window.localStorage.setItem("mehr-theme", theme);
    } catch {
      // ignore storage errors in restricted browser contexts
    }
  }, [theme]);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(window.localStorage.getItem("mehr-cart") || "[]");
      if (Array.isArray(savedCart)) {
        setCart(savedCart);
      }
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("mehr-cart", JSON.stringify(cart));
    } catch {
      // ignore storage errors in restricted browser contexts
    }
  }, [cart]);

  useEffect(() => {
    const session = getStoredAuth();

    if (session.token) {
      getCurrentUser()
        .then((user) => {
          if (user) {
            setActiveUser(user);
            setNotice(`خوش‌آمدگویی، ${user.fullName || "کاربر"}.`);
          } else {
            clearAuthSession();
          }
        })
        .catch(() => {
          clearAuthSession();
        });
    }
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.quantity * item.price, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim();

    return dashboardProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "همه" || product.category === selectedCategory;
      const haystack = `${product.title} ${product.description} ${product.category}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [searchTerm, selectedCategory]);

  async function handleCheckServer() {
    try {
      const data = await checkServer();
      window.alert(data.message || "اتصال به سرور برقرار است.");
    } catch (error) {
      console.error("API connection failed:", error);
      window.alert("اتصال به سرور برقرار نشد.");
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setErrors({});
    setNotice("");
    setShowPassword(false);
    setValues((previous) => ({
      ...previous,
      password: "",
      acceptTerms: false,
    }));
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    const nextValue =
      type === "checkbox"
        ? checked
        : name === "phone"
          ? normalizeDigits(value).replace(/\D/g, "").slice(0, 11)
          : value;

    setValues((previous) => ({ ...previous, [name]: nextValue }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setNotice("");
  }

  function addToCart(product) {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { ...product, quantity: 1 }];
    });

    setNotice(`${product.title} به سبد خرید اضافه شد.`);
  }

  function updateCartQuantity(productId, delta) {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCart((previous) => previous.filter((item) => item.id !== productId));
  }

  async function handleCheckout() {
    if (!cart.length) {
      setNotice("سبد خرید شما خالی است.");
      return;
    }

    setIsSubmittingOrder(true);
    setNotice("");

    try {
      const result = await submitCartOrder({
        customer: activeUser?.fullName || "کاربر",
        items: cart.map(({ id, title, price, quantity }) => ({
          id,
          title,
          price,
          quantity,
        })),
        total: cartTotal,
      });

      setNotice(result.message || "سفارش شما با موفقیت ثبت شد.");
      setCart([]);
    } catch (error) {
      const message = error?.payload?.message || error?.message || "ثبت سفارش انجام نشد.";
      setNotice(message);
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    const normalizedPhone = normalizeDigits(values.phone).replace(/\D/g, "");
    const password = values.password.trim();

    if (isSignup && values.name.trim().length < 2) {
      nextErrors.name = "نام خودت رو با حداقل ۲ حرف وارد کن.";
    }

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      nextErrors.phone = "یک شماره موبایل معتبر مثل 09123456789 وارد کن.";
    }

    if (!isForgot && !password) {
      nextErrors.password = "رمز عبورت رو وارد کن.";
    } else if (isSignup && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(password)) {
      nextErrors.password = "رمز عبور باید حداقل ۸ کاراکتر، با حرف بزرگ، کوچک و عدد باشد.";
    } else if (!isSignup && password.length < 8) {
      nextErrors.password = "رمز عبور باید حداقل ۸ کاراکتر داشته باشد.";
    }

    if (isSignup && !values.acceptTerms) {
      nextErrors.acceptTerms = "برای ادامه، شرایط استفاده رو تأیید کن.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    setNotice("");

    try {
      if (isForgot) {
        const result = await requestPasswordReset({ phone: normalizedPhone });
        setNotice(result.message || "درخواست بازیابی ثبت شد.");
        setMode("login");
        setValues((previous) => ({ ...previous, phone: normalizedPhone, password: "" }));
        return;
      }

      if (isSignup) {
        const result = await registerUser({
          fullName: values.name.trim(),
          phone: normalizedPhone,
          password,
        });

        setNotice(result.message || "ثبت‌نام انجام شد.");
        setMode("login");
        setValues({ ...initialValues, phone: normalizedPhone });
        return;
      }

      const result = await loginUser({
        phone: normalizedPhone,
        password,
      });

      setNotice(result.message || "ورود با موفقیت انجام شد.");
      setActiveUser(result.user || null);
      setValues(initialValues);
    } catch (error) {
      const message = error?.payload?.message || error?.message || "عملیات انجام نشد.";
      setErrors((previous) => ({ ...previous, form: message }));
      setNotice(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearAuthSession();
    setActiveUser(null);
    setNotice("شما از حساب خود خارج شدید.");
    setMode("login");
    setValues(initialValues);
  }

  function goToPage(pageKey, product = null) {
    setActivePage(pageKey);
    if (product) {
      setSelectedProduct(product);
    }
  }

  const title = isForgot
    ? "رمزت رو فراموش کردی؟"
    : isSignup
      ? "به جمع مهر بپیوند"
      : "به مهر خوش اومدی";

  const subtitle = isForgot
    ? "شماره موبایل حسابت رو برای بازیابی رمز وارد کن."
    : isSignup
      ? "چند قدم ساده تا شروع یک تجربه تازه."
      : "برای ادامه مسیر، وارد حسابت شو.";

  if (activeUser) {
    const renderUserPage = () => {
      switch (activePage) {
        case "books":
          return (
            <main className="page dashboard-page" dir="rtl">
              <header className="dashboard-header">
                <div className="brand">
                  <span className="brand-icon"><SunMark /></span>
                  <span className="brand-copy"><strong>مهر</strong><span>کتاب‌ها</span></span>
                </div>
                <div className="header-actions">
                  <button type="button" className="theme-toggle" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀️ روشن" : "🌙 تاریک"}</button>
                  <button type="button" className="logout-button" onClick={handleLogout}>خروج</button>
                </div>
              </header>

              <section className="dashboard-shell">
                <aside className="dashboard-sidebar">
                  <div className="dashboard-brand-mini">
                    <span className="brand-icon small-brand"><SunMark /></span>
                    <div><strong>مهر</strong><span>فروشگاه هوشمند</span></div>
                  </div>
                  <nav className="nav-list" aria-label="منوی داشبورد">
                    {sidebarNav.map((item) => (
                      <button key={item.id} type="button" className={activePage === item.id ? "nav-item active" : "nav-item"} onClick={() => setActivePage(item.id)}>
                        <SidebarIcon name={item.icon} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                  <div className="sidebar-card"><span>درآمد ماهانه</span><strong>۲۸,۴۰۰,۰۰۰</strong><small>+۲۶٪ نسبت به ماه گذشته</small></div>
                </aside>

                <div className="dashboard-main">
                  <div className="page-hero">
                    <div>
                      <span className="section-label">کتاب‌ها</span>
                      <h2>پیشنهادهای منتخب مهر</h2>
                    </div>
                    <button type="button" className="primary-action-button" onClick={() => goToPage("add-product")}>+ افزودن محصول</button>
                  </div>

                  <div className="dashboard-toolbar">
                    <label className="search-box" aria-label="جست‌وجو در محصولات">
                      <span>⌕</span>
                      <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="جست‌وجو در محصولات..." />
                    </label>
                    <div className="toolbar-pills" aria-label="دسته‌بندی محصولات">
                      {productCategories.map((category) => (
                        <button key={category} type="button" className={selectedCategory === category ? "category-pill active" : "category-pill"} onClick={() => setSelectedCategory(category)}>{category}</button>
                      ))}
                    </div>
                  </div>

                  <div className="product-grid">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <article key={product.id} className="product-card">
                          <div className="product-image-wrap"><span className="product-badge">{product.badge}</span><img src={product.image} alt={product.title} className="product-image" /></div>
                          <div className="product-info">
                            <div className="product-meta"><span>{product.category}</span><span className="rating-pill">★ {product.rating}</span></div>
                            <h3>{product.title}</h3>
                            <p>{product.description}</p>
                            <div className="product-footer">
                              <strong>{formatPrice(product.price)}</strong>
                              <div className="product-cta">
                                <button type="button" className="secondary-button" onClick={() => goToPage("product-detail", product)}>جزئیات</button>
                                <button type="button" className="buy-button" onClick={() => {
                                  addToCart(product);
                                  goToPage("cart");
                                }}>افزودن به سبد</button>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-results">
                        <p>هیچ محصولی با این جست‌وجو پیدا نشد.</p>
                        <button type="button" onClick={() => { setSearchTerm(""); setSelectedCategory("همه"); }}>نمایش همه محصولات</button>
                      </div>
                    )}
                  </div>
                </div>

                <aside className="cart-panel">
                  <div className="cart-header">
                    <div><span className="section-label">سبد خرید</span><h3>محصولات انتخابی</h3></div>
                    <span className="cart-badge">{cartCount}</span>
                  </div>
                  <div className="mini-summary"><span>جمع فعلی</span><strong>{formatPrice(cartTotal)}</strong></div>
                  {cart.length === 0 ? (
                    <div className="empty-cart"><div className="empty-cart-icon">🛒</div><p>سبد خرید شما خالی است.</p><span>محصولات مورد علاقه‌ات را انتخاب کن.</span></div>
                  ) : (
                    <div className="cart-items">
                      {cart.map((item) => (
                        <div key={item.id} className="cart-item">
                          <div className="cart-item-copy"><strong>{item.title}</strong><span>{formatPrice(item.price)}</span></div>
                          <div className="cart-actions">
                            <div className="quantity-box"><button type="button" onClick={() => updateCartQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button type="button" onClick={() => updateCartQuantity(item.id, 1)}>+</button></div>
                            <button type="button" className="remove-item" onClick={() => removeFromCart(item.id)}>حذف</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="cart-summary">
                    <div className="summary-row"><span>جمع سبد</span><strong>{formatPrice(cartTotal)}</strong></div>
                    <div className="summary-row total-row"><span>جمع نهایی</span><strong>{formatPrice(cartTotal)}</strong></div>
                    <button type="button" className="checkout-button" onClick={() => goToPage("cart")}>مشاهده سبد خرید</button>
                  </div>
                </aside>
              </section>
            </main>
          );

        case "cart":
          return (
            <main className="page dashboard-page" dir="rtl">
              <header className="dashboard-header">
                <div className="brand"><span className="brand-icon"><SunMark /></span><span className="brand-copy"><strong>مهر</strong><span>سبد خرید</span></span></div>
                <div className="header-actions">
                  <button type="button" className="theme-toggle" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀️ روشن" : "🌙 تاریک"}</button>
                  <button type="button" className="logout-button" onClick={handleLogout}>خروج</button>
                </div>
              </header>

              <section className="screen-shell">
                <div className="screen-panel wide-panel">
                  <div className="page-hero">
                    <div><span className="section-label">سبد خرید</span><h2>محصولات انتخابی شما</h2></div>
                    <div className="welcome-actions">
                      <button type="button" className="ghost-action-button" onClick={() => goToPage("books")}>بازگشت به کتاب‌ها</button>
                      <button type="button" className="primary-action-button" onClick={() => goToPage("dashboard")}>داشبورد</button>
                    </div>
                  </div>

                  {cart.length === 0 ? (
                    <div className="empty-cart large-empty"><div className="empty-cart-icon">🛒</div><p>سبد خرید شما خالی است.</p><span>برای شروع خرید، یکی از کتاب‌ها را انتخاب کنید.</span><button type="button" className="primary-action-button" onClick={() => goToPage("books")}>مشاهده محصولات</button></div>
                  ) : (
                    <>
                      <div className="cart-list-block">
                        {cart.map((item) => (
                          <div key={item.id} className="line-item">
                            <div className="line-item-info">
                              <img src={item.image} alt={item.title} className="line-item-image" />
                              <div>
                                <strong>{item.title}</strong>
                                <span>{item.category}</span>
                              </div>
                            </div>
                            <div className="line-item-tools">
                              <div className="quantity-box">
                                <button type="button" onClick={() => updateCartQuantity(item.id, -1)}>−</button>
                                <span>{item.quantity}</span>
                                <button type="button" onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                              </div>
                              <strong>{formatPrice(item.price * item.quantity)}</strong>
                              <button type="button" className="remove-item" onClick={() => removeFromCart(item.id)}>حذف</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="checkout-box">
                        <div className="summary-row"><span>جمع محصولات</span><strong>{formatPrice(cartTotal)}</strong></div>
                        <div className="summary-row"><span>هزینه ارسال</span><strong>رایگان</strong></div>
                        <div className="summary-row total-row"><span>مبلغ نهایی</span><strong>{formatPrice(cartTotal)}</strong></div>
                        <button type="button" className="checkout-button" onClick={handleCheckout} disabled={isSubmittingOrder}>{isSubmittingOrder ? "در حال ثبت سفارش..." : "تأیید و پرداخت"}</button>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </main>
          );

        case "orders":
          return (
            <main className="page dashboard-page" dir="rtl">
              <header className="dashboard-header">
                <div className="brand"><span className="brand-icon"><SunMark /></span><span className="brand-copy"><strong>مهر</strong><span>سفارش‌ها</span></span></div>
                <div className="header-actions">
                  <button type="button" className="theme-toggle" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀️ روشن" : "🌙 تاریک"}</button>
                  <button type="button" className="logout-button" onClick={handleLogout}>خروج</button>
                </div>
              </header>

              <section className="screen-shell">
                <div className="screen-panel wide-panel">
                  <div className="page-hero">
                    <div><span className="section-label">سفارش‌ها</span><h2>آخرین خریدهای شما</h2></div>
                    <button type="button" className="primary-action-button" onClick={() => goToPage("dashboard")}>بازگشت به داشبورد</button>
                  </div>

                  <div className="order-list">
                    {recentOrders.map((order, index) => (
                      <div key={order.name} className="order-row">
                        <div>
                          <strong>#{index + 1} {order.name}</strong>
                          <span>شماره سفارش: ۲۱۶۸۷{index + 11}</span>
                        </div>
                        <div className="order-meta">
                          <small>{order.status}</small>
                          <button type="button" className="ghost-action-button" onClick={() => goToPage("books")}>مشاهده مجدد</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </main>
          );

        case "profile":
          return (
            <main className="page dashboard-page" dir="rtl">
              <header className="dashboard-header">
                <div className="brand"><span className="brand-icon"><SunMark /></span><span className="brand-copy"><strong>مهر</strong><span>پروفایل</span></span></div>
                <div className="header-actions">
                  <button type="button" className="theme-toggle" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀️ روشن" : "🌙 تاریک"}</button>
                  <button type="button" className="logout-button" onClick={handleLogout}>خروج</button>
                </div>
              </header>

              <section className="screen-shell">
                <div className="screen-panel wide-panel profile-card-page">
                  <div className="page-hero">
                    <div><span className="section-label">پروفایل</span><h2>اطلاعات حساب</h2></div>
                    <button type="button" className="primary-action-button" onClick={() => goToPage("dashboard")}>بازگشت</button>
                  </div>

                  <div className="profile-box">
                    <div className="profile-avatar">{(activeUser.fullName || "کاربر").slice(0, 1)}</div>
                    <div className="profile-info">
                      <strong>{activeUser.fullName || "کاربر"}</strong>
                      <span>{activeUser.phone || "شماره نامشخص"}</span>
                      <small>عضویت فعال در مهر</small>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button type="button" className="ghost-action-button" onClick={() => goToPage("orders")}>سفارش‌ها</button>
                    <button type="button" className="ghost-action-button" onClick={() => goToPage("books")}>کتاب‌ها</button>
                    <button type="button" className="logout-button" onClick={handleLogout}>خروج از حساب</button>
                  </div>
                </div>
              </section>
            </main>
          );

        case "product-detail":
          return (
            <main className="page dashboard-page" dir="rtl">
              <header className="dashboard-header">
                <div className="brand"><span className="brand-icon"><SunMark /></span><span className="brand-copy"><strong>مهر</strong><span>جزئیات محصول</span></span></div>
                <div className="header-actions">
                  <button type="button" className="theme-toggle" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀️ روشن" : "🌙 تاریک"}</button>
                  <button type="button" className="logout-button" onClick={handleLogout}>خروج</button>
                </div>
              </header>

              <section className="screen-shell">
                <div className="screen-panel wide-panel product-detail-page">
                  <button type="button" className="ghost-action-button" onClick={() => goToPage("books")}>← بازگشت به کتاب‌ها</button>
                  <div className="detail-panel detail-page-card">
                    <div className="detail-image-wrap"><img src={selectedProduct.image} alt={selectedProduct.title} /></div>
                    <div className="detail-copy">
                      <div className="detail-header"><span className="detail-badge">{selectedProduct.badge}</span><span className="rating-pill">★ {selectedProduct.rating}</span></div>
                      <div className="detail-description-block"><span className="section-label">محصول منتخب</span><h3>{selectedProduct.title}</h3></div>
                      <p>{selectedProduct.description}</p>
                      <div className="detail-meta"><span>{selectedProduct.category}</span><span>ارسال ۲۴ ساعته</span><span>تضمین کیفیت</span></div>
                      <div className="detail-price-row"><strong>{formatPrice(selectedProduct.price)}</strong><small>تخفیف ویژه برای اعضای مهر</small></div>
                      <ul className="detail-features"><li>کیفیت چاپ بالا و جلد مقاوم</li><li>مطالب کاربردی با تمرین‌های روزانه</li><li>ارسال سریع و پشتیبانی ۷ روز هفته</li></ul>
                      <div className="detail-actions">
                        <button type="button" className="primary-action-button" onClick={() => {
                          addToCart(selectedProduct);
                          goToPage("cart");
                        }}>افزودن به سبد</button>
                        <button type="button" className="ghost-action-button" onClick={() => goToPage("books")}>انصراف</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          );

        case "add-product":
          return (
            <main className="page dashboard-page" dir="rtl">
              <header className="dashboard-header">
                <div className="brand"><span className="brand-icon"><SunMark /></span><span className="brand-copy"><strong>مهر</strong><span>افزودن محصول</span></span></div>
                <div className="header-actions">
                  <button type="button" className="theme-toggle" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀️ روشن" : "🌙 تاریک"}</button>
                  <button type="button" className="logout-button" onClick={handleLogout}>خروج</button>
                </div>
              </header>

              <section className="screen-shell">
                <div className="screen-panel wide-panel">
                  <div className="page-hero">
                    <div><span className="section-label">محصول جدید</span><h2>ثبت کتاب در فروشگاه</h2></div>
                    <div className="welcome-actions">
                      <button type="button" className="ghost-action-button" onClick={() => goToPage("books")}>لغو</button>
                      <button type="button" className="primary-action-button" onClick={() => { setNotice("محصول جدید با موفقیت ثبت شد."); goToPage("books"); }}>ذخیره محصول</button>
                    </div>
                  </div>

                  <div className="add-product-form">
                    <div className="field"><label>عنوان کتاب</label><input type="text" defaultValue="کتاب جدید مهر" /></div>
                    <div className="field"><label>دسته‌بندی</label><input type="text" defaultValue="آموزشی" /></div>
                    <div className="field"><label>قیمت</label><input type="text" defaultValue="۲۹۹۰۰۰" /></div>
                    <div className="field"><label>توضیحات</label><textarea rows="4" defaultValue="این کتاب به‌روز و با طراحی مدرن برای کمک به رشد و تمرکز کاربران منتشر شده است." /></div>
                  </div>
                </div>
              </section>
            </main>
          );

        default:
          return (
            <main className="page dashboard-page" dir="rtl">
              <header className="dashboard-header">
                <div className="brand"><span className="brand-icon"><SunMark /></span><span className="brand-copy"><strong>مهر</strong><span>داشبورد شما</span></span></div>
                <div className="header-actions">
                  <button type="button" className="theme-toggle" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>{theme === "dark" ? "☀️ روشن" : "🌙 تاریک"}</button>
                  <button type="button" className="logout-button" onClick={handleLogout}>خروج</button>
                </div>
              </header>

              <section className="dashboard-shell">
                <aside className="dashboard-sidebar">
                  <div className="dashboard-brand-mini"><span className="brand-icon small-brand"><SunMark /></span><div><strong>مهر</strong><span>فروشگاه هوشمند</span></div></div>
                  <nav className="nav-list" aria-label="منوی داشبورد">
                    {sidebarNav.map((item) => (
                      <button key={item.id} type="button" className={activePage === item.id ? "nav-item active" : "nav-item"} onClick={() => setActivePage(item.id)}>
                        <SidebarIcon name={item.icon} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                  <div className="sidebar-card"><span>درآمد ماهانه</span><strong>۲۸,۴۰۰,۰۰۰</strong><small>+۲۶٪ نسبت به ماه گذشته</small></div>
                </aside>

                <div className="dashboard-main">
                  <div className="welcome-banner">
                    <div><span className="section-label">حساب فعال</span><h1>سلام، {activeUser.fullName || "کاربر"}</h1></div>
                    <div className="welcome-actions">
                      <button type="button" className="ghost-action-button" onClick={() => goToPage("orders")}>سفارش‌های من</button>
                      <button type="button" className="primary-action-button" onClick={() => goToPage("add-product")}>+ اضافه کردن محصول</button>
                    </div>
                  </div>

                  <div className="featured-strip">{featuredOffers.map((offer) => (<div key={offer.title} className={`offer-card ${offer.accent}`}><span>{offer.title}</span><p>{offer.text}</p></div>))}</div>

                  <div className="detail-panel">
                    <div className="detail-image-wrap"><img src={selectedProduct.image} alt={selectedProduct.title} /></div>
                    <div className="detail-copy">
                      <div className="detail-header"><span className="detail-badge">{selectedProduct.badge}</span><span className="rating-pill">★ {selectedProduct.rating}</span></div>
                      <div className="detail-description-block"><span className="section-label">محصول منتخب</span><h3>{selectedProduct.title}</h3></div>
                      <p>{selectedProduct.description}</p>
                      <div className="detail-meta"><span>{selectedProduct.category}</span><span>ارسال ۲۴ ساعته</span><span>تضمین کیفیت</span></div>
                      <div className="detail-price-row"><strong>{formatPrice(selectedProduct.price)}</strong><small>تخفیف ویژه برای اعضای مهر</small></div>
                      <ul className="detail-features"><li>کیفیت چاپ بالا و جلد مقاوم</li><li>مطالب کاربردی با تمرین‌های روزانه</li><li>ارسال سریع و پشتیبانی ۷ روز هفته</li></ul>
                      <div className="detail-actions">
                        <button type="button" className="primary-action-button" onClick={() => {
                          addToCart(selectedProduct);
                          goToPage("cart");
                        }}>افزودن به سبد</button>
                        <button type="button" className="ghost-action-button" onClick={() => setSelectedProduct(dashboardProducts[0])}>انتخاب اولیه</button>
                      </div>
                    </div>
                  </div>

                  <div className="stats-grid">{quickStats.map((stat) => (<div key={stat.label} className="stat-box"><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.trend}</small></div>))}</div>

                  <div className="products-panel">
                    <div className="panel-head"><div><span className="section-label">پیشنهاد مهر</span><h2>محصولات منتخب</h2></div><button type="button" className="view-all-button" onClick={() => goToPage("books")}>مشاهده همه</button></div>
                    <div className="dashboard-toolbar"><label className="search-box" aria-label="جست‌وجو در محصولات"><span>⌕</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="جست‌وجو در محصولات..." /></label><div className="toolbar-pills" aria-label="دسته‌بندی محصولات">{productCategories.map((category) => (<button key={category} type="button" className={selectedCategory === category ? "category-pill active" : "category-pill"} onClick={() => setSelectedCategory(category)}>{category}</button>))}</div></div>
                    <div className="product-grid">{filteredProducts.length > 0 ? filteredProducts.map((product) => (<article key={product.id} className="product-card"><div className="product-image-wrap"><span className="product-badge">{product.badge}</span><img src={product.image} alt={product.title} className="product-image" /></div><div className="product-info"><div className="product-meta"><span>{product.category}</span><span className="rating-pill">★ {product.rating}</span></div><h3>{product.title}</h3><p>{product.description}</p><div className="product-footer"><strong>{formatPrice(product.price)}</strong><div className="product-cta"><button type="button" className="secondary-button" onClick={() => goToPage("product-detail", product)}>جزئیات</button><button type="button" className="buy-button" onClick={() => { addToCart(product); goToPage("cart"); }}>افزودن به سبد</button></div></div></div></article>)) : <div className="empty-results"><p>هیچ محصولی با این جست‌وجو پیدا نشد.</p><button type="button" onClick={() => { setSearchTerm(""); setSelectedCategory("همه"); }}>نمایش همه محصولات</button></div>}</div>
                  </div>
                </div>

                <aside className="cart-panel">
                  <div className="cart-header"><div><span className="section-label">سبد خرید</span><h3>محصولات انتخابی</h3></div><span className="cart-badge">{cartCount}</span></div>
                  <div className="mini-summary"><span>جمع فعلی</span><strong>{formatPrice(cartTotal)}</strong></div>
                  {cart.length === 0 ? (<div className="empty-cart"><div className="empty-cart-icon">🛒</div><p>سبد خرید شما خالی است.</p><span>محصولات مورد علاقه‌ات را انتخاب کن.</span></div>) : (
                    <div className="cart-items">{cart.map((item) => (<div key={item.id} className="cart-item"><div className="cart-item-copy"><strong>{item.title}</strong><span>{formatPrice(item.price)}</span></div><div className="cart-actions"><div className="quantity-box"><button type="button" onClick={() => updateCartQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button type="button" onClick={() => updateCartQuantity(item.id, 1)}>+</button></div><button type="button" className="remove-item" onClick={() => removeFromCart(item.id)}>حذف</button></div></div>))}</div>
                  )}
                  <div className="cart-summary"><div className="summary-row"><span>جمع سبد</span><strong>{formatPrice(cartTotal)}</strong></div><div className="summary-row total-row"><span>جمع نهایی</span><strong>{formatPrice(cartTotal)}</strong></div><button type="button" className="checkout-button" onClick={() => goToPage("cart")}>مشاهده سبد خرید</button></div>
                </aside>
              </section>
            </main>
          );
      }
    };

    return renderUserPage();
  }

  return (
    <main className="page" dir="rtl">
      <header className="page-header">
        <a
          className="brand"
          href="./"
          aria-label="مهر — صفحه اصلی"
          onClick={(event) => {
            event.preventDefault();
            changeMode("login");
          }}
        >
          <span className="brand-icon">
            <SunMark />
          </span>

          <span className="brand-copy">
            <strong>مهر</strong>
            <span>شروعی روشن، همراه مهر</span>
          </span>
        </a>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            aria-label={theme === "dark" ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "☀️ روشن" : "🌙 تاریک"}
          </button>
          <span className="header-caption">اینجا، آغاز یک همراهی‌ست.</span>
        </div>
      </header>

      <section
        className={`auth-card ${isSignup ? "is-signup" : ""}`}
        aria-label="ورود و ثبت‌نام مهر"
      >
        <aside className="story-panel">
          <div className="story-top">
            <span className="story-badge">
              <span />
              روشن‌تر از همیشه
            </span>

            <SunMark className="story-logo" />
          </div>

          <div className="story-copy">
            <span className="eyebrow">هر آغاز، یک طلوع تازه‌ست</span>

            <h1>
              کمی روشنایی،
              <br />
              یک دنیا <span>مهر.</span>
            </h1>

            <p>
              اینجا فرصت تازه‌ای برای شروعه؛
              <br />
              با خیال آسوده، قدم بعدی رو بردار.
            </p>
          </div>

          <div className="landscape" aria-hidden="true">
            <div className="arch arch-outer" />
            <div className="arch arch-inner" />
            <div className="art-sun" />
            <div className="sun-orbit" />
            <div className="hill hill-back" />
            <div className="hill hill-middle" />
            <div className="hill hill-front" />
            <span className="spark spark-one">✦</span>
            <span className="spark spark-two">✧</span>
          </div>

          <div className="story-bottom">
            <span>با مهر، کنار هم.</span>
            <span className="story-line" />
            <span>MEHR</span>
          </div>
        </aside>

        <div className="form-panel">
          <div className="form-content">
            <div className="mode-tabs" aria-label="انتخاب فرم">
              <button
                type="button"
                className={!isSignup ? "active" : ""}
                aria-pressed={!isSignup}
                onClick={() => changeMode("login")}
              >
                ورود
              </button>

              <button
                type="button"
                className={isSignup ? "active" : ""}
                aria-pressed={isSignup}
                onClick={() => changeMode("signup")}
              >
                ثبت‌نام
              </button>
            </div>

            <div className="form-view" key={mode}>
              <div className="form-heading">
                <span className="heading-icon">
                  <SunMark />
                </span>
                <h2>{title}</h2>
                <p>{subtitle}</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {isSignup && (
                  <div className="field">
                    <label htmlFor="name">نام و نام خانوادگی</label>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      placeholder="مثلاً علی محمدی"
                      value={values.name}
                      onChange={updateField}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <span className="field-error" id="name-error">
                        {errors.name}
                      </span>
                    )}
                  </div>
                )}

                <div className="field">
                  <label htmlFor="phone">شماره موبایل</label>
                  <div className="input-wrap">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="0912 345 6789"
                      dir="ltr"
                      className="phone-input"
                      value={values.phone}
                      onChange={updateField}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                    />
                    <span className="input-tag" aria-hidden="true">
                      IR
                    </span>
                  </div>
                  {errors.phone && (
                    <span className="field-error" id="phone-error">
                      {errors.phone}
                    </span>
                  )}
                </div>

                {!isForgot && (
                  <div className="field">
                    <label htmlFor="password">رمز عبور</label>
                    <div className="input-wrap">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          isSignup ? "new-password" : "current-password"
                        }
                        placeholder={
                          isSignup ? "حداقل ۸ کاراکتر" : "رمز عبورت رو وارد کن"
                        }
                        className="password-input"
                        value={values.password}
                        onChange={updateField}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={
                          errors.password ? "password-error" : undefined
                        }
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((previous) => !previous)}
                        aria-label={
                          showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"
                        }
                        aria-pressed={showPassword}
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    {errors.password && (
                      <span className="field-error" id="password-error">
                        {errors.password}
                      </span>
                    )}
                  </div>
                )}

                {isSignup ? (
                  <div className="terms-block">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={values.acceptTerms}
                        onChange={updateField}
                        aria-invalid={Boolean(errors.acceptTerms)}
                        aria-describedby={
                          errors.acceptTerms ? "terms-error" : undefined
                        }
                      />
                      <span>
                        <a href="#terms">شرایط استفاده</a> رو می‌پذیرم.
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <span className="field-error" id="terms-error">
                        {errors.acceptTerms}
                      </span>
                    )}
                  </div>
                ) : !isForgot ? (
                  <div className="form-options">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => changeMode("forgot")}
                    >
                      رمز عبورت رو فراموش کردی؟
                    </button>
                  </div>
                ) : null}

                {errors.form && (
                  <div className="notice error" role="alert">
                    {errors.form}
                  </div>
                )}

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  <span>
                    {isSubmitting
                      ? "در حال ارسال..."
                      : isForgot
                        ? "درخواست بازیابی رمز"
                        : isSignup
                          ? "ساخت حساب مهر"
                          : "ورود به مهر"}
                  </span>
                  <span aria-hidden="true">←</span>
                </button>

                {notice && (
                  <div className="notice" role="status">
                    {notice}
                  </div>
                )}

                <button type="button" onClick={handleCheckServer} className="text-button">
                  تست اتصال به سرور
                </button>
              </form>

              <div className="form-switch">
                <span>
                  {isForgot
                    ? "رمزت یادت اومد؟"
                    : isSignup
                      ? "قبلاً عضو مهر شدی؟"
                      : "هنوز حساب نداری؟"}
                </span>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    changeMode(isSignup || isForgot ? "login" : "signup")
                  }
                >
                  {isSignup || isForgot ? "وارد شو" : "به مهر بپیوند"}
                </button>
              </div>

              {isSignup && (
                <details className="terms-details" id="terms">
                  <summary>شرایط استفاده از نسخه نمایشی</summary>
                  <p>
                    این صفحه برای نمایش رابط کاربری است. حساب واقعی ساخته
                    نمی‌شود و اطلاعات فرم به سروری ارسال نمی‌شود. شرایط سرویس
                    اصلی پیش از راه‌اندازی منتشر خواهد شد.
                  </p>
                </details>
              )}
            </div>

            <div className="form-footer">
              <span className="mini-sun">✦</span>
              شروعی ساده برای روزهای روشن‌تر
            </div>
          </div>
        </div>
      </section>

      <footer className="page-footer">
        <span>با مهر ساخته شده، برای همراهی با تو.</span>
        <span>© {new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date())} مهر</span>
      </footer>
    </main>
  );
}
