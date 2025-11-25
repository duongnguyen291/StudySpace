export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  url: string | null;
  active: boolean;
  earned: boolean;
}
