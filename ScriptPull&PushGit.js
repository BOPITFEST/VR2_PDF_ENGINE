import { execSync } from "child_process";
import fetch from "node-fetch";

// ✅ Google Chat Webhook URL
const CHAT_WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAQAW675rio/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Km0aIuIjbwOno-Xxc7YyKmO6BzKXIiBe65zE8KE-2Uo";

// ✅ custom commit message from command line
const commitMsg = process.argv[2] || "Auto-sync from Apps Script";

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
            text: `📢 Engine_PDF_VR2 updated from Apps Script!*\n🕒 ${new Date().toLocaleString()}\n📝 *Commit:* ${commitMsg}\n✅ Code synced and pushed to GitHub`,
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
