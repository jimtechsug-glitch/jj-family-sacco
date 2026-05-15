import React, { useState } from 'react';
import { useSacco } from '../context/SaccoContext';
import { Eye, EyeOff } from 'lucide-react';
import classes from './Login.module.css';

const Login = () => {
  const { login } = useSacco();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.loginContainer}>
      <div className={`glass-panel ${classes.loginBox}`}>
        <div className={classes.logo}>
          <div className={classes.logoIcon}>J&J</div>
          <h2>Family Sacco Portal</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className={classes.error}>{error}</div>}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin or Member Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className={classes.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className={classes.visibilityToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
