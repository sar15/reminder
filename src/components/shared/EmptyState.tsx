export function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#cbd5e1] rounded-[24px] bg-[#f8fafc]/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm mb-5 text-[#94a3b8]">
        {icon}
      </div>
      <h3 className="text-[17px] font-semibold text-[#0f172a] mb-2">{title}</h3>
      <p className="text-[14px] text-[#64748b] max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
