
import { useEffect, useState } from "react";
import {
  Button,
  Badge,
  Spinner,
  Alert,
  Modal
} from "react-bootstrap";

import { toast } from "react-toastify";

import {
  getAdminContactMessages,
  markAdminContactMessageRead
} from "../../Api/postApi";

export const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [error, setError] = useState("");

  // ================= FETCH MESSAGES =================

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminContactMessages();

      setMessages(response.data.messages || []);

    } catch (err) {
      console.error("Fetch contact messages error:", err);

      setError(
        err.response?.data?.message ||
        "Failed to load contact messages"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ================= MARK AS READ =================

  const handleMarkAsRead = async (messageId) => {
    try {
      setProcessingId(messageId);

      const response = await markAdminContactMessageRead(messageId);

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId
              ? { ...message, status: "read" }
              : message
          )
        );

        setSelectedMessage((prev) =>
          prev?._id === messageId
            ? { ...prev, status: "read" }
            : prev
        );

        toast.success("Message marked as read");
      }

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Failed to update message"
      );

    } finally {
      setProcessingId(null);
    }
  };

  // ================= MESSAGE COUNTS =================

  const counts = {
    all: messages.length,
    unread: messages.filter(
      (message) => message.status === "unread"
    ).length,
    read: messages.filter(
      (message) => message.status === "read"
    ).length
  };

  // ================= FILTER MESSAGES =================

  const filteredMessages = messages.filter((message) => {
    if (filter === "all") return true;
    return message.status === filter;
  });

  // ================= FORMAT DATE =================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-4">

      {/* ================= PAGE HEADER ================= */}

      <h3 className="fw-bold mb-1">
        Contact Messages
      </h3>

      <p className="text-muted mb-4">
        View and manage messages submitted through the Contact Us page.
      </p>

      {/* ================= STATISTICS ================= */}

      <div className="row g-3 mb-4">

        {[
          {
            label: "Total Messages",
            key: "all",
            color: "primary"
          },
          {
            label: "Unread Messages",
            key: "unread",
            color: "warning"
          },
          {
            label: "Read Messages",
            key: "read",
            color: "success"
          }
        ].map((item) => (
          <div className="col-md-4" key={item.key}>
            <div className="bg-white rounded-3 shadow-sm border p-3">
              <h6 className="text-muted">
                {item.label}
              </h6>

              <h2 className={`fw-bold mb-0 text-${item.color}`}>
                {counts[item.key]}
              </h2>
            </div>
          </div>
        ))}

      </div>

      {/* ================= FILTER BUTTONS ================= */}

      <div className="d-flex gap-2 mb-4 flex-wrap">

        {["all", "unread", "read"].map((status) => (
          <Button
            key={status}
            variant={
              filter === status
                ? "primary"
                : "outline-primary"
            }
            onClick={() => setFilter(status)}
            className="text-capitalize"
          >
            {status}
          </Button>
        ))}

      </div>

      {/* ================= MESSAGE LIST ================= */}

      {loading ? (

        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>

      ) : error ? (

        <Alert variant="danger">
          {error}
        </Alert>

      ) : filteredMessages.length === 0 ? (

        <Alert variant="light" className="border">
          No {filter === "all" ? "" : filter} contact messages found.
        </Alert>

      ) : (

        <div className="d-flex flex-column gap-3">

          {filteredMessages.map((message) => (

            <div
              key={message._id}
              className="bg-white border rounded-3 shadow-sm p-4"
            >

              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

                <div>
                  <h5 className="fw-bold mb-1">
                    {message.fullName}
                  </h5>

                  <p className="text-muted small mb-2">
                    {message.email}
                  </p>

                  <h6 className="fw-semibold mb-2">
                    {message.subject}
                  </h6>

                  <p className="text-muted small mb-0">
                    {formatDate(message.createdAt)}
                  </p>
                </div>

                <Badge
                  bg={
                    message.status === "read"
                      ? "success"
                      : "warning"
                  }
                  text={
                    message.status === "read"
                      ? undefined
                      : "dark"
                  }
                >
                  {message.status === "read"
                    ? "READ"
                    : "UNREAD"}
                </Badge>

              </div>

              <p
                className="text-secondary mt-3 mb-0"
                style={{
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical"
                }}
              >
                {message.message}
              </p>

              <div className="d-flex justify-content-end gap-2 mt-3 flex-wrap">

                <Button
                  variant="outline-primary"
                  onClick={() => setSelectedMessage(message)}
                >
                  View Message
                </Button>

                {message.status === "unread" && (
                  <Button
                    variant="success"
                    disabled={processingId !== null}
                    onClick={() =>
                      handleMarkAsRead(message._id)
                    }
                  >
                    {processingId === message._id
                      ? "Processing..."
                      : "Mark as Read"}
                  </Button>
                )}

              </div>

            </div>

          ))}

        </div>

      )}

      {/* ================= MESSAGE DETAILS MODAL ================= */}

      <Modal
        show={!!selectedMessage}
        onHide={() => setSelectedMessage(null)}
        size="lg"
        centered
        scrollable
      >

        <Modal.Header closeButton>
          <Modal.Title>
            Contact Message Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {selectedMessage && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">
                  {selectedMessage.subject}
                </h5>

                <Badge
                  bg={
                    selectedMessage.status === "read"
                      ? "success"
                      : "warning"
                  }
                >
                  {selectedMessage.status?.toUpperCase()}
                </Badge>
              </div>

              <div className="row g-3 mb-4">

                <div className="col-md-6">
                  <strong>Full Name</strong>
                  <p>{selectedMessage.fullName}</p>
                </div>

                <div className="col-md-6">
                  <strong>Email</strong>
                  <p>{selectedMessage.email}</p>
                </div>

                <div className="col-md-12">
                  <strong>Submitted On</strong>
                  <p>{formatDate(selectedMessage.createdAt)}</p>
                </div>

              </div>

              <hr />

              <h6 className="fw-bold mb-3">
                Message
              </h6>

              <div
                className="bg-light border rounded-3 p-3"
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere"
                }}
              >
                {selectedMessage.message}
              </div>

            </>
          )}

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() => setSelectedMessage(null)}
          >
            Close
          </Button>

          {selectedMessage?.status === "unread" && (
            <Button
              variant="success"
              disabled={processingId !== null}
              onClick={() =>
                handleMarkAsRead(selectedMessage._id)
              }
            >
              {processingId === selectedMessage._id
                ? "Processing..."
                : "Mark as Read"}
            </Button>
          )}

        </Modal.Footer>

      </Modal>

    </div>
  );
};
