import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { loginValidationSchema } from '../schemas/loginschema'
import axiosInstance from '../lib/axios'
import { useAuthStore } from '../store/authStore'

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        console.log('Attempting login with:', { username: values.username });
        console.log('API URL:', 'https://dashboard.cercus.app/login/');
        
        const response = await axiosInstance.post('/login/', values);
        console.log('Login response:', response);
        
        const { access, refresh, user } = response.data;
        
        if (access && refresh) {
          // Create user object if not provided
          const userObj = user || { 
            id: '', 
            username: values.username, 
            email: '' 
          };
          
          setAuth(userObj, access, refresh);
          toast.success(`Welcome back, ${values.username}!`);
          navigate('/dashboard');
        }
      } catch (err: any) {
        console.error('Login error:', err);
        console.error('Error response:', err.response);
        console.error('Error message:', err.message);
        
        let errorMessage = 'Login failed. Please try again.';
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.message === 'Network Error') {
          errorMessage = 'Network error. Please check your internet connection or the API might be down.';
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          errorMessage = 'Connection timeout. The API server is not responding. Please check if the server is running or try again later.';
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }
        
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  })
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-full bg-gray-100 p-3">
            <img src="/logo-image.webp" alt="logo" className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: '#000' }}>Admin sign in</h2>
            <p className="text-sm text-gray-600">Enter your credentials to access the dashboard</p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Username</span>
              <div className="mt-1 relative rounded-md shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none ${formik.touched.username && formik.errors.username ? 'border-red-500 border' : 'border border-gray-200'}`}
                  placeholder="Enter your username"
                />
                </div>
                {formik.touched.username && formik.errors.username ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.username}</p>
                ) : null}
              
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-800">Password</span>
              <div className="mt-1 relative rounded-md shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 8V6a5 5 0 1110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zM7 6a3 3 0 116 0v2H7V6z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`block w-full pl-10 pr-10 py-2 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none ${formik.touched.password && formik.errors.password ? 'border-red-500 border' : 'border border-gray-200'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                ) : null}
              
            </label>
          </div>

          {/* <div className="flex items-center justify-between text-sm text-gray-700">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="remember" className="h-4 w-4 rounded bg-white border-gray-300" />
              Remember me
            </label>
            <a href="#" className="font-medium" style={{ color: accent }}>Forgot password?</a>
          </div> */}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 rounded-lg text-black font-semibold shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#edaa00'}}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-90" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V7h2v2h2v2h-2v2H9v-2H7V9h2z" clipRule="evenodd" />
                  </svg>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-700">
          Don't have an account? <Link to="/register" className="font-medium text-black">Sign up</Link>
        </div>
        </div>
      </div>
  )
}

export default Login
 
  // sign up link
  // add small footer link to register
  /*
    Display a link so users who don't have an account can go to register.
  */
  // Note: the UI already has white background; Link below is visible with black text.
