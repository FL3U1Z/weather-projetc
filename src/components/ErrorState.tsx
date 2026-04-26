interface ErrorStateProps {
  message: string
}

export const ErrorState = ({ message }: ErrorStateProps) => (
  <div className="text-center animate-fade-in">
    <div className="text-6xl mb-4">⚠️</div>
    <h3 className="font-display text-white/80 text-lg font-medium mb-2">
      Ops! Algo deu errado
    </h3>
    <p className="text-white/50 font-body text-sm max-w-xs mx-auto">{message}</p>
  </div>
)
