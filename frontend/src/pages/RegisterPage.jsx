import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import AuthLayout from '../components/layout/AuthLayout';

export default function RegisterPage() {
    return (
        <AuthLayout>
            <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-bold text-text-primary mb-2">Create an account</h2>
                <p className="text-text-secondary">Get started with your free account</p>
            </div>

            <RegisterForm />

            <p className="mt-8 text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-emerald hover:text-emerald/80 transition-colors">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}

