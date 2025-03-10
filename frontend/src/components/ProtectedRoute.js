import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children, redirectTo }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setIsAuthorized(auth);
    };
    checkAuth();
  }, []);

  if (isAuthorized === null) return <div>Loading...</div>;

  return isAuthorized ? children : <Navigate to={redirectTo} />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string.isRequired,
};

export default ProtectedRoute;
