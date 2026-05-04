import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import AuthLayout from '../components/layout/AuthLayout';

export default function LoginPage() {
    return (
        <AuthLayout>
            <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
                <p className="text-text-secondary">Enter your details to sign in to your account</p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-emerald hover:text-emerald/80 transition-colors">
                    Sign up
                </Link>
            </p>
        </AuthLayout>
    );
}

