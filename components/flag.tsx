import { flagUrl } from "@/lib/data/flags";

export function Flag({
  teamId,
  size = 40,
  className = "",
}: {
  teamId: string;
  size?: 20 | 40 | 80 | 160;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl(teamId, size)}
      alt=""
      width={size / 2}
      loading="lazy"
      className={`inline-block h-auto border border-ink-700 ${className}`}
    />
  );
}
