import AUTH_MN, {
  config,
  find,
  setHost as AuthMnSetHost,
  config as AuthConfig
} from "../src";

async function main() {
  if (true) {
    AuthMnSetHost(
      {
        MAIN: "https://api.auth.mn",
        WALLET: "https://api.auth.mn"
      },
      "prod"
    );
  } else {
    AuthMnSetHost(
      {
        MAIN: "https://staging-api.auth.mn",
        WALLET: "https://staging-api.auth.mn"
      },
      "staging"
    );
  }

  // Configure authentication details
  AuthConfig.auth.username = "info@seller.mn";
  AuthConfig.auth.password = "@9{4p.]g4t3>b})(Xd~5ZtuR76Iq]";

  try {
    // Generate an authentication token
    const tokenResponse = await AUTH_MN.auth.TOKEN({
      username: config.auth.username,
      password: config.auth.password
    });

    console.log("Token response:", tokenResponse);
  } catch (error) {
    console.error("Error during TOKEN generation or payment:", error);
  }
  try {
    const user = await find.USER({ user_id: 6246839 });
    console.log("user", user);
  } catch (error) {}
}

// Execute the main function
main();
