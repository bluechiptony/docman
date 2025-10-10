export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-500">
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h1>
      <p className="text-sm text-gray-400">This module is coming soon.</p>
    </div>
  );
}
