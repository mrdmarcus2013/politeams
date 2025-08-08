"use client";

import { useEffect, useState } from "react";

export default function ManagePollsPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  // Fetch existing polls
  useEffect(() => {
    fetch("/api/admin/polls")
      .then((res) => res.json())
      .then(setPolls);
  }, []);

  // Add a new option input
  const addOption = () => setOptions([...options, ""]);

  // Update option text
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Submit new poll
  const createPoll = async () => {
    const cleanedOptions = options.filter((o) => o.trim() !== "");
    if (!question.trim() || cleanedOptions.length < 2) {
      alert("Enter a question and at least 2 options.");
      return;
    }

    await fetch("/api/admin/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options: cleanedOptions }),
    });

    setQuestion("");
    setOptions(["", ""]);
    const updated = await fetch("/api/admin/polls").then((res) => res.json());
    setPolls(updated);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Polls</h1>

      {/* Create Poll Form */}
      <div className="mb-6 border p-4 rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Create New Poll</h2>
        <input
          type="text"
          placeholder="Poll Question"
          className="border p-2 w-full mb-2"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            className="border p-2 w-full mb-2"
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
          />
        ))}

        <button
          onClick={addOption}
          className="bg-gray-200 px-4 py-2 rounded mb-2"
        >
          + Add Option
        </button>

        <button
          onClick={createPoll}
          className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
        >
          Create Poll
        </button>
      </div>

      {/* Poll List */}
      <h2 className="text-xl font-semibold mb-2">Existing Polls</h2>
      <ul className="space-y-4">
        {polls.map((poll) => (
          <li key={poll.id} className="border p-4 rounded bg-white">
            <div className="font-bold">{poll.question}</div>
            <div className="text-sm text-gray-600">
              {poll.options.length} options • {poll.options.reduce((sum, o) => sum + o.votes.length, 0)} votes
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
