"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

export default function Modal({ isOpen, onClose, title, message, type = "info" }: ModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          buttonColor: "bg-green-600 hover:bg-green-700",
          icon: "✓",
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
        };
      case "error":
        return {
          buttonColor: "bg-red-600 hover:bg-red-700",
          icon: "✗",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
        };
      case "warning":
        return {
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
          icon: "!",
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
        };
      default:
        return {
          buttonColor: "bg-blue-600 hover:bg-blue-700",
          icon: "i",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "90%",
          margin: "16px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "transparent",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#9ca3af",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#9ca3af";
          }}
        >
          ✕
        </button>

        <div style={{ padding: "24px", textAlign: "center" }}>
          {/* Icon Circle */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              fontSize: "24px",
              fontWeight: "bold",
            }}
            className={styles.iconBg}
          >
            <span className={styles.iconColor}>{styles.icon}</span>
          </div>

          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
            {title}
          </h3>

          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
            {message}
          </p>

          <button
            onClick={onClose}
            className={styles.buttonColor}
            style={{
              width: "100%",
              padding: "10px 16px",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}