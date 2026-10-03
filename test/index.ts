// Ажиллуулах:
//   AUTH_MN_CLIENT_ID=cl_xxx AUTH_MN_CLIENT_SECRET=sk_xxx npx ts-node test/index.ts
import authMn, { setAuth, setHost, setLogger, authState } from "../src";

async function main() {
  setHost((process.env.AUTH_MN_ENV as "prod" | "staging") || "staging");
  setLogger(true);
  setAuth({
    client_id: process.env.AUTH_MN_CLIENT_ID || "",
    client_secret: process.env.AUTH_MN_CLIENT_SECRET || ""
  });

  const me = await authMn.auth.me();
  console.log("me:", me);
  console.log("permissions:", authState.permissions);

  const user = await authMn.user.find({ user_id: Number(process.env.AUTH_MN_TEST_USER_ID || 0) });
  console.log("user:", user.success, user.message, user.data?.user_name);

  // refresh урсгал
  const r = await authMn.auth.refresh();
  console.log("refresh:", r.success, r.message);
}

main();
