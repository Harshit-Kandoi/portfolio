export interface Note {
  id: string;
  title: string;
  category?: string;
  type?: 'reflection' | 'memory' | 'principle' | 'question' | 'journal' | string;
  status?: 'stable' | 'evolving' | 'experiment';
  last_updated?: string;
  date: string;
  read_time_mins?: number;
  tags?: string[];
  is_featured: boolean;
  
  // Markdown content (if any)
  content?: string;
  
  // Type: reflection
  observation?: string;
  thought?: string;
  still_thinking?: string;
  
  // Type: memory
  what_i_remember?: string;
  why_it_stuck?: string;
  
  // Type: principle
  the_rule?: string;
  where_i_learned_it?: string;
  exception?: string;
  
  // Type: question
  question?: string;
  why_i_care?: string;
  possible_answers?: string[];
  
  // Type: journal
  what_happened?: string;
  what_surprised_me?: string;
  
  // Legacy / fallback fields
  takeaways?: string[];
  thought_type?: string;
  related_note_ids?: string[];
}
