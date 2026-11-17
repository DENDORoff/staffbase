"use client";

export function DeleteButton({ csrfToken, action }: { csrfToken: string; action: string }) {
  return (
    <form method="POST" action={action} className="mt-4">
      <input type="hidden" name="sb_csrf" value={csrfToken} />
      <button
        type="submit"
        className="btn btn-danger"
        onClick={(ev) => {
          if (!window.confirm("Удалить карточку сотрудника? Действие необратимо.")) ev.preventDefault();
        }}
      >
        Удалить сотрудника
      </button>
    </form>
  );
}
