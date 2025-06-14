
const JoyIcon = ({ size = 40 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className="drop-shadow"
    aria-label="Joy Nudge Mascot"
  >
    <circle cx="24" cy="24" r="20" fill="#FFFACD" stroke="#FFDDAA" strokeWidth="3"/>
    <ellipse cx="24" cy="28" rx="8" ry="5" fill="#FFDDAA" />
    {/* Smile */}
    <path d="M17,28 Q24,35 31,28" stroke="#FFA07A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Eyes */}
    <ellipse cx="19.5" cy="23" rx="1.5" ry="2.2" fill="#FFA07A"/>
    <ellipse cx="28.5" cy="23" rx="1.5" ry="2.2" fill="#FFA07A"/>
    {/* Cheeks */}
    <ellipse cx="16" cy="25" rx="1.3" ry="0.5" fill="#FFD6EB"/>
    <ellipse cx="32" cy="25" rx="1.3" ry="0.5" fill="#FFD6EB"/>
  </svg>
);
export default JoyIcon;
