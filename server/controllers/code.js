import axios from 'axios';
import { logActivity } from '../utills/activity-logger.js';


// Map our language names to Piston language names/versions
// Piston is a free open-source engine for code execution
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

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const langConfig = LANGUAGE_MAP[language] || { language: language, version: "*" };

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language: langConfig.language,
      version: langConfig.version,
      files: [{ content: code }],
    });

    // Piston returns separate stdout and stderr
    const result = response.data.run;
    const output = result.stdout || result.stderr || "✅ Code executed (no output)";
    
    if (req.user) {
      logActivity(req.user._id, 'CODE', 'Executed Code', '', `Lang: ${language}`);
    }

    res.status(200).json({ output });
  } catch (error) {
    console.error("Piston API Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Compilation failed", 
      details: error.response?.data?.message || error.message 
    });
  }
};

export { compliecode };
