export default function LetterAvatar({ name, className = "" }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      aria-hidden="true"
      className={`rounded-full bg-gradient-to-br from-zm-blue to-zm-blue-light text-white font-bold flex items-center justify-center shrink-0 ${className}`}
    >
      {letter}
    </div>
  );
}
