export type JobAppearance = {
  id: string;
  appearance: string;
  label: string;
};

export type Job = {
  title: string;
  selectedAppearance: string;
  state: string;
  date: string;
  time: string;
};
