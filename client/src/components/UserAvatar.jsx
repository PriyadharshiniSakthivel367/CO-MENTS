const COLORS = [
  'from-orange-500 to-red-600',
  'from-violet-500 to-fuchsia-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export default function UserAvatar({ username, size = 40 }) {
  const letter = (username || '?').charAt(0).toUpperCase();
  const grad = COLORS[hash(username || '') % COLORS.length];
  const px = `${size}px`;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-sm font-semibold text-white shadow-inner`}
      style={{ width: px, height: px, minWidth: px }}
      aria-hidden
    >
      {letter}
    </div>
  );
}
