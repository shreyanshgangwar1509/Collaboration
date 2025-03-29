const asking =  async (req, res) => {
  const { code, language } = req.body;

  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      script: code,
      language: language,
      versionIndex: languageConfig[language].versionIndex,
      clientId: process.env.jDoodle_clientId,
      clientSecret: process.env.kDoodle_clientSecret,
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to compile code" });
  }
}
export { asking };

