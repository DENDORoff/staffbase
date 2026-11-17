import { LegalPage } from "@/components/LegalPage";
import { Icon } from "@/components/Icon";

export const metadata = {
  title: "Запрос на удаление моих данных",
  description: "Подача запроса на удаление или обезличивание персональных данных в системе StaffBase.",
};

export default async function DeleteDataPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <LegalPage title="Запрос на удаление данных" updated="17 ноября 2026">
      <p>
        Вы можете запросить удаление или обезличивание ваших персональных данных из системы StaffBase. Запрос
        рассматривается отделом кадров и юридической службой в течение 30 календарных дней с момента регистрации.
        Отдельные сведения (приказы, табели) хранятся в сроки, установленные архивным и трудовым законодательством РК,
        и удаляются только по истечении этих сроков — вместо удаления выполняется ограничение обработки.
      </p>

      {sp.ok && (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-ok/40 bg-ok/10 px-3 py-2 text-sm text-ok">
          <Icon name="check" size={18} className="mt-0.5" />
          Запрос № зарегистрирован. Ответ поступит на указанную рабочую почту в течение 30 календарных дней.
        </p>
      )}
      {sp.error && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          Проверьте форму: почтовый адрес и подтверждение возраста обязательны.
        </p>
      )}

      <form method="POST" action="/api/delete-request" className="card card-pad !bg-bg">
        <div>
          <label className="label" htmlFor="email">Рабочая почта *</label>
          <input className="input" id="email" name="email" type="email" required placeholder="name@staffbase.kz" autoComplete="email" />
        </div>
        <div className="mt-3">
          <label className="label" htmlFor="reason">Что именно удалить / основание</label>
          <textarea className="input min-h-24" id="reason" name="reason" maxLength={1000} placeholder="Например: прошу удалить контактный телефон, указанный в карточке…" />
        </div>
        <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" name="adult" required className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
          <span>Я подтверждаю, что мне исполнилось 18 лет и я являюсь субъектом запрашиваемых данных (либо действую по нотариально удостоверенной доверенности). *</span>
        </label>
        <button type="submit" className="btn btn-primary mt-4">Отправить запрос</button>
      </form>

      <h2>Альтернативные способы</h2>
      <ul>
        <li>письменно: г. Павлодар, ул. Торайгырова, 91/1, каб. 214 (отдел кадров);</li>
        <li>по почте: <a href="mailto:privacy@staffbase.kz">privacy@staffbase.kz</a>;</li>
        <li>по телефону: +7 (7182) 55-01-01 (Пн–Пт, 09:00–18:00).</li>
      </ul>
    </LegalPage>
  );
}
