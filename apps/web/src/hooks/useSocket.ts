"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

type ConnectionState = "connecting" | "connected" | "reconnecting" | "disconnected";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");

  useEffect(() => {
    const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;
    if (!realtimeUrl) {
      setConnectionError("Realtime URL is not configured.");
      setConnectionState("disconnected");
      return;
    }

    const nextSocket = io(realtimeUrl, {
      transports: ["websocket"],
    });

    const handleConnect = () => {
      setConnectionState("connected");
      setConnectionError(null);
    };

    const handleConnectError = () => {
      setConnectionState("reconnecting");
      setConnectionError("Unable to connect to the realtime server.");
    };

    const handleDisconnect = () => {
      setConnectionState("disconnected");
      setConnectionError("Realtime connection lost. Reconnecting...");
    };

    const handleReconnectAttempt = () => {
      setConnectionState("reconnecting");
    };

    nextSocket.on("connect", handleConnect);
    nextSocket.on("connect_error", handleConnectError);
    nextSocket.on("disconnect", handleDisconnect);
    nextSocket.io.on("reconnect_attempt", handleReconnectAttempt);
    setSocket(nextSocket);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("connect_error", handleConnectError);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.io.off("reconnect_attempt", handleReconnectAttempt);
      nextSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return {
    socket,
    connectionState,
    connectionError,
  };
}
