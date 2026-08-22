import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-5 m-5 border border-red-200 rounded-md bg-red-50 text-red-900">
                    <h2 className="text-lg font-semibold mb-2">Something went wrong in the Profile section.</h2>
                    <p className="text-sm mb-4">Please try refreshing the page.</p>
                    <details className="mt-3 whitespace-pre-wrap text-sm opacity-80 cursor-pointer">
                        {this.state.error && this.state.error.toString()}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;