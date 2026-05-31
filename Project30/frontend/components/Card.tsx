export default function Card({ 
  title, 
  children, 
  className = '',
  rightAction
}: { 
  title?: string
  children: React.ReactNode
  className?: string
  rightAction?: React.ReactNode
}) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {rightAction}
        </div>
      )}
      {children}
    </div>
  )
}
