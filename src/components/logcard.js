export default function LogCard({ log }) {
  const badge = log.is_spam ? "SPAM" : log.is_toxic ? "TOXIC" : "CLEAN";
  const color = log.is_spam ? "red" : log.is_toxic ? "orange" : "green";

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 16,
        marginBottom: 12,
        borderLeft: `6px solid ${color}`,
      }}
    >
      <p>
        <strong>Text:</strong> {log.text_preview}
      </p>
      <p>
        <strong>Status:</strong> <span style={{ color }}>{badge}</span>
      </p>
      <p>
        <strong>Confidence:</strong> {(log.confidence * 100).toFixed(1)}%
      </p>
      <p>
        <strong>Keywords:</strong> {log.flagged_words?.join(", ")}
      </p>
      <p>
        <small>{new Date(log.timestamp).toLocaleString()}</small>
      </p>
    </div>
  );
}
