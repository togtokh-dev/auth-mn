import AUTH_MN, { config } from "../src";

async function main() {
  // Configure authentication details
  config.auth.username = "";
  config.auth.password = "";

  try {
    // Generate an authentication token
    const tokenResponse = await AUTH_MN.auth.TOKEN({
      username: config.auth.username,
      password: config.auth.password,
    });

    console.log("Token response:", tokenResponse);
  } catch (error) {
    console.error("Error during TOKEN generation or payment:", error);
  }
}

// Execute the main function
main();
