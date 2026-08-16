import { config } from "dotenv";

interface DiscordMessage {
  content: string;
}


export async function sendDiscordMessage(
  message: DiscordMessage,
): Promise<void> {
  const response = await fetch(
    config().parsed?.DISCORD_WEBHOOK_URL as string,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Discord webhook failed: ${response.status} ${errorBody}`,
    );
  }
}