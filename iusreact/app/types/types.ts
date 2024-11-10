// types.ts

export interface Document {
    origin: string;
    id: number;
    parsed_id: number;
    similarity: string;
    forderung: string;
    file_path: string;
    datum: string;
    case_number: string;
    signatur: string;
    source: string;
  }
  
  export interface Article {
    srn: string;
    shortName: string;
    book_name: string;
    part_name: string;
    title_name: string;
    sub_title_name: string;
    chapter_name: string;
    sub_chapter_name: string;
    section_name: string;
    sub_section_name: string;
    art_id: string;
    full_article: string;
    title: string;
    sourcelink: string;
    source_table: string;
    similarity: number;
  }
  
  export interface Message {
    sender: string;
    text: string;
  }
  