import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Simple fallback UI for demo app
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#000",
            color: "#fff",
            fontFamily: "Roboto, sans-serif",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Aevum Labs
            </h1>
            <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
              Extending Humanity's Healthspan
            </p>
            <p style={{ fontSize: "0.9rem", marginTop: "2rem", opacity: 0.6 }}>
              Something went wrong. Please refresh the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
