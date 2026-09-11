export interface OptionNode {
  id: string;
  name: string;
  code: string;
}

export interface SectionNode {
  id: string;
  name: string;
  options: OptionNode[];
}

export interface LevelNode {
  id: string;
  name: string;
  numericOrder: number;
}

export interface CycleNode {
  id: string;
  name: string;
  levels: LevelNode[];
  sections: SectionNode[];
}
