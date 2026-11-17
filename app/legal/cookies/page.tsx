import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Политика Cookie",
  description: "Какие cookie использует StaffBase: сессия, тема, язык, согласие на cookie. Без рекламы и счётчиков.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Политика использования файлов Cookie" updated="17 ноября 2026">
      <p>StaffBase использует только строго необходимые cookies и не применяет рекламные или маркетинговые идентификаторы. Никакие данные для сторонней аналитики не передаются — счётчики (Яндекс.Метрика, Google Analytics и т. п.) не подключены.</p>

      <h2>Состав cookies</h2>
      <table>
        <thead>
          <tr><th>Cookie</th><th>Назначение</th><th>Срок</th><th>Тип</th></tr>
        </thead>
        <tbody>
          <tr><td><code>sb_session</code></td><td>Сессия авторизованного пользователя (в базе хранится SHA-256 токена, httpOnly, SameSite=Lax)</td><td>8 часов</td><td>Необходимый</td></tr>
          <tr><td><code>sb_theme</code></td><td>Выбор темы оформления: системная / светлая / тёмная</td><td>1 год</td><td>Функциональный</td></tr>
          <tr><td><code>sb_locale</code></td><td>Язык интерфейса: RU / EN / KZ</td><td>1 год</td><td>Функциональный</td></tr>
          <tr><td><code>sb_cookie_consent</code></td><td>Запоминание вашего выбора в баннере согласия</td><td>180 дней</td><td>Необходимый</td></tr>
        </tbody>
      </table>

      <h2>Управление cookies</h2>
      <ul>
        <li>в баннере внизу экрана можно принять или отклонить необязательные cookies;</li>
        <li>функциональные cookies (тема, язык) можно отключить в браузере — система будет работать в светлой теме на русском языке;</li>
        <li>отключение <code>sb_session</code> делает вход в систему невозможным;</li>
        <li>очистка cookies завершает сессию на всех устройствах.</li>
      </ul>

      <h2>Согласие</h2>
      <p>Продолжая пользоваться сайтом после отображения баннера, вы соглашаетесь с использованием необходимых cookies. Отозвать согласие можно, удалив cookies в настройках браузера и выбрав «Отклонить» в баннере.</p>
    </LegalPage>
  );
}
