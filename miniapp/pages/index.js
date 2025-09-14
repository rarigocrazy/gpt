"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);

  useEffect(() => {
    try {
      // wait a tick to let Telegram inject API in some environments
      const init = () => {
        if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();

          setDebug({
            hasWebApp: true,
            initData: tg.initData,
            initDataUnsafe: tg.initDataUnsafe || null,
          });

          const user = tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user : null;
          setUser(user);

          // Send initData to server for verification
          fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: tg.initData }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.ok) setVerified("✅ Подпись верная");
              else setVerified("❌ Неверная подпись или ошибка проверки");
            })
            .catch((e) => setError("Ошибка запроса: " + e.message));
        } else {
          // not running inside Telegram Web App context
          setDebug({ hasWebApp: false, windowTelegram: typeof window !== "undefined" ? window.Telegram : null });
          setError("❌ Открой через Telegram Mini App (мобильное приложение Telegram рекомендуем).");
        }
      };

      // small timeout to allow Telegram to inject globals in some clients
      const t = setTimeout(init, 50);
      return () => clearTimeout(t);
    } catch (e) {
      setError("Ошибка инициализации: " + e.message);
    }
  }, []);

  return (
    <main style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>{user ? `Привет, ${user.first_name} 👋` : "Привет, незнакомец 👋"}</h1>
      {user ? <p>ID: {user.id}</p> : null}
      {verified ? <p>{verified}</p> : null}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
      {debug ? (
        <details style={{ marginTop: 18 }}>
          <summary style={{ cursor: "pointer" }}>Debug (initData)</summary>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{JSON.stringify(debug, null, 2)}</pre>
        </details>
      ) : null}
    </main>
  );
}
