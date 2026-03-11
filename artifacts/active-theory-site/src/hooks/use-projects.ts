import { useQuery } from "@tanstack/react-query";

export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  accentColor: string;
  imageUrl: string;
};

// Mock data to simulate API response for the agency portfolio
const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Quantum Dimensions",
    category: "Interactive Web",
    year: "2024",
    accentColor: "bg-blue-600",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" // abstract retro tech
  },
  {
    id: "p2",
    title: "Neural Synthesis",
    category: "Motion & 3D",
    year: "2023",
    accentColor: "bg-rose-600",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" // abstract lines
  },
  {
    id: "p3",
    title: "Void Architecture",
    category: "Brand Identity",
    year: "2023",
    accentColor: "bg-emerald-600",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80" // dark architecture
  },
  {
    id: "p4",
    title: "Echo Systems",
    category: "Immersive Campaign",
    year: "2024",
    accentColor: "bg-amber-500",
    imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&q=80" // space/stars
  }
];

export function useProjects() {
  return useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_PROJECTS;
    }
  });
}
