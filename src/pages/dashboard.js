import { useEffect, useState } from "react";
import api from "../api/api";
import LogCard from "../components/logcard";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api
      .get("/api/admin/logs")
      .then((res) => setLogs(res.data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Moderation Logs</h2>
      {logs.map((log) => (
        <LogCard key={log.id} log={log} />
      ))}
    </div>
  );
}
