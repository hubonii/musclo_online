// React error boundary that catches crashes in child component trees.
import { Component } from 'react';
import GlobalErrorFallback from './GlobalErrorFallback';

class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        // Sets boundary error state from thrown child error.
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.group('🔴 CRITICAL RUNTIME ERROR');
        console.error('Error:', error);
        console.error('Component Stack:', errorInfo.componentStack);
        console.groupEnd();
    }
    handleReset = () => {
        // Clears boundary error state.
        this.setState({ hasError: false, error: null });
    };
    render() {
        if (this.state.hasError && this.state.error) {
return (<GlobalErrorFallback error={this.state.error} resetErrorBoundary={this.handleReset}/>);
        }
        return this.props.children;
    }
}
export default ErrorBoundary;


