export type Photo = {
  id: string;
  title: string;
  gradient: string;
};

export const photos: Photo[] = Array.from({ length: 12 }, (_, i) => {
  const hue = (i * 47) % 360;
  return {
    id: String(i + 1),
    title: `作品 #${i + 1}`,
    gradient: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${
      (hue + 60) % 360
    } 70% 42%))`,
  };
});

export function getPhoto(id: string): Photo | undefined {
  return photos.find((p) => p.id === id);
}
