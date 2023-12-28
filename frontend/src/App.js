import "./App.css";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import AwsData from "./AwsData";

function App() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: AwsData.USER_POOL_APP_CLIENT_ID,
        userPoolId: AwsData.USER_POOL_ID,
        loginWith: {
          oauth: {
            domain:
              "abcdefghij1234567890-29051e27.auth.us-east-1.amazoncognito.com",
            scopes: [
              "openid email phone profile aws.cognito.signin.user.admin ",
            ],
            redirectSignIn: ["http://localhost:3000/", "https://example.com/"],
            redirectSignOut: ["http://localhost:3000/", "https://example.com/"],
            responseType: "code",
          },
        },
      },
    },
  });

  return (
    <div className="App">
      <Authenticator>
        {({ signOut, user }) => (
          <div>
            <p>Welcome {user?.username}</p>
            <button onClick={signOut}>Sign out</button>
          </div>
        )}
      </Authenticator>
    </div>
  );
}

export default App;
