export interface Character {
  id: string;
  name: string;
  description: string;
  prompt: string;
  generatedContent: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}