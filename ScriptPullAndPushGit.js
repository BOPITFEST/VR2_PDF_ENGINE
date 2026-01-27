import { execSync } from "child_process";

// ✅ Google Chat Webhook URL
const CHAT_WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAAACpUvFA4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=had1T28dUvoyeVGTPNVvWbLx2mzl1o6QFlHBzn9tMLA";

// ✅ custom commit message from command line
const commitMsg = process.argv[2] || "Auto-sync from Apps Script";
const commitLink = process.argv[3] || "https://github.com/BOPITFEST/VR2_PDF_ENGINE";

async function main() {
    try {
        console.log("🔄 Pulling latest changes from Apps Script...");
        execSync("clasp pull", { stdio: "inherit" });

        console.log("📦 Committing changes to GitHub...");
        execSync("git add .", { stdio: "inherit" });
        execSync(`git commit -m "${commitMsg}"`, { stdio: "inherit" });
        execSync("git push", { stdio: "inherit" });

        console.log("💬 Sending message to Google Chat...");

        const chatMessage = {
            text: `📢 *Engine_PDF_VR2 updated from Apps Script!* \n *Date and Time:* ${new Date().toLocaleString()}\n *Commit Message:* ${commitMsg} \n ✅ Code synced and pushed to GitHub \n 🔗 *View Commit:* ${commitLink}`,
        };

        const res = await fetch(CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chatMessage),
        });

        if (!res.ok) throw new Error(`Chat webhook failed: ${res.status}`);
        console.log("✅ Done! Pulled + pushed + notified.");
    } catch (err) {
        console.error("❌ Error during sync:", err.message);
    }
}

main();
