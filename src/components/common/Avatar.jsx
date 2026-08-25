import { FaUser } from "react-icons/fa";

export default function Avatar({ src, alt = "", name, className = "", ...rest }) {
  if (!src) {
    const initial = name?.trim()?.[0]?.toUpperCase();
    return (
      <div
        role="img"
        aria-label={alt || name || "Ảnh đại diện"}
        className={`rounded-full bg-zm-hover text-zm-muted flex items-center justify-center font-semibold ${className}`}
      >
        {initial || <FaUser size="45%" aria-hidden="true" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${className}`}
      {...rest}
    />
  );
}
