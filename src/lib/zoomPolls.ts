import { getZoomAccessToken } from "@/lib/zoom";

export interface PollQuestionResult {
  question: string;
  answers: { text: string; count: number }[];
}

interface ZoomPollReportResponse {
  questions?: {
    email?: string;
    name?: string;
    question_details?: { question: string; answer: string }[];
  }[];
}

// Aggregates Zoom's per-respondent poll report into vote counts per answer.
// Uses the live "Get meeting's poll report" endpoint — works while the
// meeting is still in progress, not just after it ends.
export async function getPollResults(meetingId: string): Promise<PollQuestionResult[]> {
  const accessToken = await getZoomAccessToken();
  const res = await fetch(
    `https://api.zoom.us/v2/report/meetings/${meetingId}/polls`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    throw new Error(`Zoom poll report request failed: ${res.status}`);
  }
  const data: ZoomPollReportResponse = await res.json();

  const tally = new Map<string, Map<string, number>>();
  for (const respondent of data.questions || []) {
    for (const qa of respondent.question_details || []) {
      if (!tally.has(qa.question)) tally.set(qa.question, new Map());
      const answers = tally.get(qa.question)!;
      answers.set(qa.answer, (answers.get(qa.answer) || 0) + 1);
    }
  }

  return Array.from(tally.entries()).map(([question, answers]) => ({
    question,
    answers: Array.from(answers.entries()).map(([text, count]) => ({ text, count })),
  }));
}
