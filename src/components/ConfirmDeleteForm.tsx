"use client";

export function ConfirmDeleteForm({
  action,
  hiddenFields,
  confirmMessage,
  label = "Delete",
}: {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  confirmMessage: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
        {label}
      </button>
    </form>
  );
}
