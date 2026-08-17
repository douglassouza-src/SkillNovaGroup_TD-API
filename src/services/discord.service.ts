interface DiscordMessage {
  content: string;
}

export async function sendDiscordMessage(
  message: DiscordMessage,
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error(
      'DISCORD_WEBHOOK_URL is not configured',
    );
  }

  const response = await fetch(
    webhookUrl,
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