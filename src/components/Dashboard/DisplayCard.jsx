
export default function DisplayCard({ children }) {
  return (
    <div className={`bg-white p-6 rounded-[24px] h-auto`}>      
      <div className="w-full space-y-4">
        {children}
      </div>
    </div>
  );
}
