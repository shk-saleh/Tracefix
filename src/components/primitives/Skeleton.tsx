interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded bg-[#1a1a24] animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}
