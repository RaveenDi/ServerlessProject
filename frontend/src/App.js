import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Appointments from "./pages/Appointments";
import CreateAppointments from "./pages/CreateAppointments";
import { awsData } from "./AwsData";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

function App() {
  const { loading } = useSelector((state) => state.alerts);
  const formFields = {
   signUp: {
     username: {
       order: 1
     },
     name: {
       order: 2
     },
     email: {
       order:3
     },
     password: {
       order: 4
     },
     confirm_password: {
       order: 5
     }
   },
  };
  const signUpAttributes=['name', 'email'];

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: awsData.USER_POOL_APP_CLIENT_ID,
        userPoolId: awsData.USER_POOL_ID,
      },
    },
  });
  return (
    <BrowserRouter>
      {loading && (
        <div className="spinner-parent">
          <div class="spinner-border" role="status"></div>
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Authenticator formFields={formFields} signUpAttributes={signUpAttributes}>{({ signOut, user }) => <Home />}</Authenticator>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Authenticator formFields={formFields} signUpAttributes={signUpAttributes}>
                {({ signOut, user }) => (
                  <div>
                    <p>Welcome {user?.username}</p>
                    <button onClick={signOut}>Sign out</button>
                  </div>
                )}
              </Authenticator>
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-appointment/:doctorId"
          element={
            <ProtectedRoute>
              <CreateAppointments />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
