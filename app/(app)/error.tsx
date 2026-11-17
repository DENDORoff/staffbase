"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="card card-pad max-w-lg">
      <h1 className="font-sans text-xl font-bold text-text">Не удалось загрузить страницу</h1>
      <p className="mt-2 text-sm text-text-2">
        Что-то пошло не так на нашей стороне. Повторите попытку; если ошибка повторяется — сообщите в отдел ИТ (it@staffbase.kz).
        {error?.digest && <span className="mt-1 block text-xs text-text-2/70">Код ошибки: {error.digest}</span>}
      </p>
      <button onClick={reset} className="btn btn-primary mt-4">Повторить</button>
    </div>
  );
}
