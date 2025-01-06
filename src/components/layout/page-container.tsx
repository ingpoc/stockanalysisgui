interface PageContainerProps {
  children: React.ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      {children}
    </div>
  )
} 