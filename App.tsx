import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import Amplify, { Auth, API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react-native";
import { getUser } from "./graphql/queries";
import { createUser } from "./graphql/mutations";
import config from "./aws-exports";

Amplify.configure(config);
const randomImages = [
  "https://hieumobile.com/wp-content/uploads/avatar-among-us-2.jpg",
  "https://hieumobile.com/wp-content/uploads/avatar-among-us-3.jpg",
  "https://hieumobile.com/wp-content/uploads/avatar-among-us-6.jpg",
  "https://hieumobile.com/wp-content/uploads/avatar-among-us-9.jpg",
];

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const getRandomImages = () => {
    return randomImages[Math.floor(Math.random() * randomImages.length)];
  };

  //run this when app first mounted
  useEffect(() => {
    const fetchUser = async () => {
      //get auth user from Auth
      const userInfo = await Auth.currentAuthenticatedUser({
        bypassCache: true,
      });
      // console.log(userInfo);

      if (userInfo) {
        //get the user from backend with user sub from Auth
        const userData = await API.graphql(
          graphqlOperation(getUser, { id: userInfo.attributes.sub })
        );

        if (userData.data.getUser) {
          console.log("User is already registered in database");
          return;
        }

        const newUser = {
          id: userInfo.attributes.sub,
          name: userInfo.username,
          imageUri: getRandomImages(),
          status: "Heyy, come and chat with me",
        };

        await API.graphql(graphqlOperation(createUser, { input: newUser }));

        //if no user, create one
      }
    };
    fetchUser();
  }, []);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}

export default withAuthenticator(App);
