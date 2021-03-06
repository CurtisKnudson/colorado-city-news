export interface ArrowUpIconProps {
  className?: string;
}

export const ArrowUpIcon = ({ className }: ArrowUpIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${className ? className : "h-6 w-6"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 11l5-5m0 0l5 5m-5-5v12"
      />
    </svg>
  );
};
