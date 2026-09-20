import { checkServer } from "./services/api";

import { useState } from "react";



const normalizeDigits = (value) =>
  value
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));

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

const initialValues = {
  name: "",
  phone: "",
  password: "",
  acceptTerms: false,
};

export default function App() {
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

    const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  async function handleCheckServer() {
    try {
      const data = await checkServer();
      window.alert(data.message);
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

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (isSignup && values.name.trim().length < 2) {
      nextErrors.name = "نام خودت رو با حداقل ۲ حرف وارد کن.";
    }

    if (!/^09\d{9}$/.test(values.phone)) {
      nextErrors.phone = "یک شماره موبایل معتبر مثل 09123456789 وارد کن.";
    }

    if (!isForgot && !values.password) {
      nextErrors.password = "رمز عبورت رو وارد کن.";
    } else if (isSignup && values.password.length < 8) {
      nextErrors.password = "رمز عبور باید حداقل ۸ کاراکتر باشه.";
    }

    if (isSignup && !values.acceptTerms) {
      nextErrors.acceptTerms = "برای ادامه، شرایط استفاده رو تأیید کن.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    // اتصال به API ورود، ثبت‌نام یا درخواست بازیابی در این قسمت انجام می‌شود.
    // رمز عبور و کد بازیابی را در localStorage ذخیره نکنید.
    setNotice(
      isForgot
        ? "شماره معتبره. این نسخه نمایشی است و هنوز پیامکی ارسال نمی‌شه."
        : isSignup
          ? "اطلاعات معتبره. ساخت حساب بعد از اتصال به سرور فعال می‌شه."
          : "اطلاعات فرم معتبره. بررسی حساب و ورود به اتصال سرور نیاز داره."
    );
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

        <span className="header-caption">اینجا، آغاز یک همراهی‌ست.</span>
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

                <button type="submit" className="submit-button">
                  <span>
                    {isForgot
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
                <button type="button" onClick={handleCheckServer}>
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
