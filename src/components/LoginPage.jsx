import { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-400 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-black text-center mb-8">
          -HDBInsight-
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username/ Email"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="
            w-full bg-blue-500 
            hover:bg-blue-600 
            text-white 
            font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out"
          >
            Login
          </button>
        </form>
        <p className="text-sm italic text-gray-600 text-center mt-6">
          User roles and permissions are enforced
        </p>
        <div className="mt-6 space-y-2 text-center">
          <Link 
            to="/register" 
            className="block text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Create Account
          </Link>
          <Link 
            to="/forgot-password" 
            className="block text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Forget Password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
