"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 🔹 Poll type for state management
type Poll = {
  id: string;
  question: string;
  startDate: string;
  endDate: string;
  closedAt?: string | null;
  options?: { id: string; text: string }[];
};

export default function ManagePollsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 New Poll state
  const [addingPoll, setAddingPoll] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  // 🔹 Edit Poll state
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>([]);

  // 🔹 Protect the route (only ADMIN allowed)
  useEffect(() => {
    if (status !== "loading") {
      if (!session?.user || session.user.role !== "ADMIN") {
        router.replace("/dashboard");
      }
    }
  }, [session, status, router]);

  // 🔹 Fetch all polls from the API
  async function loadPolls() {
    if (session?.user?.role === "ADMIN") {
      try {
        const res = await fetch("/api/admin/polls");
        const data = await res.json();
        setPolls(data.polls || []);
      } catch (err) {
        console.error("❌ Failed to fetch polls:", err);
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadPolls();
  }, [session]);

  /**
   * 🔹 Open Add Poll modal
   * - Start date defaults to the latest poll's end date
   * - End date defaults to start date + 1 day
   */
  function handleOpenAddPoll() {
    // Find the latest end date
    const latestEndDate = polls.reduce((latest, poll) => {
      const end = new Date(poll.endDate);
      return end > latest ? end : latest;
    }, new Date());

    // Start date is the same as the latest poll's end date
    const start = new Date(latestEndDate);

    // End date is always 1 day after start date
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    setNewStartDate(start.toISOString().split("T")[0]);
    setNewEndDate(end.toISOString().split("T")[0]);

    setAddingPoll(true);
  }

  // 🔹 Close a poll
  async function handleClosePoll(id: string) {
    if (!confirm("Are you sure you want to close this poll?")) return;
    await fetch("/api/admin/polls", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { closedAt: new Date() } }),
    });
    loadPolls();
  }

  // 🔹 Undo Close
  async function handleUndoClose(id: string) {
    await fetch("/api/admin/polls", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { closedAt: null } }),
    });
    loadPolls();
  }

  // 🔹 Delete a poll
  async function handleDeletePoll(id: string) {
    if (!confirm("This will permanently delete the poll. Are you sure?")) return;
    await fetch("/api/admin/polls", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadPolls();
  }

  // 🔹 Add a new poll
  async function handleAddPoll() {
    if (!newQuestion.trim() || newOptions.filter((o) => o.trim()).length < 2) {
      alert("Please enter a question and at least 2 valid options.");
      return;
    }
    await fetch("/api/admin/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: newQuestion,
        options: newOptions.filter((o) => o.trim()),
        startDate: newStartDate,
        endDate: newEndDate,
      }),
    });
    setAddingPoll(false);
    setNewQuestion("");
    setNewOptions(["", ""]);
    setNewStartDate("");
    setNewEndDate("");
    loadPolls();
  }

  // 🔹 Start editing
  function handleStartEdit(poll: Poll) {
    setEditingPoll(poll);
    setEditQuestion(poll.question);
    setEditOptions(poll.options?.map((o) => o.text) || []);
  }

  // 🔹 Save edited poll
  async function handleSaveEdit() {
    if (!editingPoll) return;
    const cleanedOptions = editOptions.filter((o) => o.trim());
    if (!editQuestion.trim() || cleanedOptions.length < 2) {
      alert("Please enter a question and at least 2 options.");
      return;
    }
    await fetch("/api/admin/polls", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingPoll.id,
        data: {
          question: editQuestion,
          options: cleanedOptions,
        },
      }),
    });
    setEditingPoll(null);
    loadPolls();
  }

  if (status === "loading" || loading) {
    return <p className="p-4">Loading...</p>;
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <main className="flex flex-col min-h-screen p-6 gap-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold">Manage Polls</h1>
      <p className="text-gray-600 mb-4">
        Below is a list of all polls. You can add, edit, close, undo-close, or delete polls.
      </p>

      {/* Poll List */}
      <div className="flex flex-col gap-4">
        {polls.length > 0 ? (
          polls.map((poll) => (
            <div
              key={poll.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{poll.question}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(poll.startDate).toLocaleDateString()} -{" "}
                  {new Date(poll.endDate).toLocaleDateString()}
                </p>
                {poll.closedAt && (
                  <p className="text-xs text-red-500">
                    Closed: {new Date(poll.closedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStartEdit(poll)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                {poll.closedAt ? (
                  <button
                    onClick={() => handleUndoClose(poll.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Undo Close
                  </button>
                ) : (
                  <button
                    onClick={() => handleClosePoll(poll.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => handleDeletePoll(poll.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No polls found.</p>
        )}
      </div>

      {/* Add New Poll */}
      <div className="mt-6">
        {!addingPoll ? (
          <button
            onClick={handleOpenAddPoll}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            ➕ Add New Poll
          </button>
        ) : (
          <div className="border rounded p-4 flex flex-col gap-3 bg-gray-50">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Poll question"
              className="border rounded px-3 py-2"
            />
            {/* Start and End Date */}
            <label className="text-sm font-semibold">Start Date</label>
            <input
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <label className="text-sm font-semibold">End Date</label>
            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="border rounded px-3 py-2"
            />

            {/* Options */}
            {newOptions.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                value={opt}
                onChange={(e) =>
                  setNewOptions(
                    newOptions.map((o, i) => (i === idx ? e.target.value : o))
                  )
                }
                placeholder={`Option ${idx + 1}`}
                className="border rounded px-3 py-2"
              />
            ))}
            <button
              onClick={() => setNewOptions([...newOptions, ""])}
              className="text-sm text-blue-500 hover:underline text-left"
            >
              ➕ Add another option
            </button>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddPoll}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setAddingPoll(false);
                  setNewQuestion("");
                  setNewOptions(["", ""]);
                  setNewStartDate("");
                  setNewEndDate("");
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Poll Modal */}
      {editingPoll && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Poll</h2>
            <input
              type="text"
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-3"
            />
            {editOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center mb-2 gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) =>
                    setEditOptions(
                      editOptions.map((o, i) => (i === idx ? e.target.value : o))
                    )
                  }
                  className="border rounded px-3 py-2 w-full"
                />
                <button
                  onClick={() =>
                    setEditOptions(editOptions.filter((_, i) => i !== idx))
                  }
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ✖️
                </button>
              </div>
            ))}
            <button
              onClick={() => setEditOptions([...editOptions, ""])}
              className="text-sm text-blue-500 hover:underline mb-3"
            >
              ➕ Add another option
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPoll(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="w-full flex justify-center mt-6">
        <button
            onClick={() => router.push("/admin")}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
            ⬅ Back
        </button>
    </div>

    </main>
  );
}
