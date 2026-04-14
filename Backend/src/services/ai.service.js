const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

/**
 * ================================
 * GENERATE INTERVIEW REPORT
 * ================================
 */
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
You are an expert interview coach. Analyze the resume, self-description, and job description below.

Generate a complete interview preparation report with ALL of the following:
- matchScore: number 0-100 based on how well the candidate fits the role
- title: the job title being applied for
- technicalQuestions: at least 8 technical interview questions, each with question, intention, and answer
- behavioralQuestions: at least 5 behavioral interview questions, each with question, intention, and answer
- skillGaps: skill gaps with severity (low/medium/high), or empty array if none
- preparationPlan: a 7-day plan, each day with day number, focus topic, and tasks array

Return ONLY valid JSON. No markdown. No explanation.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

    // ✅ Native Gemini schema format — no zodToJsonSchema
    const responseSchema = {
        type: "OBJECT",
        properties: {
            matchScore: { type: "NUMBER" },
            title: { type: "STRING" },
            technicalQuestions: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING" },
                        intention: { type: "STRING" },
                        answer: { type: "STRING" }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            behavioralQuestions: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING" },
                        intention: { type: "STRING" },
                        answer: { type: "STRING" }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            skillGaps: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        skill: { type: "STRING" },
                        severity: { type: "STRING", enum: ["low", "medium", "high"] }
                    },
                    required: ["skill", "severity"]
                }
            },
            preparationPlan: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        day: { type: "NUMBER" },
                        focus: { type: "STRING" },
                        tasks: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["day", "focus", "tasks"]
                }
            }
        },
        required: ["matchScore", "title", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema
            }
        });

        console.log("Raw response:", response.text);
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error generating interview report:", error);
        throw new Error("Failed to generate interview report");
    }
}

/**
 * ================================
 * GENERATE PDF FROM HTML
 * ================================
 */
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
}

/**
 * ================================
 * GENERATE RESUME PDF
 * ================================
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const responseSchema = {
        type: "OBJECT",
        properties: {
            html: { type: "STRING" }
        },
        required: ["html"]
    };

    const prompt = `
Generate a professional ATS-friendly resume as a complete HTML document with inline CSS styling.

Return ONLY valid JSON with a single "html" field containing the full HTML string.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema
            }
        });

        const jsonContent = JSON.parse(response.text);
        const pdfBuffer = await generatePdfFromHtml(jsonContent.html);
        return pdfBuffer;

    } catch (error) {
        console.error("Error generating resume PDF:", error);
        throw new Error("Failed to generate resume PDF");
    }
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
};