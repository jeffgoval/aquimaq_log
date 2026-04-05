import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logClientError } from '@/shared/services/error-log.repository'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logClientError(error, info.componentStack ?? '')
  }

  private handleRetry = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center bg-background">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-7 w-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-foreground">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              O app encontrou um erro inesperado. O problema foi registrado automaticamente.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
            <button
              onClick={this.handleRetry}
              className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
