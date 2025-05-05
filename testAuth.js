const Medusa = require("@medusajs/medusa-js").default;
const medusa = new Medusa({ baseUrl: "https://backend-production-3da01.up.railway.app" });
(async () => {
  try {
    const { user, token } = await medusa.admin.auth.createSession({
      email: "admin@yourmail.com",
      password: "ibbmi5xvx5c179m3wnivr70qstho4cpe",
    });
    console.log("Authenticated:", user, "Token:", token);
  } catch (error) {
    console.error("Error:", error.message, error.response?.data);
  }
})();