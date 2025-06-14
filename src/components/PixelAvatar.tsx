
const PixelAvatar = ({ size = 40 }: { size?: number }) => (
  <div
    className="rounded-full border-2 border-joy-steel-blue bg-joy-light-blue overflow-hidden shadow"
    style={{ width: size, height: size }}
  >
    <img
      src="https://api.dicebear.com/7.x/pixel-art/svg?seed=joynudge"
      alt="User avatar"
      width={size}
      height={size}
      className="object-cover w-full h-full"
      draggable={false}
    />
  </div>
);
export default PixelAvatar;
