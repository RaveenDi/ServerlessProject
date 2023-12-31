import React from "react";
import { Navigate } from "react-router-dom";
import { awsData } from "../AwsData";

function PublicRoute(props) {
  const userPoolClientId = awsData.USER_POOL_APP_CLIENT_ID;
  const authUser = localStorage.getItem("CognitoIdentityServiceProvider."+userPoolClientId+".LastAuthUser");
  if (authUser) {
    return <Navigate to="/" />;
  } else {
    return props.children;
  }
}

export default PublicRoute;