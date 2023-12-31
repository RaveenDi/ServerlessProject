import React from "react";
import * as AWS from "aws-sdk";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/userSlice";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { awsData } from "../AwsData";

AWS.config.region = awsData.REGION;

function ProtectedRoute(props) {
  const { user } = useSelector((state) => state.user);
  const userPoolClientId = awsData.USER_POOL_APP_CLIENT_ID;
  const authUser = localStorage.getItem("CognitoIdentityServiceProvider."+userPoolClientId+".LastAuthUser");
  const accessToken = localStorage.getItem("CognitoIdentityServiceProvider."+userPoolClientId+"."+authUser+".accessToken");
  const dispatch = useDispatch();
  const navigate = useNavigate();
   const cognito = new AWS.CognitoIdentityServiceProvider();
  const getUser = async () => {
    try {
      dispatch(showLoading())
      const params = {
        AccessToken: accessToken,
      };

      const userData = await cognito.getUser(params).promise();
      console.log('User details:', userData);
      dispatch(hideLoading());
      dispatch(setUser(userData));
    } catch (error) {
      dispatch(hideLoading());
      console.log(error)
      localStorage.clear()
      navigate("/login");
    }

  };

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, [user]);

  if (authUser) {
    return props.children;
  } else {
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
