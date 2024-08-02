type Props = {
  size?: number;
  className?: string;
};

const BaseLoader = ({ size }: Props) => {
  return (
    <div
      className="inline-block  animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] "
      role="status"
      style={{ height: `${size}px`, width: `${size}px` }}
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};
const CircularLoader = ({ size = 16, className }: Props) => {
  if (className) {
    return (
      <div className={className}>
        <BaseLoader size={size} />
      </div>
    );
  }
  return <BaseLoader size={size} />;
};

export default CircularLoader;
