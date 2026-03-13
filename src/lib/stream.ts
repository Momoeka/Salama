import { StreamChat } from "stream-chat";

let serverClient: StreamChat | null = null;

export function getStreamServerClient() {
  if (!serverClient) {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
    const secret = process.env.STREAM_API_SECRET!;
    serverClient = StreamChat.getInstance(apiKey, secret);
  }
  return serverClient;
}
