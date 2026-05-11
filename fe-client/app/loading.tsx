import LoadingSpinner from "@/components/UI/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner label="Đang tải..." />
    </div>
  );
}
