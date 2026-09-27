import { Timestamp } from "firebase/firestore";

export interface Dates {
  dates: Timestamp[];
  datesByDivision?: Record<string, Timestamp[]>;
}
