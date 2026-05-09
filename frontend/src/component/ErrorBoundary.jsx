// Error boundary component for React
import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details in development
        if (import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                    backgroundColor: '#f5f5f5'
                }}>
                    <h1 style={{ color: '#d32f2f' }}>Something went wrong</h1>
                    <p style={{ color: '#666' }}>Please refresh the page or contact support</p>
                    {import.meta.env.DEV && (
                        <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
                            {this.state.error?.toString()}
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
