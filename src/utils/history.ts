import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.ts";

export interface HistoryRecord {
  id: string;
  userId: string;
  feature: string;
  input: any;
  output: any;
  createdAt: string;
}

const FEATURE_COLLECTIONS: Record<string, string> = {
  "career": "career_history",
  "resume": "resume_analysis",
  "roadmap": "roadmaps",
  "interview": "interview_sessions",
  "linkedin": "linkedin_messages",
  "skillgap": "skill_gap_reports"
};

export async function saveAIHistory(userId: string, feature: string, input: any, output: any) {
  const collectionName = FEATURE_COLLECTIONS[feature];
  if (!collectionName) {
    console.error("Unknown feature for history saving:", feature);
    return;
  }
  try {
    await addDoc(collection(db, collectionName), {
      userId,
      feature,
      input,
      output,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error(`Error saving to history for ${feature}:`, err);
  }
}

export async function fetchAIHistory(userId: string, feature: string): Promise<HistoryRecord[]> {
  const collectionName = FEATURE_COLLECTIONS[feature];
  if (!collectionName) return [];
  try {
    const q = query(
      collection(db, collectionName),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    const records: HistoryRecord[] = [];
    snap.forEach((d) => {
      records.push({
        id: d.id,
        ...d.data()
      } as HistoryRecord);
    });
    // Sort descending by createdAt
    records.sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    return records;
  } catch (err) {
    console.error(`Error fetching history for ${feature}:`, err);
    return [];
  }
}

export async function deleteAIHistoryRecord(feature: string, id: string) {
  const collectionName = FEATURE_COLLECTIONS[feature];
  if (!collectionName) return;
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (err) {
    console.error(`Error deleting history record ${id}:`, err);
  }
}
