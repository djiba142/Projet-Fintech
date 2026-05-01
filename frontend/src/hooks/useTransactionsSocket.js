import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function useTransactionsSocket(username) {
  const [liveTransactions, setLiveTransactions] = useState([]);

  useEffect(() => {
    if (!username) return;

    const wsUrl = API_URL.replace("http", "ws") + "/m1/ws/transactions/" + username;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const { type, data } = payload;

      if (type === "NEW_TRANSACTION") {
        setLiveTransactions(prev => [data, ...prev]);
      } else if (type === "UPDATE") {
        setLiveTransactions(prev => 
          prev.map(t => t.tx_id === data.tx_id ? { ...t, ...data } : t)
        );
      }
    };

    ws.onclose = () => console.log("Dashboard Live WS Closed");
    ws.onerror = (err) => console.error("Dashboard Live WS Error", err);

    return () => ws.close();
  }, [username]);

  return liveTransactions;
}
