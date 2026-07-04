export default function LoadingSpinner({ fullPage = false }) {
  const spinner = (
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (fullPage) return <div className="flex items-center justify-center h-64">{spinner}</div>;
  return spinner;
}
