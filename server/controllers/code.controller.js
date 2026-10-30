import axios from 'axios';
import { logActivity } from '../utils/activity-logger.js';

// Map our language names to Piston language names/versions
const LANGUAGE_MAP = {
  python3: { language: "python", version: "3.10.0" },
  java:    { language: "java",   version: "15.0.2" },
  cpp:     { language: "cpp",    version: "10.2.0" },
  nodejs:  { language: "javascript", version: "18.15.0" },
  c:       { language: "c",      version: "10.2.0" },
  rust:    { language: "rust",   version: "1.68.2" },
};

const compliecode = async (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== 'string' || !language || typeof language !== 'string') {
    return res.status(400).json({ error: "Code and language are required" });
  }

  if (code.length > 50000) {
    return res.status(400).json({ error: "Code exceeds maximum size of 50KB" });
  }

  const langConfig = LANGUAGE_MAP[language] || { language: language.slice(0, 30), version: "*" };

  try {
    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }],
      },
      {
        timeout: 10000, // 10-second timeout prevents indefinite hanging
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = response.data?.run || {};
    const output = result.stdout || result.stderr || "✅ Code executed (no output)";

    if (req.user?._id) {
      logActivity(req.user._id, 'CODE', 'Executed Code', '', `Lang: ${language}`);
    }

    return res.status(200).json({ output });
  } catch (error) {
    const errorDetails = error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'Execution timed out' : 'Service unavailable');
    console.error("Piston API Error:", errorDetails);
    return res.status(502).json({
      error: "Compilation failed",
      details: errorDetails,
    });
  }
};

export { compliecode };
